import React from "react";
import { DataState, TStore, useStore } from "../store";

// data from https://www.kaggle.com/sadeghjalalian/road-accident-in-uk
// This data provides detailed road safety data about the circumstances of personal injury road accidents
// in GB from 2014 to 2017. The statistics relate only to personal injury accidents on public roads that
// are reported to the police, and subsequently recorded, using the STATS19 accident reporting form.

const selector = (props: TStore) => props.dataState;

export const DataDescription: React.FC = () => {
  const dataState = useStore(selector);

  return dataState === DataState.SampleData ? (
    <div className="mt-2 text-base text-gray-700">
      <p>
        Data:{" "}
        <a
          href="https://www.kaggle.com/sadeghjalalian/road-accident-in-uk"
          target="_black"
          rel="noopener"
        >
          Road Accident in UK
        </a>
      </p>
      <p className="font-light">
        This data provides detailed road safety data about the circumstances of
        personal injury road accidents in GB from 2014 to 2017. The statistics
        relate only to personal injury accidents on public roads that are
        reported to the police, and subsequently recorded, using the STATS19
        accident reporting form.
      </p>
    </div>
  ) : null;
};
