"""Validated public contracts exposed through the Ward Insights API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class MetricStatus(str, Enum):
    AVAILABLE = "available"
    UNAVAILABLE = "unavailable"


class Metric(StrictModel):
    value: int | float | None = Field(
        description="Metric value. Null means that the source data is unavailable."
    )
    unit: str
    period: str
    status: MetricStatus
    source_id: str


class WardMetrics(StrictModel):
    diabetes_prevalence: Metric
    obesity_prevalence: Metric
    deprivation_index: Metric
    national_deprivation_percentile: Metric
    households_deprived: Metric
    population: Metric
    median_age: Metric


class WardComparisons(StrictModel):
    diabetes_vs_borough_percentage_points: float | None
    diabetes_rank: int | None
    obesity_vs_borough_percentage_points: float | None
    obesity_rank: int | None
    deprivation_vs_ward_average: float | None
    deprivation_rank: int | None
    population_vs_ward_average: float | None
    population_rank: int | None


class WardRecord(StrictModel):
    ward_code: str = Field(pattern=r"^E\d{8}$", examples=["E05009317"])
    ward_name: str = Field(examples=["Bethnal Green East"])
    metrics: WardMetrics
    comparisons: WardComparisons


class BoroughBenchmarks(StrictModel):
    diabetes_prevalence: float
    obesity_prevalence: float
    mean_ward_deprivation_index: float
    mean_ward_population: float


class SourceMetadata(StrictModel):
    name: str
    period: str


class DatasetWarning(StrictModel):
    code: str
    wards: list[str]
    message: str


class DatasetMetadata(StrictModel):
    schema_version: str
    generated_at: str
    area: str
    ward_count: int
    methodology_note: str
    sources: dict[str, SourceMetadata]
    warnings: list[DatasetWarning]


class WardDataset(StrictModel):
    metadata: DatasetMetadata
    borough_benchmarks: BoroughBenchmarks
    wards: list[WardRecord]


class WardListItem(StrictModel):
    ward_code: str
    ward_name: str
    health_data_available: bool = Field(
        description="True when both diabetes and obesity metrics are available."
    )


class WardDetailResponse(StrictModel):
    ward: WardRecord
    borough_benchmarks: BoroughBenchmarks
    dataset_schema_version: str


class ModelMetadata(StrictModel):
    provider: str
    model: str
    prompt_version: str
    used_fallback: bool


class WardSummaryResponse(StrictModel):
    ward_code: str
    ward_name: str
    overview: str
    comparisons: list[str]
    data_gaps: list[str]
    guidance_card_ids: list[str]
    disclaimer: str
    model_metadata: ModelMetadata


class HealthResponse(StrictModel):
    status: str
    service: str
    api_version: str
    dataset_schema_version: str
    dataset_generated_at: str
    ward_count: int
