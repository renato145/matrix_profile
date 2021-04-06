import { csv, csvParse, DSVRowArray, maxIndex, minIndex } from "d3";
import create from "zustand";
import { wrap } from "comlink";
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./wasm.worker.ts";
import { TWorker } from "./wasm.worker";
import { clamp, extractFilename } from "./utils";

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
  discord: undefined,
  motif: undefined,
  brushesBkup: undefined,
};

const emptyCsvData = {
  filename: undefined,
  csvData: undefined,
  csvColumns: undefined,
  selectedColumn: undefined,
};

export type TStore = {
  windowSize: number;
  /** Last window size computed */
  lastWindowSize?: number;
  data?: TData;
  nRows?: number;
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
  brushPosition: number;
  setBrushPosition: (x: number) => void;
  nearestNeighbourPosition: number;
  /** If neighbour is not found `-1` is returned */
  getNearestNeighbour: (idx: number) => number;
  /** Stores `brushPosition` and `nearestNeighbourPosition` */
  brushesBkup?: number[];
  hideBrushes: () => void;
  showBrushes: () => void;
  brushFreeze: boolean;
  toogleBrushFreeze: () => void;
  /** Index of calculated the main discord (possible annomaly) */
  discord?: number[];
  calculateDiscord: () => void;
  highlightDiscord: () => void;
  /** Index of calculated the main motif (common patterns) */
  motif?: number[];
  calculateMotif: () => void;
  highlightMotif: () => void;
};

export const useStore = create<TStore>((set, get) => ({
  windowSize: 50,
  dataState: DataState.Empty,
  calcState: CalcState.Empty,
  setData: (data) => set({ data }),
  setWindowSize: (windowSize) => set({ windowSize }),
  selectColumn: (column) => {
    const csvData = get().csvData;
    if (csvData === undefined) return { dataState: DataState.Error };
    const data = csvData.map((row) => ({ value: +(row[column] ?? "") }));
    set({
      data,
      nRows: data.length,
      selectedColumn: column,
      dataState: DataState.CustomData,
      ...emptyCalc,
    });
  },
  loadSampleData: async () => {
    const data = await csv("accident_UK.csv", (row: any) => ({
      value: +row["Total_Accident"],
    }));
    set({
      data,
      nRows: data.length,
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
      nRows: undefined,
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
    get().calculateDiscord();
    get().calculateMotif();
  },
  getNearestNeighbour: (idx) => {
    const pIdxs = get().profileIdxs;
    if (pIdxs === undefined) return -1;
    return pIdxs[Math.round(idx)] ?? -1;
  },
  brushPosition: -1,
  nearestNeighbourPosition: -1,
  setBrushPosition: (x) => {
    return set(({ getNearestNeighbour, nRows }) => {
      const brushPosition = clamp(Math.floor(x), 0, (nRows ?? 1) - 1);
      return {
        brushPosition,
        nearestNeighbourPosition: getNearestNeighbour(brushPosition),
      };
    });
  },
  hideBrushes: () => {
    set(({ brushPosition, nearestNeighbourPosition }) => ({
      brushesBkup: [brushPosition, nearestNeighbourPosition],
      brushPosition: -1,
      nearestNeighbourPosition: -1,
    }));
  },
  showBrushes: () => {
    set(({ brushesBkup }) => {
      if (brushesBkup === undefined)
        return { brushPosition: -1, nearestNeighbourPosition: -1 };
      return {
        brushesBkup: undefined,
        brushPosition: brushesBkup[0] ?? -1,
        nearestNeighbourPosition: brushesBkup[1] ?? -1,
      };
    });
  },
  brushFreeze: false,
  toogleBrushFreeze: () => {
    set(({ brushFreeze }) => ({ brushFreeze: !brushFreeze }));
  },
  calculateDiscord: () => {
    set(({ profile }) => {
      if (profile === undefined) return {};
      const idx = maxIndex(profile);
      if (idx === -1) return {};
      const discord = [idx, profile[idx]];
      return { discord };
    });
  },
  highlightDiscord: () => {
    const discord = get().discord;
    if (discord === undefined) return;
    get().setBrushPosition(discord[0]);
  },
  calculateMotif: () => {
    set(({ profile }) => {
      if (profile === undefined) return {};
      const idx = minIndex(profile);
      if (idx === -1) return {};
      const motif = [idx, profile[idx]];
      return { motif };
    });
  },
  highlightMotif: () => {
    const motif = get().motif;
    if (motif === undefined) return;
    get().setBrushPosition(motif[0]);
  },
}));
