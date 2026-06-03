# Aadhaar OCR
A modern OCR-based document processing app for uploading Aadhaar card images, refining crops, and extracting structured personal details from both sides of the card.

## Tech Stack

### Frontend
- React 19
- Vite
- TypeScript
- react-image-crop
- CSS

### Backend
- Express
- TypeScript
- Tesseract.js
- Sharp
- Multer
- Valibot
- CORS
- Helmet
- Morgan
- Pino

### Workspace & Tooling
- pnpm Workspaces
- Turbo
- ESLint
- Prettier
- Node.js

## Modules Used

### Frontend Modules
- `UploadCard` for Aadhaar front/back file selection
- `ImageEditorDialog` for crop and rotation adjustments
- `OcrResults` for displaying extracted output and progress
- `ThemeToggle` for switching the UI theme
- `useAadhaarOcr` for upload, edit, and OCR workflow state
- `useTheme` for theme persistence and toggling
- `ocr.service` for calling the backend OCR API
- `lib/ocr` for shared client-side OCR types and mapping helpers

### Backend Modules
- `routes/ocr` for OCR API routing
- `controllers/ocr.controller` for request handling
- `services/ocr` for the OCR execution pipeline
- `services/imagePreprocess` for image cleanup before OCR
- `services/parsers/*` for extracting name, DOB, gender, address, pin code, Aadhaar number, and government text
- `middlewares/upload.middleware` for multipart file uploads
- `middlewares/error-handler` for centralized API error handling
- `utils/validate-files` for request file validation
- `utils/parse-text-data` for OCR text parsing helpers
- `utils/async-handler` for async route wrapping
- `utils/logger` for structured logging
- `utils/env` for environment configuration
- `constants/*` for status codes and error messages

## Folder Structure

```text
.
├── apps
│   ├── backend
│   │   ├── src
│   │   │   ├── constants/          # HTTP status codes and error messages
│   │   │   ├── controllers/        # API controllers
│   │   │   ├── middlewares/        # Upload and error handling middleware
│   │   │   ├── routes/             # API route definitions
│   │   │   ├── services/           # OCR, preprocessing, and parsers
│   │   │   ├── utils/              # Shared backend utilities
│   │   │   └── index.ts            # Server entry point
│   │   ├── eng.traineddata         # OCR language data
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend
│       ├── public/                 # Static assets
│       ├── src
│       │   ├── assets/             # Imported images and icons
│       │   ├── components/         # UI components
│       │   ├── hooks/              # React hooks
│       │   ├── lib/                # Client-side OCR helpers
│       │   ├── services/           # API service layer
│       │   ├── App.tsx             # Main UI shell
│       │   └── main.tsx            # Frontend entry point
│       ├── package.json
│       └── vite.config.ts
├── package.json                    # Root workspace scripts
├── pnpm-workspace.yaml
└── README.md
```
