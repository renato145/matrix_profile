import React from "react";
import { LoadSampleBtn } from "./components/LoadSampleBtn";
import { Plot } from "./components/Plot";
import { DataDescription } from "./components/DataDescription";
import { CalculateBtn } from "./components/CalculateBtn";
import { WindowSizeSel } from "./components/WindowSizeSel";
import { UploadBtn } from "./components/UploadBtn";
import { RepoDescription } from "./components/RepoDescription";

export const App = () => {
  return (
    <div className="flex flex-col container mx-auto px-10 pt-6 min-h-screen">
      <p className="text-5xl font-bold">Matrix Profile</p>
      <RepoDescription />
      <div className="mt-8 pr-4 flex flex-col sm:flex-row flex-wrap justify-between">
        <WindowSizeSel />
        <div className="mt-2 sm:mt-0 flex space-x-2">
          <UploadBtn />
          <LoadSampleBtn />
          <CalculateBtn />
        </div>
      </div>
      <DataDescription />
      <Plot />
    </div>
  );
};
