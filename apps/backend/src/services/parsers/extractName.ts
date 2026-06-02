

export function extractName(frontText: string): string | null {
  const dobIndex = frontText.search(/DOB\s*:?\s*\d{2}\/\d{2}\/\d{4}/i);

  if (dobIndex === -1) return null;

  const beforeDob = frontText.slice(0, dobIndex);

  const matches = [
    ...beforeDob.matchAll(
      /\b([A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){1,3})\b/g
    ),
  ];

  if (!matches.length) return null;

  const blacklist = [
    "Government Of India",
    "Unique Identification Authority",
  ];

  const validMatches = matches
    .map((m) => m[1].trim())
    .filter(
      (name) =>
        !blacklist.some(
          (blocked) =>
            name.toLowerCase() === blocked.toLowerCase()
        )
    );

  if (!validMatches.length) return null;

  return validMatches[validMatches.length - 1];
}


