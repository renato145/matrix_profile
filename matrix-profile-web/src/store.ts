import { csv } from "d3";
import create from "zustand";
import { wrap } from "comlink";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./wasm.worker.ts";
import { TWorker } from "./wasm.worker";

const worker = wrap<TWorker>(new Worker());

export enum DataState {
  Empty,
  SampleData,
  CustomData,
}

export enum CalcState {
  Empty,
  Loading,
  Finished,
}

export type TData = {
  value: number;
}[];

export const yValue = (o: TData[0]) => o.value;

export type TStore = {
  windowSize: number;
  lastWindowSize?: number;
  data?: TData;
  dataState: DataState;
  calcState: CalcState;
  profile?: number[];
  profileIdxs?: number[];
  setData: (data: TData) => void;
  setWindowSize: (windowSize: number) => void;
  loadSampleData: () => void;
  calculate: () => void;
};

export const useStore = create<TStore>((set, get) => ({
  windowSize: 50,
  dataState: DataState.Empty,
  calcState: CalcState.Empty,
  setData: (data) => set({ data }),
  setWindowSize: (windowSize) => set({ windowSize }),
  loadSampleData: async () => {
    const data = await csv("accident_UK.csv", (row: any) => ({
      value: +row["Total_Accident"],
    }));
    set({ data, dataState: DataState.SampleData });
  },
  calculate: async () => {
    set({ calcState: CalcState.Loading });
    const data = get().data;
    if (data === undefined) return;
    const windowSize = get().windowSize;
    const x = Float32Array.from(data.map(yValue));
    const { profileIdxs, profile } = await worker.calculate(x, windowSize);
    set({
      profileIdxs,
      profile,
      calcState: CalcState.Finished,
      lastWindowSize: windowSize,
    });
  },
}));
