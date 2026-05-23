export function extractFrontData(text: string) {
  const lines = text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const dobLineIndex = lines.findIndex(line =>
    /DOB\s*:?\s*\d{2}\/\d{2}\/\d{4}/i.test(line)
  );

  let name: string | undefined;

  if (dobLineIndex > 0) {
    name = lines[dobLineIndex - 1]
      .replace(/^[^a-zA-Z]+/, "")   // remove leading OCR junk
      .replace(/[^a-zA-Z\s]/g, "")  // keep only letters/spaces
      .replace(/\s+/g, " ")
      .trim();
  }

  const dob = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/)?.[0];

  const gender = text.match(/\b(Male|Female)\b/i)?.[0];

  const aadhaarNumber =
    text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)?.[0];

  return {
    name,
    dob,
    gender,
    aadhaarNumber
  };
}
