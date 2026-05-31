import { unzip, type Unzipped } from "fflate";

// Extension → MIME for images we can compress. Zip entries carry no MIME, so we
// derive it from the filename and rebuild File objects the rest of the app trusts.
const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const ZIP_MIMES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
  "multipart/x-zip",
];

export function isZip(file: File): boolean {
  return ZIP_MIMES.includes(file.type) || /\.zip$/i.test(file.name);
}

function imageExt(path: string): string | undefined {
  const name = path.split("/").pop() ?? "";
  // skip directory entries, macOS resource forks, and hidden files
  if (!name || name.startsWith(".") || path.includes("__MACOSX/")) return undefined;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ext in EXT_MIME ? ext : undefined;
}

/** Extract every supported image from a zip into File objects, preserving names. */
export function extractImagesFromZip(file: File): Promise<File[]> {
  return file.arrayBuffer().then(
    (buf) =>
      new Promise<File[]>((resolve, reject) => {
        unzip(
          new Uint8Array(buf),
          // Only decompress entries we can actually use.
          { filter: (entry) => imageExt(entry.name) !== undefined },
          (err, entries: Unzipped) => {
            if (err) {
              reject(err);
              return;
            }
            const files: File[] = [];
            for (const [path, data] of Object.entries(entries)) {
              const ext = imageExt(path);
              if (!ext || data.length === 0) continue;
              const name = path.split("/").pop()!;
              files.push(new File([data], name, { type: EXT_MIME[ext] }));
            }
            resolve(files);
          },
        );
      }),
  );
}
