import React from "react";
import { LoadSampleBtn } from "./components/LoadSampleBtn";
import { Plot } from "./components/Plot";
import { DataDescription } from "./components/DataDescription";
import { CalculateBtn } from "./components/CalculateBtn";

export const App = () => {
  return (
    <div className="flex flex-col container mx-auto px-10 pt-6 min-h-screen">
      <p className="text-5xl font-bold">Matrix Profile</p>
      <div className="mt-14 pr-4 flex space-x-2 justify-end">
        {/* <p>upload data button</p> */}
        {/* <p>info for uploading</p> */}
        <LoadSampleBtn />
        <CalculateBtn />
      </div>
      <DataDescription />
      <Plot />
    </div>
  );
};
