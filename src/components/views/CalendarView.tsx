import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Download,
  Trash2,
  CheckCircle2,
  Square,
  CheckSquare,
  Filter,
} from 'lucide-react';
import { ScheduledEvent, ChannelType } from '../../types.ts';
import { downloadTasksIcs } from '../../utils/export.ts';

interface CalendarViewProps {
  events: ScheduledEvent[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onToggleEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onAddEvent: (event: Omit<ScheduledEvent, 'id'>) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  selectedDate,
  onSelectDate,
  onToggleEvent,
  onDeleteEvent,
  onAddEvent,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-10-17');
  const [newEventTime, setNewEventTime] = useState('14:00 UTC');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [filterBySelectedDate, setFilterBySelectedDate] = useState(false);

  const displayedEvents = filterBySelectedDate
    ? events.filter((e) => e.dateStr === selectedDate)
    : events;

  // Group events by date
  const groupedEvents: Record<string, ScheduledEvent[]> = {};
  displayedEvents.forEach((e) => {
    if (!groupedEvents[e.dateStr]) groupedEvents[e.dateStr] = [];
    groupedEvents[e.dateStr].push(e);
  });

  const sortedDates = Object.keys(groupedEvents).sort();

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddEvent({
      title: newEventTitle.trim(),
      dateStr: newEventDate,
      timeStr: newEventTime.trim() || undefined,
      description: newEventDesc.trim(),
      channel: 'manual',
      isCompleted: false,
      priority: 'high',
    });

    setNewEventTitle('');
    setNewEventDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Upcoming Deadlines & Schedule
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {events.length} extracted and committed events across all channels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterBySelectedDate(!filterBySelectedDate)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              filterBySelectedDate
                ? 'bg-violet-50 text-violet-900 border-violet-200 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {filterBySelectedDate ? `Filtered: ${selectedDate}` : 'Show All Dates'}
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-violet-900 hover:bg-violet-800 text-white rounded-lg text-xs font-semibold shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Grouped Events Timeline */}
      <div className="space-y-5">
        {sortedDates.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 bg-white border border-slate-200/90 rounded-xl">
            No events scheduled for this timeframe.
          </div>
        ) : (
          sortedDates.map((dateKey) => {
            const dateEvents = groupedEvents[dateKey];
            const dateObj = new Date(dateKey + 'T00:00:00');
            const dateFormatted = dateObj.toLocaleDateString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={dateKey} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {dateFormatted}
                  </span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
                  {dateEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`p-4 transition-colors ${
                        evt.isCompleted ? 'bg-slate-50/50' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => onToggleEvent(evt.id)}
                            className="mt-0.5 text-slate-400 hover:text-violet-700 shrink-0"
                          >
                            {evt.isCompleted ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-400" />
                            )}
                          </button>

                          <div>
                            <h4
                              className={`text-xs sm:text-sm font-semibold leading-snug ${
                                evt.isCompleted
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              {evt.title}
                            </h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {evt.description}
                            </p>

                            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                              {evt.timeStr && (
                                <span className="flex items-center gap-1 font-mono font-medium text-violet-900 bg-violet-50 px-2 py-0.5 rounded">
                                  <Clock className="w-3 h-3 text-violet-700" />
                                  <span>{evt.timeStr}</span>
                                </span>
                              )}
                              <span className="capitalize text-slate-500">
                                Via {evt.channel.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDeleteEvent(evt.id)}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors shrink-0"
                          title="Delete event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Add Scheduled Event / Deadline
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Event / Milestone Title
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Review Q3 Audit SOW"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="15:00 UTC"
                    className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Details / Notes
                </label>
                <textarea
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Dependencies, stakeholders, or meeting link..."
                  rows={3}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-violet-900 hover:bg-violet-800 text-white rounded-md text-xs font-bold"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
