import webpDecode from "@jsquash/webp/decode";
import webpEncode from "@jsquash/webp/encode";
import type { CompressOptions } from "../../core/types";

export function decode(buffer: ArrayBuffer): Promise<ImageData> {
  return webpDecode(buffer);
}

export function encode(img: ImageData, opts: CompressOptions): Promise<ArrayBuffer> {
  return webpEncode(img, { quality: opts.quality });
}
