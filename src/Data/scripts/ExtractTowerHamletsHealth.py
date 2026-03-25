import pandas as pd
import json
from datetime import datetime
from pathlib import Path
import openpyxl

"""
Extracts and processes health data for Tower Hamlets from NHS Digital QOF 2024-25 Practice Level Data.
- Reads diabetes and obesity prevalence data from provided Excel files.
- Filters data to include only practices within Tower Hamlets PCNs.
- Maps practices to wards and calculates prevalence statistics by ward.
- Generates summary statistics and ward-level data for mapping.
- Outputs results as JSON files for use in the dashboard.
"""


# =============================================================================
# CONFIGURATION
# =============================================================================

TOWER_HAMLETS_PCNS = [
    'Tower Hamlets Network 1 PCN',
    'Tower Hamlets Network 2 PCN',
    'Tower Hamlets Network 5 PCN',
    'Bromley By Bow And Stepney Health Cic PCN',
    'Tower Hamlets Network 7 PCN',
    'Tower Hamlets Network 8 PCN',
    'Tower Network PCN',
]

#GP Practice to Ward Mapping (from QOF 2024-25 practice codes)
PRACTICE_WARD_MAPPING = {
    # PCN 1 - The One Network
    'F84051': 'Bethnal Green East',
    'F84083': 'Bethnal Green East',
    'F84123': 'Bethnal Green East',
    'F84016': 'Weavers',
    # PCN 2 - East End Health Network
    'F84012': 'Whitechapel',
    'F84733': 'Whitechapel',
    'F84718': 'Spitalfields & Banglatown',
    'F84081': 'Spitalfields & Banglatown',
    # PCN 5 - Bow Health Network
    'F84055': 'Bow West',
    'F84696': 'Bow East',
    'F84044': 'Bow East',
    'F84034': 'Bow West',
    'F84030': 'Mile End',
    # PCN 6 - Bromley by Bow and Stepney
    'F84118': 'Bromley North',
    'Y03023': 'Bromley South',
    'F84122': 'Bromley South',
    # PCN 7 - Poplar and Limehouse
    'F84698': 'Lansbury',
    'F84054': 'Limehouse',
    'F84025': 'Poplar',
    'F84062': 'Lansbury',
    # PCN 8 - Healthy Island Partnership
    'F84747': 'Island Gardens',
    'F84656': 'Blackwall & Cubitt Town',
    'F84710': 'Blackwall & Cubitt Town',
    'F84647': 'Canary Wharf',
    # PCN 9 - Tower Network
    'F84079': "St Katharine's & Wapping",
    'F84039': 'Whitechapel',
    'F84114': 'Shadwell',
    'F84087': 'Stepney Green',
    'F84031': 'Stepney Green',
    'F84731': "St Katharine's & Wapping",
}

TOWER_HAMLETS_WARDS = [
    'Bethnal Green East', 'Bethnal Green West', 'Blackwall & Cubitt Town',
    'Bow East', 'Bow West', 'Bromley North', 'Bromley South', 'Canary Wharf',
    'Island Gardens', 'Lansbury', 'Limehouse', 'Mile End', 'Poplar', 'Shadwell',
    'Spitalfields & Banglatown', "St Dunstan's", "St Katharine's & Wapping",
    'Stepney Green', 'Weavers', 'Whitechapel',
]

# Default, hardcoded data file locations (change here for your environment)
DATA_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DM_FILE = DATA_DIR / 'qof-2425-prev-ach-pca-hd-prac.xlsx'
DEFAULT_OB_FILE = DATA_DIR / 'qof-2425-prev-ach-pca-ls-prac.xlsx'
DEFAULT_OUTPUT_PREFIX = str(DATA_DIR / 'tower_hamlets_health')

# =============================================================================
# SHEET CONFIGURATIONS
# =============================================================================

SHEET_CONFIGS = {
    'DM': {
        'header_row': 11,
        'data_start_row': 12,
        'age_group': '17+',
        'condition_name': 'Diabetes Mellitus (Type 2)',
        'condition_short': 'diabetes',
        'columns': {
            0: 'sub_icb_loc_ods_code',
            1: 'sub_icb_loc_ons_code',
            2: 'sub_icb_loc_name',
            3: 'pcn_ods_code',
            4: 'pcn_name',
            5: 'practice_code',
            6: 'practice_name',
            7: 'prev_2023_24_list_size',
            8: 'prev_2023_24_register',
            9: 'prev_2023_24_prevalence_pct',
            10: 'prev_2024_25_list_size',
            11: 'prev_2024_25_list_size_40plus',
            12: 'prev_2024_25_register',
            13: 'prev_2024_25_prevalence_pct',
            14: 'prev_yoy_change_pp',
        }
    },
    'OB': {
        'header_row': 11,
        'data_start_row': 12,
        'age_group': '18+',
        'condition_name': 'Obesity',
        'condition_short': 'obesity',
        'columns': {
            0: 'sub_icb_loc_ods_code',
            1: 'sub_icb_loc_ons_code',
            2: 'sub_icb_loc_name',
            3: 'pcn_ods_code',
            4: 'pcn_name',
            5: 'practice_code',
            6: 'practice_name',
            7: 'prev_2023_24_list_size',
            8: 'prev_2023_24_register',
            9: 'prev_2023_24_prevalence_pct',
            10: 'prev_2024_25_list_size',
            11: 'prev_2024_25_register',
            12: 'prev_2024_25_prevalence_pct',
            13: 'prev_yoy_change_pp',
        }
    }
}

