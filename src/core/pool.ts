import * as Comlink from "comlink";
import type { CodecWorker } from "../worker/codec.worker";
import type { CompressInput, CompressResult } from "./types";

interface Slot {
  worker: Worker;
  api: Comlink.Remote<CodecWorker>;
  busy: boolean;
}

interface Job {
  input: CompressInput;
  resolve: (r: CompressResult) => void;
  reject: (e: Error) => void;
}

export class CodecPool {
  private slots: Slot[] = [];
  private queue: Job[] = [];

  constructor(size = Math.max(1, (navigator.hardwareConcurrency || 4) - 1)) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(new URL("../worker/codec.worker.ts", import.meta.url), {
        type: "module",
      });
      this.slots.push({
        worker,
        api: Comlink.wrap<CodecWorker>(worker),
        busy: false,
      });
    }
  }

  run(input: CompressInput): Promise<CompressResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ input, resolve, reject });
      this.pump();
    });
  }

  private pump() {
    for (const slot of this.slots) {
      if (slot.busy || this.queue.length === 0) continue;
      const job = this.queue.shift()!;
      slot.busy = true;
      slot.api
        .run(Comlink.transfer(job.input, [job.input.buffer]))
        .then(job.resolve, job.reject)
        .finally(() => {
          slot.busy = false;
          this.pump();
        });
    }
  }

  terminate() {
    for (const slot of this.slots) slot.worker.terminate();
  }
}

export const pool = new CodecPool();
