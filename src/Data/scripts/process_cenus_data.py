import pandas as pd
import json
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
DATA_DIR = SCRIPT_DIR.parent

input_candidates = sorted(DATA_DIR.glob('TS007-2021-3-filtered-*.csv'))
if not input_candidates:
    raise FileNotFoundError(
        f'Could not find TS007 census CSV in {DATA_DIR}'
    )

INPUT_FILE = input_candidates[-1]
OUTPUT_FILE = DATA_DIR / 'tower_hamlets_ward_age_pop.json'

# load the census age data
df = pd.read_csv(INPUT_FILE)

# tower hamlets ward codes (E05009317 to E05009336)
th_codes = [f'E0500931{i}' for i in range(7, 10)] + \
           [f'E0500932{i}' for i in range(0, 10)] + \
           [f'E0500933{i}' for i in range(0, 7)]

# filter to tower hamlets wards only
th_df = df[df['Electoral wards and divisions Code'].isin(th_codes)]


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


# process each ward
results = {"wards": {}}

for code in sorted(th_codes):
    ward_data = th_df[th_df['Electoral wards and divisions Code'] == code]
    if len(ward_data) > 0:
        ward_name = ward_data['Electoral wards and divisions'].iloc[0]
        total_pop, median_age = calculate_stats(ward_data)

        results["wards"][ward_name] = {
            "ward_code": code,
            "total_population": int(total_pop),
            "median_age": int(median_age)
        }

# output json file
with open(OUTPUT_FILE, 'w') as f:
    json.dump(results, f, indent=2)

print(f"processed {len(results['wards'])} wards")
print(f"output saved to {OUTPUT_FILE}")
