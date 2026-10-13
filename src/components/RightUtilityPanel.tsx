import React from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Square,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { ScheduledEvent, ExtractedTask, SeeLaterItem } from '../types.ts';

interface RightUtilityPanelProps {
  todayTasks: ExtractedTask[];
  scheduledEvents: ScheduledEvent[];
  seeLaterItems: SeeLaterItem[];
  onToggleTask: (taskId: string) => void;
  onSelectDate: (dateStr: string) => void;
  selectedDate: string;
  onOpenSeeLaterView: () => void;
  onOpenCalendarView: () => void;
  onClose?: () => void;
}

export const RightUtilityPanel: React.FC<RightUtilityPanelProps> = ({
  todayTasks,
  scheduledEvents,
  seeLaterItems,
  onToggleTask,
  onSelectDate,
  selectedDate,
  onOpenSeeLaterView,
  onOpenCalendarView,
  onClose,
}) => {
  const daysInMonth = 31;
  const firstDayOfWeek = 4; // Oct 1, 2026 was a Thursday
  const todayDateNum = 13; // Oct 13, 2026

  // Find dates that have scheduled events
  const eventDates = new Set(
    scheduledEvents.map((e) => {
      const parts = e.dateStr.split('-');
      return parseInt(parts[2], 10);
    })
  );

  const nextCheckedItems = seeLaterItems.filter((i) => i.triageState === 'next_checked');

  return (
    <aside className="w-80 bg-white border-l border-slate-200/90 flex flex-col h-screen shrink-0 overflow-y-auto select-none p-4 space-y-6">
      {/* Top Header with Close (visible when in mobile drawer or toggled) */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Schedule & Quick Queue
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 xl:hidden"
            title="Close companion panel"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 1. Interactive Mini Calendar */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-violet-800" />
            <span className="text-xs font-bold text-slate-800">
              October 2026
            </span>
          </div>
          <button
            onClick={onOpenCalendarView}
            className="text-[11px] font-medium text-violet-700 hover:underline cursor-pointer"
          >
            Full View
          </button>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 mb-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-6" />
          ))}

          {/* Day numbers */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDate = `2026-10-${String(dayNum).padStart(2, '0')}`;
            const isToday = dayNum === todayDateNum;
            const isSelected = selectedDate === formattedDate;
            const hasEvents = eventDates.has(dayNum);

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => onSelectDate(formattedDate)}
                className={`h-6 text-[11px] font-mono rounded flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-violet-900 text-white font-bold'
                    : isToday
                    ? 'bg-violet-100 text-violet-900 font-bold border border-violet-300'
                    : 'text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <span>{dayNum}</span>
                {hasEvents && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-violet-600 absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Today's Quick Queue */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Today's Queue ({todayTasks.length})
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Oct 13</span>
        </div>

        <div className="space-y-1.5">
          {todayTasks.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center text-xs text-slate-400">
              No pending tasks for today.
            </div>
          ) : (
            todayTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="p-2.5 bg-slate-50/80 border border-slate-200/70 rounded-lg flex items-start gap-2.5 group hover:border-slate-300 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-violet-700 shrink-0 cursor-pointer"
                  title="Toggle task completion"
                >
                  {task.completed ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs leading-snug truncate ${
                      task.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                    }`}
                  >
                    {task.task}
                  </p>
                  {task.deadline && (
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {task.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. "Next Checked" Watchlist Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Next Checked ({nextCheckedItems.length})
            </span>
          </div>
          <button
            onClick={onOpenSeeLaterView}
            className="text-[10px] font-medium text-violet-700 hover:underline cursor-pointer"
          >
            All Watch
          </button>
        </div>

        <div className="space-y-2">
          {nextCheckedItems.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center text-xs text-slate-400">
              No items awaiting next check.
            </div>
          ) : (
            nextCheckedItems.map((item) => (
              <div
                key={item.id}
                className="p-2.5 bg-amber-50/40 border border-amber-200/60 rounded-lg text-xs"
              >
                <div className="flex items-start justify-between gap-1.5">
                  <span className="font-semibold text-amber-950 leading-snug line-clamp-1">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                        item.priority === 'high'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : item.priority === 'low'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.priority || 'medium'}
                    </span>
                    <span className="text-[9px] font-bold text-amber-700 uppercase px-1 py-0.2 bg-amber-100/80 rounded">
                      Watch
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-800/80 mt-1 line-clamp-2 leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
