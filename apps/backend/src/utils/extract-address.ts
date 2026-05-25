import { INDIAN_STATES } from "../constants/states";


export function extractAddress(text: string) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const joined = lines.join(" ");

  const careOf =
    joined.match(/C\/O:\s*([A-Za-z\s]+?)(?=\s+[A-Z]{4,})/i)?.[1]?.trim();

  const pincode =
    joined.match(/\b\d{6}\b/)?.[0];

  const district =
    joined.match(/DIST:?\s*([A-Za-z\s]+)/i)?.[1]?.trim();

  const state = INDIAN_STATES.find((s) =>
    new RegExp(`\\b${s.replace(/\s+/g, "\\s+")}\\b`, "i").test(joined)
  );

  const postOffice =
    joined
      .match(/([A-Z\s]+?)\s+P\s?O\b/i)?.[1]
      ?.replace(/\s+/g, " ")
      .trim();

  const addressStart = lines.findIndex((l) => /C\/O:/i.test(l));

  let addressParts: string[] = [];

  if (addressStart !== -1) {
    for (let i = addressStart; i < lines.length; i++) {
      const line = lines[i];

      if (
        /DIST:|\d{6}/i.test(line) ||
        INDIAN_STATES.some((state) =>
          new RegExp(`\\b${state.replace(/\s+/g, "\\s+")}\\b`, "i").test(line)
        )
      ) {
        break;
      }

      const cleaned = i === addressStart
        ? line.replace(/^.*?C\/O:\s*[A-Za-z\s]+/, "").trim()
        : line;

      if (cleaned) {
        addressParts.push(cleaned);
      }
    }
  }

  const addressLine = addressParts
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    careOf,
    addressLine,
    postOffice,
    district,
    state,
    pincode
  };
}


