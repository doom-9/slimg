import { useRef, useState } from "react";
import { useTasks } from "../store/tasks";
import { isSupportedImage } from "../core/format";

const LARGE_FILE_WARN = 50 * 1024 * 1024; // 50MB — decode can blow past tab memory on mobile

export function DropZone() {
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
    if (rejected > 0) messages.push(`${rejected} unsupported file(s) skipped (JPEG/PNG/WebP only)`);
    if (large > 0)
      messages.push(`${large} very large file(s) may be slow or fail on low-memory devices`);
    setNotice(messages.join(". "));

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
        <p className="dropzone__title">Drop images here</p>
        <p className="dropzone__hint">or click to choose files — JPEG, PNG, WebP</p>
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
