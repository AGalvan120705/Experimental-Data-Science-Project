import { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';

import wardBoundaries from '../../../Tower_Hamlet_ward_boundaries.json';
import wardData from '../../Data/tower_hamlets_health_ward_data.json';
import wardAgePopData from '../../Data/tower_hamlets_ward_age_pop.json';

const WARD_GEOJSON = wardBoundaries;
const WARD_DATA = wardData.wards || {};

const WARD_AGE_POP_DATA_BY_CODE = Object.values(wardAgePopData.wards).reduce((acc, curr) => {
  acc[curr.ward_code] = curr;
  return acc;
}, {});


const LAYERS = {
  diabetes: {
    label: 'Diabetes prevalence',
    unit: '%',
    colors: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e3a8a'],
    thresholds: [4, 5.5, 7, 8.5, 10, 12]
  },
  obesity: {
    label: 'Obesity rate',
    unit: '%',
    colors: ['#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c'],
    thresholds: [7.5, 9, 10.5, 12, 13.5, 15]
  },
  deprivation: {
    label: 'Deprivation index',
    unit: '/10',
    colors: ['#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8'],
    thresholds: [2, 3.5, 5, 6.5, 8, 9]
  },
};

function getColor(value, layer) {
    if (value === null || value === undefined) return '#e5e7eb'; // gray for missing data
    const l = LAYERS[layer];
    for (let i = 0; i < l.thresholds.length; i++) {
        if (value < l.thresholds[i]) {
            return l.colors[i];
        }
    }
    return l.colors[l.colors.length - 1];
}

function getRisk(val, layer) {
    if (val === null || val === undefined) return { text: 'No GP Data', bg: '#f8f8f8', color: '#6b7280' };

    const levels = { diabetes: { h: 9, m: 6.5 }, obesity: { h: 12, m: 9.5 }, deprivation: { h: 7, m: 4 } };
    const l = levels[layer];
    
    let highText = layer === 'deprivation' ? 'High deprivation' : 'High risk';
    let modText = layer === 'deprivation' ? 'Moderate deprivation' : 'Moderate risk';
    let lowText = layer === 'deprivation' ? 'Low deprivation' : 'Lower risk';

    if (val >= l.h) return { text: highText, bg: '#fef2f2', color: '#dc2626' };
    if (val >= l.m) return { text: modText, bg: '#fffbeb', color: '#d97706' };
    return { text: lowText, bg: '#f0fdf4', color: '#16a34a' };
}

// convert GeoJSON to SVG paths
function geoToSvgPath(coordinates, bounds, width, height, padding) {
    const [minLon, minLat, maxLon, maxLat] = bounds;
    const scaleX = (width - 2 * padding) / (maxLon - minLon);
    const scaleY = (height - 2 * padding) / (maxLat - minLat);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = padding + (width - 2 * padding - (maxLon - minLon) * scale) / 2;
    const offsetY = padding + (height - 2 * padding - (maxLat - minLat) * scale) / 2;

    return coordinates[0].map((coord, i) => {
        const x = offsetX + (coord[0] - minLon) * scale;
        const y = offsetY + (maxLat - coord[1]) * scale; // invert Y axis
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ') + ' Z';
}


export default function TowerHamletsMap() {
    const [selectedLayer, setSelectedLayer] = useState('diabetes');
    const [hoveredWard, setHoveredWard] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);

    const bounds = useMemo(() => {
        let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
        WARD_GEOJSON.features.forEach(f => {
            f.geometry.coordinates[0].forEach(([lon, lat]) => {
                minLon = Math.min(minLon, lon);
                minLat = Math.min(minLat, lat);
                maxLon = Math.max(maxLon, lon);
                maxLat = Math.max(maxLat, lat);
            });
        });
        return [minLon, minLat, maxLon, maxLat];
    }, []);

    const width = 600;
    const height = 500;
    const padding = 20;
    const layer = LAYERS[selectedLayer];

    const otherLayers = Object.keys(LAYERS).filter((l) => l !== selectedLayer);
    const displayNames = { 
        diabetes: 'Diabetes', 
        obesity: 'Obesity', 
        deprivation: 'Deprivation' 
    };
    const maxScale ={
        diabetes: 12,
        obesity: 15,
        deprivation: 10
    };
    const barColor = {
        diabetes: '#3b82f6',
        obesity: '#f97316',
        deprivation: '#9333ea'
    };

    const selectedFeature = WARD_GEOJSON.features.find(f => f.properties.name === selectedWard);
    const selectedCode = selectedFeature?.properties.code;
    const agePopData = selectedCode ? WARD_AGE_POP_DATA_BY_CODE[selectedCode] : null;
    
    return (
        <div className="w-full mx-auto p-3 lg:p-5">
            <div className = "bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="flex flex-col lg:flex-row lg: items-start">
                    {/* Map area */}
                    <div className ="flex-1 relative bg-slate-50" style={{minHeight: 'calc(100vh - 180px)'}} >
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ height: 'calc(100vh - 160px)' }}>
                            <defs>
                                <filter id="glow">
                                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#3b82f6" floodOpacity="0.4" />
                                </filter>
                            </defs>
                            {WARD_GEOJSON.features.map(feature => {
                                const name = feature.properties.name;
                                const data = WARD_DATA[name];
                                const val = data ? data[selectedLayer] : null;
                                const color = getColor(val, selectedLayer);
                                const isHovered = hoveredWard === name;
                                const isSelected = selectedWard === name;
                                const isHighlighted = isHovered || isSelected;
                                const path = geoToSvgPath(feature.geometry.coordinates, bounds, width, height, padding);

                                return (
                                    <path
                                        key={feature.properties.code}
                                        d={path}
                                        fill={color}
                                        stroke={isHighlighted ? '#3b82f6' : '#fff'}
                                        strokeWidth={isHighlighted ? 2 : 0.8}
                                        strokeLinejoin="round"
                                        filter={isHighlighted ? 'url(#glow)' : ''}
                                        style={{
                                            cursor: 'pointer',
                                            opacity: selectedWard && !isHighlighted ? 0.25 : hoveredWard && !isHighlighted ? 0.4 : 1,
                                            transition: 'opacity 0.15s, stroke-width 0.15s'
                                        }}
                                        onMouseEnter={() => setHoveredWard(name)}
                                        onMouseLeave={() => setHoveredWard(null)}
                                        onClick={() => setSelectedWard(name === selectedWard ? null : name)}
                                    />
                                );
                            })}
                        </svg>
                        {/* Layer control */}
                        <div className="absolute top-4 left-4">
                            <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 p-3 w-48">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layers size={16} className="text-gray-500" />
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Map layers</p>
                                </div>
                                <div className="space-y-1">
                                    {Object.entries(LAYERS).map(([id, l]) => (
                                        <button
                                            key={id}
                                            onClick={() => setSelectedLayer(id)}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${selectedLayer === id
                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Low</span>
                                        <span>High</span>
                                    </div>
                                    <div className="h-2 rounded-full"
                                    style={{
                                        background: `linear-gradient(to right, ${layer.colors.join(',')})`
                                    }}
                                    />
                                </div>
                        </div>

                        {/* Hover/selected Tooltip */}
                        {(hoveredWard || selectedWard) && (
                            <div className ="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-lg shadow-lg border px-3 py-2">
                                <p className="font-semibold text-gray-900 text-sm">{hoveredWard || selectedWard}</p>
                                <p className="text-blue-600 text-sm">
                                    {layer.label}: {WARD_DATA[hoveredWard || selectedWard]?.[selectedLayer] != null ? `${WARD_DATA[hoveredWard || selectedWard][selectedLayer]}${layer.unit}` : 'No GP data for this ward'}
                                </p>
                            </div>
                        )}
                    </div>

                        {/* Sidebar */}
                        {selectedWard && (
                            <div className="lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-100 p-5">
                                <div className="flex justify-between items-start mb-5">
                                    <h2 className="text-xl font-bold text-gray-900">{selectedWard}</h2>
                                    <button
                                    onClick={() => setSelectedWard(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                    >
                                        X
                                    </button>
                                </div>

                                {!WARD_DATA[selectedWard] ? (
                                    <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-sm text-yellow-800">
                                        No data available for this ward.
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-blue-50 rounded-xl p-4 mb-5">
                                            <p className="text-sm text-blue-600 font-medium mb-1">{layer.label}</p>
                                            <div className="flex items-baseline gap-2">
                                                {WARD_DATA[selectedWard][selectedLayer] != null ? (
                                                    <>
                                                        <span className="text-4xl font-bold">{WARD_DATA[selectedWard][selectedLayer]}</span>
                                                        <span className="text-lg text-gray-500">{layer.unit}</span>
                                                        <span
                                                            className="ml-3 px-3 py-1 rounded-md text-sm font-medium"
                                                            style={{
                                                            backgroundColor: getRisk(WARD_DATA[selectedWard][selectedLayer], selectedLayer).bg,
                                                            color: getRisk(WARD_DATA[selectedWard][selectedLayer], selectedLayer).color
                                                        }}
                                                    >
                                                        {getRisk(WARD_DATA[selectedWard][selectedLayer], selectedLayer).text}
                                                    </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-semibold text-gray-500">N/A - No GP data</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-5">
                                            {otherLayers.map((metric) => {
                                                const value = WARD_DATA[selectedWard][metric];
                                                const hasData = value != null;
                                                return (
                                                    <div key={metric}>
                                                        <div className="flex justify-between text-sm mb-2">
                                                            <span className="text-gray-600">{displayNames[metric]}</span>
                                                            <span className="font-semibold text-gray-600">
                                                            {hasData ? (metric === 'deprivation' ? `${value}/10` : `${value}%`) : 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                            {hasData && (
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                width: `${(value / maxScale[metric]) * 100}%`,
                                                                backgroundColor: barColor[metric],
                                                                }}
                                                            />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Population</p>
                                                <p className="text-2xl text-gray-900 font-bold mt-1">
                                                    {agePopData?.total_population ? agePopData.total_population.toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="text-xs text-gray-400 uppercase tracking-wide">Median Age</p>
                                                <p className="text-2xl text-gray-900 font-bold mt-1">
                                                    {agePopData?.median_age ? agePopData.median_age : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div> 
                        )}
                    </div>

                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                        Boundary data: ONS Open Geography Portal © Crown copyright. Health data: NHS QOF 2024-25.
                    </div>
            </div>
        </div>

    );
}