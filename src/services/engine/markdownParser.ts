import { JournalEntry, Priority } from '../../types/journal';

export interface ParsedMarkdownEntry {
  timeStr: string;
  tag?: string;
  priority?: Priority;
  body: string;
  raw: string;
}

export function parseMarkdownEntryLine(line: string): ParsedMarkdownEntry | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('*Created on') || trimmed === '---') {
    return null;
  }

  // Regex matching: - **[11:33 AM]** `(#tag)` **[HIGH]**: Message
  const pattern = /^[*-]\s+\*\*\[(.*?)\]\*\*(?:\s+`#(.*?)`)?(?:\s+\*\*\[(.*?)\]\*\*)?:\s*(.*)$/;
  const match = trimmed.match(pattern);

  if (match) {
    const [, timeStr, tag, rawPriority, body] = match;
    let priority: Priority | undefined;
    if (rawPriority) {
      const pLower = rawPriority.toLowerCase();
      if (pLower === 'high' || pLower === 'med' || pLower === 'medium') {
        priority = pLower === 'high' ? 'high' : 'medium';
      } else if (pLower === 'low') {
        priority = 'low';
      }
    }

    return {
      timeStr: timeStr || '',
      tag: tag ? tag.trim().toLowerCase() : undefined,
      priority,
      body: (body || '').trim(),
      raw: trimmed,
    };
  }

  // Conservative fallback for plain bullet lines: preserve content without dropping
  const fallbackBullet = /^[*-]\s+(.*)$/;
  const bulletMatch = trimmed.match(fallbackBullet);
  if (bulletMatch) {
    return {
      timeStr: '12:00 PM',
      body: bulletMatch[1].trim(),
      raw: trimmed,
    };
  }

  return {
    timeStr: '12:00 PM',
    body: trimmed,
    raw: trimmed,
  };
}

export function parseMarkdownFile(content: string, dateStr: string): JournalEntry[] {
  const lines = content.split('\n');
  const entries: JournalEntry[] = [];

  for (let i = 0; i < lines.length; i++) {
    const parsed = parseMarkdownEntryLine(lines[i]);
    if (parsed && parsed.body) {
      const id = `jnl_${dateStr}_${i}_${Math.random().toString(36).substring(2, 6)}`;
      
      // Parse ISO timestamp from studyDate + timeStr
      let createdAt = `${dateStr}T12:00:00.000Z`;
      try {
        const timeMatch = parsed.timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = parseInt(timeMatch[2], 10);
          const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : '';
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          createdAt = `${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00.000`;
        }
      } catch {
        // use fallback
      }

      entries.push({
        id,
        createdAt,
        updatedAt: createdAt,
        studyDate: dateStr,
        timeStr: parsed.timeStr || '12:00 PM',
        body: parsed.body,
        tags: parsed.tag ? [parsed.tag] : [],
        priority: parsed.priority,
      });
    }
  }

  return entries;
}

export function serializeEntriesToMarkdown(
  studyDate: string,
  entries: JournalEntry[],
  author: string = 'Student'
): string {
  const [y, m, d] = studyDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  let output = `# 📓 Study Log — ${studyDate}\n\n`;
  output += `*Created on ${weekday}, ${fullDate} by ${author}*\n\n---\n\n`;

  for (const entry of entries) {
    const tagPart = entry.tags && entry.tags.length > 0 ? ` \`#${entry.tags[0]}\`` : '';
    const prioPart = entry.priority ? ` **[${entry.priority.toUpperCase()}]**` : '';
    const line = `- **[${entry.timeStr}]**${tagPart}${prioPart}: ${entry.body.trim()}\n`;
    output += line;
  }

  return output;
}
