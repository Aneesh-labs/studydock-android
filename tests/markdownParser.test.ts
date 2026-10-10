import { describe, it, expect } from 'vitest';
import { parseMarkdownEntryLine, parseMarkdownFile, serializeEntriesToMarkdown } from '../src/services/engine/markdownParser';
import { JournalEntry } from '../src/types/journal';

describe('Markdown Parser & Serializer', () => {
  it('parses formatted study-journaler line with tag, priority, and time', () => {
    const line = '- **[11:33 AM]** `#biology` **[HIGH]**: Completed Cell Division summary';
    const parsed = parseMarkdownEntryLine(line);

    expect(parsed).not.toBeNull();
    expect(parsed?.timeStr).toBe('11:33 AM');
    expect(parsed?.tag).toBe('biology');
    expect(parsed?.priority).toBe('high');
    expect(parsed?.body).toBe('Completed Cell Division summary');
  });

  it('parses formatted line with tag but no priority', () => {
    const line = '- **[02:15 PM]** `#cs`: Mastered dynamic programming memoization';
    const parsed = parseMarkdownEntryLine(line);

    expect(parsed).not.toBeNull();
    expect(parsed?.timeStr).toBe('02:15 PM');
    expect(parsed?.tag).toBe('cs');
    expect(parsed?.priority).toBeUndefined();
    expect(parsed?.body).toBe('Mastered dynamic programming memoization');
  });

  it('ignores file headers and dividers', () => {
    expect(parseMarkdownEntryLine('# 📓 Study Log — 2026-10-10')).toBeNull();
    expect(parseMarkdownEntryLine('*Created on Saturday, October 10, 2026 by Student*')).toBeNull();
    expect(parseMarkdownEntryLine('---')).toBeNull();
  });

  it('serializes entries to identical study-journaler Markdown format', () => {
    const entries: JournalEntry[] = [
      {
        id: '1',
        studyDate: '2026-10-10',
        timeStr: '11:33 AM',
        body: 'Completed Cell Division summary',
        tags: ['biology'],
        priority: 'high',
        createdAt: '2026-10-10T11:33:00.000Z',
        updatedAt: '2026-10-10T11:33:00.000Z',
      },
    ];

    const md = serializeEntriesToMarkdown('2026-10-10', entries, 'Student');
    expect(md).toContain('# 📓 Study Log — 2026-10-10');
    expect(md).toContain('- **[11:33 AM]** `#biology` **[HIGH]**: Completed Cell Division summary');
  });

  it('parses full markdown file content into structured JournalEntry objects', () => {
    const sampleMd = `# 📓 Study Log — 2026-10-10

*Created on Saturday, October 10, 2026 by Student*

---

- **[09:00 AM]** \`#math\` **[HIGH]**: Solved 20 Calculus integrals
- **[02:30 PM]** \`#physics\`: Reviewed Newton laws of motion
`;

    const entries = parseMarkdownFile(sampleMd, '2026-10-10');
    expect(entries.length).toBe(2);
    expect(entries[0].tags).toEqual(['math']);
    expect(entries[0].priority).toBe('high');
    expect(entries[0].body).toBe('Solved 20 Calculus integrals');
    expect(entries[1].tags).toEqual(['physics']);
    expect(entries[1].body).toBe('Reviewed Newton laws of motion');
  });
});
