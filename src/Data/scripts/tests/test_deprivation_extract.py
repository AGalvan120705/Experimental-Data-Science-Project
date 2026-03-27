import json

import pandas as pd

from src.Data.scripts import extract_deprivation_data as dep


def test_calculate_ward_deprivation_score_ignores_non_applicable_codes():
    ward_data = pd.DataFrame(
        [
            {"Household deprivation (6 categories) Code": 1,
             "Observation": 100},
            {"Household deprivation (6 categories) Code": 2,
             "Observation": 50},
            {"Household deprivation (6 categories) Code": 3,
             "Observation": 25},
            {"Household deprivation (6 categories) Code": 6,
             "Observation": 999},
        ]
    )

    score = dep.calculate_ward_deprivation_score(ward_data)

    # weighted average over valid categories only
    # ((0*100) + (1*50) + (2*25)) / (100+50+25) = 100 / 175
    assert round(score, 4) == round(100 / 175, 4)


def test_merge_into_master_data_updates_ward_stats(tmp_path, monkeypatch):
    master_file = tmp_path / "master.json"

    master_data = {
        "metadata": {"sources": {}},
        "wards": {
            "Bethnal Green East": {},
            "Poplar": {},
            "Unknown Ward": {},
        },
    }
    master_file.write_text(json.dumps(master_data), encoding="utf-8")

    deprivation_data = {
        "metadata": {"source": "Census 2021 Household Deprivation (TS011)"},
        "wards": [
            {
                "ward": "Bethnal Green",
                "deprivation_index": 8,
                "national_percentile": 82.0,
                "pct_deprived": 63.1,
            },
            {
                "ward": "Poplar",
                "deprivation_index": 7,
                "national_percentile": 73.5,
                "pct_deprived": 55.4,
            },
        ],
    }

    monkeypatch.setattr(dep, "MASTER_FILE", master_file)

    dep.merge_into_master_data(deprivation_data)

    updated = json.loads(master_file.read_text(encoding="utf-8"))
    assert updated["wards"]["Bethnal Green East"]["deprivation"] == 8
    assert updated["wards"]["Poplar"]["deprivation"] == 7
    assert updated["wards"]["Unknown Ward"]["deprivation"] is None
    assert "deprivation" in updated["metadata"]["sources"]
