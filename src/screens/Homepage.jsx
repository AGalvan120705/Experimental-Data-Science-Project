import { useNavigate } from 'react-router-dom';
import Statbox from '../boxes/Statbox';
import { Activity, MapPin, UsersRound, OctagonAlert, TrendingUp, BrainCircuit } from 'lucide-react';

const homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="grid-cols-1 pt-20 px-8">
      <div className="p-8 bg-gradient-to-br from-[#1a3a6c] to-[#0b2545] rounded-xl shadow-md">

        <span className="inline-flex items-center rounded-full border border-white/30 bg-gray-500/25 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          ♡ Public Health Intelligence
        </span>

        <h2 className="text-4xl font-bold text-white mb-4 pt-4">
          Sugar<span className="text-[#6cd4ff]">Aware</span>
        </h2>
        <p className="text-gray-300">Addressing the health inequalilites within Tower Hamlets through data-driven insights. This site will provide insights and recommendations for improving sugar consumption awareness and reducing health disparities.</p>
        <p className="text-amber-300 mt-4"> Disclaimer: Please do not take this information as medical advice. This site is only meant to inform and be insightful. Please talk to a medical profession for a real diagnosis.</p>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[#6cd4ff] text-white font-bold rounded-lg hover:bg-blue-400 transition"
          >
            Explore Dashboard →
          </button>
          <button 
            onClick={() => navigate('/map')}
            className="inline-flex items-center rounded-xl border border-white/30 bg-gray-500/25 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm"
          >
            View Borough Map
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Statbox 
          data = {{
            label: 'Current Prevalance',
            value: '15.2%', //need to get update to correct value
            comparisonText: 'from last year',
            comparisonValue: '+2.1%', //need to update to correct value
            trend: 'down', // can be 'up' or 'down' based on the trend
            iconBg: 'bg-green-100',
            iconColor: 'text-green-700',
            icon: Activity
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Statbox 
          data = {{
            label: 'Borough Prevalance',
            value: '15.2%', //need to get update to correct value
            comparisonText: 'Higher than london average (7.8%)',
            trend: 'up', // can be 'up' or 'down' based on the trend
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-700',
            icon: Activity
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Statbox 
          data = {{
            label: 'Highest Risk Ward',
            value: 'Canary Wharf', //need to get update to correct value
            comparisonText: 'risk score of 8.5/10',
            trend: 'up', // can be 'up' or 'down' based on the trend
            iconBg: 'bg-red-100',
            iconColor: 'text-red-700',
            icon: TrendingUp
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Statbox 
          data = {{
            label: 'Obesity Rate (Adults)',
            value: '48%', // no change, correct value
            comparisonText: 'Half of the popluation is at risk for T2D',
            trend: 'up', // can be 'up' or 'down' based on the trend
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-700',
            icon: UsersRound
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Statbox 
          data = {{
            label: 'Deprivtation Rank',
            value: '1st', // no change, correct value
            comparisonText: 'most deprived borough in London',
            trend: 'up', // can be 'up' or 'down' based on the trend
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-700',
            icon: OctagonAlert
          }}
        />
      </div>

      <h2 className="text-black font-extrabold text-2xl mt-4">Platform Capabilites</h2>
      <p className = "text-gray-600 mt-2 mb-4">Explore the various features of our platform designed to provide insights and recommendations for reducing health disparities in Tower Hamlets.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6"> 
        {/* // has a the trend down icon... needs to get fix 
        // //need to add button to navigate to the dashboard3
        */}
        <Statbox 
          data = {{
            value: 'Data Intelligence',
            comparisonText: 'Data vizualizations and insights across all 20 wards in Tower Hamlets, normalized for age and deprivation indices.',
            iconBg: 'bg-gradient-to-br from-blue-600 to-blue-900',
            iconColor: 'text-white',
            icon: BrainCircuit
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6"> 
      {/* // has a the trend down icon... needs to get fix
      //need to add button to navigate to the dashboard
       */} 
        <Statbox 
          data = {{
            value: 'Predictive Modelling',
            comparisonText: 'Interactive graph that forcecast the impact of various interventions on the prevalence of type 2 diabetes in Tower Hamlets.',
            iconBg: 'bg-gradient-to-br from-[#7ca982] to-[#4B7F52]',
            iconColor: 'text-white',
            icon: TrendingUp
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6"> 
      {/* // has a the trend down icon... needs to get fix
      // need to add button to navigate to the interactive map
       */} 
        <Statbox 
          data = {{
            value: 'Geographic Mapping',
            comparisonText: 'Interactive map that displays visualizations of diabetes, obesity and deprivation across all 20 wards in Tower Hamlets.',
            iconBg: 'bg-gradient-to-br from-[#6CD4FF] to-[#0075F2]',
            iconColor: 'text-white',
            icon: MapPin
          }}
        />
      </div>

    </div>

    
  )
}

export default homepage