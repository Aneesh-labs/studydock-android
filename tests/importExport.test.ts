import { describe, it, expect } from 'vitest';
import { parseMarkdownFile, serializeEntriesToMarkdown } from '../src/services/engine/markdownParser';
import { JournalEntry } from '../src/types/journal';
import { Deadline } from '../src/types/deadline';

describe('Import and Export Interoperability', () => {
  it('handles legacy deadlines.json format import properly', () => {
    const legacyDeadlinesJson = JSON.stringify([
      {
        id: 'legacy-1',
        title: 'Physics Lab 3 Report',
        subject: 'Physics',
        category: 'Lab',
        due: '2026-10-15 14:00',
        priority: 'high',
        notes: 'Include error propagation calculations',
        completed: false,
      },
      {
        id: 'legacy-2',
        title: 'History Essay Draft',
        subject: 'History',
        category: 'Assignment',
        due: '2026-10-20 23:59',
        priority: 'medium',
        completed: true,
      },
    ]);

    const parsed = JSON.parse(legacyDeadlinesJson);
    const converted: Deadline[] = parsed.map((item: any) => ({
      id: String(item.id),
      title: item.title,
      subject: item.subject || 'General',
      category: item.category?.toLowerCase() || 'homework',
      dueAt: item.due.includes('T') ? item.due : `${item.due.replace(' ', 'T')}:00.000`,
      priority: item.priority || 'medium',
      notes: item.notes,
      status: item.completed ? 'completed' : 'active',
      createdAt: '2026-10-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
    }));

    expect(converted).toHaveLength(2);
    expect(converted[0].title).toBe('Physics Lab 3 Report');
    expect(converted[0].category).toBe('lab');
    expect(converted[0].dueAt).toBe('2026-10-15T14:00:00.000');
    expect(converted[0].status).toBe('active');

    expect(converted[1].title).toBe('History Essay Draft');
    expect(converted[1].status).toBe('completed');
  });

  it('round-trips journal entries to daily Markdown without data loss', () => {
    const originalEntries: JournalEntry[] = [
      {
        id: 'test-entry-1',
        studyDate: '2026-10-10',
        timeStr: '09:30',
        body: 'Learned about Dijkstra algorithm and priority queues in Python.',
        tags: ['algorithms'],
        subject: 'Computer Science',
        priority: 'high',
        createdAt: '2026-10-10T09:30:00.000Z',
        updatedAt: '2026-10-10T09:30:00.000Z',
      },
      {
        id: 'test-entry-2',
        studyDate: '2026-10-10',
        timeStr: '14:15',
        body: 'Reviewed organic chemistry reaction mechanisms: SN1 vs SN2.',
        tags: ['chemistry'],
        subject: 'Chemistry',
        priority: 'medium',
        createdAt: '2026-10-10T14:15:00.000Z',
        updatedAt: '2026-10-10T14:15:00.000Z',
      },
    ];

    const markdownOutput = serializeEntriesToMarkdown('2026-10-10', originalEntries);
    expect(markdownOutput).toContain('# 📓 Study Log — 2026-10-10');
    expect(markdownOutput).toContain('- **[09:30]** `#algorithms` **[HIGH]**: Learned about Dijkstra algorithm and priority queues in Python.');
    expect(markdownOutput).toContain('- **[14:15]** `#chemistry` **[MEDIUM]**: Reviewed organic chemistry reaction mechanisms: SN1 vs SN2.');

    // Parse the generated Markdown back
    const parsedBack = parseMarkdownFile(markdownOutput, '2026-10-10');
    expect(parsedBack).toHaveLength(2);
    expect(parsedBack[0].timeStr).toBe('09:30');
    expect(parsedBack[0].tags).toEqual(['algorithms']);
    expect(parsedBack[0].priority).toBe('high');
    expect(parsedBack[0].body).toBe('Learned about Dijkstra algorithm and priority queues in Python.');

    expect(parsedBack[1].timeStr).toBe('14:15');
    expect(parsedBack[1].tags).toEqual(['chemistry']);
    expect(parsedBack[1].priority).toBe('medium');
    expect(parsedBack[1].body).toBe('Reviewed organic chemistry reaction mechanisms: SN1 vs SN2.');
  });
});
