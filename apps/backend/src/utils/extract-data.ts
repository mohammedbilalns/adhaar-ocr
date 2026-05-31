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

const explicitAddressPattern = /\bAddress\b\s*:?\s*/i;
const relationPrefixPattern = /\b(?:C\/O|CIO|D\/O|S\/O|W\/O)\b\s*:?\s*/i;
const boilerplatePattern =
  /^(?:unique identification authority of india|unique ldentification authority of india|aadhaar|government of india|help\s*@?uidai\.gov\.in|www\.uidai\.gov\.in)$/i;
const addressKeywordPattern =
  /\b(?:flat|house|hno|house no|ward|sector|block|street|road|lane|village|colony|locality|area|district|tehsil|taluka|town|city|state|po|post|pincode|pin|near|opp|behind|vpo|mohalla|gali|nagar|vihar)\b/i;
const highwayPattern = /\b(?:NH|SH)\s*[-/]?\s*\d+\b/i;
const pincodePattern = /\b\d{6}\b(?!\d)/;

function splitAddressSegments(line: string) {
  return line
    .split(",")
    .map((segment) => {
      const normalized = cleanLine(segment);
      const pincodeMatch = normalized.match(pincodePattern);

      if (pincodeMatch?.index !== undefined) {
        return normalized.slice(0, pincodeMatch.index + pincodeMatch[0].length).trim();
      }

      return normalized;
    })
    .filter(Boolean);
}

function isBoilerplateLine(line: string) {
  return boilerplatePattern.test(line);
}

function isLikelyAddressSegment(segment: string) {
  if (!segment || isBoilerplateLine(segment)) {
    return false;
  }

  if (relationPrefixPattern.test(segment)) {
    return true;
  }

  if (pincodePattern.test(segment)) {
    return true;
  }

  if (addressKeywordPattern.test(segment)) {
    return true;
  }

  if (highwayPattern.test(segment)) {
    return true;
  }

  const words = segment.split(" ").filter(Boolean);

  if (words.length <= 2) {
    return words.some((word) => /[A-Za-z0-9]/.test(word));
  }

  return words.every(
    (word) => /^[A-Z][A-Za-z.'-]*$/.test(word) || /^[A-Z0-9]+$/.test(word),
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
  const lines = ocrText
    .split("\n")
    .map((line) => normalizeWhitespace(line.split(/\s{3,}/)[0] ?? line))
    .map((line) => cleanLine(line))
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  const pincodeIndices = lines
    .map((line, index) => (pincodePattern.test(line) ? index : -1))
    .filter((index) => index !== -1);

  const endIndex = pincodeIndices.length > 0 ? pincodeIndices[pincodeIndices.length - 1] : lines.length - 1;

  let startIndex = -1;

  for (let index = endIndex; index >= 0; index -= 1) {
    if (relationPrefixPattern.test(lines[index])) {
      startIndex = index;
      break;
    }
  }

  if (startIndex === -1) {
    for (let index = endIndex; index >= 0; index -= 1) {
      if (explicitAddressPattern.test(lines[index])) {
        const addressLabelTail = lines[index].replace(explicitAddressPattern, "").trim();

        if (
          addressLabelTail &&
          (relationPrefixPattern.test(addressLabelTail) ||
            pincodePattern.test(addressLabelTail) ||
            addressKeywordPattern.test(addressLabelTail) ||
            addressLabelTail.includes(","))
        ) {
          startIndex = index;
        } else {
          startIndex = Math.min(index + 1, lines.length);
        }
        break;
      }
    }
  }

  if (startIndex === -1 || startIndex >= lines.length || startIndex > endIndex) {
    return "";
  }

  const addressSegments: string[] = [];

  for (let index = startIndex; index <= endIndex; index += 1) {
    const line = lines[index];

    if (!line || isBoilerplateLine(line)) {
      continue;
    }

    const lineWithoutLabel = line.replace(explicitAddressPattern, "").trim();

    for (const segment of splitAddressSegments(lineWithoutLabel)) {
      if (isLikelyAddressSegment(segment)) {
        addressSegments.push(segment);
      }
    }
  }

  const address = addressSegments
    .join(", ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,\s*,+/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^[,:.\- ]+|[,:.\- ]+$/g, "");

  return address;
}
export function extractName(ocrText: string) {
  const rawLines = ocrText.split("\n");
  const cleanedLines = rawLines.map((line) => cleanLine(line));
  const dobIndex = cleanedLines.findIndex((line) => /\bDOB\b/i.test(line));

  if (dobIndex === -1) {
    return "";
  }

  for (let index = dobIndex - 1; index >= Math.max(0, dobIndex - 4); index -= 1) {
    const rawLine = rawLines[index];
    const cleanedLine = cleanedLines[index];
    
    if (!cleanedLine) {
      continue;
    }
    if (/\b(government of india|male|female|dob|year of birth|aadhaar)\b/i.test(cleanedLine)) {
      continue;
    }

    // Isolate the name block from left/right noise using large space gaps
    const parts = rawLine.split(/\s{3,}/).map(cleanLine).filter(Boolean);
    
    const validParts = parts.filter(part => {
        const words = part.split(" ");
        const validWords = words.filter(w => /^[A-Za-z]+$/.test(w) && w.length >= 2);
        return validWords.length > 0;
    });

    if (validParts.length > 0) {
        // Take the longest valid block as the name
        validParts.sort((a, b) => b.length - a.length);
        const bestPart = validParts[0];

        const words = bestPart.split(" ").filter(Boolean);
        while (words.length > 1 && (!/^[A-Za-z]+$/.test(words[0]) || words[0].length === 1)) {
          words.shift();
        }
        while (
          words.length > 1 &&
          (!/^[A-Za-z]+$/.test(words[words.length - 1]) || words[words.length - 1].length === 1)
        ) {
          words.pop();
        }

        return words.join(" ");
    }
    
    // Fallback logic
    if ((cleanedLine.match(/[A-Za-z]+/g) ?? []).length < 2) {
      continue;
    }

    const words = cleanedLine.split(" ").filter(Boolean);
    while (words.length > 1 && (!/^[A-Za-z]+$/.test(words[0]) || words[0].length === 1)) {
      words.shift();
    }
    while (
      words.length > 2 &&
      /^[A-Za-z]$/.test(words[words.length - 1])
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
