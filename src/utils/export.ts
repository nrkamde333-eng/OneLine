import { ExtractedTask, AnalysisResult } from '../types.ts';

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'oneline-ai';
}

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download extracted tasks as a CSV file
 */
export function downloadTasksCsv(tasks: ExtractedTask[], title: string) {
  const headers = ['Task', 'Assignee', 'Deadline', 'Priority', 'Status', 'Type', 'Source Quote'];
  const rows = tasks.map((t) => [
    escapeCsvField(t.task),
    escapeCsvField(t.assignee || 'Unassigned'),
    escapeCsvField(t.deadline || 'No deadline'),
    escapeCsvField(t.priority.toUpperCase()),
    escapeCsvField(t.completed ? 'Completed' : 'Pending'),
    escapeCsvField(t.isSuggested ? 'Suggested' : 'Explicit'),
    escapeCsvField(t.sourceQuote || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizeFilename(title)}-tasks.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download an iCalendar (.ics) file for tasks
 */
export function downloadTasksIcs(tasks: ExtractedTask[], title: string) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // Base date for events without a parseable date: tomorrow at 09:00
  const defaultEventDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const defaultDateStr = defaultEventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const events = tasks.map((t, idx) => {
    const uid = `oneline-${t.id || idx}-${Date.now()}@oneline.ai`;
    const summary = t.task.replace(/\n/g, ' ');
    const description = [
      `Priority: ${t.priority.toUpperCase()}`,
      t.assignee ? `Assignee: ${t.assignee}` : null,
      t.deadline ? `Deadline: ${t.deadline}` : null,
      t.sourceQuote ? `Evidence: "${t.sourceQuote}"` : null,
    ]
      .filter(Boolean)
      .join('\\n');

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART:${defaultDateStr}`,
      `DTEND:${defaultDateStr}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `STATUS:${t.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//OneLine AI//Action Queue//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:OneLine AI: ${title}`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizeFilename(title)}-calendar.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format tasks as a clean Markdown checklist
 */
export function formatTasksMarkdown(tasks: ExtractedTask[], title: string, summary?: string): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  if (summary) {
    lines.push(`\n> **Executive Summary:** ${summary}\n`);
  }
  lines.push('## Action Items\n');

  if (tasks.length === 0) {
    lines.push('*No tasks in queue.*');
  } else {
    tasks.forEach((t) => {
      const check = t.completed ? '[x]' : '[ ]';
      const meta: string[] = [];
      if (t.priority) meta.push(`Priority: ${t.priority.toUpperCase()}`);
      if (t.assignee) meta.push(`Assignee: ${t.assignee}`);
      if (t.deadline) meta.push(`Due: ${t.deadline}`);
      const metaStr = meta.length > 0 ? ` _(${meta.join(' · ')})_` : '';
      lines.push(`- ${check} **${t.task}**${metaStr}`);
      if (t.sourceQuote) {
        lines.push(`  > "${t.sourceQuote}"`);
      }
    });
  }

  return lines.join('\n');
}

/**
 * Format complete analysis report as Markdown
 */
export function formatFullAnalysisMarkdown(result: AnalysisResult): string {
  const lines: string[] = [];
  lines.push(`# ${result.title}`);
  lines.push(`_Analyzed on ${new Date(result.timestamp).toLocaleString()}_\n`);

  lines.push(`## Executive One-Sentence Summary`);
  lines.push(`> ${result.oneSentenceSummary}\n`);

  lines.push(`## Deadlines`);
  lines.push(`**${result.deadlines.deadlineSummary}**`);
  if (result.deadlines.items && result.deadlines.items.length > 0) {
    result.deadlines.items.forEach((item) => {
      lines.push(`- **${item.dateOrTime}:** ${item.description}`);
    });
  }
  lines.push('');

  lines.push(`## Key Verified Facts`);
  result.keyFacts.forEach((fact) => {
    lines.push(`- ${fact}`);
  });
  lines.push('');

  if (result.ambiguities && result.ambiguities.length > 0) {
    lines.push(`## Ambiguities & Clarifications Needed`);
    result.ambiguities.forEach((amb) => {
      lines.push(`- ⚠️ ${amb}`);
    });
    lines.push('');
  }

  lines.push(`## Action Queue (${result.tasks.length} items)`);
  result.tasks.forEach((t) => {
    const check = t.completed ? '[x]' : '[ ]';
    const meta: string[] = [];
    if (t.assignee) meta.push(`Assignee: ${t.assignee}`);
    if (t.deadline) meta.push(`Due: ${t.deadline}`);
    meta.push(`Priority: ${t.priority.toUpperCase()}`);
    lines.push(`- ${check} **${t.task}** (${meta.join(' · ')})`);
    if (t.sourceQuote) {
      lines.push(`  > "${t.sourceQuote}"`);
    }
  });
  lines.push('');

  if (result.suggestedNextSteps && result.suggestedNextSteps.length > 0) {
    lines.push(`## Suggested Next Steps (Recommendations)`);
    result.suggestedNextSteps.forEach((step) => {
      lines.push(`- 💡 ${step}`);
    });
    lines.push('');
  }

  if (result.evidenceSnippets && result.evidenceSnippets.length > 0) {
    lines.push(`## Source Evidence Snippets`);
    result.evidenceSnippets.forEach((snippet) => {
      lines.push(`> "${snippet}"`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
