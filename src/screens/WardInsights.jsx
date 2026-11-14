import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Database,
  ExternalLink,
  FileText,
  Info,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { guidanceCards } from '../Data/guidanceCards';
import { generateWardSummary, getWard, listWards } from '../services/wardInsightsApi';

const metricConfig = [
  {
    key: 'diabetes_prevalence',
    label: 'Diabetes prevalence',
    benchmarkKey: 'diabetes_prevalence',
    benchmarkLabel: 'borough benchmark',
    scale: 15,
  },
  {
    key: 'obesity_prevalence',
    label: 'Obesity prevalence',
    benchmarkKey: 'obesity_prevalence',
    benchmarkLabel: 'borough benchmark',
    scale: 20,
  },
  {
    key: 'national_deprivation_percentile',
    label: 'Deprivation percentile',
    scale: 100,
    note: 'Higher means more deprived',
  },
  {
    key: 'households_deprived',
    label: 'Households deprived',
    scale: 100,
    note: 'Households in 1+ dimensions',
  },
];

function formatMetric(metric) {
  if (!metric || metric.value == null) return 'Unavailable';
  if (metric.unit === 'percent') return `${metric.value}%`;
  if (metric.unit === 'percentile') return metric.value;
  if (metric.unit === 'people') return Number(metric.value).toLocaleString('en-GB');
  return metric.value;
}

function MetricCard({ config, metric, benchmarks }) {
  const value = metric?.value;
  const barWidth = value == null ? 0 : Math.min(100, Math.max(3, (Number(value) / config.scale) * 100));
  const benchmark = config.benchmarkKey ? benchmarks?.[config.benchmarkKey] : null;
  const note = benchmark != null
    ? `${benchmark}% ${config.benchmarkLabel}`
    : config.note;

  return (
    <div className="min-h-44 border-b border-r border-slate-200 p-6 last:border-r-0 lg:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <p className="font-semibold text-slate-700">{config.label}</p>
        <p className={`text-2xl font-bold ${value == null ? 'text-slate-400' : 'text-[#0b2344]'}`}>
          {formatMetric(metric)}
        </p>
      </div>
      <div className="mt-8 h-2 bg-slate-100" aria-hidden="true">
        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${barWidth}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-500">{value == null ? 'No source value available' : note}</p>
    </div>
  );
}

