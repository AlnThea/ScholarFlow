# ScholarFlow Backend

FastAPI backend skeleton for ScholarFlow.

## Included

- health check endpoint
- `improve-writing` endpoint skeleton
- CORS configuration for the frontend
- service-based folder structure
- Pydantic request and response schemas

## Run

Create a virtual environment, install dependencies, then run:

```bash
uvicorn app.main:app --reload --port 8000
```

## Environment

Copy `.env.example` to `.env` and adjust values as needed.

## API

- `GET /api/v1/health`
- `POST /api/v1/ai/improve-writing`
