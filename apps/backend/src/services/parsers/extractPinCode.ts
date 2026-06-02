
export function extractPincode(ocrText: string) {
  //const pincodeRegex = /\b\d{6}\b(?!\d)/g;
  const pincodeRegex = /\b\d{6}\b/g;

  const data = ocrText.match(pincodeRegex);
  if(data == null ) return ""
  return data[1] ?? data[0];
}
