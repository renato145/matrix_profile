import { expose } from "comlink";
import wasm from "matrix-profile-wasm";

export type TWorker = {
  module: typeof wasm | null;
  loadModule: () => void;
  calculate: (
    x: Float32Array,
    m: number
  ) => Promise<{ profile: number[]; profileIdxs: number[] }>;
};

const exports: TWorker = {
  module: null,
  async loadModule() {
    if (this.module === null) this.module = await import("matrix-profile-wasm");
  },
  async calculate(x, m) {
    await this.loadModule();
    if (this.module === null) throw new Error("Failed to load wasm module");
    const res = await this.module.StompMatrixProfile.calculate(x, m);
    const profile = Array.from(res.get_profile());
    const profileIdxs = Array.from(res.get_profile_idxs());
    return { profile, profileIdxs };
  },
};

expose(exports);
