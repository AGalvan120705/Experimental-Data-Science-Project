"""Build the canonical ward insight dataset from existing processed JSON files."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


DATA_DIR = Path(__file__).resolve().parent.parent
DEFAULT_HEALTH_FILE = DATA_DIR / "tower_hamlets_health_ward_data.json"
DEFAULT_SUMMARY_FILE = DATA_DIR / "tower_hamlets_health_combined_stats.json"
DEFAULT_CENSUS_FILE = DATA_DIR / "tower_hamlets_ward_age_pop.json"
DEFAULT_OUTPUT_FILE = DATA_DIR / "ward_insights.json"

SCHEMA_VERSION = "1.0.0"

# Census names are the source of ward codes. These aliases connect them to the
# canonical names already used throughout the React dashboard.
CENSUS_TO_CANONICAL = {
    "Bethnal Green": "Bethnal Green East",
    "Mile End (Tower Hamlets)": "Mile End",
    "Poplar (Tower Hamlets)": "Poplar",
    "St Peter's (Tower Hamlets)": "Bethnal Green West",
}


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as file:
        return json.load(file)


def canonical_name(census_name: str) -> str:
    return CENSUS_TO_CANONICAL.get(census_name, census_name)


def metric(
    value: int | float | None,
    *,
    unit: str,
    period: str,
    source_id: str,
) -> dict[str, Any]:
    return {
        "value": value,
        "unit": unit,
        "period": period,
        "status": "available" if value is not None else "unavailable",
        "source_id": source_id,
    }


def average(values: list[int | float]) -> float:
    if not values:
        raise ValueError("Cannot calculate an average from an empty list")
    return round(sum(values) / len(values), 2)


def ranks_by_ward(values: dict[str, int | float | None]) -> dict[str, int]:
    """Rank available values from highest to lowest, using competition ranks."""
    available = sorted(
        (value for value in values.values() if value is not None), reverse=True
    )
    return {
        ward_name: available.index(value) + 1
        for ward_name, value in values.items()
        if value is not None
    }


def build_dataset(
    health_data: dict[str, Any],
    summary_data: dict[str, Any],
    census_data: dict[str, Any],
    *,
    generated_at: str | None = None,
) -> dict[str, Any]:
    health_wards = health_data.get("wards", {})
    census_wards = census_data.get("wards", {})

    census_by_canonical = {
        canonical_name(name): record for name, record in census_wards.items()
    }

    health_names = set(health_wards)
    census_names = set(census_by_canonical)
    if health_names != census_names:
        missing_census = sorted(health_names - census_names)
        missing_health = sorted(census_names - health_names)
        raise ValueError(
            "Ward sources do not align after normalization. "
            f"Missing from census: {missing_census}; "
            f"missing from health: {missing_health}"
        )

    if len(health_names) != 20:
        raise ValueError(f"Expected 20 wards, found {len(health_names)}")

    ward_codes = [record.get("ward_code") for record in census_by_canonical.values()]
    if None in ward_codes or len(set(ward_codes)) != len(ward_codes):
        raise ValueError("Every ward must have a unique, non-empty ward code")

    conditions = summary_data.get("conditions", {})
    try:
        diabetes_benchmark = conditions["diabetes"]["overall_prevalence_percentage"]
        obesity_benchmark = conditions["obesity"]["overall_prevalence_percentage"]
    except KeyError as error:
        raise ValueError(f"Missing required borough summary field: {error}") from error

    diabetes_values = {
        name: record.get("diabetes") for name, record in health_wards.items()
    }
    obesity_values = {
        name: record.get("obesity") for name, record in health_wards.items()
    }
    deprivation_values = {
        name: record.get("deprivation") for name, record in health_wards.items()
    }
    population_values = {
        name: census_by_canonical[name].get("total_population")
        for name in health_names
    }

    diabetes_ranks = ranks_by_ward(diabetes_values)
    obesity_ranks = ranks_by_ward(obesity_values)
    deprivation_ranks = ranks_by_ward(deprivation_values)
    population_ranks = ranks_by_ward(population_values)

    deprivation_benchmark = average(
        [value for value in deprivation_values.values() if value is not None]
    )
    population_benchmark = average(
        [value for value in population_values.values() if value is not None]
    )

    wards = []
    for ward_name in sorted(health_names):
        health = health_wards[ward_name]
        census = census_by_canonical[ward_name]
        diabetes = diabetes_values[ward_name]
        obesity = obesity_values[ward_name]
        deprivation = deprivation_values[ward_name]
        population = population_values[ward_name]

        wards.append(
            {
                "ward_code": census["ward_code"],
                "ward_name": ward_name,
                "metrics": {
                    "diabetes_prevalence": metric(
                        diabetes,
                        unit="percent",
                        period="2024-25",
                        source_id="nhs_qof_2024_25",
                    ),
                    "obesity_prevalence": metric(
                        obesity,
                        unit="percent",
                        period="2024-25",
                        source_id="nhs_qof_2024_25",
                    ),
                    "deprivation_index": metric(
                        deprivation,
                        unit="index_1_to_10",
                        period="2021",
                        source_id="census_ts011_2021",
                    ),
                    "national_deprivation_percentile": metric(
                        health.get("national_percentile"),
                        unit="percentile",
                        period="2021",
                        source_id="census_ts011_2021",
                    ),
                    "households_deprived": metric(
                        health.get("pct_deprived"),
                        unit="percent",
                        period="2021",
                        source_id="census_ts011_2021",
                    ),
                    "population": metric(
                        population,
                        unit="people",
                        period="2021",
                        source_id="census_ts007_2021",
                    ),
                    "median_age": metric(
                        census.get("median_age"),
                        unit="years",
                        period="2021",
                        source_id="census_ts007_2021",
                    ),
                },
                "comparisons": {
                    "diabetes_vs_borough_percentage_points": (
                        round(diabetes - diabetes_benchmark, 2)
                        if diabetes is not None
                        else None
                    ),
                    "diabetes_rank": diabetes_ranks.get(ward_name),
                    "obesity_vs_borough_percentage_points": (
                        round(obesity - obesity_benchmark, 2)
                        if obesity is not None
                        else None
                    ),
                    "obesity_rank": obesity_ranks.get(ward_name),
                    "deprivation_vs_ward_average": (
                        round(deprivation - deprivation_benchmark, 2)
                        if deprivation is not None
                        else None
                    ),
                    "deprivation_rank": deprivation_ranks.get(ward_name),
                    "population_vs_ward_average": (
                        round(population - population_benchmark, 2)
                        if population is not None
                        else None
                    ),
                    "population_rank": population_ranks.get(ward_name),
                },
            }
        )

    created_at = generated_at or datetime.now(timezone.utc).isoformat()
    return {
        "metadata": {
            "schema_version": SCHEMA_VERSION,
            "generated_at": created_at,
            "area": "Tower Hamlets",
            "ward_count": len(wards),
            "methodology_note": (
                "Diabetes and obesity values are estimates associated with GP "
                "practices mapped to wards, not direct measurements of all ward residents."
            ),
            "sources": {
                "nhs_qof_2024_25": {
                    "name": "NHS Digital QOF Practice Level Data",
                    "period": "2024-25",
                },
                "census_ts011_2021": {
                    "name": "Census 2021 Household Deprivation (TS011)",
                    "period": "2021",
                },
                "census_ts007_2021": {
                    "name": "Census 2021 Age (TS007)",
                    "period": "2021",
                },
            },
            "warnings": [
                {
                    "code": "health_data_unavailable",
                    "wards": sorted(
                        name
                        for name in health_names
                        if diabetes_values[name] is None
                        or obesity_values[name] is None
                    ),
                    "message": (
                        "GP-associated diabetes and obesity values are unavailable "
                        "for these wards and have not been estimated."
                    ),
                }
            ],
        },
        "borough_benchmarks": {
            "diabetes_prevalence": diabetes_benchmark,
            "obesity_prevalence": obesity_benchmark,
            "mean_ward_deprivation_index": deprivation_benchmark,
            "mean_ward_population": population_benchmark,
        },
        "wards": wards,
    }


def build_from_files(
    health_file: Path = DEFAULT_HEALTH_FILE,
    summary_file: Path = DEFAULT_SUMMARY_FILE,
    census_file: Path = DEFAULT_CENSUS_FILE,
    output_file: Path = DEFAULT_OUTPUT_FILE,
) -> dict[str, Any]:
    dataset = build_dataset(
        load_json(health_file),
        load_json(summary_file),
        load_json(census_file),
    )
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(json.dumps(dataset, indent=2) + "\n", encoding="utf-8")
    return dataset


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--health-file", type=Path, default=DEFAULT_HEALTH_FILE)
    parser.add_argument("--summary-file", type=Path, default=DEFAULT_SUMMARY_FILE)
    parser.add_argument("--census-file", type=Path, default=DEFAULT_CENSUS_FILE)
    parser.add_argument("--output-file", type=Path, default=DEFAULT_OUTPUT_FILE)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    dataset = build_from_files(
        args.health_file, args.summary_file, args.census_file, args.output_file
    )
    print(f"Built {len(dataset['wards'])} wards in {args.output_file}")


if __name__ == "__main__":
    main()
