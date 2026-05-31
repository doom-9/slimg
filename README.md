# slimg

Fast, private image compression that runs entirely in your browser. No uploads, no servers — your images never leave your device.

slimg decodes and re-encodes images using WebAssembly codecs ([jSquash](https://github.com/jamsinclair/jSquash)) across a pool of web workers, so you can batch-compress dozens of files in parallel without freezing the UI.

## Features

- **100% client-side** — all processing happens in your browser via WASM. Nothing is uploaded.
- **JPEG, PNG & WebP** — decode and encode any combination, or keep the original format.
- **Format conversion** — turn PNGs into WebP, JPEGs into PNG, and so on.
- **Quality control** — adjustable quality for JPEG/WebP encoding.
- **Lossless PNG optimization** — powered by [oxipng](https://github.com/shssoichiro/oxipng) with selectable optimization levels.
- **Resize on the fly** — optional max width/height (never upscales).
- **Parallel batch processing** — a worker pool sized to your CPU keeps compression fast and the page responsive.
- **One-click download** — grab files individually or export everything as a `.zip`.
- **Drag & drop** with instant before/after size and savings summary.
- **Internationalized** — English, 中文, and 日本語 out of the box.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [jSquash](https://github.com/jamsinclair/jSquash) WASM codecs (JPEG, PNG, oxipng, WebP)
- [Comlink](https://github.com/GoogleChromeLabs/comlink) for ergonomic web worker RPC
- [Zustand](https://github.com/pmndrs/zustand) for state
- [client-zip](https://github.com/Touffy/client-zip) for in-browser zip export
- [i18next](https://www.i18next.com/) for localization
- [Vite+](https://viteplus.dev/) toolchain (Vite, Rolldown, Oxlint, Oxfmt)

## Getting started

This project uses the [Vite+](https://viteplus.dev/) toolchain via the global `vp` CLI.

```bash
# install dependencies
vp install

# start the dev server
vp dev

# build for production
vp build

# preview the production build
vp preview
```

> Prefer pnpm scripts? `pnpm dev`, `pnpm build`, and `pnpm preview` wrap the same commands.

## How it works

1. Files dropped into the browser are read as `ArrayBuffer`s and dispatched to a [`CodecPool`](src/core/pool.ts).
2. The pool spreads jobs across `navigator.hardwareConcurrency - 1` web workers, transferring buffers (zero-copy) to each [worker](src/worker/codec.worker.ts).
3. Each worker lazily loads only the WASM codecs it needs and [caches them](src/worker/codecs/index.ts), so repeated formats pay the init cost only once.
4. Decoded `ImageData` is optionally resized, then re-encoded to the target format and handed back to the UI as a `Blob`.

Because everything is local, slimg works offline and handles sensitive images without ever transmitting them.

## Project structure

```text
src/
├── core/          # worker pool, types, download/zip helpers
├── worker/        # codec worker + per-format encode/decode modules
├── components/    # DropZone, SettingsPanel, TaskList, ...
├── store/         # Zustand task store
└── i18n/          # i18next setup + locale files (en, zh, ja)
```

## Contributing

Issues and pull requests are welcome. Before submitting, please run:

```bash
vp check   # format, lint, and type-check
vp test    # run tests
```

## License

[MIT](LICENSE)
