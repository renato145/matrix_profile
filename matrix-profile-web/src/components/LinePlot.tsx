import { axisBottom, axisLeft, extent, line, scaleLinear, select } from "d3";
import React, { CSSProperties, useCallback, useMemo, useRef } from "react";
import { TStore, useStore } from "../store";
import { Margins } from "../types";

interface Props {
  /** Time series data */
  y: number[];
  /** Maximum length for the data (to align all plots) */
  yLength?: number;
  height: number;
  width: number;
  margins: Margins;
  /** min-max index limits for the plot */
  limits: number[] | null;
  title?: string;
  className: string;
  showYAxis?: boolean;
  /** If true, a brush is shown under the cursor on hover */
  cursorBrush?: boolean;
  /** Classname for the `cursorBrush` */
  brushClassName?: string;
  /** Classname for the a cursor that points the nearest element */
  brushNearestClassName?: string;
  /** Custom styles for the a cursor that points the nearest element */
  brushNearestStyle?: CSSProperties;
  /** Window size for `cursorBrush` */
  windowSize?: number;
}

const selector = ({
  brushPosition,
  setBrushPosition,
  nearestNeighbourPosition,
}: TStore) => ({
  brushPosition,
  setBrushPosition,
  nearestNeighbourPosition,
});

export const LinePlot: React.FC<Props> = ({
  y,
  yLength,
  margins,
  height,
  width,
  limits,
  title,
  className,
  brushNearestStyle,
  windowSize,
  brushClassName,
  brushNearestClassName,
  showYAxis = true,
  cursorBrush = false,
  children,
}) => {
  const innerHeight = height - margins.top - margins.bottom;
  const innerWidth = width - margins.left - margins.right;

  const { x, yShow } = useMemo(() => {
    return limits === null
      ? { x: [0, yLength ?? y.length], yShow: y }
      : { x: [limits[0], limits[1]], yShow: y.slice(limits[0], limits[1]) };
  }, [limits, y, yLength]);

  const { xAxis, xScale } = useMemo(() => {
    const domain = x;
    const range = [margins.left, width - margins.right];
    const xScale = scaleLinear().domain(domain).range(range);
    const xAxis = axisBottom(xScale).tickSize(5).tickSizeOuter(0);
    return { xAxis, xScale };
  }, [margins.left, margins.right, width, x]);

  const { yAxis, yScale } = useMemo(() => {
    const domain = extent(y).map((o?: number) => o ?? 0);
    const range = [height - margins.bottom, margins.top];
    const yScale = scaleLinear().domain(domain).range(range).nice();
    const yAxis = axisLeft(yScale).tickSize(-innerWidth).ticks(4);
    return { yScale, yAxis };
  }, [y, height, margins, innerWidth]);

  const path = useMemo(() => {
    if (yShow !== undefined) {
      return line()(yShow.map((o, i) => [xScale(i + x[0]), yScale(o)]));
    }
    return null;
  }, [yShow, xScale, yScale, x]);

  const xAxisRef = useCallback(
    (node) => {
      select(node).call(xAxis);
    },
    [xAxis]
  );

  const yAxisRef = useCallback(
    (node) => {
      if (showYAxis) select(node).transition().call(yAxis);
    },
    [showYAxis, yAxis]
  );
  const cursorRef = useRef<SVGRectElement>(null);

  const scaleWindowSize = useMemo(
    () =>
      windowSize === 1 ? 1 : Math.abs(xScale(0) - xScale(windowSize ?? 0)),
    [windowSize, xScale]
  );

  const {
    brushPosition,
    setBrushPosition,
    nearestNeighbourPosition,
  } = useStore(selector);

  const { brushXPosition, brushWindowSize } = useMemo(() => {
    const brushXPosition = xScale(brushPosition) - margins.left;
    const brushWindowSize =
      brushPosition === -1
        ? 0
        : Math.min(innerWidth - brushXPosition, scaleWindowSize);
    return { brushXPosition, brushWindowSize };
  }, [brushPosition, innerWidth, margins.left, scaleWindowSize, xScale]);

  const { brushNearestXPosition, brushNearestWindowSize } = useMemo(() => {
    const xPosition = xScale(nearestNeighbourPosition) - margins.left;
    const brushNearestXPosition = Math.max(0, xPosition);
    const leftCap = xPosition + scaleWindowSize;
    const brushNearestWindowSize =
      xPosition === -1 || leftCap < margins.left
        ? 0
        : Math.min(
            leftCap,
            scaleWindowSize,
            innerWidth - brushNearestXPosition
          );
    return { brushNearestXPosition, brushNearestWindowSize };
  }, [
    innerWidth,
    margins.left,
    nearestNeighbourPosition,
    scaleWindowSize,
    xScale,
  ]);

  const onCursorMove = useCallback(
    ({ clientX, target }) => {
      const ref = cursorRef as React.RefObject<SVGRectElement>;
      if (ref.current === null) return;
      const { x } = target.getBoundingClientRect();
      const newX = clientX - Math.round(x);
      setBrushPosition(xScale.invert(newX + margins.left - 1));
    },
    [margins.left, setBrushPosition, xScale]
  );

  return (
    <div className="bg-indigo-50 rounded-sm">
      <svg height={height} width={width}>
        <rect
          className="fill-current text-white"
          transform={`translate(${margins.left},${margins.top})`}
          width={innerWidth}
          height={innerHeight}
        />
        {title !== undefined ? (
          <text
            className="text-current text-2xl"
            transform={`translate(${margins.left + 5}, ${margins.top - 10})`}
          >
            {title}
          </text>
        ) : null}
        <g
          ref={xAxisRef}
          transform={`translate(0,${height - margins.bottom})`}
        />
        <g ref={yAxisRef} transform={`translate(${margins.left},0)`} />
        {path !== null ? (
          <path fill="none" className={className} d={path} />
        ) : null}
        {children}
        <g transform={`translate(${margins.left},${margins.top})`}>
          <rect
            className={brushNearestClassName}
            style={brushNearestStyle}
            height={innerHeight}
            x={brushNearestXPosition}
            width={brushNearestWindowSize}
          />
          {cursorBrush ? (
            <>
              <rect
                ref={cursorRef}
                className={brushClassName}
                height={innerHeight}
                x={brushXPosition}
                width={brushWindowSize}
              />
              <rect
                className="opacity-0"
                width={innerWidth}
                height={innerHeight}
                onPointerMove={onCursorMove}
              />
            </>
          ) : null}
        </g>
      </svg>
    </div>
  );
};
