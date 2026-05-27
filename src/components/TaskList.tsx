import { useTranslation } from "react-i18next";
import { useTasks } from "../store/tasks";
import { downloadAll } from "../core/download";
import { formatBytes } from "../core/format";
import { TaskItem } from "./TaskItem";
import { CompressIcon, DownloadIcon, TrashIcon } from "./icons";

interface Props {
  onCompressAll: () => void;
}

export function TaskList({ onCompressAll }: Props) {
  const { t } = useTranslation();
  const tasks = useTasks((s) => s.tasks);
  const clear = useTasks((s) => s.clear);

  if (tasks.length === 0) return null;

  const pending = tasks.filter((t) => t.status === "pending" || t.status === "error").length;
  const running = tasks.some((t) => t.status === "running");
  const done = tasks.filter((t) => t.status === "done");

  const totalOriginal = done.reduce((sum, t) => sum + t.originalSize, 0);
  const totalResult = done.reduce((sum, t) => sum + (t.resultSize ?? 0), 0);
  const savedRatio = totalOriginal > 0 ? 1 - totalResult / totalOriginal : 0;

  return (
    <section className="tasklist">
      <div className="tasklist__toolbar">
        <button
          type="button"
          className="btn"
          onClick={onCompressAll}
          disabled={pending === 0 || running}
        >
          <CompressIcon />
          {running
            ? t("task.compressing")
            : pending
              ? t("task.compressWithCount", { count: pending })
              : t("task.compress")}
        </button>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => void downloadAll(tasks)}
          disabled={done.length === 0}
        >
          <DownloadIcon />
          {t("task.downloadAll")}
        </button>
        <button type="button" className="btn btn--ghost" onClick={clear}>
          <TrashIcon />
          {t("task.clear")}
        </button>

        {done.length > 0 && (
          <span className="tasklist__summary">
            {t("tasklist.summary", {
              count: done.length,
              size: formatBytes(Math.max(0, totalOriginal - totalResult)),
              percent: Math.round(savedRatio * 100),
            })}
          </span>
        )}
      </div>

      <ul className="tasklist__items">
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} />
        ))}
      </ul>
    </section>
  );
}
