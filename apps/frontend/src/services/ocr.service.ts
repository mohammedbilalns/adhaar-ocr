import type { AadhaarApiResponse, AadhaarApiError } from '../lib/ocr'

const LOCAL_API_URL = 'http://localhost:3000'
const DEFAULT_ERROR_MESSAGE = 'Unable to extract text from the uploaded images.'

export async function requestAadhaarOcr(frontFile: File, backFile: File): Promise<AadhaarApiResponse> {
  const apiBaseUrl = resolveApiBaseUrl()
  const formData = new FormData()

  formData.append('front', frontFile)
  formData.append('back', backFile)

  const response = await fetch(`${apiBaseUrl}/ocr/aadhaar`, {
    method: 'POST',
    body: formData,
  })

  const payload = (await readResponseBody(response)) as AadhaarApiResponse | AadhaarApiError | null

  if (!response.ok || !payload || isErrorPayload(payload)) {
    throw new Error(
      isErrorPayload(payload)
        ? payload.message || payload.error || DEFAULT_ERROR_MESSAGE
        : DEFAULT_ERROR_MESSAGE,
    )
  }

  return payload
}

function resolveApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_URL?.trim()

  if (apiBaseUrl) {
    return apiBaseUrl
  }

  if (import.meta.env.DEV) {
    return LOCAL_API_URL
  }

  throw new Error('Missing VITE_API_URL for the frontend build.')
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  if (!text.trim()) {
    return null
  }

  return {
    success: false,
    message: text,
  } satisfies AadhaarApiError
}

function isErrorPayload(
  payload: AadhaarApiResponse | AadhaarApiError | null,
): payload is AadhaarApiError {
  return Boolean(payload && 'success' in payload && payload.success === false)
}
