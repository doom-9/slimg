import { useTranslation } from "react-i18next";
import { useTasks, type Task } from "../store/tasks";
import { downloadOne } from "../core/download";
import { formatBytes } from "../core/format";
import { DownloadIcon, TrashIcon } from "./icons";

export function TaskItem({ task }: { task: Task }) {
  const { t } = useTranslation();
  const removeTask = useTasks((s) => s.removeTask);

  const ratio =
    task.resultSize !== undefined && task.originalSize > 0
      ? 1 - task.resultSize / task.originalSize
      : undefined;

  return (
    <li className={`task task--${task.status}`}>
      <div className="task__preview">
        <img src={task.resultUrl ?? task.originalUrl} alt={task.file.name} />
      </div>

      <div className="task__body">
        <p className="task__name" title={task.file.name}>
          {task.file.name}
        </p>
        <p className="task__meta">
          <span className={`task__status task__status--${task.status}`}>
            {task.status === "running" && <span className="task__spinner" aria-hidden="true" />}
            {t(`status.${task.status}`)}
          </span>
          {task.durationMs !== undefined && (
            <span className="task__time">
              {t("task.duration", { ms: Math.round(task.durationMs) })}
            </span>
          )}
        </p>
        {task.status === "error" ? (
          <p className="task__error">{task.error}</p>
        ) : (
          <p className="task__sizes">
            {formatBytes(task.originalSize)}
            {task.resultSize !== undefined && (
              <>
                {" → "}
                <strong>{formatBytes(task.resultSize)}</strong>
                {ratio !== undefined && (
                  <span className={`task__ratio${ratio < 0 ? " task__ratio--neg" : ""}`}>
                    {ratio >= 0 ? `−${Math.round(ratio * 100)}%` : `+${Math.round(-ratio * 100)}%`}
                  </span>
                )}
              </>
            )}
          </p>
        )}
      </div>

      <div className="task__actions">
        {task.status === "done" && (
          <button
            type="button"
            className="btn btn--small"
            onClick={() => downloadOne(task)}
            title={t("task.download")}
          >
            <DownloadIcon width={16} height={16} />
            <span className="btn__label">{t("task.download")}</span>
          </button>
        )}
        <button
          type="button"
          className="btn btn--small btn--ghost"
          onClick={() => removeTask(task.id)}
          title={t("task.remove")}
        >
          <TrashIcon width={16} height={16} />
          <span className="btn__label">{t("task.remove")}</span>
        </button>
      </div>
    </li>
  );
}
