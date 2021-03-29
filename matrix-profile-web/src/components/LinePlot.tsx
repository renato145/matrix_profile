import { axisBottom, axisLeft, extent, line, scaleLinear, select } from "d3";
import React, {
  forwardRef,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
} from "react";
import { Margins } from "../types";

interface Props {
  y: number[];
  yLength?: number;
  height: number;
  width: number;
  margins: Margins;
  limits: number[] | null;
  title?: string;
  className: string;
  showYAxis?: boolean;
  cursorBrush?: boolean;
  children?: ReactNode;
  refB?: RefObject<SVGRectElement>;
  windowSize?: number;
  windowSizeB?: number;
  brushClassName?: string;
}

export const LinePlot = forwardRef<SVGRectElement, Props>(
  (
    {
      y,
      yLength: yOffset,
      margins,
      height,
      width,
      children,
      limits,
      title,
      className,
      refB,
      windowSize,
      windowSizeB,
      brushClassName,
      showYAxis = true,
      cursorBrush = false,
    },
    cursorRef
  ) => {
    const innerHeight = height - margins.top - margins.bottom;
    const innerWidth = width - margins.left - margins.right;

    const { x, yShow } = useMemo(() => {
      return limits === null
        ? { x: [0, yOffset ?? y.length ], yShow: y }
        : { x: [limits[0], limits[1]], yShow: y.slice(limits[0], limits[1]) };
    }, [limits, y, yOffset]);

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

    const scaleWindowSize = useMemo(
      () => Math.abs(xScale(0) - xScale(windowSize ?? 0)),
      [windowSize, xScale]
    );

    const scaleWindowSizeB = useMemo(
      () => Math.abs(xScale(0) - xScale(windowSizeB ?? 0)),
      [windowSizeB, xScale]
    );

    const onCursorMove = useCallback(
      ({ clientX, target }) => {
        const ref = cursorRef as React.RefObject<SVGRectElement>;
        if (ref.current === null) return;
        const { x, width } = target.getBoundingClientRect();
        const newX = clientX - x;
        const newWidth = Math.min(width - newX, scaleWindowSize);
        ref.current.setAttribute("x", "" + newX);
        ref.current.setAttribute("width", "" + newWidth);
        if (refB === undefined || refB.current === null) return;
        const newWidthB = Math.min(width - newX, scaleWindowSizeB);
        refB.current.setAttribute("x", "" + newX);
        refB.current.setAttribute("width", "" + newWidthB);
      },
      [cursorRef, refB, scaleWindowSize, scaleWindowSizeB]
    );

    const onCursorLeave = useCallback(() => {
      const ref = cursorRef as React.RefObject<SVGRectElement>;
      if (ref.current === null) return;
      ref.current.setAttribute("width", "0");
      if (refB === undefined || refB.current === null) return;
      refB.current.setAttribute("width", "0");
    }, [cursorRef, refB]);

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
          {cursorBrush ? (
            <g transform={`translate(${margins.left},${margins.top})`}>
              <rect
                ref={cursorRef}
                className={brushClassName}
                height={innerHeight}
              />
              <rect
                className="opacity-0"
                width={innerWidth}
                height={innerHeight}
                onPointerMove={onCursorMove}
                onPointerLeave={onCursorLeave}
              />
            </g>
          ) : null}
        </svg>
      </div>
    );
  }
);
