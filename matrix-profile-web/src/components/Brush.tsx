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
  limits: number[] | null;
  setLimits: (x: number[] | null) => void;
}

// const initialLimit = 400;

export const Brush: React.FC<Props> = ({
  y,
  profile,
  height,
  width,
  margins,
  xScale,
  limits,
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
      >
        <g ref={refTS} />
      </LinePlot>
      {profile !== undefined ? (
        <LinePlot
          y={profile}
          margins={margins}
          height={height}
          width={width}
          limits={null}
        >
          <g ref={refMP} />
        </LinePlot>
      ) : null}
    </div>
  );
};
