import json
from pathlib import Path

import pandas as pd

from src.Data.scripts import ExtractTowerHamletsHealth as health


def test_filter_tower_hamlets_data_filters_pcn_and_maps_wards():
    df = pd.DataFrame(
        [
            {
                "pcn_name": "Tower Hamlets Network 1 PCN",
                "practice_code": "F84051",
                "practice_name": "A Practice",
            },
            {
                "pcn_name": "Tower Hamlets Network 2 PCN",
                "practice_code": "UNKNOWN",
                "practice_name": "B Practice",
            },
            {
                "pcn_name": "Not Tower Hamlets",
                "practice_code": "F84012",
                "practice_name": "C Practice",
            },
        ]
    )

    out = health.filter_tower_hamlets_data(df)

    assert len(out) == 2
    assert set(out["practice_name"]) == {"A Practice", "B Practice"}
    assert "Bethnal Green East" in out["ward"].values
    assert "Unknown" in out["ward"].values


def test_generate_condition_stats_calculates_totals_and_sorted_wards():
    df = pd.DataFrame(
        [
            {
                "ward": "Ward A",
                "practice_name": "P1",
                "prev_2024_25_register": 100,
                "prev_2024_25_list_size": 1000,
                "prev_2023_24_register": 90,
                "prev_2024_25_prevalence_pct": "10.0",
            },
            {
                "ward": "Ward B",
                "practice_name": "P2",
                "prev_2024_25_register": 50,
                "prev_2024_25_list_size": 800,
                "prev_2023_24_register": 40,
                "prev_2024_25_prevalence_pct": "6.25",
            },
        ]
    )

    stats = health.generate_condition_stats(df, health.SHEET_CONFIGS["DM"])

    assert stats["total_diagnosed"] == 150
    assert stats["total_dignosed_prev"] == 130
    assert stats["total_year_on_year_change"] == 20
    assert stats["practice_count"] == 2
    assert stats["by_ward"][0]["ward"] == "Ward A"
    assert stats["by_ward"][1]["ward"] == "Ward B"


def test_generate_map_ward_data_includes_all_wards():
    diabetes_stats = {
        "by_ward": [
            {"ward": "Bethnal Green East", "prevalence_percentage": 8.1},
        ]
    }
    obesity_stats = {
        "by_ward": [
            {"ward": "Bethnal Green East", "prevalence_percentage": 11.2},
        ]
    }

    out = health.generate_map_ward_data(diabetes_stats, obesity_stats)

    assert "wards" in out
    assert len(out["wards"]) == len(health.TOWER_HAMLETS_WARDS)
    assert out["wards"]["Bethnal Green East"]["diabetes"] == 8.1
    assert out["wards"]["Bethnal Green East"]["obesity"] == 11.2


def test_loaddata_extracts_rows_and_stops_on_source(monkeypatch):
    rows = [[None] * 15 for _ in range(16)]
    rows[12][5] = "F84051"  # type: ignore
    rows[12][6] = "Practice A"  # type: ignore
    rows[12][4] = "Tower Hamlets Network 1 PCN"  # type: ignore
    rows[13][5] = None  # should be skipped
    rows[14][0] = "Source: NHS"  # type: ignore  # should stop parsing

    fake_df = pd.DataFrame(rows)
    monkeypatch.setattr(health.pd, "read_excel",
                        lambda *_args, **_kwargs: fake_df)

    out = health.loaddata("dummy.xlsx", "DM")

    assert len(out) == 1
    assert "practice_code" in out.columns
    assert out.iloc[0]["practice_code"] == "F84051"


def test_generate_condition_stats_excludes_unknown_ward_rows():
    df = pd.DataFrame(
        [
            {
                "ward": "Unknown",
                "practice_name": "PX",
                "prev_2024_25_register": 10,
                "prev_2024_25_list_size": 100,
                "prev_2023_24_register": 8,
                "prev_2024_25_prevalence_pct": "10.0",
            },
            {
                "ward": "Ward C",
                "practice_name": "PY",
                "prev_2024_25_register": 15,
                "prev_2024_25_list_size": 150,
                "prev_2023_24_register": 12,
                "prev_2024_25_prevalence_pct": "10.0",
            },
        ]
    )

    stats = health.generate_condition_stats(df, health.SHEET_CONFIGS["DM"])

    assert len(stats["by_ward"]) == 1
    assert stats["by_ward"][0]["ward"] == "Ward C"


def test_generate_combined_stats_and_save_output(tmp_path):
    diabetes_stats = {
        "condition": "Diabetes Mellitus (Type 2)",
        "condition_short": "diabetes",
        "age_group": "17+",
        "total_diagnosed": 100,
        "total_year_on_year_change": 5,
        "overall_prevalence_percentage": 7.5,
        "practice_count": 2,
        "by_ward": [{"ward": "Bethnal Green East", "prevalence_percentage": 8.2}],
    }
    obesity_stats = {
        "condition": "Obesity",
        "condition_short": "obesity",
        "age_group": "18+",
        "total_diagnosed": 120,
        "total_year_on_year_change": 6,
        "overall_prevalence_percentage": 9.1,
        "practice_count": 2,
        "by_ward": [{"ward": "Poplar", "prevalence_percentage": 10.4}],
    }

    combined = health.generate_combined_stats(diabetes_stats, obesity_stats)
    assert "diabetes" in combined["conditions"]
    assert "obesity" in combined["conditions"]
    assert combined["summary"]["wards_covered"] == 2

    output_prefix = str(tmp_path / "out" / "tower_hamlets_health")
    paths = health.save_output(diabetes_stats, obesity_stats, output_prefix)

    assert len(paths) == 2
    for p in paths:
        assert Path(p).exists()

    payload = json.loads(Path(paths[0]).read_text(encoding="utf-8"))
    assert payload["summary"]["wards_covered"] == 2


def test_main_handles_missing_files_and_calls_save(monkeypatch, tmp_path):
    missing_dm = tmp_path / "missing_dm.xlsx"
    missing_ob = tmp_path / "missing_ob.xlsx"
    out_prefix = str(tmp_path / "output" / "tower_hamlets_health")

    monkeypatch.setattr(health, "DEFAULT_DM_FILE", missing_dm)
    monkeypatch.setattr(health, "DEFAULT_OB_FILE", missing_ob)
    monkeypatch.setattr(health, "DEFAULT_OUTPUT_PREFIX", out_prefix)

    captured = {}

    def fake_save_output(diabetes_stats, obesity_stats, output_prefix):
        captured["diabetes_stats"] = diabetes_stats
        captured["obesity_stats"] = obesity_stats
        captured["output_prefix"] = output_prefix
        return ["x.json", "y.json"]

    monkeypatch.setattr(health, "save_output", fake_save_output)

    health.main()

    assert captured["diabetes_stats"] is None
    assert captured["obesity_stats"] is None
    assert captured["output_prefix"] == out_prefix
