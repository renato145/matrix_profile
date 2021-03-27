import React from "react";
import useMeasure from "react-use-measure";
import { TStore, useStore, yValue } from "../store";
import { clamp } from "../utils";
import { LinePlot } from "./LinePlot";

const selector = ({ data, profile }: TStore) => ({ data, profile });

const margins = {
  left: 30,
  right: 20,
  top: 38,
  bottom: 25,
};

const minHeight = 100;
const maxHeight = 200;

export const Plot = () => {
  const [ref, { height, width }] = useMeasure({ polyfill: ResizeObserver });
  const { data, profile } = useStore(selector);
  const plotData = data?.map(yValue);
  let dataHeight = profile === undefined ? height : height / 2;
  dataHeight = clamp(dataHeight, minHeight, maxHeight);

  return (
    <div
      ref={ref}
      style={{ minWidth: "300px" }}
      className="mt-2 flex flex-col flex-1"
    >
      {plotData !== undefined ? (
        <LinePlot
          y={plotData}
          margins={margins}
          height={dataHeight}
          width={width}
          title="Time series data"
        />
      ) : (
        <div className="mt-5 text-center">
          <p>Upload some time series data or Load the sample data.</p>
        </div>
      )}
      {profile !== undefined ? (
        <div className="mt-2">
          <LinePlot
            y={profile}
            margins={margins}
            height={dataHeight}
            width={width}
            title="Matrix profile"
          />
        </div>
      ) : plotData !== undefined ? (
        <div className="mt-5 text-center">
          <p>Use the "Calculate" button to cumpute the matrix profile.</p>
        </div>
      ) : null}

    </div>
  );
};
