import pandas as pd

from src.Data.scripts import TrendData


def test_extract_trends_data_filters_tower_hamlets_and_sorts_years(monkeypatch):
    sample_df = pd.DataFrame(
        [
            {"area_code": "E09000030", "time_period": "2019/20",
                "time_period_sortable": 201920, "value": 6.9},
            {"area_code": "E09000030", "time_period": "2020/21",
                "time_period_sortable": 202021, "value": 7.1},
            {"area_code": "E09000030", "time_period": "2021/22",
                "time_period_sortable": 202122, "value": 7.3},
            {"area_code": "E09000030", "time_period": "2022/23",
                "time_period_sortable": 202223, "value": 7.4},
            {"area_code": "E09000030", "time_period": "2023/24",
                "time_period_sortable": 202324, "value": 7.6},
            {"area_code": "E09000030", "time_period": "2024/25",
                "time_period_sortable": 202425, "value": 7.8},
            {"area_code": "E00000001", "time_period": "2024/25",
                "time_period_sortable": 202425, "value": 1.2},
            {"area_code": "E09000030", "time_period": "bad",
                "time_period_sortable": 202526, "value": None},
        ]
    )

    monkeypatch.setattr(TrendData.pd, "read_csv",
                        lambda *_args, **_kwargs: sample_df)

    data = TrendData.extract_trends_data()

    assert len(data) == 6
    assert all(item["year"] >= 2019 for item in data)
    assert [item["year"]
            for item in data] == sorted(item["year"] for item in data)
    assert data[-1]["value"] == 7.8