def loaddata (filepath,sheet_names):
    config = SHEET_CONFIGS[sheet_names]
    df = pd.read_excel(filepath, sheet_name=sheet_names, header=None)


    #Extracting data
    dataRows = []
    for idx in range (config['data_start_row'], len(df)):
        row = df.iloc[idx]
        first_value= str(row.iloc[0]) if pd.notna(row.iloc[0]) else ''
        if 'source:' in first_value.lower() or 'copyright:' in first_value.lower():
            break
        if pd.isna(row.iloc[5]):
            continue
        dataRows.append(row.tolist())

    # Create DataFrame with specified columns
    result_df = pd.DataFrame(dataRows)
    rename_dict = {
        i: name for i, name in config['columns'].items() if i < len(result_df.columns)}
    result_df = result_df.rename(columns=rename_dict)
    result_df = result_df[[
        col for col in rename_dict.values() if col in result_df.columns
    ]]

    return result_df

def filter_tower_hamlets_data(df):
    # Filter to Tower Hamlets PCNs
    th_df = df[df['pcn_name'].isin(TOWER_HAMLETS_PCNS)].copy()

    # Map practices to wards and filter to Tower Hamlets wards
    th_df['ward'] = th_df['practice_code'].map(
        lambda x: PRACTICE_WARD_MAPPING.get(x, 'Unknown'))

    return th_df.sort_values(by=['pcn_name', 'practice_name']).reset_index(drop=True)


# =============================================================================
# Stats Calculations
# =============================================================================

def generate_condition_stats(df, config):
    for col in ['prev_2024_25_prevalence_pct', 'prev_2024_25_list_size',
                'prev_2023_24_register', 'prev_2024_25_prevalence_pct']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    total_dignosed = int(df['prev_2024_25_register'].sum())
    total_list_size = int(df['prev_2024_25_list_size'].sum())
    overall_prevalence = (total_dignosed / total_list_size) * 100 if total_list_size > 0 else 0
    prev_diagnosed = int(df['prev_2023_24_register'].sum())

    stats = {
          'condition': config['condition_name'],
          'condition_short': config['condition_short'],
          'age_group': config['age_group'],
            'total_diagnosed': total_dignosed,
            'total_dignosed_prev': prev_diagnosed,
            'total_year_on_year_change': total_dignosed - prev_diagnosed,
            'total_register_paitents': total_list_size,
            'overall_prevalence_percentage': round(overall_prevalence, 2),
            'practice_count': len(df),
            'by_ward': []
    }

    #ward breakdown
    for ward in sorted(df['ward'].unique()):
        if ward == 'Unknown':
            continue
        ward_df = df[df['ward'] == ward]

        ward_diagnosed = int(ward_df['prev_2024_25_register'].sum())
        ward_list_size = int(ward_df['prev_2024_25_list_size'].sum())
        ward_prevalence = (ward_diagnosed / ward_list_size) * 100 if ward_list_size > 0 else 0

        stats['by_ward'].append({
            'ward': ward,
            'practice_count': len(ward_df),
            'practices': ward_df['practice_name'].tolist(),
            'diagnosed': ward_diagnosed,
            'list_size': ward_list_size,
            'prevalence_percentage': round(ward_prevalence, 2)
        })

    #Sort by decending
    stats['by_ward'].sort(key=lambda x: x['prevalence_percentage'], reverse=True)

    return stats

