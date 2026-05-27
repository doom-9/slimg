export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

export const SUPPORTED_MIMES = ["image/jpeg", "image/png", "image/webp"];

export function isSupportedImage(file: File): boolean {
  return SUPPORTED_MIMES.includes(file.type);
}
