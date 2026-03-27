import { useState } from 'react';

// risk factors configuration
const RISK_FACTORS = {
    age: {
        label: 'Age Group',
        options: [
            { value: '', label: 'Select age range...', points: 0 },
            { value: 'under25', label: 'Under 25', points: 0 },
            { value: '25-34', label: '25-34', points: 1 },
            { value: '35-44', label: '35-44', points: 2 },
            { value: '45-54', label: '45-54', points: 3 },
            { value: '55-64', label: '55-64', points: 4 },
            { value: '65+', label: '65 or over', points: 5 },
        ],
    },
    ethnicity: {
        label: 'Ethnicity',
        hint: 'Certain groups have a higher genetic predisposition.',
        options: [
            { value: '', label: 'Select ethnicity...', points: 0 },
            { value: 'white', label: 'White', points: 0 },
            { value: 'mixed', label: 'Mixed', points: 1 },
            { value: 'black', label: 'Black African / Caribbean', points: 2 },
            { value: 'southasian', label: 'South Asian (Bangladeshi, Indian, Pakistani)', points: 3 },
            { value: 'other', label: 'Other', points: 1 },
        ],
    },
    bmi: {
        label: 'BMI Category',
        hint: 'Obesity accounts for 80-85% of Type 2 diabetes risk.',
        options: [
            { value: '', label: 'Select BMI range...', points: 0 },
            { value: 'healthy', label: 'Healthy (under 25)', points: 0 },
            { value: 'overweight', label: 'Overweight (25-30)', points: 2 },
            { value: 'obese', label: 'Obese (over 30)', points: 3 },
        ],
    },
    activity: {
        label: 'Physical Activity',
        hint: 'NHS recommends 150 minutes of moderate activity per week.',
        options: [
            { value: '', label: 'Select activity level...', points: 0 },
            { value: 'active', label: '150+ minutes per week', points: 0 },
            { value: 'moderate', label: '60-150 minutes per week', points: 1 },
            { value: 'low', label: 'Under 60 minutes per week', points: 2 },
        ],
    },
    familyHistory: {
        label: 'Family history of Diabetes?',
        options: [
            { value: '', label: 'Select...', points: 0 },
            { value: 'none', label: 'No family history', points: 0 },
            { value: 'distant', label: 'Yes (grandparent, aunt, uncle)', points: 2 },
            { value: 'close', label: 'Yes (parent or sibling)', points: 4 },
        ],
    },
};

const RISK_LEVELS = [
    { min: 0, max: 4, level: 'Low', color: 'emerald', description: 'Your current risk of developing Type 2 diabetes is low.' },
    { min: 5, max: 8, level: 'Moderate', color: 'amber', description: 'You have some risk factors for Type 2 diabetes.' },
    { min: 9, max: 12, level: 'High', color: 'orange', description: 'Your risk of developing Type 2 diabetes is elevated.' },
    { min: 13, max: 20, level: 'Very High', color: 'red', description: 'You are at significant risk of developing Type 2 diabetes.' },
];

function getRiskLevel(score) {
    return RISK_LEVELS.find(r => score >= r.min && score <= r.max) || RISK_LEVELS[0];
}

export default function DiabetesRiskAssessment({ onAssessmentComplete }) {
    const [values, setValues] = useState({
        age: '',
        ethnicity: '',
        bmi: '',
        activity: '',
        familyHistory: '',
    });
    const [showResult, setShowResult] = useState(false);

    const handleChange = (field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
    };

    // calculate the total score based on selected values
    const calculateScore = () => {
        let total = 0;
        Object.entries(values).forEach(([field, value]) => {
            const option = RISK_FACTORS[field].options.find(o => o.value === value);
            if (option) total += option.points;
        });
        return total;
    };

    const isComplete = Object.values(values).every(v => v !== '');
    const score = calculateScore();
    const risk = getRiskLevel(score);

    // show results if all fields are filled
    const handleSubmit = () => {
        if (isComplete) {
            setShowResult(true);
            if (onAssessmentComplete) {
                onAssessmentComplete(true);
            }
        }
    };

    const handleRecalculate = () => {
        setShowResult(false);
        if (onAssessmentComplete) {
            onAssessmentComplete(false);
        }
        setValues({
            age: '',
            ethnicity: '',
            bmi: '',
            activity: '',
            familyHistory: '',
        });
    };

    const HeartbeatIcon = () => (
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-9 4 18 3-9h4" />
        </svg>
    );

    const colorClasses = {
        emerald: {
            iconBg: 'bg-emerald-100',
            text: 'text-emerald-600',
            textDark: 'text-emerald-700',
        },
        amber: {
            iconBg: 'bg-amber-100',
            text: 'text-amber-600',
            textDark: 'text-amber-700',
        },
        orange: {
            iconBg: 'bg-orange-100',
            text: 'text-orange-600',
            textDark: 'text-orange-700',
        },
        red: {
            iconBg: 'bg-red-100',
            text: 'text-red-500',
            textDark: 'text-red-600',
        },
    };

    const colors = colorClasses[risk.color];

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Risk Assessment</h3>

            {!showResult ? (
                <>
                    <div className="space-y-5">
                        {Object.entries(RISK_FACTORS).map(([field, config]) => (
                            <div key={field}>
                                <label htmlFor={`risk-${field}`} className="block text-sm font-medium text-gray-700 mb-1.5">
                                    {config.label}
                                </label>
                                <select
                                    id={`risk-${field}`}
                                    value={values[field]}
                                    onChange={(e) => handleChange(field, e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        backgroundSize: '20px',
                                    }}
                                >
                                    {config.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {config.hint && (
                                    <p className="text-xs text-gray-400 mt-1">{config.hint}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!isComplete}
                        className={`w-full mt-6 py-3 px-4 rounded-xl font-medium transition-all ${isComplete
                            ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Calculate Risk Score
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className={`w-20 h-20 ${colors.iconBg} rounded-full flex items-center justify-center mb-6`}>
                        <span className={colors.text}>
                            <HeartbeatIcon />
                        </span>
                    </div>

                    <h4 className={`text-2xl font-bold ${colors.textDark} mb-3`}>
                        {risk.level} Risk
                    </h4>

                    <p className="text-gray-500 text-center text-sm leading-relaxed max-w-xs mb-6">
                        {risk.description}
                        {(risk.level === 'High' || risk.level === 'Very High') && (
                            <span className="block mt-2 font-medium text-gray-700">
                                We strongly recommend visiting your GP for a blood test.
                            </span>
                        )}
                    </p>

                    <button
                        onClick={handleRecalculate}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                    >
                        Recalculate
                    </button>

                    <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
                        This is an indicative assessment only and does not constitute medical advice.
                    </p>
                </div>
            )}
        </div>
    );
}