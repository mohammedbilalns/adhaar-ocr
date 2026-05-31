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
  const explicitAddressPatterns = [
    /\bAddress\s*:?\s*/i,
    /\bAddres\s*:?\s*/i,
    /\bAddr[eu]ss\s*:?\s*/i,
  ];

  const fallbackPatterns = [
    /\bC\/O\s*:?\s*/i,
    /\bW\/O\s*:?\s*/i,
    /\bS\/O\s*:?\s*/i,
    /\bD\/O\s*:?\s*/i,
    /\bCIO\s*:?\s*/i,
  ];

  let startIndex = -1;

  for (const pattern of explicitAddressPatterns) {
    const match = pattern.exec(ocrText);
    if (match && (startIndex === -1 || match.index < startIndex)) {
      startIndex = match.index;
    }
  }

  if (startIndex === -1) {
    let lastFallbackIndex = -1;
    for (const pattern of fallbackPatterns) {
      const globalPattern = new RegExp(pattern.source, "ig");
      const matches = Array.from(ocrText.matchAll(globalPattern));
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        if (lastMatch.index > lastFallbackIndex) {
          lastFallbackIndex = lastMatch.index;
        }
      }
    }
    startIndex = lastFallbackIndex;
  }

  if (startIndex === -1) {
    return "";
  }

  const pincodeRegex = /\b\d{6}\b(?!\d)/g;
  let endIndex = ocrText.length;
  
  const matches = Array.from(ocrText.matchAll(pincodeRegex));
  const validPincodeMatch = matches.find((m) => m.index !== undefined && m.index > startIndex);
  
  if (validPincodeMatch) {
    endIndex = validPincodeMatch.index! + validPincodeMatch[0].length;
  } else if (matches.length > 0) {
    const lastPincode = matches[matches.length - 1];
    if (lastPincode.index! + lastPincode[0].length > startIndex) {
       endIndex = lastPincode.index! + lastPincode[0].length;
    }
  }

  const rawAddress = ocrText.slice(startIndex, endIndex);
  const cleanedLines = rawAddress
    .split("\n")
    .map((line) => {
      // Aadhaar cards often have noise (like QR code text) on the right side,
      // separated by a large gap of spaces. We take the left side.
      const parts = line.split(/\s{3,}/);
      let cleaned = cleanLine(parts[0]);
      
      // Remove explicit "Address" keywords from the line itself
      cleaned = cleaned
        .replace(/\baddres{1,2}\b/i, "")
        .replace(/\baddr[eu]ss\b/i, "")
        .trim();
        
      // Remove any leading or trailing punctuation that might be left over (like commas or colons)
      cleaned = cleaned.replace(/^[,:.\- ]+|[,:.\- ]+$/g, "");
      
      return cleaned;
    })
    .filter(Boolean)
    .filter((line) => !/^(unique identification authority of india|aadhaar|help@uidai\.gov\.in|www\.uidai\.gov\.in)$/i.test(line));

  const address = cleanedLines
    .join(", ")
    .replace(/\s*,\s*/g, ", ")
    .replace(/,\s*,+/g, ", ")
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
