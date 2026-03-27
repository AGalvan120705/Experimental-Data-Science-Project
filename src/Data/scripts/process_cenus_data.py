import pandas as pd
import json
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent

# tower hamlets ward codes (E05009317 to E05009336)
TH_CODES = [f'E0500931{i}' for i in range(7, 10)] + \
           [f'E0500932{i}' for i in range(0, 10)] + \
           [f'E0500933{i}' for i in range(0, 7)]


def calculate_stats(ward_data):
    """calculate total population and median age for a ward"""
    ward_data = ward_data.sort_values('Age (101 categories) Code')

    total_pop = ward_data['Observation'].sum()

    # median = age where cumulative count crosses 50th percentile
    median_position = total_pop / 2
    cumulative = 0
    median_age = 0

    for _, row in ward_data.iterrows():
        cumulative += row['Observation']
        if cumulative >= median_position:
            median_age = row['Age (101 categories) Code']
            break

    return total_pop, median_age


def find_latest_input_file(data_dir):
    data_dir = Path(data_dir)
    input_candidates = sorted(data_dir.glob('TS007-2021-3-filtered-*.csv'))
    if not input_candidates:
        raise FileNotFoundError(
            f'Could not find TS007 census CSV in {data_dir}'
        )
    return input_candidates[-1]


def process_census_data(input_file):
    df = pd.read_csv(input_file)
    th_df = df[df['Electoral wards and divisions Code'].isin(TH_CODES)]

    results = {"wards": {}}
    for code in sorted(TH_CODES):
        ward_data = th_df[th_df['Electoral wards and divisions Code'] == code]
        if len(ward_data) > 0:
            ward_name = ward_data['Electoral wards and divisions'].iloc[0]
            total_pop, median_age = calculate_stats(ward_data)

            results["wards"][ward_name] = {
                "ward_code": code,
                "total_population": int(total_pop),
                "median_age": int(median_age)
            }

    return results


def save_results(results, output_file):
    output_path = Path(output_file)
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)


def main(data_dir=None, output_file=None):
    effective_data_dir = Path(data_dir) if data_dir is not None else DATA_DIR
    input_file = find_latest_input_file(effective_data_dir)
    effective_output_file = Path(output_file) if output_file is not None else effective_data_dir / 'tower_hamlets_ward_age_pop.json'

    results = process_census_data(input_file)
    save_results(results, effective_output_file)

    print(f"processed {len(results['wards'])} wards")
    print(f"output saved to {effective_output_file}")


if __name__ == '__main__':
    main()
