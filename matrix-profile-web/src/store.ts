import { csv } from "d3";
import create from "zustand";
import { NaiveMatrixProfile } from "matrix-profile-wasm";
import { sleep } from "./utils";

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
  data?: TData;
  dataState: DataState;
  calcState: CalcState;
  matrixProfile?: NaiveMatrixProfile;
  profile?: number[];
  setData: (data: TData) => void;
  loadSampleData: () => void;
  calculate: () => void;
};

export const useStore = create<TStore>((set, get) => ({
  dataState: DataState.Empty,
  calcState: CalcState.Empty,
  setData: (data) => set({ data }),
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
    await sleep(0.1);
    const x = Float32Array.from(data.map(yValue));
    const matrixProfile = NaiveMatrixProfile.calculate(x, 10);
    const profile = Array.from(matrixProfile.get_profile());
    set({ matrixProfile, profile, calcState: CalcState.Finished });
  },
}));
