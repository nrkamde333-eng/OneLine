import { HistoryItem, AnalysisResult } from '../types.ts';

const STORAGE_KEYS = {
  HISTORY: 'oneline_ai_history',
  CURRENT_RESULT: 'oneline_ai_current_result',
  INPUT_DRAFT: 'oneline_ai_input_draft',
};

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return [];
  }
}

export function saveToHistory(result: AnalysisResult): HistoryItem[] {
  try {
    const existing = loadHistory();
    const item: HistoryItem = {
      id: result.id,
      timestamp: result.timestamp,
      title: result.title,
      oneSentenceSummary: result.oneSentenceSummary,
      taskCount: result.tasks.length,
      completedTaskCount: result.tasks.filter((t) => t.completed).length,
      hasDeadline: result.deadlines.hasDeadline,
      deadlineSummary: result.deadlines.deadlineSummary,
      result,
    };

    // Filter out if duplicate ID exists, then prepend to top
    const updated = [item, ...existing.filter((h) => h.id !== result.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save to history', e);
    return [];
  }
}

export function updateHistoryItem(result: AnalysisResult): HistoryItem[] {
  try {
    const existing = loadHistory();
    const index = existing.findIndex((h) => h.id === result.id);
    if (index === -1) return saveToHistory(result);

    existing[index] = {
      ...existing[index],
      title: result.title,
      oneSentenceSummary: result.oneSentenceSummary,
      taskCount: result.tasks.length,
      completedTaskCount: result.tasks.filter((t) => t.completed).length,
      result,
    };

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(existing));
    return existing;
  } catch (e) {
    console.error('Failed to update history item', e);
    return [];
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const existing = loadHistory();
    const updated = existing.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete history item', e);
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}

export function loadCurrentResult(): AnalysisResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_RESULT);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Failed to load current result', e);
    return null;
  }
}

export function saveCurrentResult(result: AnalysisResult | null): void {
  try {
    if (result) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_RESULT, JSON.stringify(result));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_RESULT);
    }
  } catch (e) {
    console.error('Failed to save current result', e);
  }
}

export function loadInputDraft(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.INPUT_DRAFT) || '';
  } catch {
    return '';
  }
}

export function saveInputDraft(draft: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INPUT_DRAFT, draft);
  } catch {
    // Ignore storage quota
  }
}
