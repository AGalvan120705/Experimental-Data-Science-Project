import React from 'react'
import Dashboardstatbox from '../boxes/Dashboardstatbox';
import PrevalenceByWardChart from '../components/graphs/PrevalenceByWardChart';
import FiveYearTrend from '../components/graphs/FiveYearTrendGraph';
import RiskCorrelationGraph from '../components/graphs/RiskCorrelationGraph';
import { UserRoundPlus, HeartCrack, Brain, Hospital} from 'lucide-react';

const Dashboard = () => {
  return <>
    
    <div className="pt-12 px-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 ">Health Dashboard</h2>
      <p className="text-gray-600 mb-4">
        Current health statistics and insight of Tower Hamlets of Type 2 diabtes indicators across the borough.
      </p>
    
    </div>


    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 px-8">
 
      {/* // Total Diagnosed box */}
      <Dashboardstatbox
        data={{
          label: "Total Dignosed",
          value: "23,719",
          comparisonText: " increase since 2012/13",
          comparisonValue: "+0.9%",
          iconBg: "bg-blue-100",
          iconColor: "text-blue-700",
          icon: UserRoundPlus,
        }}
      />

      {/* // Mortality Box */}
      <Dashboardstatbox
        data={{
          label: "Mortality rate",
          value: "1,093",
          comparisonText: " increase since 2012/13",
          comparisonValue: "+1.10%",
          iconBg: "bg-red-100",
          iconColor: "text-red-700",
          icon: HeartCrack,
        }}
      />

      {/* // Mental well-being */}
      <Dashboardstatbox
        data={{
          label: "Mental well-being",
          value: "40%",
          comparisonText: " struggle with their mental well-being as a diabetic",
          iconBg: "bg-green-100",
          iconColor: "text-green-700",
          icon: Brain,
        }}
      />

      {/* //GP practice */}
      <Dashboardstatbox
        data={{
          label: "GP Practices",
          value: "30",
          comparisonText: " of GP reporting diabetes data in Tower Hamlets",
          comparisonValue: "+93.75%",
          iconBg: "bg-purple-100",
          iconColor: "text-purple-700",
          icon: Hospital,
        }}
      />

    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 px-8">
      {/* Prevalence by ward chart */}
      <div className="w-full">
        <PrevalenceByWardChart />
      </div>

      {/* 5 year trend chart */}
      <div className="w-full">
        <FiveYearTrend />
      </div>
    </div>

    {/* Risk correlation graph */}
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6 px-8 pb-8">
      <RiskCorrelationGraph />
    </div>



    
  </>
}

export default Dashboard
    