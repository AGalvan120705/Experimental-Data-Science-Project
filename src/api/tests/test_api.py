from fastapi.testclient import TestClient

from src.api.main import app
from src.api.repository import WardRepository
from src.api.summary import (
    DeterministicSummaryProvider,
    GeminiSummaryProvider,
    _health_data_gaps,
)
from src.api.summary_cache import SummaryCache


client = TestClient(app)


def test_openapi_and_documentation_routes_are_available():
    schema = client.get("/openapi.json")

    assert schema.status_code == 200
    assert schema.json()["info"]["title"] == "Tower Hamlets Ward Insights API"
    assert "/api/wards/{ward_code}/summary" in schema.json()["paths"]
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200


def test_health_reports_dataset_version():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["dataset_schema_version"] == "1.0.0"
    assert response.json()["ward_count"] == 20


def test_list_wards_marks_missing_health_data():
    response = client.get("/api/wards")

    assert response.status_code == 200
    wards = {ward["ward_name"]: ward for ward in response.json()}
    assert len(wards) == 20
    assert wards["Bethnal Green East"]["health_data_available"] is True
    assert wards["Bethnal Green West"]["health_data_available"] is False


def test_get_ward_returns_data_and_borough_context():
    response = client.get("/api/wards/E05009317")

    assert response.status_code == 200
    payload = response.json()
    assert payload["ward"]["ward_name"] == "Bethnal Green East"
    assert payload["borough_benchmarks"]["diabetes_prevalence"] == 7.2


def test_unknown_ward_returns_documented_404():
    response = client.get("/api/wards/E00000000")

    assert response.status_code == 404
    assert response.json()["detail"] == "Ward 'E00000000' was not found."


def test_summary_is_grounded_and_flags_missing_data():
    complete = client.post("/api/wards/E05009317/summary")
    missing = client.post("/api/wards/E05009331/summary")

    assert complete.status_code == 200
    assert complete.json()["ward_name"] == "Bethnal Green East"
    assert complete.json()["model_metadata"]["provider"] == "deterministic"
    assert "1.89 percentage points below" in complete.json()["comparisons"][0]
    assert complete.json()["guidance_card_ids"] == [
        "nice-prevention-ph38",
        "nhs-type-2-treatment",
        "nhs-diabetes-prevention-programme",
    ]

    assert missing.status_code == 200
    assert missing.json()["ward_name"] == "Bethnal Green West"
    assert len(missing.json()["data_gaps"]) == 2
    assert "unavailable" in missing.json()["comparisons"][0]


def test_daily_summary_cache_returns_a_saved_response(tmp_path):
    repository = WardRepository()
    ward = repository.get_ward("E05009317")
    summary = DeterministicSummaryProvider().summarise(
        ward, repository.dataset.borough_benchmarks
    )
    cache = SummaryCache(tmp_path / "summaries.sqlite3")

    assert cache.get(ward.ward_code, "1.0.0") is None
    cache.put(summary, "1.0.0")
    cached = cache.get(ward.ward_code, "1.0.0")

    assert cached is not None
    assert cached.model_dump() == summary.model_dump()


def test_gemini_source_payload_uses_metric_values_without_calling_the_api():
    repository = WardRepository()
    ward = repository.get_ward("E05009317")

    payload = GeminiSummaryProvider._source_payload(
        ward, repository.dataset.borough_benchmarks
    )

    assert payload["metrics"]["diabetes_prevalence"] == {
        "value": 5.31,
        "unit": "percent",
        "period": "2024-25",
    }


def test_only_source_confirmed_health_gaps_are_included():
    repository = WardRepository()

    assert _health_data_gaps(repository.get_ward("E05009317")) == []
    assert _health_data_gaps(repository.get_ward("E05009331")) == [
        "GP-practice-associated diabetes prevalence is unavailable.",
        "GP-practice-associated obesity prevalence is unavailable.",
    ]
