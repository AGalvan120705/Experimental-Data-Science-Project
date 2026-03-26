import React, { useState } from 'react'
import RiskAssessmentBox from '../boxes/RiskAssessmentBox';
import { BadgeCheck, ExternalLink, Phone, MapPin } from 'lucide-react';

const PersonalRiskAssessment = () => {
    const [assessmentComplete, setAssessmentComplete] = useState(false);

function PWithIcon({ children, icon = BadgeCheck }) {
    return (
        <p className="flex items-center gap-2 text-sm">
        <BadgeCheck className={`mt-0.5 h-4 w-4 shrink-0 text-green-500`} />
        <span>{children}</span>
        </p>
    );
}

  return (
    <div className="pt-12 px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 ">Know your Risk</h2>
        <p className="text-gray-600 mb-4">
            Type 2 diabetes is largely preventable. Use this tool to understand your personal risk factors and receive tailored recommendations to reduce your risk of developing Type 2 diabetes.
        </p>


        {/* Risk assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pb-4">
            <div className="lg:col-span-6 min-w-0">
                <RiskAssessmentBox onAssessmentComplete={setAssessmentComplete} />
            </div>

            {/* Personalised Recommendations */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                <div className={`bg-white p-6 rounded-2xl shadow-md w-full flex flex-col gap-4 ${assessmentComplete ? '' : 'blur-[2px]'}`}>
                    <div className="flex justify-start items-center ml-1">
                        <p className={'text-xl font-bold text-gray-900'}>Personalised Recommdendation</p>
                    </div>

                        <div className={'space-y-2 text-gray-700'}>
                            <PWithIcon> Schedule an NHS Health Check at your local GP surgery </PWithIcon>
                            <PWithIcon> Aim for about 150 minutes of moderate-intensity physical activity per week </PWithIcon>
                            <PWithIcon> Reduce sugar intake and increase fiber-rich foods</PWithIcon>
                        </div>
                </div>
                
                {/* Local Support Services */}
                <div className="bg-blue-900 p-6 rounded-2xl shadow-md text-white flex flex-col gap-4">
                        <div className="flex justify-start items-center ml-1">
                            <MapPin size={22} className='text-white mr-2' />
                            <p className='text-xl font-bold'>Local Support Services</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <a href="https://www.healthe1practice.nhs.uk/" className="bg-[#1e40af] hover:bg-blue-700 transition-colors rounded-xl p-4 flex justify-between items-start border border-blue-600 group">
                                <div>
                                    <h3 className="font-bold text-white text-base leading-snug">Health E1 Medical Centre</h3>
                                    <p className="text-sm text-blue-200 mt-1">Diabetes Prevention Program</p>
                                </div>
                                <ExternalLink size={18} className="text-blue-400 group-hover:text-blue-200 mt-0.5" />
                            </a>

                            <a href="https://www.safh.org.uk/good-moves" className="bg-[#1e40af] hover:bg-blue-700 transition-colors rounded-xl p-4 flex justify-between items-start border border-blue-600 group">
                                <div>
                                    <h3 className="font-bold text-white text-base leading-snug">Social Action for Health - Good Moves</h3>
                                    <p className="text-sm text-blue-200 mt-1">Free Fitness & Mobility Classes</p>
                                </div>
                                <ExternalLink size={18} className="text-blue-400 group-hover:text-blue-200 mt-0.5" />
                            </a>
                        </div>

                        <hr className="border-blue-600" />

                        {/* helpline number */}
                        <div className="flex items-center gap-2 text-blue-200">
                            <Phone size={18} className='text-blue-200' />
                            <span className="text-sm">Tower Hamlets Helpline: 020 7364 5000</span>
                        </div>
                    </div>
                
            </div>

        </div>


      
    </div>
  )
}

export default PersonalRiskAssessment
