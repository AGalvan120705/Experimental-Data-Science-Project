from fastapi.testclient import TestClient

from src.api.main import app


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

    assert missing.status_code == 200
    assert missing.json()["ward_name"] == "Bethnal Green West"
    assert len(missing.json()["data_gaps"]) == 2
    assert "unavailable" in missing.json()["comparisons"][0]
