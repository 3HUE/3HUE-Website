# Risk Assessment Onboarding Questionnaire

## Requirements
- Node.js 18+
- PostgreSQL 14+

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file using `.env.example` as a template.
3. Run Prisma migrations:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Key Routes
- `/start` create or resume a session
- `/q/[sessionId]` questionnaire wizard
- `/complete/[sessionId]` confirmation
- `/admin/sessions` session status list

## Notes
- Uploads are stored in `/assessments/uploads` for local development.
- The external delivery endpoint is mocked at `/api/integrations/external`.

