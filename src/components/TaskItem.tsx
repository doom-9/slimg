import { useTasks, type Task } from "../store/tasks";
import { downloadOne } from "../core/download";
import { formatBytes } from "../core/format";

const STATUS_LABEL: Record<Task["status"], string> = {
  pending: "Pending",
  running: "Compressing…",
  done: "Done",
  error: "Error",
};

export function TaskItem({ task }: { task: Task }) {
  const removeTask = useTasks((s) => s.removeTask);

  const ratio =
    task.resultSize !== undefined && task.originalSize > 0
      ? 1 - task.resultSize / task.originalSize
      : undefined;

  return (
    <li className={`task task--${task.status}`}>
      <div className="task__preview">
        {task.resultUrl ? (
          <img src={task.resultUrl} alt={task.file.name} />
        ) : (
          <span className="task__preview-placeholder" />
        )}
      </div>

      <div className="task__body">
        <p className="task__name" title={task.file.name}>
          {task.file.name}
        </p>
        <p className="task__meta">
          <span className={`task__status task__status--${task.status}`}>
            {STATUS_LABEL[task.status]}
          </span>
          {task.durationMs !== undefined && (
            <span className="task__time">{Math.round(task.durationMs)} ms</span>
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
          <button type="button" className="btn btn--small" onClick={() => downloadOne(task)}>
            Download
          </button>
        )}
        <button
          type="button"
          className="btn btn--small btn--ghost"
          onClick={() => removeTask(task.id)}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
