import json
from pathlib import Path

import pandas as pd

from src.Data.scripts import process_cenus_data as census


def test_calculate_stats_returns_population_and_median_age():
    ward_data = pd.DataFrame(
        [
            {"Age (101 categories) Code": 20, "Observation": 50},
            {"Age (101 categories) Code": 30, "Observation": 30},
            {"Age (101 categories) Code": 40, "Observation": 20},
        ]
    )

    total_pop, median_age = census.calculate_stats(ward_data)

    assert total_pop == 100
    assert median_age == 20


def test_find_latest_input_file_returns_latest(tmp_path):
    older = tmp_path / 'TS007-2021-3-filtered-2026-03-20.csv'
    newer = tmp_path / 'TS007-2021-3-filtered-2026-03-25.csv'
    older.write_text('a,b\n1,2\n', encoding='utf-8')
    newer.write_text('a,b\n3,4\n', encoding='utf-8')

    out = census.find_latest_input_file(tmp_path)
    assert out == newer


def test_find_latest_input_file_raises_when_missing(tmp_path):
    try:
        census.find_latest_input_file(tmp_path)
        assert False, 'Expected FileNotFoundError'
    except FileNotFoundError:
        assert True


def test_process_and_save_results_with_sample_input(tmp_path):
    input_file = tmp_path / 'TS007-2021-3-filtered-2026-03-25.csv'
    output_file = tmp_path / 'tower_hamlets_ward_age_pop.json'

    df = pd.DataFrame(
        [
            {
                'Electoral wards and divisions Code': 'E05009317',
                'Electoral wards and divisions': 'Bethnal Green East',
                'Age (101 categories) Code': 20,
                'Observation': 60,
            },
            {
                'Electoral wards and divisions Code': 'E05009317',
                'Electoral wards and divisions': 'Bethnal Green East',
                'Age (101 categories) Code': 30,
                'Observation': 40,
            },
            {
                'Electoral wards and divisions Code': 'E00000000',
                'Electoral wards and divisions': 'Other Place',
                'Age (101 categories) Code': 30,
                'Observation': 500,
            },
        ]
    )
    df.to_csv(input_file, index=False)

    results = census.process_census_data(input_file)
    census.save_results(results, output_file)

    payload = json.loads(output_file.read_text(encoding='utf-8'))
    assert 'Bethnal Green East' in payload['wards']
    assert payload['wards']['Bethnal Green East']['total_population'] == 100
    assert payload['wards']['Bethnal Green East']['median_age'] == 20


def test_main_end_to_end_creates_output(tmp_path):
    input_file = tmp_path / 'TS007-2021-3-filtered-2026-03-25.csv'
    output_file = tmp_path / 'ward_age_output.json'

    df = pd.DataFrame(
        [
            {
                'Electoral wards and divisions Code': 'E05009318',
                'Electoral wards and divisions': 'Bethnal Green West',
                'Age (101 categories) Code': 25,
                'Observation': 10,
            },
            {
                'Electoral wards and divisions Code': 'E05009318',
                'Electoral wards and divisions': 'Bethnal Green West',
                'Age (101 categories) Code': 50,
                'Observation': 10,
            },
        ]
    )
    df.to_csv(input_file, index=False)

    census.main(data_dir=tmp_path, output_file=output_file)

    payload = json.loads(output_file.read_text(encoding='utf-8'))
    assert 'Bethnal Green West' in payload['wards']
