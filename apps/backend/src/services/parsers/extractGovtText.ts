export function extractGovermentText(ocrText: string) {
  const regex =
    /(U[a-z1]{4,6}\s+[I1l|]dentification\s+Authority\s+of\s+[Il]ndia|AADHAAR|UIDAI)/i;

  const data = ocrText.match(regex);
  if(data == null ) return ""
  return data[1] ?? data[0];
}
