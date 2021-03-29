import { scaleLinear } from "d3";
import React, { useCallback, useMemo, useRef, useState } from "react";
import useMeasure from "react-use-measure";
import { TStore, useStore, yValue } from "../store";
import { clamp } from "../utils";
import { Brush } from "./Brush";
import { LinePlot } from "./LinePlot";

const selector = ({ data, profile, windowSize }: TStore) => ({
  data,
  profile,
  windowSize,
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
  const { data, profile, windowSize } = useStore(selector);
  const [limits, setLimits] = useState<number[] | null>(null);

  const plotData = useMemo(() => data?.map(yValue), [data]);

  const xScale = useMemo(() => {
    const domain = [0, plotData?.length ?? 100];
    const range = [margins.left, width - margins.right];
    const xScale = scaleLinear().domain(domain).range(range);
    return xScale;
  }, [plotData, width]);

  let dataHeight = profile === undefined ? height : height / 2;
  dataHeight = clamp(dataHeight, plotLimits.minHeight, plotLimits.maxHeight);
  const brushHeight = clamp(
    height - dataHeight,
    brushLimits.minHeight,
    brushLimits.maxHeight
  );

  const cursorRefTS = useRef<SVGRectElement>(null);
  const cursorRefMP = useRef<SVGRectElement>(null);

  return (
    <div
      ref={ref}
      style={{ minWidth: "300px" }}
      className="mt-4 flex flex-col flex-1"
    >
      {plotData !== undefined ? (
        <LinePlot
          ref={cursorRefTS}
          refB={cursorRefMP}
          y={plotData}
          margins={margins}
          height={dataHeight}
          width={width}
          limits={limits}
          title="Time series data"
          className="stroke-current text-blue-900 stroke-2 text-opacity-80"
          cursorBrush
          brushClassName="fill-current text-blue-400 opacity-30"
          windowSize={windowSize}
          windowSizeB={1}
        />
      ) : (
        <div className="mt-5 text-center">
          <p>Upload some time series data or Load the sample data.</p>
        </div>
      )}
      {profile !== undefined ? (
        <div className="mt-2">
          <LinePlot
            ref={cursorRefMP}
            refB={cursorRefTS}
            y={profile}
            yLength={plotData?.length}
            margins={margins}
            height={dataHeight}
            width={width}
            limits={limits}
            title="Matrix profile"
            className="stroke-current text-red-900 stroke-2 text-opacity-80"
            cursorBrush
            brushClassName="fill-current text-red-600 opacity-60 stroke-current stroke-1"
            windowSize={1}
            windowSizeB={windowSize}
          />
        </div>
      ) : null}
      {plotData !== undefined ? (
        <div className="mt-2">
          <Brush
            y={plotData}
            profile={profile}
            margins={brushMargins}
            height={brushHeight}
            width={width}
            xScale={xScale}
            setLimits={setLimits}
          />
        </div>
      ) : null}
      {profile === undefined && plotData !== undefined ? (
        <div className="mt-5 text-center">
          <p>Use the "Calculate" button to cumpute the matrix profile.</p>
        </div>
      ) : null}
    </div>
  );
};
