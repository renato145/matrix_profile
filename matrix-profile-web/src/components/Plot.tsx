import React, { useMemo, useState } from "react";
import useMeasure from "react-use-measure";
import { CalcState, DataState, TStore, useStore, yValue } from "../store";
import { clamp } from "../utils";
import { Brush } from "./Brush";
import { ColumnSelector } from "./ColumnSelector";
import { DownloadCSV } from "./DownloadCSV";
import { LinePlot } from "./LinePlot";

const selector = ({
  data,
  profile,
  windowSize,
  lastWindowSize,
  dataState,
  calcState,
}: TStore) => ({
  data,
  profile,
  windowSize,
  lastWindowSize,
  dataState,
  calcState,
});

const margins = {
  left: 30,
  right: 20,
  top: 38,
  bottom: 25,
};

const brushMargins = {
  ...margins,
  top: 10,
};

const plotLimits = { minHeight: 100, maxHeight: 200 };
const brushLimits = { minHeight: 50, maxHeight: 120 };

export const Plot = () => {
  const [ref, { height, width }] = useMeasure({ polyfill: ResizeObserver });
  const {
    data,
    profile,
    windowSize,
    lastWindowSize,
    dataState,
    calcState,
  } = useStore(selector);
  const [limits, setLimits] = useState<number[] | null>(null);
  const plotData = useMemo(() => data?.map(yValue), [data]);
  const { dataHeight, brushHeight } = useMemo(() => {
    let dataHeight = profile === undefined ? height : height / 2;
    dataHeight = clamp(dataHeight, plotLimits.minHeight, plotLimits.maxHeight);
    const brushHeight = clamp(
      height - dataHeight,
      brushLimits.minHeight,
      brushLimits.maxHeight
    );
    return { dataHeight, brushHeight };
  }, [height, profile]);
  const showWindowSize = useMemo(() => {
    return calcState === CalcState.Empty
      ? windowSize
      : lastWindowSize ?? windowSize;
  }, [calcState, lastWindowSize, windowSize]);

  return (
    <div ref={ref} style={{ minWidth: "300px" }} className="mt-4 flex flex-col">
      <ColumnSelector />
      {plotData !== undefined ? (
        <div className="mt-3">
          <LinePlot
            y={plotData}
            margins={margins}
            height={dataHeight}
            width={width}
            limits={limits}
            title="Time series data"
            className="stroke-current text-blue-900 stroke-2 text-opacity-80"
            cursorBrush
            brushClassName="fill-current text-blue-400 opacity-40"
            brushNearestClassName="fill-current text-blue-600 opacity-80 stroke-current stroke-2 stroke-dashed-8"
            brushNearestStyle={{fillOpacity: 0.1}}
            windowSize={showWindowSize}
          />
        </div>
      ) : dataState === DataState.SelectColumn ? (
        <div className="mt-5 text-center">
          <p>Select one column to plot.</p>
        </div>
      ) : (
        <div className="mt-5 text-center">
          <p>Upload some time series data or Load the sample data.</p>
        </div>
      )}
      {profile !== undefined ? (
        <div className="mt-2">
          <LinePlot
            y={profile}
            yLength={plotData?.length}
            margins={margins}
            height={dataHeight}
            width={width}
            limits={limits}
            title="Matrix profile"
            className="stroke-current text-red-900 stroke-2 text-opacity-80"
            cursorBrush
            brushClassName="fill-current text-red-600 opacity-60 stroke-current stroke-2"
            brushNearestClassName="fill-none text-red-600 opacity-40 stroke-current stroke-2 stroke-dashed-8"
            windowSize={1}
          />
        </div>
      ) : null}
      {plotData !== undefined ? (
        <div className="mt-2">
          <Brush
            y={plotData}
            margins={brushMargins}
            height={brushHeight}
            width={width}
            setLimits={setLimits}
            windowSize={showWindowSize}
          />
        </div>
      ) : null}
      {profile !== undefined ? (
        <DownloadCSV className="mt-2 ml-auto mr-2" />
      ) : plotData !== undefined ? (
        <div className="mt-5 text-center">
          <p>Use the "Calculate" button to compute the matrix profile.</p>
        </div>
      ) : null}
    </div>
  );
};
