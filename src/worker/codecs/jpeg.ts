import jpegDecode from "@jsquash/jpeg/decode";
import jpegEncode from "@jsquash/jpeg/encode";
import type { CompressOptions } from "../../core/types";

export function decode(buffer: ArrayBuffer): Promise<ImageData> {
  return jpegDecode(buffer);
}

export function encode(img: ImageData, opts: CompressOptions): Promise<ArrayBuffer> {
  return jpegEncode(img, { quality: opts.quality });
}
