import React, { useCallback, useMemo } from "react";
import useMeasure from "react-use-measure";
import { ResizeObserver } from "@juggle/resize-observer";
import { TData, TStore, useStore } from "../store";
import { axisBottom, axisLeft, line, max, min, scaleLinear, select } from "d3";

const selector = (props: TStore) => props.data;

const margins = {
  left: 30,
  right: 20,
  top: 20,
  bottom: 25,
};

const yValue = (o: TData[0]) => o.value;

export const Plot = () => {
  const [ref, { height, width }] = useMeasure({ polyfill: ResizeObserver });
  const data = useStore(selector);
  // const innerHeight = height - margins.top - margins.bottom;
  const innerWidth = width - margins.left - margins.right;

  const { xAxis, xScale } = useMemo(() => {
    const domain = [0, data?.length ?? 100];
    const range = [margins.left, width - margins.right];
    const xScale = scaleLinear().domain(domain).range(range);
    const xAxis = axisBottom(xScale).tickSize(5).tickSizeOuter(0);
    return { xScale, xAxis };
  }, [data, width]);

  const { yAxis, yScale } = useMemo(() => {
    const values = data?.map(yValue) ?? [0, 100];
    const domain = [min(values) ?? 0, max(values) ?? 100];
    const range = [height - margins.bottom, margins.top];
    const yScale = scaleLinear().domain(domain).range(range).nice();
    const yAxis = axisLeft(yScale).tickSize(-innerWidth);
    return { yScale, yAxis };
  }, [data, height, innerWidth]);

  const path = useMemo(() => {
    if (data !== undefined) {
      return line()(data.map((o, i) => [xScale(i), yScale(o.value)]));
    }
    return null;
  }, [data, xScale, yScale]);

  const xAxisRef = useCallback(
    (node) => {
      select(node).call(xAxis);
    },
    [xAxis]
  );

  const yAxisRef = useCallback(
    (node) => {
      select(node).call(yAxis);
    },
    [yAxis]
  );

  return (
    <div
      ref={ref}
      style={{ minHeight: "100px", maxHeight: "300px", minWidth: "300px" }}
      className="mt-2 bg-indigo-100 rounded-sm flex-1"
    >
      <svg height={height} width={width}>
        <g
          ref={xAxisRef}
          transform={`translate(0,${height - margins.bottom})`}
        />
        <g ref={yAxisRef} transform={`translate(${margins.left},0)`} />
        {path !== null ? (
          <path
            fill="none"
            className="stroke-current text-blue-700 stroke-2 transition-all"
            d={path}
          />
        ) : null}
      </svg>
    </div>
  );
};
