import { create } from "zustand";

export type TaskStatus = "pending" | "running" | "done" | "error";

export interface Task {
  id: string;
  file: File;
  status: TaskStatus;
  originalSize: number;
  originalUrl: string; // object URL for the source file, shown before compression
  resultSize?: number;
  resultBlob?: Blob;
  resultUrl?: string; // object URL for preview/download
  outMime?: string;
  error?: string;
  durationMs?: number;
}

interface State {
  tasks: Task[];
  addFiles: (files: File[]) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  clear: () => void;
}

export const useTasks = create<State>((set) => ({
  tasks: [],
  addFiles: (files) =>
    set((s) => ({
      tasks: [
        ...s.tasks,
        ...files.map((f) => ({
          id: crypto.randomUUID(),
          file: f,
          status: "pending" as const,
          originalSize: f.size,
          originalUrl: URL.createObjectURL(f),
        })),
      ],
    })),
  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),
  removeTask: (id) =>
    set((s) => {
      const target = s.tasks.find((t) => t.id === id);
      if (target) {
        URL.revokeObjectURL(target.originalUrl);
        if (target.resultUrl) URL.revokeObjectURL(target.resultUrl);
      }
      return { tasks: s.tasks.filter((t) => t.id !== id) };
    }),
  clear: () =>
    set((s) => {
      for (const t of s.tasks) {
        URL.revokeObjectURL(t.originalUrl);
        if (t.resultUrl) URL.revokeObjectURL(t.resultUrl);
      }
      return { tasks: [] };
    }),
}));
