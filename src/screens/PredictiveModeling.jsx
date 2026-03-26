import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import PrevalenceForecast, { generateChartData, FORECAST_END_YEAR } from '../components/graphs/PrevalenceForecastGraph';
import trendData from '../Data/tower_hamlets_trends.json';

const PredictiveModeling = () => {
  const navigate = useNavigate();

  const { chartData } = useMemo(() => generateChartData(trendData), []);

  const baselineEnd = chartData.find(d => d.year === FORECAST_END_YEAR)?.baseline;

  // Estimate affected residents (rough calculation)
  const estimatedPopulation2030 = 350000; // Tower Hamlets projected population
  const estimatedAffected = Math.round((baselineEnd / 100) * estimatedPopulation2030);

  return (
    <div className="pt-12 px-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 ">
        Prevalence Forecast Model
      </h2>
      <p className="text-gray-600 mb-4">
        Linear regression projection based on current diabete prevalence across
        the wards.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pb-4">
        <div className="lg:col-span-8 min-w-0">
          <PrevalenceForecast />
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <h4 className="font-semibold text-blue-100 text-sm uppercase tracking-wider">Projected Impact</h4>
            <p className="text-blue-200 text-sm mt-1">Estimated prevalence in 2030</p>
            <p className="text-5xl font-bold mt-4 mb-2 drop-shadow-sm">{baselineEnd}%</p>
            <p className="text-blue-50 text-sm mt-4 leading-relaxed opacity-95">
                Based on current trends, the model projects Type 2 diabetes prevalence will reach{' '}
                <span className="font-bold text-white">{baselineEnd}%</span> by 2030, representing approximately{' '}
                <span className="font-bold text-white">{estimatedAffected.toLocaleString()}</span> residents.
            </p>
            <div className="mt-5 pt-5 border-t border-blue-400/30">
                <p className="text-blue-100 text-xs leading-relaxed opacity-80">
                  Projections assume that current trends in diabetes prevalence and
                  risk factors will continue without significant intervention to
                  increase support with diatery and with physical activity programs.
                </p>
            </div>
          </div>

          <div className="p-8 bg-white rounded-xl shadow-md">
            <div className="flex justify-start items-center -ml-4">
              <div className=" bg-[#e9f3eb] p-3 rounded-xl">
                <MapPin className={`w-6 h-6 text-[#59835f]`} />
              </div>
              <p className={` pl-3 text-xl font-bold text-black`}>Take Action</p>
            </div>

            <p className=" text-sm text-gray-600 mt-4">
              Explore targeted-based recommendations to address the projected
              increase in diabetes prevalence within your community.
            </p>

            <button
              className="mt-6 px-4 py-2 bg-[#7CA982] text-white rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => navigate("/recommendations")}
            >
              View Recommendations →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveModeling;
