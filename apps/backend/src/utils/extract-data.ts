function extractData(data: string[] | null) {
  if (data === null) {
    return "";
  }
  return data[1] ?? data[0];
}

function normalizeWhitespace(value: string) {
  return value.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
}

function cleanLine(value: string) {
  return normalizeWhitespace(
    value
      .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
      .replace(/[^A-Za-z0-9,./\- ]/g, " "),
  );
}

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

export function extractDOB(ocrText: string) {
  const dobRegex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
  return extractData(ocrText.match(dobRegex));
}

export function extractGender(ocrText: string) {
  const genderRegex = /\b(Female|Male)\b/i;
  return extractData(ocrText.match(genderRegex));
}

export function extractPincode(ocrText: string) {
  const pincodeRegex = /\b\d{6}\b(?!\d)/g;
  return extractData(ocrText.match(pincodeRegex));
}


export function extractAddress(ocrText: string) {
  const addressStartPatterns = [
    /\bAddress\s*:?\s*/i,
    /\bAddres\s*:?\s*/i,
    /\bAddr[eu]ss\s*:?\s*/i,
    /\bC\/O\s*:?\s*/i,
    /\bW\/O\s*:?\s*/i,
    /\bS\/O\s*:?\s*/i,
    /\bD\/O\s*:?\s*/i,
    /\bCIO\s*:?\s*/i,
  ];
  const pincodeMatch = ocrText.match(/\b\d{6}\b(?!\d)/);

  let startIndex = -1;
  for (const pattern of addressStartPatterns) {
    const match = pattern.exec(ocrText);
    if (match && (startIndex === -1 || match.index < startIndex)) {
      startIndex = match.index;
    }
  }

  if (startIndex === -1) {
    return "";
  }

  const endIndex = pincodeMatch
    ? pincodeMatch.index! + pincodeMatch[0].length
    : ocrText.length;

  const rawAddress = ocrText.slice(startIndex, endIndex);
  const cleanedLines = rawAddress
    .split("\n")
    .map((line) => cleanLine(line))
    .filter(Boolean)
    .filter((line) => !/^(unique identification authority of india|aadhaar|help@uidai\.gov\.in|www\.uidai\.gov\.in)$/i.test(line));

  const address = cleanedLines
    .join(", ")
    .replace(/\bAddress\s*:?\s*/i, "")
    .replace(/\bAddres\s*:?\s*/i, "")
    .replace(/\bAddr[eu]ss\s*:?\s*/i, "")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,\s*,+/g, ", ")
    .trim()
    .replace(/[,:.\- ]+$/g, "");

  return address;
}
export function extractName(ocrText: string) {
  const lines = ocrText.split("\n").map((line) => cleanLine(line));
  const dobIndex = lines.findIndex((line) => /\bDOB\b/i.test(line));

  if (dobIndex === -1) {
    return "";
  }

  for (let index = dobIndex - 1; index >= Math.max(0, dobIndex - 4); index -= 1) {
    const line = lines[index];
    if (!line) {
      continue;
    }
    if (/\b(government of india|male|female|dob|year of birth|aadhaar)\b/i.test(line)) {
      continue;
    }
    if ((line.match(/[A-Za-z]+/g) ?? []).length < 2) {
      continue;
    }

    const words = line.split(" ").filter(Boolean);
    while (words.length > 1 && (!/^[A-Za-z]+$/.test(words[0]) || words[0].length === 1)) {
      words.shift();
    }
    while (
      words.length > 2 &&
      /^[a-z]$/.test(words[words.length - 1])
    ) {
      words.pop();
    }

    return words.join(" ");
  }

  return "";
}


export function extractGovermentText(ocrText: string) {
  const regex =
    /(U[a-z1]{4,6}\s+[I1l|]dentification\s+Authority\s+of\s+[Il]ndia|AADHAAR|UIDAI)/i;

  return extractData(ocrText.match(regex));
}
