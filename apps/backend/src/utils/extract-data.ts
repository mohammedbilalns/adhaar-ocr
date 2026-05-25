function extractData(data: string[] | null) {
  if (data === null) {
    return "";
  }
  return data[1] ?? data[0];
}

export function extractAdhaarNumber(ocrText: string) {
  const adhaarRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;

  return extractData(ocrText.match(adhaarRegex));
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
  const patterns = [
    /Address\s*:?\s*([\s\S]*?)(?=\b\d{6}\b)/i,
    /Addres\s*:?\s*([\s\S]*?)(?=\b\d{6}\b)/i,
    /padres\s*:?\s*([\s\S]*?)(?=\b\d{6}\b)/i,
    /C\/O\s*:?\s*([\s\S]*?)(?=\b\d{6}\b)/i,
    /CIO\s*:?\s*([\s\S]*?)(?=\b\d{6}\b)/i,
  ];

  for (const pattern of patterns) {
    const match = ocrText.match(pattern);

    if (match) {
      return extractData(match)
        .replace(/\n+/g, " ")
        .replace(/\s{2,}/g, " ")
        .replace(/[^a-zA-Z0-9,\/\- ]/g, "")
        .replace(/\s*,\s*/g, ", ")
        .trim();
    }
  }

  return "";
}
export function extractName(ocrText: string) {
  const nameRegex = /([A-Za-z]+(?:[ \t]+[A-Za-z]+)*)[ \t]*\n.*DOB\s*:/im;

  return extractData(ocrText.match(nameRegex));
}


export function extractGovermentText(ocrText: string) {
  const regex =
    /(U[nm][iqg]ue\s+[I1]dentification\s+Authority\s+of\s+India|AADHAAR)/i;

  return extractData(ocrText.match(regex));
}
