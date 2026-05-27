import { useState } from "react";
import "./App.css";
import { DropZone } from "./components/DropZone";
import { SettingsPanel } from "./components/SettingsPanel";
import { TaskList } from "./components/TaskList";
import { pool } from "./core/pool";
import { useTasks, type Task } from "./store/tasks";
import type { CompressOptions } from "./core/types";

async function processOne(task: Task, options: CompressOptions) {
  const { updateTask } = useTasks.getState();
  updateTask(task.id, { status: "running", error: undefined });
  try {
    const buffer = await task.file.arrayBuffer();
    const result = await pool.run({
      id: task.id,
      buffer,
      sourceMime: task.file.type,
      options,
    });
    const blob = new Blob([result.buffer], { type: result.outMime });
    updateTask(task.id, {
      status: "done",
      resultBlob: blob,
      resultSize: blob.size,
      resultUrl: URL.createObjectURL(blob),
      outMime: result.outMime,
      durationMs: result.durationMs,
    });
  } catch (e) {
    updateTask(task.id, {
      status: "error",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

export default function App() {
  const [options, setOptions] = useState<CompressOptions>({
    format: "original",
    quality: 75,
    pngOptimizationLevel: 2,
  });

  function compressAll() {
    const tasks = useTasks
      .getState()
      .tasks.filter((t) => t.status === "pending" || t.status === "error");
    for (const t of tasks) void processOne(t, options);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>slimg</h1>
        <p>Fast, private image compression — everything runs in your browser.</p>
      </header>

      <main className="app__main">
        <DropZone />
        <SettingsPanel
          options={options}
          onChange={(patch) => setOptions((o) => ({ ...o, ...patch }))}
        />
        <TaskList onCompressAll={compressAll} />
      </main>
    </div>
  );
}
