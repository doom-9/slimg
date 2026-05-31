import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTasks } from "../store/tasks";
import { isSupportedImage } from "../core/format";
import { extractImagesFromZip, isZip } from "../core/archive";
import { UploadIcon } from "./icons";

const LARGE_FILE_WARN = 50 * 1024 * 1024; // 50MB — decode can blow past tab memory on mobile

export function DropZone() {
  const { t } = useTranslation();
  const addFiles = useTasks((s) => s.addFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [notice, setNotice] = useState<string>("");

  async function accept(fileList: FileList | null) {
    if (!fileList) return;
    const all = Array.from(fileList);
    const zips = all.filter(isZip);
    const direct = all.filter((f) => !isZip(f));

    // Pull images out of any dropped archives first.
    const fromZip: File[] = [];
    let zipError = 0;
    if (zips.length > 0) {
      setExtracting(true);
      for (const z of zips) {
        try {
          fromZip.push(...(await extractImagesFromZip(z)));
        } catch {
          zipError++;
        }
      }
      setExtracting(false);
    }

    const supportedDirect = direct.filter(isSupportedImage);
    const supported = [...supportedDirect, ...fromZip];
    const rejected = direct.length - supportedDirect.length;
    const large = supported.filter((f) => f.size > LARGE_FILE_WARN).length;

    const messages: string[] = [];
    if (fromZip.length > 0) messages.push(t("dropzone.extracted", { count: fromZip.length }));
    if (zips.length > 0 && fromZip.length === 0 && zipError === 0)
      messages.push(t("dropzone.zipEmpty"));
    if (zipError > 0) messages.push(t("dropzone.zipError", { count: zipError }));
    if (rejected > 0) messages.push(t("dropzone.rejected", { count: rejected }));
    if (large > 0) messages.push(t("dropzone.large", { count: large }));
    setNotice(messages.join(" · "));

    if (supported.length > 0) addFiles(supported);
  }

  return (
    <div>
      <div
        className={`dropzone${dragging ? " dropzone--active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void accept(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon className="dropzone__icon" width={36} height={36} />
        <p className="dropzone__title">{t("dropzone.title")}</p>
        <p className="dropzone__hint">{t("dropzone.hint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.zip,application/zip"
          multiple
          hidden
          onChange={(e) => {
            void accept(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {extracting && <p className="dropzone__notice">{t("dropzone.extracting")}</p>}
      {notice && <p className="dropzone__notice">{notice}</p>}
    </div>
  );
}
