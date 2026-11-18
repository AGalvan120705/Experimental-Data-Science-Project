import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WardInsights from '../../src/screens/WardInsights';

const wardList = [
  { ward_code: 'E05009317', ward_name: 'Bethnal Green East', health_data_available: true },
  { ward_code: 'E05009329', ward_name: "St Dunstan's", health_data_available: false },
];

const detail = {
  ward: {
    ward_code: 'E05009317',
    ward_name: 'Bethnal Green East',
    metrics: {
      diabetes_prevalence: { value: 5.31, unit: 'percent', period: '2024-25', status: 'available', source_id: 'qof' },
      obesity_prevalence: { value: 7.98, unit: 'percent', period: '2024-25', status: 'available', source_id: 'qof' },
      deprivation_index: { value: 9, unit: 'index_1_to_10', period: '2021', status: 'available', source_id: 'census' },
      national_deprivation_percentile: { value: 89.1, unit: 'percentile', period: '2021', status: 'available', source_id: 'census' },
      households_deprived: { value: 60.2, unit: 'percent', period: '2021', status: 'available', source_id: 'census' },
      population: { value: 21089, unit: 'people', period: '2021', status: 'available', source_id: 'census' },
      median_age: { value: 29, unit: 'years', period: '2021', status: 'available', source_id: 'census' },
    },
    comparisons: {
      diabetes_vs_borough_percentage_points: -1.89,
      diabetes_rank: 14,
      obesity_vs_borough_percentage_points: -2.3,
      obesity_rank: 15,
      deprivation_vs_ward_average: 1.95,
      deprivation_rank: 3,
      population_vs_ward_average: 5572.1,
      population_rank: 4,
    },
  },
  borough_benchmarks: {
    diabetes_prevalence: 7.2,
    obesity_prevalence: 10.28,
    mean_ward_deprivation_index: 7.05,
    mean_ward_population: 15516.9,
  },
  dataset_schema_version: '1.0.0',
};

const summary = {
  ward_code: 'E05009317',
  ward_name: 'Bethnal Green East',
  overview: 'Bethnal Green East is one of Tower Hamlets\' 20 wards.',
  comparisons: ['Diabetes prevalence is 1.89 percentage points below the Tower Hamlets benchmark.'],
  data_gaps: [],
  guidance_card_ids: [],
  disclaimer: 'This is general public-health information, not medical advice.',
  model_metadata: { provider: 'deterministic', model: 'template-v1', prompt_version: 'v1', used_fallback: true },
};

function jsonResponse(payload, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(payload) });
}

describe('WardInsights', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url, options = {}) => {
      if (url.endsWith('/api/wards')) return jsonResponse(wardList);
      if (url.endsWith('/api/wards/E05009317/summary') && options.method === 'POST') return jsonResponse(summary);
      if (url.endsWith('/api/wards/E05009317')) return jsonResponse(detail);
      return jsonResponse({ detail: 'Unexpected request' }, false);
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  it('loads ward figures and generates a grounded briefing', async () => {
    render(<WardInsights />);

    expect(screen.getByRole('heading', { name: /ward insight summariser/i })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Bethnal Green East' })).toBeInTheDocument();
    expect((await screen.findAllByText('5.31%')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /generate ward summary/i }));

    expect(await screen.findByRole('heading', { name: /bethnal green east at a glance/i })).toBeInTheDocument();
    expect(screen.getByText(/1.89 percentage points below/i)).toBeInTheDocument();
    expect(screen.getByText(/general public-health information/i)).toBeInTheDocument();
    expect(screen.getByText(/7 of 7 indicators available/i)).toBeInTheDocument();
    expect(screen.getByText(/safe deterministic fallback used/i)).toBeInTheDocument();
  });

  it('shows an API error without replacing the page', async () => {
    fetch.mockImplementationOnce(() => jsonResponse({ detail: 'API unavailable' }, false));
    render(<WardInsights />);

    expect(await screen.findByRole('alert')).toHaveTextContent('API unavailable');
    expect(screen.getByRole('heading', { name: /ward insight summariser/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /generate ward summary/i })).toBeDisabled());
  });
});
