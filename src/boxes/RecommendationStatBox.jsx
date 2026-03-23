import React from "react";
import { SquareCheckBig } from "lucide-react";

const RecommendationsStatBox = ({ data }) => {
  const {
    label,
    labelColor,
    iconBg,
    iconColor,
    icon: Icon,
    backgroundColor,
    backgroundColorBorder,
    TextColor,
    CheckBoxColor,
    Recommendation1,
    Recommendation2,
    Recommendation3,
    Recommendation4,
    Recommendation5
  } = data;

  function PWithIcon({ children, icon = SquareCheckBig }) {
    return (
      <p className="flex items-center gap-2 text-sm">
        <SquareCheckBig className={`mt-0.5 h-4 w-4 shrink-0 ${CheckBoxColor}`} />
        <span>{children}</span>
      </p>
    );
  }

  return (
    <div
      className={`${backgroundColor} p-6 rounded-2xl border ${backgroundColorBorder} shadow-md w-full flex flex-col gap-4`}
    >
      <div className="flex justify-start items-center -ml-4">
        <div className="p-3 rounded-xl">
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <p className={`text-xl font-bold ${labelColor}`}>{label}</p>
      </div>

        <div className={`space-y-2 ${TextColor}`}>
            <PWithIcon> {Recommendation1} </PWithIcon>
            <PWithIcon> {Recommendation2} </PWithIcon>
            <PWithIcon> {Recommendation3} </PWithIcon>
            <PWithIcon> {Recommendation4} </PWithIcon>
            <PWithIcon> {Recommendation5} </PWithIcon>
        </div>
    </div>
  );
};

export default RecommendationsStatBox;