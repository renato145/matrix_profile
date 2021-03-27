import React from "react";
import { TStore, useStore } from "../store";

const selector = (props: TStore) => props.loadSampleData;

export const LoadSampleBtn: React.FC = () => {
  const loadSampleData = useStore(selector);

  return (
    <div className="flex items-baseline">
      <button className="btn" onClick={loadSampleData}>
        Load sample
      </button>
      <p className="text-sm">(info)</p>
    </div>
  );
};
