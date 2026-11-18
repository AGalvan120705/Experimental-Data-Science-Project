"""Summary provider boundary and safe deterministic fallback implementation."""

from __future__ import annotations

import os
import re
from typing import Protocol

from pydantic import BaseModel, ConfigDict, Field

from src.api.models import (
    BoroughBenchmarks,
    Metric,
    ModelMetadata,
    WardRecord,
    WardSummaryResponse,
)


DISCLAIMER = (
    "This is general public-health information, not medical advice or an "
    "assessment of any individual."
)

GUIDANCE_CARD_IDS = [
    "nice-prevention-ph38",
    "nhs-type-2-treatment",
    "nhs-diabetes-prevention-programme",
]
PROMPT_VERSION = "ward-summary-v3"
GEMINI_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "overview": {"type": "string"},
        "comparisons": {"type": "array", "items": {"type": "string"}},
        "data_gaps": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["overview", "comparisons", "data_gaps"],
}


class GeneratedContent(BaseModel):
    """The deliberately small, model-owned part of a summary response."""

    model_config = ConfigDict(extra="forbid")

    overview: str = Field(min_length=1, max_length=700)
    comparisons: list[str] = Field(min_length=1, max_length=4)
    data_gaps: list[str] = Field(max_length=3)


class SummaryProvider(Protocol):
    def summarise(
        self, ward: WardRecord, benchmarks: BoroughBenchmarks
    ) -> WardSummaryResponse: ...


def _comparison_sentence(label: str, metric: Metric, difference: float | None) -> str:
    if metric.value is None or difference is None:
        return f"{label} data is unavailable for this ward."
    direction = "above" if difference > 0 else "below" if difference < 0 else "equal to"
    distance = abs(difference)
    if direction == "equal to":
        return f"{label} is equal to the Tower Hamlets benchmark."
    return (
        f"{label} is {distance:.2f} percentage points {direction} "
        "the Tower Hamlets benchmark."
    )


def _health_data_gaps(ward: WardRecord) -> list[str]:
    """Only expose source-confirmed health-data availability gaps."""
    data_gaps = []
    if ward.metrics.diabetes_prevalence.value is None:
        data_gaps.append("GP-practice-associated diabetes prevalence is unavailable.")
    if ward.metrics.obesity_prevalence.value is None:
        data_gaps.append("GP-practice-associated obesity prevalence is unavailable.")
    return data_gaps


class DeterministicSummaryProvider:
    """Grounded non-LLM response used until Gemini is configured and as fallback."""

    cache_key = "deterministic:template-v1"

    def summarise(
        self, ward: WardRecord, benchmarks: BoroughBenchmarks
    ) -> WardSummaryResponse:
        diabetes = ward.metrics.diabetes_prevalence
        obesity = ward.metrics.obesity_prevalence
        population = ward.metrics.population.value
        median_age = ward.metrics.median_age.value

        overview_parts = [f"{ward.ward_name} is one of Tower Hamlets' 20 wards."]
        if population is not None:
            overview_parts.append(f"Its 2021 Census population was {int(population):,}.")
        if median_age is not None:
            overview_parts.append(f"The recorded median age was {int(median_age)} years.")

        data_gaps = _health_data_gaps(ward)

        comparisons = [
            _comparison_sentence(
                "Diabetes prevalence",
                diabetes,
                ward.comparisons.diabetes_vs_borough_percentage_points,
            ),
            _comparison_sentence(
                "Obesity prevalence",
                obesity,
                ward.comparisons.obesity_vs_borough_percentage_points,
            ),
        ]

        return WardSummaryResponse(
            ward_code=ward.ward_code,
            ward_name=ward.ward_name,
            overview=" ".join(overview_parts),
            comparisons=comparisons,
            data_gaps=data_gaps,
            guidance_card_ids=GUIDANCE_CARD_IDS,
            disclaimer=DISCLAIMER,
            model_metadata=ModelMetadata(
                provider="deterministic",
                model="template-v1",
                prompt_version="ward-summary-v1",
                used_fallback=True,
            ),
        )


