import React, { useMemo } from "react";
import { CalcState, DataState, TStore, useStore } from "../store";

const selector = ({ loadSampleData, dataState, calcState }: TStore) => ({
  loadSampleData,
  dataState,
  calcState,
});

export const LoadSampleBtn: React.FC = () => {
  const { loadSampleData, dataState, calcState } = useStore(selector);

  const disabled = useMemo(() => {
    return (
      dataState === DataState.SampleData || calcState === CalcState.Loading
    );
  }, [calcState, dataState]);

  return (
    <button className="btn" onClick={loadSampleData} disabled={disabled}>
      Load sample
    </button>
  );
};
