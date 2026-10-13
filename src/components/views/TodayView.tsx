import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Trash2,
  Plus,
  Clock,
  Calendar,
  Download,
  Copy,
  Check,
  Edit2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { ExtractedTask } from '../../types.ts';
import { downloadTasksCsv, downloadTasksIcs, formatTasksMarkdown } from '../../utils/export.ts';

interface TodayViewProps {
  tasks: ExtractedTask[];
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<ExtractedTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Omit<ExtractedTask, 'id'>) => void;
  onMoveToSeeLater: (task: ExtractedTask) => void;
  onMoveToCalendar: (task: ExtractedTask, dateStr: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onMoveToSeeLater,
  onMoveToCalendar,
}) => {
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedMd, setCopiedMd] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    onAddTask({
      task: newTaskInput.trim(),
      priority: newTaskPriority,
      completed: false,
      triageState: 'today',
    });
    setNewTaskInput('');
  };

  const startEditing = (task: ExtractedTask) => {
    setEditingTaskId(task.id);
    setEditingText(task.task);
  };

  const saveEditing = (taskId: string) => {
    if (editingText.trim()) {
      onUpdateTask(taskId, { task: editingText.trim() });
    }
    setEditingTaskId(null);
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = formatTasksMarkdown(tasks, "Today's Focus Tasks", "High-priority commitments for today.");
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Today's Commitments & Focus
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tuesday, October 13, 2026 · {completedCount} of {tasks.length} tasks completed
          </p>
        </div>

        {/* Export Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => downloadTasksCsv(tasks, 'today-focus')}
            disabled={tasks.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => downloadTasksIcs(tasks, 'today-focus')}
            disabled={tasks.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>.ICS</span>
          </button>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            disabled={tasks.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 shadow-2xs"
          >
            {copiedMd ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{copiedMd ? 'Copied' : 'Markdown'}</span>
          </button>
        </div>
      </div>

      {/* Inline Add Task Form */}
      <form
        onSubmit={handleAddNewTask}
        className="p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs flex items-center gap-2"
      >
        <input
          type="text"
          value={newTaskInput}
          onChange={(e) => setNewTaskInput(e.target.value)}
          placeholder="Add an urgent task for today..."
          className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-violet-500 focus:bg-white text-slate-800"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as any)}
          aria-label="Task priority"
          className="text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden"
        >
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        <button
          type="submit"
          disabled={!newTaskInput.trim()}
          className="flex items-center gap-1 px-3 py-1.5 bg-violet-900 hover:bg-violet-800 disabled:opacity-40 text-white rounded-md text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </form>

      {/* Task List */}
      <div className="bg-white border border-slate-200/90 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
        {tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No active tasks scheduled for today. Distill incoming messages or add an action above.
          </div>
        ) : (
          tasks.map((task) => {
            const isEditing = editingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-4 transition-colors ${
                  task.completed ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-violet-700 focus:outline-hidden shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  {/* Task details / editor */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEditing(task.id)}
                          onBlur={() => saveEditing(task.id)}
                          autoFocus
                          className="w-full text-xs px-2 py-1 border border-violet-400 rounded bg-white text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => saveEditing(task.id)}
                          className="px-2 py-1 text-xs font-semibold bg-violet-900 text-white rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p
                        onClick={() => startEditing(task)}
                        className={`text-xs sm:text-sm font-medium leading-snug cursor-pointer ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 hover:text-violet-900'
                        }`}
                      >
                        {task.task}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      <span
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                          task.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {task.deadline && (
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.deadline}</span>
                        </span>
                      )}

                      {task.assignee && (
                        <span className="text-slate-600 font-medium">
                          👤 {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Triage & Management Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onMoveToSeeLater(task)}
                      className="px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors"
                      title="Move to See Later / Look After if details are unconfirmed"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      <span>See Later</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onMoveToCalendar(task, '2026-10-17')}
                      className="px-2 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition-colors"
                      title="Schedule to upcoming calendar"
                    >
                      <Calendar className="w-3 h-3 inline mr-1" />
                      <span>Schedule</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
