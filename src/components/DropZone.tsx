import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTasks } from "../store/tasks";
import { isSupportedImage } from "../core/format";
import { UploadIcon } from "./icons";

const LARGE_FILE_WARN = 50 * 1024 * 1024; // 50MB — decode can blow past tab memory on mobile

export function DropZone() {
  const { t } = useTranslation();
  const addFiles = useTasks((s) => s.addFiles);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string>("");

  function accept(fileList: FileList | null) {
    if (!fileList) return;
    const all = Array.from(fileList);
    const supported = all.filter(isSupportedImage);
    const rejected = all.length - supported.length;
    const large = supported.filter((f) => f.size > LARGE_FILE_WARN).length;

    const messages: string[] = [];
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
          accept(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <UploadIcon className="dropzone__icon" width={36} height={36} />
        <p className="dropzone__title">{t("dropzone.title")}</p>
        <p className="dropzone__hint">{t("dropzone.hint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => {
            accept(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {notice && <p className="dropzone__notice">{notice}</p>}
    </div>
  );
}
