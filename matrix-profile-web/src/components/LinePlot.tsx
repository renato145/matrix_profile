import { axisBottom, axisLeft, extent, line, scaleLinear, select } from "d3";
import React, { useCallback, useMemo } from "react";

interface Props {
  y: number[];
  margins: { left: number; right: number; top: number; bottom: number };
  height: number;
  width: number;
  title: string;
}

export const LinePlot: React.FC<Props> = ({
  y,
  margins,
  height,
  width,
  title,
}) => {
  // const innerHeight = height - margins.top - margins.bottom;
  const innerWidth = width - margins.left - margins.right;

  const { xAxis, xScale } = useMemo(() => {
    const domain = [0, y.length];
    const range = [margins.left, width - margins.right];
    const xScale = scaleLinear().domain(domain).range(range);
    const xAxis = axisBottom(xScale).tickSize(5).tickSizeOuter(0);
    return { xScale, xAxis };
  }, [margins, width, y]);

  const { yAxis, yScale } = useMemo(() => {
    const domain = extent(y).map((o?: number) => o ?? 0);
    const range = [height - margins.bottom, margins.top];
    const yScale = scaleLinear().domain(domain).range(range).nice();
    const yAxis = axisLeft(yScale).tickSize(-innerWidth);
    return { yScale, yAxis };
  }, [y, height, margins, innerWidth]);

  const path = useMemo(() => {
    if (y !== undefined) {
      return line()(y.map((o, i) => [xScale(i), yScale(o)]));
    }
    return null;
  }, [y, xScale, yScale]);

  const xAxisRef = useCallback(
    (node) => {
      select(node).transition().call(xAxis);
    },
    [xAxis]
  );

  const yAxisRef = useCallback(
    (node) => {
      select(node).transition().call(yAxis);
    },
    [yAxis]
  );

  return (
    <div className="bg-indigo-50 rounded-sm">
      <svg height={height} width={width}>
        <text
          className="text-current text-2xl"
          transform={`translate(${margins.left + 5}, ${margins.top - 10})`}
        >
          {title}
        </text>
        <g
          ref={xAxisRef}
          transform={`translate(0,${height - margins.bottom})`}
        />
        <g ref={yAxisRef} transform={`translate(${margins.left},0)`} />
        {path !== null ? (
          <path
            fill="none"
            className="stroke-current text-blue-900 stroke-2 transition-all"
            d={path}
          />
        ) : null}
      </svg>
    </div>
  );
};
