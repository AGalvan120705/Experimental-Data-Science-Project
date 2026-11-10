"""FastAPI application for Tower Hamlets ward insight data."""

from __future__ import annotations

import os
from functools import lru_cache

from fastapi import Depends, FastAPI, HTTPException, Path, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from src.api.models import (
    HealthResponse,
    WardDetailResponse,
    WardListItem,
    WardSummaryResponse,
)
from src.api.repository import WardNotFoundError, WardRepository
from src.api.summary import DeterministicSummaryProvider, SummaryProvider


API_VERSION = "0.1.0"
WARD_CODE_DESCRIPTION = "ONS electoral ward code, for example E05009317."

load_dotenv()

OPENAPI_TAGS = [
    {
        "name": "service",
        "description": "Service readiness and dataset version information.",
    },
    {
        "name": "wards",
        "description": "Validated ward statistics and borough comparisons.",
    },
    {
        "name": "summaries",
        "description": (
            "Grounded plain-English summaries. The current provider is a safe "
            "deterministic template; an OpenAI provider can be added behind the "
            "same response contract."
        ),
    },
]


@lru_cache(maxsize=1)
def get_repository() -> WardRepository:
    return WardRepository()


@lru_cache(maxsize=1)
def get_summary_provider() -> SummaryProvider:
    return DeterministicSummaryProvider()


def _cors_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


def create_app() -> FastAPI:
    app = FastAPI(
        title="Tower Hamlets Ward Insights API",
        summary="Validated ward statistics and grounded plain-English insights.",
        description=(
            "Read-only access to the canonical Tower Hamlets ward dataset. "
            "Health metrics are associated with GP practices mapped to wards and "
            "must not be treated as individual medical advice."
        ),
        version=API_VERSION,
        openapi_tags=OPENAPI_TAGS,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        contact={"name": "Ward Insights project"},
        license_info={"name": "Portfolio project"},
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins(),
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.get(
        "/api/health",
        response_model=HealthResponse,
        tags=["service"],
        summary="Check service and dataset readiness",
        operation_id="getApiHealth",
    )
    def api_health(
        repository: WardRepository = Depends(get_repository),
    ) -> HealthResponse:
        metadata = repository.dataset.metadata
        return HealthResponse(
            status="ok",
            service="ward-insights-api",
            api_version=API_VERSION,
            dataset_schema_version=metadata.schema_version,
            dataset_generated_at=metadata.generated_at,
            ward_count=metadata.ward_count,
        )

    @app.get(
        "/api/wards",
        response_model=list[WardListItem],
        tags=["wards"],
        summary="List available wards",
        operation_id="listWards",
    )
    def list_wards(
        repository: WardRepository = Depends(get_repository),
    ) -> list[WardListItem]:
        return [
            WardListItem(
                ward_code=ward.ward_code,
                ward_name=ward.ward_name,
                health_data_available=(
                    ward.metrics.diabetes_prevalence.value is not None
                    and ward.metrics.obesity_prevalence.value is not None
                ),
            )
            for ward in repository.list_wards()
        ]

    @app.get(
        "/api/wards/{ward_code}",
        response_model=WardDetailResponse,
        tags=["wards"],
        summary="Get one ward and its borough context",
        operation_id="getWard",
        responses={404: {"description": "Ward code was not found."}},
    )
    def get_ward(
        ward_code: str = Path(description=WARD_CODE_DESCRIPTION),
        repository: WardRepository = Depends(get_repository),
    ) -> WardDetailResponse:
        try:
            ward = repository.get_ward(ward_code)
        except WardNotFoundError as error:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ward '{ward_code}' was not found.",
            ) from error
        return WardDetailResponse(
            ward=ward,
            borough_benchmarks=repository.dataset.borough_benchmarks,
            dataset_schema_version=repository.dataset.metadata.schema_version,
        )

    @app.post(
        "/api/wards/{ward_code}/summary",
        response_model=WardSummaryResponse,
        tags=["summaries"],
        summary="Generate a grounded ward summary",
        operation_id="createWardSummary",
        responses={404: {"description": "Ward code was not found."}},
    )
    def create_ward_summary(
        ward_code: str = Path(description=WARD_CODE_DESCRIPTION),
        repository: WardRepository = Depends(get_repository),
        provider: SummaryProvider = Depends(get_summary_provider),
    ) -> WardSummaryResponse:
        try:
            ward = repository.get_ward(ward_code)
        except WardNotFoundError as error:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ward '{ward_code}' was not found.",
            ) from error
        return provider.summarise(ward, repository.dataset.borough_benchmarks)

    return app


app = create_app()
