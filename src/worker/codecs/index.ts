import type {
  CompressInput,
  CompressOptions,
  CompressResult,
  OutputFormat,
} from "../../core/types";

type DecodeFn = (buffer: ArrayBuffer) => Promise<ImageData>;
type EncodeFn = (img: ImageData, opts: CompressOptions) => Promise<ArrayBuffer>;

type EncodableFormat = Exclude<OutputFormat, "original">;

const decoders: Record<string, () => Promise<DecodeFn>> = {
  "image/jpeg": () => import("./jpeg").then((m) => m.decode),
  "image/png": () => import("./png").then((m) => m.decode),
  "image/webp": () => import("./webp").then((m) => m.decode),
};

const encoders: Record<EncodableFormat, () => Promise<EncodeFn>> = {
  jpeg: () => import("./jpeg").then((m) => m.encode),
  png: () => import("./png").then((m) => m.encode),
  webp: () => import("./webp").then((m) => m.encode),
};

// WASM modules are cached per worker, so the first use of a format pays the
// init cost and subsequent images of the same format are pure compute.
const decoderCache = new Map<string, DecodeFn>();
const encoderCache = new Map<string, EncodeFn>();

async function getDecoder(mime: string): Promise<DecodeFn> {
  const cached = decoderCache.get(mime);
  if (cached) return cached;
  const loader = decoders[mime];
  if (!loader) throw new Error(`Unsupported source format: ${mime}`);
  const fn = await loader();
  decoderCache.set(mime, fn);
  return fn;
}

async function getEncoder(format: EncodableFormat): Promise<EncodeFn> {
  const cached = encoderCache.get(format);
  if (cached) return cached;
  const fn = await encoders[format]();
  encoderCache.set(format, fn);
  return fn;
}

function resolveTargetFormat(sourceMime: string, format: OutputFormat): EncodableFormat {
  const target = format === "original" ? sourceMime.split("/")[1] : format;
  if (target === "jpg") return "jpeg";
  if (target === "jpeg" || target === "png" || target === "webp") return target;
  throw new Error(`Unsupported output format: ${target}`);
}

export async function compress(
  input: CompressInput,
): Promise<Omit<CompressResult, "id" | "durationMs">> {
  const { buffer, sourceMime, options } = input;

  const decode = await getDecoder(sourceMime);
  let imageData = await decode(buffer);

  if (options.maxWidth || options.maxHeight) {
    imageData = resize(imageData, options.maxWidth, options.maxHeight);
  }

  const targetFormat = resolveTargetFormat(sourceMime, options.format);
  const encode = await getEncoder(targetFormat);
  const out = await encode(imageData, options);

  return {
    buffer: out,
    outMime: `image/${targetFormat}`,
    width: imageData.width,
    height: imageData.height,
  };
}

function resize(img: ImageData, maxW?: number, maxH?: number): ImageData {
  const ratio = Math.min(maxW ? maxW / img.width : 1, maxH ? maxH / img.height : 1, 1);
  if (ratio === 1) return img;

  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const src = new OffscreenCanvas(img.width, img.height);
  src.getContext("2d")!.putImageData(img, 0, 0);
  const dst = new OffscreenCanvas(w, h);
  const ctx = dst.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}
