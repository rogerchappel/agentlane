const PATH_HINT_PATTERN = /`([^`]+)`|\b([A-Za-z0-9_.-]+\/(?:[A-Za-z0-9_.-]+\/?)*\*{0,2})\b/g;

export function extractProtectedPathHints(markdown: string | undefined): string[] {
  if (!markdown) {
    return [];
  }

  const lowered = markdown.toLowerCase();
  if (!lowered.includes('stop') && !lowered.includes('ask')) {
    return [];
  }

  const hints = new Set<string>();
  for (const line of markdown.split(/\r?\n/)) {
    const normalizedLine = line.toLowerCase();
    if (!normalizedLine.includes('touch')) {
      continue;
    }

    for (const match of line.matchAll(PATH_HINT_PATTERN)) {
      const value = match[1] ?? match[2];
      if (!value) {
        continue;
      }

      const trimmed = value.replace(/[.,:;]+$/g, '');
      if (trimmed.includes('/')) {
        hints.add(trimmed.endsWith('/') ? `${trimmed}**` : trimmed);
      }
    }
  }

  return Array.from(hints).sort();
}
