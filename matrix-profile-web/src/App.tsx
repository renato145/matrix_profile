import React from "react";
import { LoadSampleBtn } from "./coimponents/LoadSampleBtn";
import { Plot } from "./coimponents/Plot";

export const App = () => {
  return (
    <div className="flex flex-col container mx-auto px-10 pt-6 min-h-screen">
      <p className="text-5xl font-bold">Matrix Profile</p>
      <div className="mt-14 pr-4 flex space-x-2 justify-end">
        {/* <p>upload data button</p> */}
        {/* <p>info for uploading</p> */}
        <LoadSampleBtn />
        <button className="btn">Calculate</button>
      </div>
      <Plot />
    </div>
  );
};
