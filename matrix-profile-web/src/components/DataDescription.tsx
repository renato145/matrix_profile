import { format } from "d3-format";
import React from "react";
import { DataState, TStore, useStore } from "../store";

const selector = ({ nRows, dataState, filename }: TStore) => ({
  nRows,
  dataState,
  filename,
});

const formatNumber = format(",.2r");

export const DataDescription: React.FC = () => {
  const { nRows, dataState, filename } = useStore(selector);
  const show =
    dataState === DataState.SampleData || dataState === DataState.CustomData;
  const fn = filename ?? "custom_file";

  return show ? (
    <div className="mt-4 text-base text-gray-700">
      <p className="inline font-medium">Data: </p>
      {dataState === DataState.CustomData ? (
        <p className="inline">
          {fn}{" "}
          {nRows !== undefined ? (
            <span className="text-sm">({formatNumber(nRows)} rows)</span>
          ) : null}
        </p>
      ) : (
        <>
          <p className="inline">
            <a
              href="https://www.kaggle.com/sadeghjalalian/road-accident-in-uk"
              target="_black"
              rel="noopener"
            >
              Road Accident in UK
            </a>
          </p>
          <p className="mt-1 font-light">
            This data provides detailed road safety data about the circumstances
            of personal injury road accidents in GB from 2014 to 2017. The
            statistics relate only to personal injury accidents on public roads
            that are reported to the police, and subsequently recorded, using
            the STATS19 accident reporting form.
          </p>
        </>
      )}
    </div>
  ) : null;
};
