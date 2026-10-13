import React, { useState } from 'react';
import {
  Clock,
  Eye,
  Calendar,
  Trash2,
  Plus,
  Quote,
  Flag,
  Filter,
  Check,
  ChevronDown,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { SeeLaterItem } from '../../types.ts';

interface SeeLaterViewProps {
  items: SeeLaterItem[];
  onPromoteToToday: (item: SeeLaterItem) => void;
  onPromoteToCalendar: (item: SeeLaterItem, dateStr: string) => void;
  onSnoozeItem: (itemId: string, newDateStr: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (item: Omit<SeeLaterItem, 'id' | 'createdAt'>) => void;
  onUpdatePriority?: (itemId: string, newPriority: 'high' | 'medium' | 'low') => void;
}

type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export const SeeLaterView: React.FC<SeeLaterViewProps> = ({
  items,
  onPromoteToToday,
  onPromoteToCalendar,
  onSnoozeItem,
  onDeleteItem,
  onAddItem,
  onUpdatePriority,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newTriageState, setNewTriageState] = useState<'next_checked' | 'see_later'>('next_checked');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newSnoozeDate, setNewSnoozeDate] = useState('2026-10-18');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);

  // Counts for triage overview
  const highCount = items.filter((i) => (i.priority || 'medium') === 'high').length;
  const mediumCount = items.filter((i) => (i.priority || 'medium') === 'medium').length;
  const lowCount = items.filter((i) => (i.priority || 'medium') === 'low').length;

  // Apply priority filter
  const filteredItems = priorityFilter === 'all'
    ? items
    : items.filter((i) => (i.priority || 'medium') === priorityFilter);

  const nextCheckedList = filteredItems.filter((i) => i.triageState === 'next_checked');
  const seeLaterList = filteredItems.filter((i) => i.triageState === 'see_later');

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddItem({
      title: newTitle.trim(),
      reason: newReason.trim() || 'Awaiting further clarification.',
      triageState: newTriageState,
      snoozedUntil: newSnoozeDate,
      priority: newPriority,
    });

    setNewTitle('');
    setNewReason('');
    setNewPriority('medium');
    setShowAddModal(false);
  };

  const handleQuickSnooze = (itemId: string, daysAhead: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const dateStr = targetDate.toISOString().split('T')[0];
    onSnoozeItem(itemId, dateStr);
  };

  const handlePrioritySelect = (itemId: string, priority: 'high' | 'medium' | 'low') => {
    if (onUpdatePriority) {
      onUpdatePriority(itemId, priority);
    }
    setEditingPriorityId(null);
  };

  const renderPriorityBadge = (
    priority: 'high' | 'medium' | 'low' = 'medium',
    itemId: string
  ) => {
    const isEditing = editingPriorityId === itemId;

    const styles = {
      high: {
        label: 'High',
        badge: 'bg-rose-50 text-rose-700 border-rose-200/90 hover:bg-rose-100',
        dot: 'bg-rose-500',
        ring: 'ring-1 ring-rose-300/40',
      },
      medium: {
        label: 'Medium',
        badge: 'bg-amber-50 text-amber-700 border-amber-200/90 hover:bg-amber-100',
        dot: 'bg-amber-500',
        ring: 'ring-1 ring-amber-300/40',
      },
      low: {
        label: 'Low',
        badge: 'bg-slate-100 text-slate-600 border-slate-200/90 hover:bg-slate-200',
        dot: 'bg-slate-400',
        ring: 'ring-1 ring-slate-300/40',
      },
    }[priority];

    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setEditingPriorityId(isEditing ? null : itemId)}
          className={`group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs transition-all cursor-pointer ${styles.badge} ${styles.ring}`}
          title={`Priority: ${styles.label}. Click to re-triage.`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
          <span>{styles.label}</span>
          <ChevronDown className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
        </button>

        {isEditing && (
          <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-lg shadow-lg z-30 py-1 text-xs">
            <div className="px-2 py-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Set Priority
            </div>
            {(['high', 'medium', 'low'] as const).map((p) => {
              const pInfo = {
                high: { label: 'High', color: 'text-rose-700 hover:bg-rose-50', dot: 'bg-rose-500' },
                medium: { label: 'Medium', color: 'text-amber-700 hover:bg-amber-50', dot: 'bg-amber-500' },
                low: { label: 'Low', color: 'text-slate-700 hover:bg-slate-50', dot: 'bg-slate-400' },
              }[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePrioritySelect(itemId, p)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left font-medium cursor-pointer ${pInfo.color}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${pInfo.dot}`} />
                    <span>{pInfo.label}</span>
                  </span>
                  {priority === p && <Check className="w-3 h-3 text-slate-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            See Later & Next Checked Tray
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Quarantine for ambiguous, unconfirmed, or blocked office items awaiting more information
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Unconfirmed Item</span>
        </button>
      </div>

      {/* Triage & Priority Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Triage Priority:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPriorityFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                priorityFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setPriorityFilter('high')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                priorityFilter === 'high'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>High ({highCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setPriorityFilter('medium')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                priorityFilter === 'medium'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Medium ({mediumCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setPriorityFilter('low')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                priorityFilter === 'low'
                  ? 'bg-slate-200 text-slate-800 border border-slate-300 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Low ({lowCount})</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <Flag className="w-3 h-3 text-slate-400" />
          <span>Click any priority badge on a card to re-triage</span>
        </div>
      </div>

      {/* Section 1: Next Checked (Immediate review in next standup) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Next Checked ({nextCheckedList.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            · Review during morning check-in or shift handover
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nextCheckedList.length === 0 ? (
            <div className="col-span-2 p-6 bg-white border border-slate-200/90 rounded-xl text-center text-xs text-slate-400">
              No items in Next Checked matching filter.
            </div>
          ) : (
            nextCheckedList.map((item) => {
              const priority = item.priority || 'medium';
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors ${
                    priority === 'high'
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : priority === 'medium'
                      ? 'border-amber-200/80 hover:border-amber-300'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug flex-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {renderPriorityBadge(priority, item.id)}
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase shrink-0">
                          Next Checked
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-amber-50/50 p-2 rounded-md border border-amber-100">
                      ⚠️ {item.reason}
                    </p>

                    {item.sourceQuote && (
                      <div className="flex items-start gap-1 mt-2 text-[11px] text-slate-400 italic">
                        <Quote className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">"{item.sourceQuote}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickSnooze(item.id, 1)}
                        className="px-2 py-0.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded cursor-pointer"
                        title="Snooze 1 day"
                      >
                        +1d
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSnooze(item.id, 3)}
                        className="px-2 py-0.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded cursor-pointer"
                        title="Snooze 3 days"
                      >
                        +3d
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPromoteToToday(item)}
                        className="px-2.5 py-1 bg-violet-900 hover:bg-violet-800 text-white rounded font-medium shadow-2xs transition-colors cursor-pointer"
                        title="Promote to Today's Tasks"
                      >
                        Promote to Today
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer"
                        title="Resolve or delete"
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

      {/* Section 2: Look After / See Later (Unknown information / Snoozed) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Look After / See Later ({seeLaterList.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            · Snoozed until unconfirmed requirements are determined
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {seeLaterList.length === 0 ? (
            <div className="col-span-2 p-6 bg-white border border-slate-200/90 rounded-xl text-center text-xs text-slate-400">
              No items in See Later matching filter.
            </div>
          ) : (
            seeLaterList.map((item) => {
              const priority = item.priority || 'medium';
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors ${
                    priority === 'high'
                      ? 'border-rose-200/90 hover:border-rose-300'
                      : priority === 'medium'
                      ? 'border-amber-200/80 hover:border-amber-300'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug flex-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {renderPriorityBadge(priority, item.id)}
                        {item.snoozedUntil && (
                          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-mono font-semibold shrink-0">
                            Until {item.snoozedUntil}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-md border border-slate-100">
                      ℹ️ {item.reason}
                    </p>

                    {item.sourceQuote && (
                      <div className="flex items-start gap-1 mt-2 text-[11px] text-slate-400 italic">
                        <Quote className="w-3 h-3 text-slate-300 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">"{item.sourceQuote}"</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickSnooze(item.id, 7)}
                        className="px-2 py-0.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded cursor-pointer"
                        title="Snooze 1 week"
                      >
                        +1 week
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPromoteToCalendar(item, item.snoozedUntil || '2026-10-20')}
                        className="px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded font-medium transition-colors cursor-pointer"
                        title="Schedule to Calendar"
                      >
                        Schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => onPromoteToToday(item)}
                        className="px-2.5 py-1 bg-violet-900 hover:bg-violet-800 text-white rounded font-medium shadow-2xs transition-colors cursor-pointer"
                      >
                        Move to Today
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded cursor-pointer"
                        title="Resolve or delete"
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Add Item to See Later / Watch
            </h3>

            <form onSubmit={handleCreateItem} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Awaiting client decision on UAT location"
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white text-slate-800 focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Classification
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTriageState('next_checked')}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors cursor-pointer ${
                      newTriageState === 'next_checked'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Next Checked
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTriageState('see_later')}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors cursor-pointer ${
                      newTriageState === 'see_later'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    See Later
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Triage Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPriority('high')}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      newPriority === 'high'
                        ? 'bg-rose-50 border-rose-400 text-rose-800 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>High</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority('medium')}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      newPriority === 'medium'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Medium</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPriority('low')}
                    className={`py-1.5 text-xs font-medium rounded-md border text-center transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      newPriority === 'low'
                        ? 'bg-slate-100 border-slate-400 text-slate-800 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>Low</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reason for Holding / Unconfirmed Details
                </label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="What information is missing? Who are we waiting for?"
                  rows={2}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md resize-none focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Snooze Until Date
                </label>
                <input
                  type="date"
                  value={newSnoozeDate}
                  onChange={(e) => setNewSnoozeDate(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-bold cursor-pointer transition-colors"
                >
                  Add to Watch Tray
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
