import { csv } from "d3";
import create from "zustand";
import { NaiveMatrixProfile } from "matrix-profile-wasm";

export enum DataState {
  Empty,
  SampleData,
  CustomData,
}

export type TData = {
  value: number;
}[];

export const yValue = (o: TData[0]) => o.value;

export type TStore = {
  data?: TData;
  dataState: DataState;
  matrixProfile?: NaiveMatrixProfile;
  profile?: number[];
  setData: (data: TData) => void;
  loadSampleData: () => void;
  calculate: () => void;
};

export const useStore = create<TStore>((set, get) => ({
  dataState: DataState.Empty,
  setData: (data) => set({ data }),
  loadSampleData: async () => {
    const data = await csv("accident_UK.csv", (row: any) => ({
      value: +row["Total_Accident"],
    }));
    set({ data, dataState: DataState.SampleData });
  },
  calculate: () => {
    const data = get().data;
    if (data === undefined) return;
    const x = Float32Array.from(data.map(yValue));
    const matrixProfile = NaiveMatrixProfile.calculate(x, 10);
    const profile = Array.from(matrixProfile.get_profile());
    set({ matrixProfile, profile });
  },
}));
