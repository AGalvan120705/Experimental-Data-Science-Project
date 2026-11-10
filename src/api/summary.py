"""Summary provider boundary and safe deterministic fallback implementation."""

from __future__ import annotations

from typing import Protocol

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


class DeterministicSummaryProvider:
    """Grounded non-LLM response used until OpenAI is configured and as fallback."""

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

        data_gaps = []
        if diabetes.value is None:
            data_gaps.append("GP-associated diabetes prevalence is unavailable.")
        if obesity.value is None:
            data_gaps.append("GP-associated obesity prevalence is unavailable.")

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
            guidance_card_ids=[],
            disclaimer=DISCLAIMER,
            model_metadata=ModelMetadata(
                provider="deterministic",
                model="template-v1",
                prompt_version="ward-summary-v1",
                used_fallback=True,
            ),
        )
