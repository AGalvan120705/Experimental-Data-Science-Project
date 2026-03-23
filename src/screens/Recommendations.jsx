import React from "react";
import {
  Heart,
  AppleIcon,
  Activity,
  UsersRound,
  HeartIcon,
  BikeIcon,
  BookOpen,
  MapPin,
  HomeIcon,
  HandHeartIcon,
  HeartPulseIcon,
} from "lucide-react";
import RecommendationsStatBox from "../boxes/RecommendationStatBox";
import RecommendationsStatBox2 from "../boxes/RecommdationStatBox2";
import { useNavigate } from "react-router-dom";

const Recommendations = () => {
  const showFooterLink = true;
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2 pt-8 px-8">
        Recommendations
      </h2>
      <p className="text-gray-600 mb-4 px-8">
        Simple and actionable recommendations to help reduce the risk for
        diabetes for you and your community.
      </p>

      <div className=" px-6 max-w-full">
        <div className=" grid grid-cols-1 gap-x-2 gap-y-2 px-8 py-4 bg-linear-to-r from-[#13315c] to-blue-700 rounded-xl shadow-md">
          <Heart className="mr-2 w-8 h-8 text-amber-300 mt-5" />
          <h2 className=" pl-10 p-4 text-2xl font-extrabold text-White">
            You Have the power to Reduce Your Risk
          </h2>

          <div className=" col-start-2 space-y-1 pl-11">
            <p className="text-slate-200 mb-4 text-xl">
              Type 2 diabetes is a preventable condition. Small, consistent
              changes to your lifestyle can have a big impact on your risk for
              developing diabetes- and inspire others in your community to do
              the same.
            </p>
            <p className="text-slate-200 mb-4 text-xl">
              Together, we can create a healthier future for ourselves and our
              community.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2 pt-10 px-8">
        What You Can Do: Personal Actions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 px-8 gap-6 pb-12">
        {/* // Eat Well Box */}

        <RecommendationsStatBox
          data={{
            backgroundColorBorder: "border-green-400",
            backgroundColor: "bg-green-50",
            label: "Eat Well",
            labelColor: "text-green-900",
            iconColor: "text-green-600",
            icon: AppleIcon,
            TextColor: "text-green-900",
            CheckBoxColor: "text-green-600",
            Recommendation1: "Eat plenty of fruits and vegetables.",
            Recommendation2: "Choose drinks without added sugars.",
            Recommendation3: "Choose higher fibre carbs-like whole grains.",
            Recommendation4: "Cut down on red and processed meat.",
            Recommendation5: "Practice portion control.",
          }}
        />

        {/* // Stay Active Box */}

        <RecommendationsStatBox
          data={{
            backgroundColorBorder: "border-blue-400",
            backgroundColor: "bg-blue-50",
            label: "Stay Active",
            labelColor: "text-blue-900",
            iconColor: "text-blue-600",
            icon: Activity,
            TextColor: "text-blue-900",
            CheckBoxColor: "text-blue-600",
            Recommendation1: "Aim for about 150 minutes of exercise a week.",
            Recommendation2: "Break up periods of inactivity.",
            Recommendation3:
              "Join a local sports club or group exercise class.",
            Recommendation4: "Set realistic fitness goals for yourself.",
            Recommendation5:
              "Find ways to be active in your daily routine, like walking or cycling to work.",
          }}
        />

        {/* // Know your numbers Box */}

        <RecommendationsStatBox
          data={{
            backgroundColorBorder: "border-red-400",
            backgroundColor: "bg-red-50",
            label: "Know Your Numbers",
            labelColor: "text-red-900",
            iconColor: "text-red-600",
            icon: HeartPulseIcon,
            TextColor: "text-red-900",
            CheckBoxColor: "text-red-600",
            Recommendation1:
              "Get regular health check-ups to monitor your blood sugar, blood pressure, and cholesterol levels.",
            Recommendation2: "Monitor your weight and waist circumference.",
            Recommendation3: "Get good quality sleep and manage stress levels.",
            Recommendation4:
              "Attend free NHS health checks if you're eligible. (available to Adults aged 40-74 every 5 years)",
            Recommendation5:
              "Track your health metrics using apps or a health journal ",
          }}
        />

        {/* // Build Support Box */}

        <RecommendationsStatBox
          data={{
            backgroundColorBorder: "border-purple-400",
            backgroundColor: "bg-purple-50",
            label: "Build Support",
            labelColor: "text-purple-900",
            iconColor: "text-purple-600",
            icon: UsersRound,
            TextColor: "text-purple-900",
            CheckBoxColor: "text-purple-600",
            Recommendation1:
              "Share your goals with friends and family to build a support system.",
            Recommendation2:
              "Cook with friends or family to make healthy eating more enjoyable.",
            Recommendation3:
              "Join local community groups focused on health and wellness.",
            Recommendation4:
              "Encourage family and friends to make healthy lifestyle changes together.",
            Recommendation5:
              "Learn from others in your community who have successfully reduced their risk.",
          }}
        />
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2 pt-10 px-8">
        What You Can Do: Personal Actions
      </h2>
      <p className="text-gray-600 px-8">
        Help create an healthier Tower Hamlets for everyone by taking action in
        your community and advocating for change.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 px-8 gap-6 pb-12">
        {/* // Start a walking group */}

        <RecommendationsStatBox2
          data={{
            label: "Start a Walking Group",
            Text: "Organize a local walking group to encourage physical activity and foster community connections.",
            Icon: BikeIcon,
            backgroundColorBorder: "border-blue-400",
            ImpactBorderColor: "border-blue-400",
            EffortBorderColor: "border-blue-400",
            ImpactBox: "High Impact",
            EffortBox: "Low Effort",
          }}
        />

        {/* // Share Healthy Recipes */}

        <RecommendationsStatBox2
          data={{
            label: "Share Healthy Recipes",
            Text: "Share healthy and affordable recipes with your community through social media, local newsletters, or community events to inspire healthier eating habits.",
            Icon: BookOpen,
            backgroundColorBorder: "border-green-400",
            ImpactBorderColor: "border-green-400",
            EffortBorderColor: "border-green-400",
            ImpactBox: "medium Impact",
            EffortBox: "Low Effort",
          }}
        />

        {/* // Advocate for Change */}

        <RecommendationsStatBox2
          data={{
            label: "Advocate for Change",
            Text: "Work with local authorities to advocate for policies that promote healthy environments, such as improved access to parks, healthier food options in schools, and better public transportation.",
            Icon: MapPin,
            backgroundColorBorder: "border-purple-400",
            ImpactBorderColor: "border-purple-400",
            EffortBorderColor: "border-purple-400",
            ImpactBox: "High Impact",
            EffortBox: "Medium Effort",
          }}
        />

        {/* //Host Community Events */}

        <RecommendationsStatBox2
          data={{
            label: "Host Community Events",
            Text: "Organize community events that promote healthy lifestyles, such as fitness classes, cooking demonstrations, or health fairs in local spaces.",
            Icon: HomeIcon,
            backgroundColorBorder: "border-red-400",
            ImpactBorderColor: "border-red-400",
            EffortBorderColor: "border-red-400",
            ImpactBox: "High Impact",
            EffortBox: "High Effort",
          }}
        />
      </div>

      <div className="space-y-1 mt-4 px-8">
        <div className=" grid grid-cols-1 gap-x-2 gap-y-2 px-8 py-4 bg-white border border-gray-200 rounded-xl shadow-md">
          <div className="flex justify-start items-center -ml-4">
            <div className="p-3 rounded-xl">
              <MapPin className={`w-6 h-6 text-[#7CA982]`} />
            </div>
            <p className={`text-xl font-bold text-black`}>
              Tower Hamlets Resources
            </p>
          </div>

          <div className="space-y-1 mt-4 px-4 grid grid-cols-1 md:grid-cols-3">
            <div>
              <p className="text-xl font-bold text-black">Free Health Checks</p>
              <p className="text-md text-gray-800">
                Get your health checked for free at your local GP surgery.
              </p>

              {showFooterLink && (
                <div className="pt-1">
                  <a
                    href={`https://www.nhs.uk/service-search/find-a-gp`}
                    className={`text-sm font-semibold transition-colors ${"text-[#0075F2]" || "text-blue-600"} ${"hover:text-[#0075F2]" || "hover:text-blue-700"}`}
                  >
                    Find your Nearest Clinic →
                  </a>
                </div>
              )}
            </div>

            <div>
              <p className="text-xl font-bold text-black">
                Diabetes Prevention Programme
              </p>
              <p className="text-md text-gray-800">
                A free programme to help prevent type 2 diabetes through healthy
                lifestyle changes.
              </p>

              {showFooterLink && (
                <div className="pt-1">
                  <a
                    href={`https://northeastlondon.icb.nhs.uk/service/diabetes-diabetes-prevention-programme-ndpp/`}
                    className={`text-sm font-semibold transition-colors ${"text-[#0075F2]" || "text-blue-600"} ${"hover:text-[#0075F2]" || "hover:text-blue-700"}`}
                  >
                    Learn More →
                  </a>
                </div>
              )}
            </div>

            <div>
              <p className="text-xl font-bold text-black">
                Healthy Eating options
              </p>
              <p className="text-md text-gray-800">
                Discover delicious and healthy recipes designed to help prevent
                type 2 diabetes.
              </p>

              {showFooterLink && (
                <div className="pt-1">
                  <a
                    href={`https://www.bbc.co.uk/food/collections/diabetes_recipes`}
                    className={`text-sm font-semibold transition-colors ${"text-[#0075F2]" || "text-blue-600"} ${"hover:text-[#0075F2]" || "hover:text-blue-700"}`}
                  >
                    Browse Recipes →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-1 mt-4 px-8 py-6 pb-12">
        <div className="flex flex-col items-center justify-center px-8 py-4 bg-linear-to-r from-[#7CA982] to-[#519872] rounded-xl shadow-md">
          <HandHeartIcon className="w-8 h-8 text-white" />

          <h2 className="pl-4 text-2xl font-extrabold text-white">
            Start Today, Not Tomorrow
          </h2>

          <p className="text-slate-200 mb-4 text-xl mt-4 items-center">
            Pick one action to start with and commit to it for the next week.
          </p>

          <p className="text-slate-200 mb-4 text-xl items-center">
            Every journey starts with a single step - take that step today for a
            healthier tomorrow.
          </p>

          <button
            onClick={() => navigate("/PersonalRiskAssessment")}
            className="px-6 py-3 bg-white text-[#519872] font-semibold rounded-lg transition-colors hover:bg-gray-200"
          >
            Take the Personal Risk Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