def generate_combined_stats(diabetes_stats, obesity_stats):

    #Find wards without GP practices in the data
    covered_wards = set()
    if diabetes_stats:
        covered_wards.update([ward_stat['ward'] for ward_stat in diabetes_stats['by_ward']])
    if obesity_stats:
        covered_wards.update([ward_stat['ward'] for ward_stat in obesity_stats['by_ward']])

    uncovered_wards = [ward for ward in TOWER_HAMLETS_WARDS if ward not in covered_wards]

    combined = {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'data_period': '2024-25',
            'source': 'NHS Digital QOF 2024-25 Practice Level Data',
            'area': 'Tower Hamlets',
        },
        'summary':{
            'gp_practices': {
                'total_in_data': diabetes_stats['practice_count'] if diabetes_stats else 0,
                'total_in_borough': 32,
            },
            'pcn_counts': 7,
            'wards_covered': len(covered_wards),
            'wards_total': 20,
            'wards_without_gp': uncovered_wards,
        },
        'conditions': {}
    }

    if diabetes_stats:
        combined['conditions']['diabetes'] = {
            'name': diabetes_stats['condition'],
            'total_diagnosed': diabetes_stats['total_diagnosed'],
            'year_on_year_change': diabetes_stats['total_year_on_year_change'],
            'overall_prevalence_percentage': diabetes_stats['overall_prevalence_percentage'],
            'age_group': diabetes_stats['age_group'],
            'highest_ward': diabetes_stats['by_ward'][0]['ward'] if diabetes_stats['by_ward'] else None,
            'lowest_ward': diabetes_stats['by_ward'][-1]['ward'] if diabetes_stats['by_ward'] else None,
        }
    if obesity_stats:
        combined['conditions']['obesity'] = {
            'name': obesity_stats['condition'],
            'total_diagnosed': obesity_stats['total_diagnosed'],
            'year_on_year_change': obesity_stats['total_year_on_year_change'],
            'overall_prevalence_percentage': obesity_stats['overall_prevalence_percentage'],
                'age_group': obesity_stats['age_group'],
                'highest_ward': obesity_stats['by_ward'][0]['ward'] if obesity_stats['by_ward'] else None,
                'lowest_ward': obesity_stats['by_ward'][-1]['ward'] if obesity_stats['by_ward'] else None,
        }
    
    return combined

# =============================================================================
# Output Functions
# =============================================================================

def generate_map_ward_data(diabetes_stats, obesity_stats):
    
    diabetes_by_ward = {item['ward']: item['prevalence_percentage'] for item in (diabetes_stats or {}).get('by_ward', [])}
    obesity_by_ward = {item['ward']: item['prevalence_percentage'] for item in (obesity_stats or {}).get('by_ward', [])}

    wards = {
        ward: {
            'diabetes': diabetes_by_ward.get(ward),
            'obesity': obesity_by_ward.get(ward)
        }
        for ward in TOWER_HAMLETS_WARDS
    }

    return {
        'metadata': {
            'generated_at': datetime.now().isoformat(),
            'data_period': '2024-25',
            'source': {'health': 'NHS Digital QOF 2024-25 Practice Level Data'},
            'area': 'Tower Hamlets',
            'ward_count': len(TOWER_HAMLETS_WARDS),
        },
        'wards': wards
    }


def save_output(diabetes_stats, obesity_stats, output_prefix):

    Path(output_prefix).parent.mkdir(parents=True, exist_ok=True)
    paths = []
    #combined stats json
    combined_stats = generate_combined_stats(diabetes_stats, obesity_stats)
    combined_path = f"{output_prefix}_combined_stats.json"
    with open(combined_path, 'w') as f:
        json.dump(combined_stats, f, indent=2)
    paths.append(combined_path)

    # Ward-level data for mapping
    map_ward_data = generate_map_ward_data(diabetes_stats, obesity_stats)
    map_data_path = f"{output_prefix}_ward_data.json"
    with open(map_data_path, 'w') as f:
        json.dump(map_ward_data, f, indent=2)
    paths.append(map_data_path)

    return paths

# =============================================================================
# Main
# =============================================================================

def main():
    dm_file = Path(DEFAULT_DM_FILE)
    ob_file = Path(DEFAULT_OB_FILE)
    output_prefix = DEFAULT_OUTPUT_PREFIX

    diabetes_stats = None
    obesity_stats = None

    #Process diabetes data
    if dm_file.exists():
        df = loaddata(str(dm_file), 'DM')
        diabetes_stats = generate_condition_stats(
            filter_tower_hamlets_data(df), SHEET_CONFIGS['DM'])
    else:
        print(f"Warning: Diabetes data file not found at {dm_file}. Skipping diabetes stats.")

    #Process obesity data
    if ob_file.exists():
        df = loaddata(str(ob_file), 'OB')
        obesity_stats = generate_condition_stats(
            filter_tower_hamlets_data(df), SHEET_CONFIGS['OB'])
    else:
        print(f"Warning: Obesity data file not found at {ob_file}. Skipping obesity stats.")

    #Save outputs

    output_paths = save_output(diabetes_stats, obesity_stats, output_prefix)

    print('\nOutput files generated:')
    for path in output_paths:
        print(f' - {path}')
    print('\n Done.')

if __name__ == "__main__":
    main()