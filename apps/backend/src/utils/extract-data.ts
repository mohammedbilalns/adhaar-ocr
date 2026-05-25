function extractData(data: string[] | null) {
  if (data === null) {
    return "";
  }
  return data[0];
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
  const genderRegex = /(Male|Female|male|female)/g;
  return extractData(ocrText.match(genderRegex));
}

export function extractPincode(ocrText: string) {
  const pincodeRegex = /\b\d{6}\b(?!\d)/g;
  return extractData(ocrText.match(pincodeRegex));
}

export function extractAdress(ocrText: string) {
  const adressRegex = /(?<=Address:\s*?)(\b[\s\S]+?)(?=\b\d{6}\b)/i;
  return extractData(ocrText.match(adressRegex))
    .replace(/[-\n]+/g, " ")
    .replace(/,\s*,+/g, ",")
    .replace(/[^a-zA-Z0-9]{2,}/g, " ")
    .replace(/\b[a-zA-Z]{1,2}\b/g, "")
    .replace(/\b\s+\b/g, ",")
    .trim();
}
export function extractName(ocrText: string) {
  const nameRegex = /([a-zA-Z]{4,})(?=\s+DOB\b)/;
  return extractData(ocrText.match(nameRegex));
}
export function extractGovermentTextBack(ocrText: string) {
  const regex = /\b(Unique\s?Identification\s?Authority\s?of\s?India)\b/i;
  return extractData(ocrText.match(regex));
}
