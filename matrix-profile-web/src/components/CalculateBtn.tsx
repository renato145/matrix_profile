import React, { useMemo } from "react";
import { CalcState, DataState, TStore, useStore } from "../store";
import { Spinner } from "./Spinner";

const selector = ({
  dataState,
  calcState,
  windowSize,
  lastWindowSize,
  calculate,
}: TStore) => ({
  dataState,
  calcState,
  windowSize,
  lastWindowSize,
  calculate,
});

export const CalculateBtn: React.FC = () => {
  const {
    dataState,
    calcState,
    windowSize,
    lastWindowSize,
    calculate,
  } = useStore(selector);

  const disabled = useMemo(() => {
    const notWindowChanged = windowSize === (lastWindowSize ?? windowSize);
    const stateReady =
      dataState === DataState.Empty || calcState !== CalcState.Empty;
    return notWindowChanged && stateReady;
  }, [calcState, dataState, lastWindowSize, windowSize]);

  return (
    <button className="btn" onClick={calculate} disabled={disabled}>
      <div className="flex items-baseline">
        Calculate
        {calcState === CalcState.Loading ? <Spinner className="ml-1" /> : null}
      </div>
    </button>
  );
};
