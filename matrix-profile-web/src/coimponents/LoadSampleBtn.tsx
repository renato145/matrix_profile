import React, { useCallback } from "react";
import { csv } from "d3";
import { TStore, useStore } from "../store";

// data from https://www.kaggle.com/sadeghjalalian/road-accident-in-uk
// This data provides detailed road safety data about the circumstances of personal injury road accidents
// in GB from 2014 to 2017. The statistics relate only to personal injury accidents on public roads that
// are reported to the police, and subsequently recorded, using the STATS19 accident reporting form.

const selector = (props: TStore) => props.setData;

export const LoadSampleBtn: React.FC = () => {
  const setData = useStore(selector);
  const loadSample = useCallback(async () => {
    const data = await csv("accident_UK.csv", (row: any) => ({
      value: +row["Total_Accident"],
    }));
    setData(data);
  }, [setData]);

  return (
    <div className="flex items-baseline">
      <button className="btn" onClick={loadSample}>
        Load sample
      </button>
      <p className="text-sm">(info)</p>
    </div>
  );
};
