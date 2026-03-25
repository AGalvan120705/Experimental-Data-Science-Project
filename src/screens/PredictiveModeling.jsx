import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

const PredictiveModeling = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-12 px-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 ">
        Prevalence Forecast Model
      </h2>
      <p className="text-gray-600 mb-4">
        Linear regression projection based on current diabete prevalence across
        the wards.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="md:row-span-2 p-8 bg-linear-to-br from-[#134074] to-blue-600 rounded-xl shadow-md">
          <p className="text-white text-xl font-bold flex items-center">
            Projected Impact
          </p>
          <p className="text-gray-200">Estimated prevalence in 2030</p>

          {/* data need to be updated to correct values */}
          <h1 className="text-2xl font-bold text-white mt-4">9.5%</h1>
          <p className="text-gray-200 mt-1">
            Based on current trends, the model predicts that by 2030, the
            diabetes prevalence will reach, insert value, representing
            appromimately, insert value, residents.
          </p>

          <p className="text-xs text-gray-200 mt-4 pt-4 border-t-[0.5px] border-white/25">
            Projections assume that current trends in diabetes prevalence and
            risk factors will continue without significant intervention to
            increase support with diatery and with physical activity programs.
          </p>
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
  );
};

export default PredictiveModeling;
