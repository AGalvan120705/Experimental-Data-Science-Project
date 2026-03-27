import { useNavigate } from "react-router-dom";
import Statbox from "../boxes/Statbox";
import {
  Activity,
  MapPin,
  UsersRound,
  OctagonAlert,
  TrendingUp,
  BrainCircuit,
  HeartPulse,
} from "lucide-react";

const homepage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="pt-8 px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 ">
          Homepage
        </h2>
        <p className="text-gray-600 mb-4">
          Overview of the health landscape of Tower Hamlets, with a focus on type 2 diabetes indicators. Explore key statistics, trends, and insights to understand the current state of health in the borough.
        </p>
      </div>

    <div className="grid grid-cols-1 md:grid-cols-1 pt-4 px-8 gap-6">
      {/* What is diabetes? */}
      <div className="md:grid-cols-1 gap-6 px-6 py-4 bg-[#2f4f6f] rounded-xl shadow-md">
          <span className="inline-flex items-center rounded-full border border-white/30 bg-[#1a3a6c] px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            What is Type 2 diabetes?
          </span>
          <p className="text-white">
            Type 2 diabetes is a long term medical condition that affects the way your body processes blood sugar (glucose). It is characterized by insulin resistance, where the body's cells do not respond properly to insulin, and eventually leads to high blood sugar levels. 
            </p>
            <p className="text-white mt-2">
            If left unmanaged, type 2 diabetes can lead to serious health complications such as heart disease, kidney damage, nerve damage, and vision problems. It is important to manage type 2 diabetes through lifestyle changes, medication, and regular monitoring of blood sugar levels to prevent complications and maintain overall health.
          </p>
        </div>

      </div>
      {/* Main grid: Sugar Aware (left, spans 2 rows) + Right column boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-8">
        {/* Left column - Sugar Aware box spanning 2 rows */}
        <div className="md:row-span-2 p-8 bg-linear-to-br from-[#1a3a6c] to-[#0b2545] rounded-xl shadow-md">
          <span className="inline-flex items-center rounded-full border border-white/30 bg-gray-500/25 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            ♡ Public Health insights
          </span>

          <h2 className="text-4xl font-bold text-white mb-4 pt-4">
            Sugar<span className="text-[#6cd4ff]">Aware</span>
          </h2>
          <p className="text-gray-300">
            Addressing the health inequalilites within Tower Hamlets through
            data-driven insights. This site will provide insights and
            recommendations for improving sugar consumption awareness and
            reducing health disparities.
          </p>
          <p className="text-amber-300 mt-4">
            {" "}
            Disclaimer: Please do not take this information as medical advice.
            This site is only meant to inform and be insightful. Please talk to
            a medical profession for a real diagnosis.
          </p>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-[#6cd4ff] text-white font-bold rounded-lg hover:bg-blue-400 transition"
            >
              Explore Dashboard →
            </button>
            <button
              onClick={() => navigate("/interactive-map")}
              className="inline-flex items-center rounded-xl border border-white/30 bg-gray-500/25 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm"
            >
              View Borough Map
            </button>
          </div>
        </div>

        {/* Right column - Current Prevalence box */}
        <div>
          <Statbox
            data={{
              label: "Current Prevalance",
              value: "7.2%",
              comparisonText: " since 2012/13",
              comparisonValue: "+0.9%",
              trend: "up",
              iconBg: "bg-green-100",
              iconColor: "text-green-700",
              icon: Activity,
            }}
          />
        </div>

        {/* Right column - Personal Risk Assessment box */}
        <div className="p-8 bg-linear-to-r from-[#7CA982] to-[#519872] rounded-xl shadow-md">
          <div className="flex justify-between items-start">
            <div
              className={`p-3 rounded-xl bg-linear-to-br bg-white/20 backdrop-blur-sm`}
            >
              <HeartPulse className={`w-6 h-6 text-white`} />
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <p className="text-sm font-bold uppercase text-white">
              Personal Risk Assessment{" "}
            </p>
            <h3 className="text-md font-bold text-white">
              Check your risk for developing Diabetes in under 2 minutes
            </h3>
          </div>
          <div className="space-y-1 mt-4">
            <button
              type="button"
              onClick={() => navigate("/personal-risk-assessment")}
              className="text-white font-semibold transition-colors hover:text-gray-200"
            >
              {" "}
              Take Assessment →{" "}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 px-8">
        <Statbox
          data={{
            label: "Borough Prevalance",
            value: "7.2%",
            comparisonText: "same as London average (7.2%)",
            trend: "up",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-700",
            icon: Activity,
          }}
        />

        <Statbox
          data={{
            label: "Highest Risk Ward",
            value: "Shadwell",
            comparisonText: "11.8% prevalence rate",
            iconBg: "bg-red-100",
            iconColor: "text-red-700",
            icon: TrendingUp,
          }}
        />

        <Statbox
          data={{
            label: "Obesity Rate (Adults)",
            value: "48%", // no change, correct value
            comparisonText: "Half of the popluation is at risk for T2D",
            trend: "up", // can be 'up' or 'down' based on the trend
            iconBg: "bg-amber-100",
            iconColor: "text-amber-700",
            icon: UsersRound,
          }}
        />

        <Statbox
          data={{
            label: "Deprivation Rank",
            value: "1st", // no change, correct value
            comparisonText: "Most deprived borough in London",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-700",
            icon: OctagonAlert,
          }}
        />
      </div>

      <div className="px-8">
        <h2 className="text-black font-extrabold text-2xl mt-8">
          Platform Capabilities
        </h2>
        <p className="text-gray-600 mt-2 mb-4">
          Explore our features to provide insights and recommendations for
          actionable change in Tower Hamlets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 mt-6 px-8 gap-6 pb-12">
        <Statbox
          data={{
            value: "Data Intelligence",
            comparisonText:
              "Data visualisations and insights across all 20 wards in Tower Hamlets, normalized for age and deprivation indices.",
            iconBg: "bg-gradient-to-br from-blue-600 to-blue-900",
            iconColor: "text-white",
            icon: BrainCircuit,
            linkText: "Explore Data Intelligence →",
            linkColor: "text-blue-700",
            linkHoverColor: "hover:text-blue-800",
            linkHref: "/dashboard",
            linkOnClick: () => navigate("/dashboard"),
          }}
        />
        <Statbox
          data={{
            value: "Predictive Modelling",
            comparisonText:
              "Interactive graph that forcecast the impact of various interventions on the prevalence of type 2 diabetes in Tower Hamlets.",
            iconBg: "bg-gradient-to-br from-[#7ca982] to-[#4B7F52]",
            iconColor: "text-white",
            icon: TrendingUp,
            linkText: "View Forecast Model →",
            linkColor: "text-[#4B7F52]",
            linkHoverColor: "hover:text-[#3f6b45]",
            linkHref: "/predictive-modeling",
            linkOnClick: () => navigate("/predictive-modeling"),
          }}
        />
        <Statbox
          data={{
            value: "Geographic Mapping",
            comparisonText:
              "Interactive map that displays visualizations of diabetes, obesity and deprivation across all 20 wards in Tower Hamlets.",
            iconBg: "bg-gradient-to-br from-[#6CD4FF] to-[#0075F2]",
            iconColor: "text-white",
            icon: MapPin,
            linkText: "Open Interactive Map →",
            linkColor: "text-[#0075F2]",
            linkHoverColor: "hover:text-[#005fc2]",
            linkHref: "/interactive-map",
            linkOnClick: () => navigate("/interactive-map"),
          }}
        />
      </div>
    </>
  );
};

export default homepage;
