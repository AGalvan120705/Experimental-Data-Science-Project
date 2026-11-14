"""FastAPI application for Tower Hamlets ward insight data."""

from __future__ import annotations

import os
import time
import logging
from functools import lru_cache
from pathlib import Path as FilePath

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
from src.api.summary import (
    DeterministicSummaryProvider,
    GeminiSummaryProvider,
    SummaryProvider,
)
from src.api.summary_cache import SummaryCache


API_VERSION = "0.1.0"
WARD_CODE_DESCRIPTION = "ONS electoral ward code, for example E05009317."
logger = logging.getLogger(__name__)

# In local development, a populated project .env must win over an inherited
# empty shell variable; otherwise the API silently selects the fallback.
load_dotenv(override=True)

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
            "Grounded plain-English summaries. When GEMINI_API_KEY is configured, "
            "one validated result per ward is generated and cached each UTC day."
        ),
    },
]


@lru_cache(maxsize=1)
def get_repository() -> WardRepository:
    return WardRepository()


@lru_cache(maxsize=1)
def get_summary_provider() -> SummaryProvider:
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        try:
            provider = GeminiSummaryProvider(api_key)
            logger.info("Ward summary provider configured: Gemini (%s)", provider.model)
            return provider
        except ImportError:
            # A deployment without the optional SDK must still return a safe
            # response instead of making the endpoint unavailable.
            logger.warning("Gemini SDK is unavailable; using deterministic summaries.")
            return DeterministicSummaryProvider()
    logger.warning("GEMINI_API_KEY is not configured; using deterministic summaries.")
    return DeterministicSummaryProvider()


@lru_cache(maxsize=1)
def get_summary_cache() -> SummaryCache:
    configured_path = os.getenv("WARD_SUMMARY_CACHE_DB")
    path = (
        FilePath(configured_path)
        if configured_path
        else FilePath(__file__).resolve().parents[1] / "Data" / "ward_summary_cache.sqlite3"
    )
    return SummaryCache(path)


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
        cache: SummaryCache = Depends(get_summary_cache),
    ) -> WardSummaryResponse:
        try:
            ward = repository.get_ward(ward_code)
        except WardNotFoundError as error:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ward '{ward_code}' was not found.",
            ) from error
        dataset_version = repository.dataset.metadata.schema_version
        cache_scope = f"{dataset_version}:{getattr(provider, 'cache_key', 'unknown-provider')}"
        started = time.perf_counter()
        cached_summary = cache.get(ward_code, cache_scope)
        # Older releases cached fallback templates. Never let one masquerade as
        # an AI result or prevent a later successful Gemini attempt.
        if cached_summary and cached_summary.model_metadata.used_fallback:
            cached_summary = None
        if cached_summary:
            cache.log(
                cached_summary, dataset_version, int((time.perf_counter() - started) * 1000),
                "cached", True,
            )
            return cached_summary

        try:
            summary = provider.summarise(ward, repository.dataset.borough_benchmarks)
            validation_result = "valid"
        except Exception:
            logger.exception(
                "Gemini summary failed for ward %s; using the deterministic fallback.",
                ward_code,
            )
            summary = DeterministicSummaryProvider().summarise(
                ward, repository.dataset.borough_benchmarks
            )
            validation_result = "fallback"
        # Do not cache a failed provider attempt. It would hide a corrected key,
        # model name, or transient Gemini outage for the rest of the day.
        if not summary.model_metadata.used_fallback:
            cache.put(summary, cache_scope)
        cache.log(
            summary, dataset_version, int((time.perf_counter() - started) * 1000),
            validation_result, False,
        )
        return summary

    return app


app = create_app()
