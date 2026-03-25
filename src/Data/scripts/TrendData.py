import pandas as pd
import json
from datetime import datetime
from pathlib import Path

Tower_Hamlets_Code = 'E09000030'
DATA_DIR = Path(__file__).resolve().parent.parent
Input_File = DATA_DIR / 'Trends.csv'
Output_File = DATA_DIR / 'tower_hamlets_trends.json'
Num_Years = 6

def extract_trends_data():
    df = pd.read_csv(Input_File)
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]

    th_data = df[(df['area_code'] == Tower_Hamlets_Code) & (df['value'].notna())]
    th_data = th_data.sort_values('time_period_sortable', ascending=False).head(Num_Years)
    th_data = th_data.sort_values('time_period_sortable')

    return [
        {
            'period': row['time_period'],
            'year': int(str(row['time_period_sortable'])[:4]),
            'value': round(float(row['value']), 2)
        }
        for _, row in th_data.iterrows()
    ]

def main():
    data = extract_trends_data()

    payload = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'source': {
                'name': 'Department of Health and Social Care Fingertips Public Health Profiles',
                'acronym': 'DHSC Fingertips',
                'note': 'Data downloaded from the Fingertips public health profiles website.'
            },
            'area': 'Tower Hamlets',
            'area_code': Tower_Hamlets_Code,
            'years_included': Num_Years
        },
        'trends': data
    }

    with open(Output_File, 'w') as f:
        json.dump(payload, f, indent=2)

    print(f"Extracted trends data for Tower Hamlets saved to {Output_File}")

if __name__ == "__main__":
    main()