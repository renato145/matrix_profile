import { extent, line, scaleLinear } from "d3";
import { brushX } from "d3-brush";
import { ScaleLinear } from "d3-scale";
import { select } from "d3-selection";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Margins } from "../types";
import { LinePlot } from "./LinePlot";

interface Props {
  y: number[];
  profile?: number[];
  width: number;
  height: number;
  margins: Margins;
  xScale: ScaleLinear<number, number>;
  setLimits: (x: number[] | null) => void;
}

export const Brush: React.FC<Props> = ({
  y,
  profile,
  height,
  width,
  margins,
  xScale,
  setLimits,
}) => {
  const brushEnd = useCallback(
    ({ selection, type }) => {
      if (selection === null) {
        setLimits(null);
      } else if (type !== "end") {
        setLimits(selection.map(xScale.invert));
      }
    },
    [setLimits, xScale]
  );

  const brush = useMemo(() => {
    const brush = brushX().extent([
      [margins.left, margins.top],
      [width - margins.right, height - margins.bottom],
    ]);
    brush.on("brush", brushEnd);
    brush.on("end", brushEnd);
    return brush;
  }, [margins, width, height, brushEnd]);

  const refTS = useRef<SVGGElement>(null);
  const refMP = useRef<SVGGElement>(null);

  const yScaleMP = useMemo(() => {
    const domain = extent(profile ?? [0, 100]).map((o?: number) => o ?? 0);
    const range = [height - margins.bottom, margins.top];
    const yScale = scaleLinear().domain(domain).range(range).nice();
    return yScale;
  }, [height, margins, profile]);

  const pathMP = useMemo(() => {
    if (profile !== undefined) {
      return line()(profile.map((o, i) => [xScale(i), yScaleMP(o)]));
    }
    return null;
  }, [profile, xScale, yScaleMP]);

  useEffect(() => {
    if (brush === undefined || refTS.current === null) return;
    select(refTS.current).call(brush);
    if (refMP.current !== null) select(refMP.current).call(brush);
    // if (y.length > initialLimit) g.call(brush.move, [0, initialLimit].map(xScale));
  }, [brush, xScale, y.length, profile]);

  return (
    <div>
      <LinePlot
        y={y}
        margins={margins}
        height={height}
        width={width}
        limits={null}
        className="stroke-current text-blue-900 stroke-2 text-opacity-80"
        showYAxis={false}
      >
        {pathMP !== null ? (
          <path
            fill="none"
            className="stroke-current text-red-900 stroke-2 text-opacity-80"
            d={pathMP}
          />
        ) : null}
        <g ref={refTS} />
      </LinePlot>
    </div>
  );
};
