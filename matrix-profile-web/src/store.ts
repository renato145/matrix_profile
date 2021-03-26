import create from "zustand";

export type TData = {
  value: number;
}[];

export type TStore = {
  data?: TData;
  setData: (data: TData) => void;
};

export const useStore = create<TStore>((set, get) => ({
  setData: (data) => set({ data }),
}));
