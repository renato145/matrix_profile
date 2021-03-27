import React from "react";
import { CalcState, DataState, TStore, useStore } from "../store";
import { Spinner } from "./Spinner";

const selector = ({ dataState, calcState, calculate }: TStore) => ({
  dataState,
  calcState,
  calculate,
});

export const CalculateBtn: React.FC = () => {
  const { dataState, calcState, calculate } = useStore(selector);

  return (
    <div>
      <button
        className="btn"
        onClick={async () => {
          // const sleep = () => new Promise(() => calculate());
          calculate();
          // sleep();
        }}
        disabled={
          dataState === DataState.Empty || calcState !== CalcState.Empty
        }
      >
        <div className="flex items-baseline">
          Calculate
          {calcState === CalcState.Loading ? (
            <Spinner className="ml-1" />
          ) : null}
        </div>
      </button>
    </div>
  );
};
