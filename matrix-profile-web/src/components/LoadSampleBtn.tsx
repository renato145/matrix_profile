import React from "react";
import { DataState, TStore, useStore } from "../store";

const selector = ({ loadSampleData, dataState }: TStore) => ({
  loadSampleData,
  dataState,
});

export const LoadSampleBtn: React.FC = () => {
  const { loadSampleData, dataState } = useStore(selector);

  return (
    <div>
      <button
        className="btn"
        onClick={loadSampleData}
        disabled={dataState === DataState.SampleData}
      >
        Load sample
      </button>
    </div>
  );
};