class GeminiSummaryProvider:
    """Gemini-backed provider that validates output before it reaches the UI."""

    def __init__(self, api_key: str, model: str | None = None):
        # Import lazily so the API remains usable with its deterministic fallback
        # until the optional Gemini dependency has been installed.
        from google import genai
        from google.genai import types

        self.client = genai.Client(api_key=api_key)
        self.types = types
        self.model = model or os.getenv("GEMINI_MODEL", "gemini-flash-latest")

    @property
    def cache_key(self) -> str:
        """Keep model or prompt changes from reusing an older daily response."""
        return f"gemini:{self.model}:{PROMPT_VERSION}"

    @staticmethod
    def _source_payload(ward: WardRecord, benchmarks: BoroughBenchmarks) -> dict:
        return {
            "ward_code": ward.ward_code,
            "ward_name": ward.ward_name,
            "metrics": {
                name: {
                    "value": metric["value"],
                    "unit": metric["unit"],
                    "period": metric["period"],
                }
                for name, metric in ward.metrics.model_dump().items()
            },
            "comparisons": ward.comparisons.model_dump(),
            "borough_benchmarks": benchmarks.model_dump(),
        }

    @staticmethod
    def _allowed_number_strings(ward: WardRecord, benchmarks: BoroughBenchmarks) -> set[str]:
        values = [1, 10, 20]
        metrics = ward.metrics.model_dump()
        values.extend(metric["value"] for metric in metrics.values() if metric["value"] is not None)
        values.extend(
            round(metric["value"] / 100) * 100
            for metric in metrics.values()
            if metric["value"] is not None and metric["unit"] == "people"
        )
        values.extend(value for value in ward.comparisons.model_dump().values() if value is not None)
        population_difference = ward.comparisons.population_vs_ward_average
        if population_difference is not None:
            values.append(round(abs(population_difference) / 100) * 100)
        values.extend(benchmarks.model_dump().values())
        allowed = set()
        for metric in metrics.values():
            # Source periods such as 2024-25 are valid contextual numbers.
            allowed.update(re.findall(r"\d+", metric["period"]))
        for value in values:
            numeric = float(value)
            for candidate in (numeric, abs(numeric)):
                allowed.add(str(candidate))
                allowed.add(f"{candidate:g}")
                allowed.add(f"{candidate:,.0f}")
                allowed.add(f"{candidate:.1f}")
                allowed.add(f"{candidate:.2f}")
        return allowed

    def _validate_numbers(
        self, content: GeneratedContent, ward: WardRecord, benchmarks: BoroughBenchmarks
    ) -> None:
        allowed = self._allowed_number_strings(ward, benchmarks)
        prose = " ".join([content.overview, *content.comparisons, *content.data_gaps])
        numbers = re.findall(r"(?<![A-Za-z])\d[\d,]*(?:\.\d+)?", prose)
        unsupported = [number for number in numbers if number.rstrip(",") not in allowed]
        if unsupported:
            raise ValueError(f"Model used unsupported number(s): {', '.join(unsupported)}")

    def summarise(
        self, ward: WardRecord, benchmarks: BoroughBenchmarks
    ) -> WardSummaryResponse:
        prompt = (
            "Write a concise, neutral public-health ward briefing using only the supplied JSON. "
            "Describe population statistics only: do not diagnose, prescribe, infer causes, or "
            "give personal advice. Do not invent any numbers; omit a number if unsure. Diabetes "
            "and obesity values must be described as GP-practice-associated estimates, not direct "
            "measurements of residents. When describing the deprivation index, say it is on a 1-to-10 "
            "scale where a higher score means greater deprivation. For population comparisons, round "
            "to the nearest 100 and say 'about' (for example, 'about 5,600 people'). Do not mention "
            "missing demographic, ethnicity, or age breakdowns. The data_gaps array must be empty when "
            "both health metrics are available; otherwise include only unavailable diabetes and/or obesity "
            "data. Return the requested JSON object only.\n\nSOURCE DATA:\n"
            f"{self._source_payload(ward, benchmarks)}"
        )
        last_error: Exception | None = None
        for _ in range(2):
            try:
                completion = self.client.models.generate_content(
                    model=self.model,
                    contents=prompt,
                    config=self.types.GenerateContentConfig(
                        system_instruction="You produce safe, grounded public-health summaries.",
                        temperature=0.1,
                        response_mime_type="application/json",
                        response_schema=GEMINI_RESPONSE_SCHEMA,
                    ),
                )
                raw = completion.text or "{}"
                content = GeneratedContent.model_validate_json(raw)
                self._validate_numbers(content, ward, benchmarks)
                return WardSummaryResponse(
                    ward_code=ward.ward_code,
                    ward_name=ward.ward_name,
                    overview=content.overview,
                    comparisons=content.comparisons,
                    data_gaps=_health_data_gaps(ward),
                    guidance_card_ids=GUIDANCE_CARD_IDS,
                    disclaimer=DISCLAIMER,
                    model_metadata=ModelMetadata(
                        provider="gemini", model=self.model,
                        prompt_version=PROMPT_VERSION, used_fallback=False,
                    ),
                )
            except Exception as error:
                last_error = error
                prompt += "\nYour previous response failed validation. Use only exact numeric values in SOURCE DATA."
        raise RuntimeError("Gemini summary validation failed") from last_error
