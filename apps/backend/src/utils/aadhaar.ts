type Side = 'front' | 'back'

export type OcrSideResult = {
  text: string
}

export type AadhaarOcrResponse = {
  documentType: 'aadhaar'
  extracted: {
    aadhaarNumber: string | null
    name: string | null
    dateOfBirth: string | null
    gender: string | null
    address: string | null
    pincode: string | null
  }
  rawText: {
    front: string
    back: string
  }
}

const GENDER_KEYWORDS = ['male', 'female', 'transgender']
const INVALID_DOCUMENT_MESSAGE =
  'The uploaded images do not appear to be a valid Aadhaar card.'

export function normalizeOcrText(text: string) {
  return text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim()
}

export function buildAadhaarResponse(frontText: string, backText: string): AadhaarOcrResponse {
  const combinedText = `${frontText}\n${backText}`
  const normalizedText = normalizeOcrText(combinedText)

  if (!isLikelyAadhaarDocument(normalizedText)) {
    throw new Error(INVALID_DOCUMENT_MESSAGE)
  }

  return {
    documentType: 'aadhaar',
    extracted: {
      aadhaarNumber: extractAadhaarNumber(normalizedText),
      name: extractName(frontText),
      dateOfBirth: extractDateOfBirth(normalizedText),
      gender: extractGender(normalizedText),
      address: extractAddress(backText),
      pincode: extractPincode(normalizedText),
    },
    rawText: {
      front: normalizeOcrText(frontText),
      back: normalizeOcrText(backText),
    },
  }
}

export function getInvalidDocumentMessage() {
  return INVALID_DOCUMENT_MESSAGE
}

function isLikelyAadhaarDocument(text: string) {
  const lowerText = text.toLowerCase()
  return (
    lowerText.includes('aadhaar') ||
    lowerText.includes('government of india') ||
    lowerText.includes('unique identification authority of india') ||
    /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(text)
  )
}

function extractAadhaarNumber(text: string) {
  const match = text.match(/\b(\d{4})\s?(\d{4})\s?(\d{4})\b/)
  return match ? `${match[1]} ${match[2]} ${match[3]}` : null
}

function extractDateOfBirth(text: string) {
  const patterns = [
    /\b(?:DOB|DoB|Year of Birth|YOB)[:\s-]*(\d{2}[/-]\d{2}[/-]\d{4})\b/i,
    /\b(?:DOB|DoB|Year of Birth|YOB)[:\s-]*(\d{4})\b/i,
    /\b(\d{2}[/-]\d{2}[/-]\d{4})\b/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

function extractGender(text: string) {
  const lowerText = text.toLowerCase()
  const keyword = GENDER_KEYWORDS.find((value) => lowerText.includes(value))
  if (!keyword) {
    return null
  }

  return keyword.charAt(0).toUpperCase() + keyword.slice(1)
}

function extractPincode(text: string) {
  const match = text.match(/\b\d{6}\b/)
  return match ? match[0] : null
}

function extractName(frontText: string) {
  const lines = frontText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /^[A-Za-z .]{3,}$/.test(line))

  const ignored = [
    'government of india',
    'unique identification authority of india',
    'aadhaar',
    'male',
    'female',
    'transgender',
  ]

  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    if (ignored.some((value) => lowerLine.includes(value))) {
      continue
    }

    if (/\d/.test(line)) {
      continue
    }

    return line
  }

  return null
}

function extractAddress(backText: string) {
  const lines = backText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const addressStart = lines.findIndex((line) => /address/i.test(line))
  const candidateLines =
    addressStart >= 0 ? lines.slice(addressStart + 1, addressStart + 5) : lines.slice(0, 4)

  const filteredLines = candidateLines.filter((line) => !/\b\d{4}\s?\d{4}\s?\d{4}\b/.test(line))
  if (filteredLines.length === 0) {
    return null
  }

  return filteredLines.join(', ')
}
