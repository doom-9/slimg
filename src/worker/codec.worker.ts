import * as Comlink from "comlink";
import { compress } from "./codecs";
import type { CompressInput, CompressResult } from "../core/types";

const api = {
  async run(input: CompressInput): Promise<CompressResult> {
    const t0 = performance.now();
    const result = await compress(input);
    return {
      ...result,
      id: input.id,
      durationMs: performance.now() - t0,
    };
  },
};

export type CodecWorker = typeof api;
Comlink.expose(api);
