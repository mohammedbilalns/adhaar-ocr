
export function extractAdhaarNumber(ocrText: string) {
  const adhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
  const matches = Array.from(ocrText.matchAll(adhaarRegex));

  for (const match of matches) {
    const index = match.index ?? 0;
    const contextStart = Math.max(0, index - 12);
    const context = ocrText.slice(contextStart, index);
    if (/\bVID\s*:?\s*$/i.test(context.replace(/\s+/g, " "))) {
      continue;
    }

    return match[0];
  }

  return "";
}
