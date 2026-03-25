#!/usr/bin/env python3
import pandas as pd
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent

input_candidates = sorted(DATA_DIR.glob('TS011-2021-6-filtered-*.csv'))
if not input_candidates:
    raise FileNotFoundError(
        f'Could not find TS011 deprivation CSV in {DATA_DIR}'
    )

INPUT_FILE = input_candidates[-1]
OUTPUT_FILE = DATA_DIR / 'tower_hamlets_deprivation.json'
MASTER_FILE = DATA_DIR / 'tower_hamlets_health_ward_data.json'

TOWER_HAMLETS_WARD_CODES = [
    'E05009317', 'E05009318', 'E05009319', 'E05009320', 'E05009321',
    'E05009322', 'E05009323', 'E05009324', 'E05009325', 'E05009326',
    'E05009327', 'E05009328', 'E05009329', 'E05009330', 'E05009331',
    'E05009332', 'E05009333', 'E05009334', 'E05009335', 'E05009336',
]

WARD_NAME_CLEANUP = {
    'Mile End (Tower Hamlets)': 'Mile End',
    'Poplar (Tower Hamlets)': 'Poplar',
    "St Peter's (Tower Hamlets)": "St Peter's",
}


def calculate_ward_deprivation_score(ward_data):
    total_households = 0
    weighted_sum = 0

    # calculate average deprivation score per household
    for _, row in ward_data.iterrows():
        dim_code = row['Household deprivation (6 categories) Code']
        count = row['Observation']

        # only count codes 1-5 (ignore 'does not apply' codes)
        if dim_code >= 1 and dim_code <= 5:
            dimensions = dim_code - 1
            total_households += count
            weighted_sum += dimensions * count

    if total_households > 0:
        return weighted_sum / total_households
    return 0


def extract_deprivation_data():
    # load and filter out invalid rows
    df = pd.read_csv(INPUT_FILE)
    df = df[df['Household deprivation (6 categories) Code'] >= 1]

    # group by ward code
    all_wards = df.groupby('Electoral wards and divisions Code')
    national_scores = {}

    for code, ward_data in all_wards:
        score = calculate_ward_deprivation_score(ward_data)
        if score > 0:
            national_scores[code] = score

    sorted_scores = sorted(national_scores.values())
    total_wards = len(sorted_scores)

    wards = []

    for code in TOWER_HAMLETS_WARD_CODES:
        if code not in national_scores:
            continue

        ward_data = df[df['Electoral wards and divisions Code'] == code]
        ward_name = ward_data['Electoral wards and divisions'].iloc[0]
        ward_name = WARD_NAME_CLEANUP.get(ward_name, ward_name)

        score = national_scores[code]

        # calculate percentile based on rank
        rank_position = sum(1 for s in sorted_scores if s < score)
        percentile = (rank_position / total_wards) * 100

        # convert to 1-10 index
        deprivation_index = round(percentile / 10)
        deprivation_index = max(1, min(10, deprivation_index))

        # calculate percentage of households with 1+ deprivation dimensions
        total_households = ward_data['Observation'].sum()
        deprived_households = ward_data[
            ward_data['Household deprivation (6 categories) Code'] >= 2
        ]['Observation'].sum()
        pct_deprived = round((deprived_households / total_households) * 100, 1)

        wards.append({
            'ward': ward_name,
            'deprivation_index': deprivation_index,
            'national_percentile': round(percentile, 1),
            'pct_deprived': pct_deprived,
        })

    # sort highest deprivation first
    wards.sort(key=lambda x: x['national_percentile'], reverse=True)

    return {
        'metadata': {
            'source': 'Census 2021 Household Deprivation (TS011)',
            'area': 'Tower Hamlets',
            'total_national_wards': total_wards,
            'generated': pd.Timestamp.now().strftime('%Y-%m-%d'),
        },
        'wards': wards,
    }


def merge_into_master_data(deprivation_data):
    # load existing health ward data
    try:
        with open(MASTER_FILE, 'r') as f:
            master_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {MASTER_FILE}")
        return

    # map deprivation data by ward name for fast lookup
    deprivation_lookup = {w['ward']: w for w in deprivation_data['wards']}

    # map census names to match health data names
    name_mapping = {
        "Bethnal Green": "Bethnal Green East",
        "St Peter's": "Bethnal Green West"
    }

    # iterate through master wards to insert deprivation stats
    for ward_name, stats in master_data['wards'].items():
        lookup_name = ward_name

        # fallback to mapping if name mismatch occurs
        if ward_name not in deprivation_lookup:
            for census_name, health_name in name_mapping.items():
                if health_name == ward_name:
                    lookup_name = census_name
                    break

        # populate stats if data exists
        if lookup_name in deprivation_lookup:
            dep_info = deprivation_lookup[lookup_name]
            stats['deprivation'] = dep_info['deprivation_index']
            stats['national_percentile'] = dep_info['national_percentile']
            stats['pct_deprived'] = dep_info['pct_deprived']
        else:
            print(
                f"Warning: No deprivation data found to merge for {ward_name}")
            stats['deprivation'] = None

    # append metadata source safely even if sources is missing
    master_data.setdefault('metadata', {})
    master_data['metadata'].setdefault('sources', {})
    master_data['metadata']['sources']['deprivation'] = deprivation_data['metadata']['source']

    # save updated json
    with open(MASTER_FILE, 'w') as f:
        json.dump(master_data, f, indent=2)

    print(f"Successfully updated {MASTER_FILE} with deprivation indices!")


def main():
    # extract census deprivation stats
    data = extract_deprivation_data()

    # save raw deprivation output
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(data, f, indent=2)

    print(f'Saved: {OUTPUT_FILE}')

    # merge into application master data
    merge_into_master_data(data)


if __name__ == '__main__':
    main()
