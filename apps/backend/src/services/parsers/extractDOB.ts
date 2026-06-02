
export function extractDOB(ocrText: string) {
  const dobRegex = /\b\d{2}\/\d{2}\/\d{4}\b/g;
  const data = ocrText.match(dobRegex);
  if(data == null ) return ""
  return data[1] ?? data[0];
}
