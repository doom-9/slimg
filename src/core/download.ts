import { downloadZip } from "client-zip";
import type { Task } from "../store/tasks";

export function downloadOne(task: Task) {
  if (!task.resultBlob) return;
  triggerDownload(task.resultBlob, renameWithExt(task.file.name, task.resultBlob.type));
}

export async function downloadAll(tasks: Task[]) {
  const files = tasks
    .filter((t) => t.resultBlob)
    .map((t) => ({
      name: renameWithExt(t.file.name, t.resultBlob!.type),
      input: t.resultBlob!,
    }));
  if (files.length === 0) return;
  const blob = await downloadZip(files).blob();
  triggerDownload(blob, "compressed.zip");
}

function renameWithExt(name: string, mime: string): string {
  const subtype = mime.split("/")[1] ?? "";
  const ext = subtype === "jpeg" ? "jpg" : subtype;
  return name.replace(/\.[^.]+$/, "") + (ext ? `.${ext}` : "");
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
