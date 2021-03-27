import React from "react";
import { DataState, TStore, useStore } from "../store";

const selector = ({ dataState, calculate }: TStore) => ({
  dataState,
  calculate,
});

export const CalculateBtn: React.FC = () => {
  const { dataState, calculate } = useStore(selector);

  return (
    <button
      className="btn"
      onClick={calculate}
      disabled={dataState === DataState.Empty}
    >
      Calculate
    </button>
  );
};
