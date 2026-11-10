"""Read-only access to the canonical ward insight dataset."""

from __future__ import annotations

import json
from pathlib import Path

from src.api.models import WardDataset, WardRecord


DEFAULT_DATASET_PATH = (
    Path(__file__).resolve().parents[1] / "Data" / "ward_insights.json"
)


class WardNotFoundError(LookupError):
    pass


class WardRepository:
    def __init__(self, dataset_path: Path = DEFAULT_DATASET_PATH):
        self.dataset_path = dataset_path
        self.dataset = self._load_dataset()
        self._wards_by_code = {ward.ward_code: ward for ward in self.dataset.wards}

        if len(self._wards_by_code) != len(self.dataset.wards):
            raise ValueError("Dataset contains duplicate ward codes")

    def _load_dataset(self) -> WardDataset:
        with self.dataset_path.open(encoding="utf-8") as file:
            return WardDataset.model_validate(json.load(file))

    def list_wards(self) -> list[WardRecord]:
        return sorted(self.dataset.wards, key=lambda ward: ward.ward_name)

    def get_ward(self, ward_code: str) -> WardRecord:
        try:
            return self._wards_by_code[ward_code]
        except KeyError as error:
            raise WardNotFoundError(ward_code) from error