function BriefingPanel({ detail, summary, generating, onCopy, copied }) {
  const ward = detail?.ward;
  const metrics = ward?.metrics;
  const metricValues = metrics ? Object.values(metrics) : [];
  const availableCount = metricValues.filter((metric) => metric.value != null).length;
  const totalCount = metricValues.length;
  const complete = totalCount > 0 && availableCount === totalCount;

  return (
    <section className="border border-slate-200 bg-white" aria-labelledby="briefing-title">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <h2 id="briefing-title" className="text-xl font-bold text-[#0b2344]">Plain-English briefing</h2>
          </div>
          <p className="mt-1 text-slate-500">
            {ward ? `Prepared for ${ward.ward_name}` : 'Select a ward to begin'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!summary}
          className="flex h-11 items-center justify-center gap-2 rounded-none border border-slate-300 bg-white px-4 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? <Check size={18} /> : <Clipboard size={18} />}
          {copied ? 'Copied' : 'Copy briefing'}
        </button>
      </div>

      <div className="min-h-95 px-8 py-10 lg:px-12">
        {generating ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center" role="status">
            <LoaderCircle className="animate-spin text-blue-600" size={34} />
            <p className="mt-4 font-semibold text-slate-700">Creating a grounded briefing…</p>
            <p className="mt-1 text-sm text-slate-500">Only published ward figures are being used.</p>
          </div>
        ) : summary ? (
          <div>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center bg-blue-50 text-blue-600">
                <Sparkles size={25} />
              </span>
              <div>
                <h3 className="text-2xl font-bold text-[#0b2344]">{summary.ward_name} at a glance</h3>
                <p className="text-sm text-slate-500">Based on the latest available ward dataset</p>
                <p className={`mt-1 text-xs font-semibold ${summary.model_metadata?.used_fallback ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {summary.model_metadata?.used_fallback
                    ? 'Safe deterministic fallback used'
                    : `Generated by ${summary.model_metadata?.provider || 'AI'} (${summary.model_metadata?.model || 'configured model'})`}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-5 text-[1.05rem] leading-8 text-slate-700">
              <p className="font-medium text-slate-900">{summary.overview}</p>
              {summary.comparisons.map((comparison) => <p key={comparison}>{comparison}</p>)}
              {summary.data_gaps.length > 0 && (
                <div className="border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  <p className="font-semibold">Data availability note</p>
                  {summary.data_gaps.map((gap) => <p key={gap}>{gap}</p>)}
                </div>
              )}
              <p className="text-sm text-slate-500">{summary.disclaimer}</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center bg-blue-50 text-blue-600">
              <Sparkles size={28} />
            </span>
            <h3 className="mt-5 text-xl font-bold text-[#0b2344]">Ready to create your ward briefing</h3>
            <p className="mt-2 max-w-md text-slate-500">
              Choose a ward and generate a summary grounded in the source figures shown below.
            </p>
          </div>
        )}
      </div>

      <div className="grid border-t border-slate-200 bg-slate-50 sm:grid-cols-3">
        <div className="border-b border-slate-200 px-7 py-5 sm:border-b-0 sm:border-r">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Prevalence</p>
          <p className="mt-2 text-3xl font-bold text-[#0b2344]">{formatMetric(metrics?.diabetes_prevalence)}</p>
          <p className="mt-1 text-sm text-slate-500">GP-associated estimate</p>
        </div>
        <div className="border-b border-slate-200 px-7 py-5 sm:border-b-0 sm:border-r">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Population</p>
          <p className="mt-2 text-3xl font-bold text-[#0b2344]">{formatMetric(metrics?.population)}</p>
          <p className="mt-1 text-sm text-slate-500">2021 Census</p>
        </div>
        <div className="px-7 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Data coverage</p>
          <p className={`mt-2 text-3xl font-bold ${complete ? 'text-emerald-700' : 'text-amber-700'}`}>
            {totalCount ? (complete ? 'Complete' : 'Partial') : '—'}
          </p>
          <p className="mt-1 text-sm text-slate-500">{availableCount} of {totalCount || 7} indicators available</p>
        </div>
      </div>
    </section>
  );
}

export default function WardInsights() {
  const [wards, setWards] = useState([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [detail, setDetail] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingWards, setLoadingWards] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    listWards()
      .then((items) => {
        if (!active) return;
        setWards(items);
        setSelectedCode(items[0]?.ward_code || '');
      })
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoadingWards(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedCode) return undefined;
    const controller = new AbortController();
    setLoadingDetail(true);
    setError('');
    setSummary(null);
    getWard(selectedCode, { signal: controller.signal })
      .then(setDetail)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => setLoadingDetail(false));
    return () => controller.abort();
  }, [selectedCode]);

  const selectedWard = useMemo(
    () => wards.find((ward) => ward.ward_code === selectedCode),
    [wards, selectedCode],
  );

  async function handleGenerate() {
    if (!selectedCode) return;
    setGenerating(true);
    setError('');
    try {
      const generatedSummary = await generateWardSummary(selectedCode);
      setSummary(generatedSummary);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!summary) return;
    const content = [
      `${summary.ward_name} at a glance`,
      summary.overview,
      ...summary.comparisons,
      ...summary.data_gaps,
      summary.disclaimer,
    ].join('\n\n');
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const metadata = detail?.ward;
  const dataPeriod = metadata?.metrics?.diabetes_prevalence?.period || 'latest available period';

  return (
    <div className="min-h-screen bg-[#f7f9fb] px-5 pb-14 pt-10 text-slate-800 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-360">
        <header className="border-b border-slate-200 pb-8">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <span className="flex items-center gap-2 text-blue-600"><Sparkles size={16} /> AI-assisted analysis</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Ward-level data</span>
          </div>
          <div className="mt-5 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[#0b2344] sm:text-5xl">Ward Insight Summariser</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                Turn local diabetes indicators into a clear, source-grounded briefing for residents,
                researchers and decision-makers.
              </p>
            </div>
            <div className="flex items-center gap-3 border-l-2 border-emerald-600 bg-emerald-50 px-5 py-4 text-emerald-900">
              <ShieldCheck size={23} />
              <p><strong>Privacy first.</strong> No personal or patient data is used.</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mt-6 flex items-start gap-3 border-l-4 border-red-500 bg-red-50 px-5 py-4 text-red-800" role="alert">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-semibold">The Ward Insights API could not complete that request.</p>
              <p className="text-sm">{error} Make sure the API is running on the configured URL.</p>
            </div>
          </div>
        )}

        <div className="mt-8 grid items-start gap-7 xl:grid-cols-[28rem_minmax(0,1fr)]">
          <aside className="border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-7 py-7">
              <div className="flex items-center gap-3">
                <MapPin className="text-[#0b2344]" size={24} />
                <h2 className="text-xl font-bold text-[#0b2344]">Choose an area</h2>
              </div>
              <p className="mt-2 leading-7 text-slate-600">Select a ward to create a plain-English data briefing.</p>
            </div>
            <div className="p-7">
              <label htmlFor="ward-select" className="font-semibold text-slate-800">Tower Hamlets ward</label>
              <select
                id="ward-select"
                value={selectedCode}
                onChange={(event) => setSelectedCode(event.target.value)}
                disabled={loadingWards}
                className="mt-3 h-15 w-full rounded-none border border-slate-400 bg-white px-4 font-semibold text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                {loadingWards && <option>Loading wards…</option>}
                {wards.map((ward) => (
                  <option key={ward.ward_code} value={ward.ward_code}>
                    {ward.ward_name}{ward.health_data_available ? '' : ' — partial data'}
                  </option>
                ))}
              </select>

              <div className="mt-8 border-y border-slate-200 py-7">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Briefing will include</p>
                <ul className="mt-4 space-y-3 text-slate-700">
                  {['Local prevalence and population', 'Key inequality indicators', 'Borough-level comparisons'].map((item) => (
                    <li key={item} className="flex items-center gap-3"><CheckCircle2 className="text-emerald-600" size={18} />{item}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={!selectedCode || loadingDetail || generating}
                className="mt-7 flex h-15 w-full items-center justify-center gap-3 rounded-none bg-blue-600 px-5 font-bold text-white shadow-[0_3px_0_#164e9f] hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
              >
                {generating ? <LoaderCircle className="animate-spin" size={20} /> : null}
                {generating ? 'Generating briefing…' : 'Generate ward summary'}
                {!generating && <ArrowRight size={19} />}
              </button>
              <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-slate-500">
                <Info className="mt-0.5 shrink-0" size={17} />
                The summariser is constrained to the published figures shown alongside its response.
              </p>
              {selectedWard && !selectedWard.health_data_available && (
                <p className="mt-4 flex items-start gap-2 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                  <AlertCircle className="mt-0.5 shrink-0" size={17} />
                  Some GP-associated health figures are unavailable for this ward.
                </p>
              )}
            </div>
          </aside>

          <BriefingPanel detail={detail} summary={summary} generating={generating} onCopy={handleCopy} copied={copied} />
        </div>

        <section className="mt-9 border border-slate-200 bg-white" aria-labelledby="source-figures-title">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-7 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Database className="text-emerald-700" size={24} />
                <h2 id="source-figures-title" className="text-xl font-bold text-[#0b2344]">Source figures</h2>
              </div>
              <p className="mt-1 text-slate-500">The exact inputs used to produce the briefing. Values update with your ward selection.</p>
            </div>
            <span className="bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
              {loadingDetail ? 'Refreshing…' : `Data period ${dataPeriod}`}
            </span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4">
            {metricConfig.map((config) => (
              <MetricCard
                key={config.key}
                config={config}
                metric={detail?.ward?.metrics?.[config.key]}
                benchmarks={detail?.borough_benchmarks}
              />
            ))}
          </div>
          <div className="flex flex-col justify-between gap-2 bg-slate-50 px-7 py-5 text-sm text-slate-500 sm:flex-row">
            <p>Sources: NHS Quality and Outcomes Framework and Census 2021.</p>
            <p>GP-associated figures are estimates and may be revised.</p>
          </div>
        </section>

        <section className="mt-9" aria-labelledby="guidance-title">
          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={24} />
            <div>
              <h2 id="guidance-title" className="text-xl font-bold text-[#0b2344]">Trusted public-health guidance</h2>
              <p className="text-sm text-slate-500">General information presented separately from the ward statistics.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {guidanceCards.map((card) => (
              <a
                key={card.id}
                href={card.url}
                target="_blank"
                rel="noreferrer"
                className="group border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">{card.publisher}</span>
                  <ExternalLink className="text-slate-400 group-hover:text-blue-600" size={18} />
                </div>
                <h3 className="mt-3 font-bold text-[#0b2344]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.summary}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
