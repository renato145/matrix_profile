import { csv } from "d3";
import create from "zustand";

export enum DataState {
  Empty,
  SampleData,
  CustomData,
}

export type TData = {
  value: number;
}[];

export type TStore = {
  data?: TData;
  dataState: DataState;
  setData: (data: TData) => void;
  loadSampleData: () => void;
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
}));
