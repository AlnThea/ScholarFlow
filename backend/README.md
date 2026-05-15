# ScholarFlow Backend

FastAPI backend skeleton for ScholarFlow.

## Included

- health check endpoint
- `improve-writing` endpoint skeleton
- citation search endpoint
- CORS configuration for the frontend
- service-based folder structure
- Pydantic request and response schemas

## Deployment Notes

- Run the API behind a process manager or container in production, not with `--reload`.
- Bind the server to `0.0.0.0` when exposing it outside localhost.
- Set `ALLOWED_ORIGINS` to the deployed frontend origin, for example `https://app.example.com`.
- Keep `OPENALEX_API_KEY` and `CROSSREF_MAILTO` in the environment, not in source control.
- Ensure the frontend `NEXT_PUBLIC_API_BASE_URL` points to the deployed API URL.
- Use a reverse proxy such as Nginx or a platform load balancer to terminate TLS.

## Run

Create a virtual environment, install dependencies, then run:

```bash
uvicorn app.main:app --reload --port 8000
```

For production:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Environment

Copy `.env.example` to `.env` and adjust values as needed.

## API

- `GET /api/v1/health`
- `POST /api/v1/ai/improve-writing`
- `POST /api/v1/citations/search`
