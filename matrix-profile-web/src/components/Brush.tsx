import { brushX } from "d3-brush";
import { ScaleLinear } from "d3-scale";
import { select } from "d3-selection";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Margins } from "../types";
import { LinePlot } from "./LinePlot";

interface Props {
  y: number[];
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
  height,
  width,
  margins,
  xScale,
  limits,
  setLimits,
}) => {
  const brushEnd = useCallback(
    ({ selection }) => {
      if (selection === null) {
        setLimits(null);
        return;
      }
      setLimits(selection.map(xScale.invert));
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

  const ref = useRef<SVGGElement>(null);

  useEffect(() => {
    if (brush === undefined || ref.current === null) return;
    select(ref.current).call(brush);
    // if (y.length > initialLimit) g.call(brush.move, [0, initialLimit].map(xScale));
  }, [brush, xScale, y.length]);

  return (
    <LinePlot
      y={y}
      margins={margins}
      height={height}
      width={width}
      limits={null}
    >
      <g ref={ref} />
    </LinePlot>
  );
};
