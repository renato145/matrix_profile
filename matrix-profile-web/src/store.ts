import { csv, csvParse, DSVRowArray } from "d3";
import create from "zustand";
import { wrap } from "comlink";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./wasm.worker.ts";
import { TWorker } from "./wasm.worker";
import { extractFilename } from "./utils";

const worker = wrap<TWorker>(new Worker());

export enum DataState {
  Empty,
  SampleData,
  SelectColumn,
  CustomData,
  Error,
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

const emptyCalc = {
  lastWindowSize: undefined,
  calcState: CalcState.Empty,
  profile: undefined,
  profileIdxs: undefined,
};

const emptyCsvData = {
  filename: undefined,
  csvData: undefined,
  csvColumns: undefined,
  selectedColumn: undefined,
};

export type TStore = {
  windowSize: number;
  lastWindowSize?: number;
  data?: TData;
  dataState: DataState;
  calcState: CalcState;
  profile?: number[];
  profileIdxs?: number[];
  filename?: string;
  csvData?: DSVRowArray;
  csvColumns?: string[];
  selectedColumn?: string;
  setData: (data: TData) => void;
  setWindowSize: (windowSize: number) => void;
  selectColumn: (column: string) => void;
  loadSampleData: () => void;
  uploadData: (data: string, path?: string) => void;
  calculate: () => void;
};

export const useStore = create<TStore>((set, get) => ({
  windowSize: 50,
  dataState: DataState.Empty,
  calcState: CalcState.Empty,
  setData: (data) => set({ data }),
  setWindowSize: (windowSize) => set({ windowSize }),
  selectColumn: (column) => {
    set(({ csvData }) => {
      if (csvData === undefined) return { dataState: DataState.Error };
      const data = csvData.map((row) => ({ value: +(row[column] ?? "") }));
      return { data, selectedColumn: column, dataState: DataState.CustomData };
    });
  },
  loadSampleData: async () => {
    const data = await csv("accident_UK.csv", (row: any) => ({
      value: +row["Total_Accident"],
    }));
    set({
      data,
      dataState: DataState.SampleData,
      ...emptyCalc,
      ...emptyCsvData,
    });
  },
  uploadData: (data, path) => {
    const filename = path === undefined ? "" : extractFilename(path);
    const csvData = csvParse(data);
    const csvColumns = csvData.columns;
    set({
      filename,
      csvData,
      csvColumns,
      data: undefined,
      dataState: DataState.SelectColumn,
      selectedColumn: undefined,
      ...emptyCalc,
    });
    get().selectColumn(csvColumns[0]);
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
