import pngDecode from "@jsquash/png/decode";
import pngEncode from "@jsquash/png/encode";
import oxipngOptimise from "@jsquash/oxipng/optimise";
import type { CompressOptions } from "../../core/types";

export function decode(buffer: ArrayBuffer): Promise<ImageData> {
  return pngDecode(buffer);
}

// Lossless: encode to PNG, then re-optimize with oxipng.
export async function encode(img: ImageData, opts: CompressOptions): Promise<ArrayBuffer> {
  const png = await pngEncode(img);
  return oxipngOptimise(png, { level: opts.pngOptimizationLevel ?? 2 });
}
