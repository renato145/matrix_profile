import React from "react";
import { LoadSampleBtn } from "./components/LoadSampleBtn";
import { Plot } from "./components/Plot";
import { DataDescription } from "./components/DataDescription";
import { CalculateBtn } from "./components/CalculateBtn";
import { WindowSizeSel } from "./components/WindowSizeSel";

export const App = () => {
  return (
    <div className="flex flex-col container mx-auto px-10 pt-6 min-h-screen">
      <p className="text-5xl font-bold">Matrix Profile</p>
      <div className="mt-8 pr-4 flex justify-between">
        {/* <p>upload data button</p> */}
        {/* <p>info for uploading</p> */}
        <WindowSizeSel />
        <div className="flex space-x-2">
          <LoadSampleBtn />
          <CalculateBtn />
        </div>
      </div>
      <DataDescription />
      <Plot />
    </div>
  );
};
