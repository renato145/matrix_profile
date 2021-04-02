import { extent, line, scaleLinear } from "d3";
import { brushX } from "d3-brush";
import { select } from "d3-selection";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { TStore, useStore } from "../store";
import { Margins } from "../types";
import { LinePlot } from "./LinePlot";

interface Props {
  y: number[];
  width: number;
  height: number;
  margins: Margins;
  windowSize?: number;
  setLimits: (x: number[] | null) => void;
}

const selector = ({
  profile,
  discord,
  motif,
  highlightDiscord,
  highlightMotif,
}: TStore) => ({
  profile,
  discord,
  motif,
  highlightDiscord,
  highlightMotif,
});

export const Brush: React.FC<Props> = ({
  y,
  height,
  width,
  margins,
  windowSize,
  setLimits,
}) => {
  const {
    discord,
    motif,
    profile,
    highlightDiscord,
    highlightMotif,
  } = useStore(selector);
  const xScale = useMemo(() => {
    const domain = [0, y.length];
    const range = [margins.left, width - margins.right];
    const xScale = scaleLinear().domain(domain).range(range);
    return xScale;
  }, [y.length, margins.left, margins.right, width]);

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

  const ref = useRef<SVGGElement>(null);

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

  const discordPoint = useMemo(() => {
    if (discord === undefined) return undefined;
    const [x, y] = discord;
    return [xScale(x), yScaleMP(y)];
  }, [discord, xScale, yScaleMP]);

  const motifPoint = useMemo(() => {
    if (motif === undefined) return undefined;
    const [x, y] = motif;
    return [xScale(x), yScaleMP(y)];
  }, [motif, xScale, yScaleMP]);

  useEffect(() => {
    if (brush === undefined || ref.current === null) return;
    select(ref.current).call(brush);
  }, [brush, xScale, y.length, profile]);

  return (
    <div className="flex flex-col">
      <LinePlot
        y={y}
        margins={margins}
        height={height}
        width={width}
        limits={null}
        className="stroke-current text-blue-900 stroke-2 text-opacity-80"
        showYAxis={false}
        windowSize={windowSize}
        cursorBrush
        brushClassName="fill-current text-blue-400 opacity-40"
        brushNearestClassName="fill-current text-blue-600 opacity-80 stroke-current stroke-2 stroke-dashed-8"
        brushNearestStyle={{ fillOpacity: 0.1 }}
      >
        {pathMP !== null ? (
          <path
            fill="none"
            className="stroke-current text-red-900 stroke-2 text-opacity-80"
            d={pathMP}
          />
        ) : null}
        <g ref={ref} />
        <g>
          {discordPoint !== undefined ? (
            <circle
              className="motif-discord-points"
              cx={discordPoint[0]}
              cy={discordPoint[1]}
              onMouseEnter={highlightDiscord}
            />
          ) : null}
          {motifPoint !== undefined ? (
            <circle
              className="motif-discord-points"
              cx={motifPoint[0]}
              cy={motifPoint[1]}
              onMouseEnter={highlightMotif}
            />
          ) : null}
        </g>
      </LinePlot>
    </div>
  );
};
