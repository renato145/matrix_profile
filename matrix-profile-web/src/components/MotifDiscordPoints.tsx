import { ScaleLinear } from "d3-scale";
import React, { useCallback, useMemo, useState } from "react";
import { TStore, useStore } from "../store";

interface PointProps {
  loc: number[];
  size: number;
  hoverSize: number;
  onMouseEnter: () => void;
  title?: string;
}

const Point: React.FC<PointProps> = ({
  loc,
  size,
  hoverSize,
  onMouseEnter,
  title,
}) => {
  const [pointSize, setSize] = useState(size);
  const onMouseEnterCB = useCallback(() => {
    onMouseEnter();
    setSize(hoverSize);
  }, [hoverSize, onMouseEnter]);
  const onMouseLeaveCB = useCallback(() => setSize(size), [size]);

  return (
    <circle
      className="motif-discord-points"
      cx={loc[0]}
      cy={loc[1]}
      r={pointSize}
      onMouseEnter={onMouseEnterCB}
      onMouseLeave={onMouseLeaveCB}
    >
      {/* {title === undefined ? <title>{title}</title> : null} */}
      <title>{title}</title>
    </circle>
  );
};

interface Props {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  size?: number;
  hoverSize?: number;
}

const selector = ({
  discord,
  motif,
  highlightDiscord,
  highlightMotif,
}: TStore) => ({
  discord,
  motif,
  highlightDiscord,
  highlightMotif,
});

export const MotifDiscordPoints: React.FC<Props> = ({
  xScale,
  yScale,
  size = 4,
  hoverSize = 8,
}) => {
  const { discord, motif, highlightDiscord, highlightMotif } = useStore(
    selector
  );

  const discordPoint = useMemo(() => {
    if (discord === undefined) return undefined;
    const [x, y] = discord;
    return [xScale(x), yScale(y)];
  }, [discord, xScale, yScale]);

  const motifPoint = useMemo(() => {
    if (motif === undefined) return undefined;
    const [x, y] = motif;
    return [xScale(x), yScale(y)];
  }, [motif, xScale, yScale]);

  const discordTitle = `This point represents a window in the time series data \
which is farthest away from all other windows in the data, as such, it can \
be considered a potential annomally (a discord),`;

  const motifTitle = `This point represents a window in the time series data \
which have the closest pair in the data, this usually indicates common patterns \
and are called motif,`;

  return (
    <g>
      {discordPoint !== undefined ? (
        <Point
          loc={discordPoint}
          size={size}
          hoverSize={hoverSize}
          onMouseEnter={highlightDiscord}
          title={discordTitle}
        />
      ) : null}
      {motifPoint !== undefined ? (
        <Point
          loc={motifPoint}
          size={size}
          hoverSize={hoverSize}
          onMouseEnter={highlightMotif}
          title={motifTitle}
        />
      ) : null}
    </g>
  );
};
