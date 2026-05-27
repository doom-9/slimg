export type OutputFormat = "jpeg" | "png" | "webp" | "original";

export interface CompressOptions {
  format: OutputFormat;
  quality: number; // 1-100, applies to jpeg/webp
  maxWidth?: number; // optional downscale, never upscales
  maxHeight?: number;
  pngOptimizationLevel?: number; // 0-6, oxipng
}

export interface CompressInput {
  id: string;
  buffer: ArrayBuffer; // Transferable
  sourceMime: string;
  options: CompressOptions;
}

export interface CompressResult {
  id: string;
  buffer: ArrayBuffer;
  outMime: string;
  width: number;
  height: number;
  durationMs: number;
}
