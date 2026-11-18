import json

import pytest

from src.Data.scripts import build_ward_insights as builder


def sample_inputs():
    health_wards = {}
    census_wards = {}
    for offset in range(20):
        canonical = f"Ward {offset:02d}"
        census_name = canonical
        if offset == 0:
            canonical = "Bethnal Green East"
            census_name = "Bethnal Green"
        elif offset == 1:
            canonical = "Bethnal Green West"
            census_name = "St Peter's (Tower Hamlets)"

        health_wards[canonical] = {
            "diabetes": None if offset == 1 else float(offset + 1),
            "obesity": None if offset == 1 else float(offset + 2),
            "deprivation": (offset % 10) + 1,
            "national_percentile": float(offset + 10),
            "pct_deprived": float(offset + 30),
        }
        census_wards[census_name] = {
            "ward_code": f"E{offset:08d}",
            "total_population": 1000 + offset,
            "median_age": 25 + (offset % 5),
        }

    health = {"wards": health_wards}
    summary = {
        "conditions": {
            "diabetes": {"overall_prevalence_percentage": 10.0},
            "obesity": {"overall_prevalence_percentage": 12.0},
        }
    }
    census = {"wards": census_wards}
    return health, summary, census


def test_build_dataset_normalizes_names_and_preserves_missing_values():
    health, summary, census = sample_inputs()

    result = builder.build_dataset(
        health, summary, census, generated_at="2026-11-01T00:00:00+00:00"
    )

    assert result["metadata"]["schema_version"] == "1.0.0"
    assert result["metadata"]["ward_count"] == 20
    assert result["metadata"]["warnings"][0]["wards"] == ["Bethnal Green West"]

    wards = {ward["ward_name"]: ward for ward in result["wards"]}
    east = wards["Bethnal Green East"]
    west = wards["Bethnal Green West"]

    assert east["ward_code"] == "E00000000"
    assert east["metrics"]["diabetes_prevalence"]["status"] == "available"
    assert east["comparisons"]["diabetes_vs_borough_percentage_points"] == -9.0
    assert west["metrics"]["diabetes_prevalence"]["value"] is None
    assert west["metrics"]["diabetes_prevalence"]["status"] == "unavailable"
    assert west["comparisons"]["diabetes_rank"] is None


def test_build_dataset_rejects_misaligned_wards():
    health, summary, census = sample_inputs()
    census["wards"].pop("Bethnal Green")

    with pytest.raises(ValueError, match="Ward sources do not align"):
        builder.build_dataset(health, summary, census)


def test_build_from_files_writes_json(tmp_path):
    health, summary, census = sample_inputs()
    paths = {
        "health": tmp_path / "health.json",
        "summary": tmp_path / "summary.json",
        "census": tmp_path / "census.json",
        "output": tmp_path / "ward_insights.json",
    }
    paths["health"].write_text(json.dumps(health), encoding="utf-8")
    paths["summary"].write_text(json.dumps(summary), encoding="utf-8")
    paths["census"].write_text(json.dumps(census), encoding="utf-8")

    result = builder.build_from_files(
        paths["health"], paths["summary"], paths["census"], paths["output"]
    )

    saved = json.loads(paths["output"].read_text(encoding="utf-8"))
    assert saved == result
    assert len(saved["wards"]) == 20
