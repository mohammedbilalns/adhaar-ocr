
export function extractGender(ocrText: string) {
  const genderRegex = /\b(Female|Male)\b/i;
  const  data = ocrText.match(genderRegex);
  if(data == null ) return ""
  return data[1] ?? data[0];
}


