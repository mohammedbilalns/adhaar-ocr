import type { AadhaarApiResponse, AadhaarApiError } from '../lib/ocr'

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
  const apiBaseUrl = import.meta.env.VITE_API_URL
  if(!apiBaseUrl) {
    throw new Error('VITE_API_URL environment variable is not set.')
  }
  return apiBaseUrl
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
