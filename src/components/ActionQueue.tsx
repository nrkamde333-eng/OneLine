import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Trash2,
  Plus,
  Download,
  Calendar,
  Copy,
  Check,
  Edit2,
  Quote,
  Clock,
  User,
} from 'lucide-react';
import { ExtractedTask } from '../types.ts';
import { downloadTasksCsv, downloadTasksIcs, formatTasksMarkdown } from '../utils/export.ts';

interface ActionQueueProps {
  tasks: ExtractedTask[];
  analysisTitle: string;
  summaryText: string;
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<ExtractedTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: Omit<ExtractedTask, 'id'>) => void;
  onClearTasks: () => void;
}

export const ActionQueue: React.FC<ActionQueueProps> = ({
  tasks,
  analysisTitle,
  summaryText,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onClearTasks,
}) => {
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedMd, setCopiedMd] = useState(false);
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    onAddTask({
      task: newTaskInput.trim(),
      priority: newTaskPriority,
      completed: false,
      isSuggested: false,
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

  const handleKeyDownEdit = (e: React.KeyboardEvent, taskId: string) => {
    if (e.key === 'Enter') {
      saveEditing(taskId);
    } else if (e.key === 'Escape') {
      setEditingTaskId(null);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const md = formatTasksMarkdown(tasks, analysisTitle, summaryText);
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      // Fallback
    }
  };

  const cyclePriority = (task: ExtractedTask) => {
    const cycleMap: Record<string, 'high' | 'medium' | 'low'> = {
      high: 'medium',
      medium: 'low',
      low: 'high',
    };
    onUpdateTask(task.id, { priority: cycleMap[task.priority] || 'medium' });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden mt-6">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Action Queue
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-mono tabular-nums text-slate-600 font-medium">
            {completedCount}/{totalCount} completed
          </span>
        </div>

        {/* Export and Clear controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => downloadTasksCsv(tasks, analysisTitle)}
            disabled={tasks.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors shadow-2xs"
            title="Download tasks as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => downloadTasksIcs(tasks, analysisTitle)}
            disabled={tasks.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors shadow-2xs"
            title="Download tasks as .ics Calendar file"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Calendar (.ics)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            disabled={tasks.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-colors shadow-2xs"
            title="Copy tasks checklist as Markdown"
          >
            {copiedMd ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy MD</span>
              </>
            )}
          </button>

          {tasks.length > 0 && (
            <button
              type="button"
              onClick={onClearTasks}
              className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Clear all tasks"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Inline Add Task Form */}
      <form onSubmit={handleAddNewTask} className="p-3 bg-white border-b border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={newTaskInput}
          onChange={(e) => setNewTaskInput(e.target.value)}
          placeholder="Add a new action item..."
          className="flex-1 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:border-violet-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as any)}
          aria-label="New task priority"
          className="text-xs px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-hidden"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
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
      <div className="divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No tasks in queue. Add one above or distill from a message.
          </div>
        ) : (
          tasks.map((task) => {
            const isEditing = editingTaskId === task.id;
            const hasQuote = Boolean(task.sourceQuote);
            const isQuoteExpanded = expandedQuoteId === task.id;

            return (
              <div
                key={task.id}
                className={`p-3.5 sm:px-4 transition-colors ${
                  task.completed ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-violet-700 focus:outline-hidden shrink-0 transition-colors"
                    title={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-violet-700" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>

                  {/* Task Content / Editing Input */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => handleKeyDownEdit(e, task.id)}
                          onBlur={() => saveEditing(task.id)}
                          autoFocus
                          className="w-full text-xs px-2 py-1 border border-violet-400 rounded bg-white text-slate-800 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => saveEditing(task.id)}
                          className="px-2 py-1 text-[11px] font-medium bg-violet-900 text-white rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="group">
                        <p
                          className={`text-xs sm:text-sm font-medium leading-snug cursor-pointer ${
                            task.completed
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 hover:text-violet-900'
                          }`}
                          onClick={() => startEditing(task)}
                          title="Click to edit task description"
                        >
                          {task.task}
                        </p>
                      </div>
                    )}

                    {/* Meta row: Priority, Due Date, Assignee, Source quote */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                      {/* Priority toggle */}
                      <button
                        type="button"
                        onClick={() => cyclePriority(task)}
                        className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded transition-colors ${
                          task.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : task.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                        title="Click to cycle priority (High · Medium · Low)"
                      >
                        {task.priority}
                      </button>

                      {/* Deadline */}
                      {task.deadline && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span className="font-mono">{task.deadline}</span>
                        </div>
                      )}

                      {/* Assignee */}
                      {task.assignee && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{task.assignee}</span>
                        </div>
                      )}

                      {/* Source quote badge */}
                      {hasQuote && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedQuoteId(isQuoteExpanded ? null : task.id)
                          }
                          className="flex items-center gap-0.5 text-slate-400 hover:text-slate-700 transition-colors"
                          title="View source evidence quote from text"
                        >
                          <Quote className="w-3 h-3" />
                          <span className="text-[10px] underline">Source quote</span>
                        </button>
                      )}
                    </div>

                    {/* Expanded source quote callout */}
                    {isQuoteExpanded && task.sourceQuote && (
                      <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 italic">
                        "{task.sourceQuote}"
                      </div>
                    )}
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => (isEditing ? saveEditing(task.id) : startEditing(task))}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
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
