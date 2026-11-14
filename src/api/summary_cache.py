"""SQLite-backed daily cache and audit log for ward summaries."""

from __future__ import annotations

import json
import sqlite3
from datetime import UTC, datetime
from pathlib import Path

from src.api.models import WardSummaryResponse


class SummaryCache:
    """Store a single generated result for each ward and UTC calendar day."""

    def __init__(self, path: Path):
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._initialise()

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path, timeout=10)

    def _initialise(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS ward_summary_cache (
                    ward_code TEXT NOT NULL,
                    dataset_version TEXT NOT NULL,
                    cache_date TEXT NOT NULL,
                    response_json TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    PRIMARY KEY (ward_code, dataset_version, cache_date)
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS ward_summary_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    ward_code TEXT NOT NULL,
                    dataset_version TEXT NOT NULL,
                    prompt_version TEXT NOT NULL,
                    model TEXT NOT NULL,
                    latency_ms INTEGER NOT NULL,
                    validation_result TEXT NOT NULL,
                    cache_hit INTEGER NOT NULL,
                    response_json TEXT NOT NULL
                )
                """
            )

    @staticmethod
    def today() -> str:
        return datetime.now(UTC).date().isoformat()

    def get(self, ward_code: str, dataset_version: str) -> WardSummaryResponse | None:
        with self._connect() as connection:
            row = connection.execute(
                """SELECT response_json FROM ward_summary_cache
                   WHERE ward_code = ? AND dataset_version = ? AND cache_date = ?""",
                (ward_code, dataset_version, self.today()),
            ).fetchone()
        return WardSummaryResponse.model_validate_json(row[0]) if row else None

    def put(self, summary: WardSummaryResponse, dataset_version: str) -> None:
        with self._connect() as connection:
            connection.execute(
                """INSERT OR REPLACE INTO ward_summary_cache
                   (ward_code, dataset_version, cache_date, response_json, created_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (
                    summary.ward_code,
                    dataset_version,
                    self.today(),
                    summary.model_dump_json(),
                    datetime.now(UTC).isoformat(),
                ),
            )

    def log(
        self,
        summary: WardSummaryResponse,
        dataset_version: str,
        latency_ms: int,
        validation_result: str,
        cache_hit: bool,
    ) -> None:
        metadata = summary.model_metadata
        with self._connect() as connection:
            connection.execute(
                """INSERT INTO ward_summary_log
                   (timestamp, ward_code, dataset_version, prompt_version, model, latency_ms,
                    validation_result, cache_hit, response_json)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    datetime.now(UTC).isoformat(), summary.ward_code, dataset_version,
                    metadata.prompt_version, metadata.model, latency_ms, validation_result,
                    int(cache_hit), json.dumps(summary.model_dump(mode="json")),
                ),
            )
