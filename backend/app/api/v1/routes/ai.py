from fastapi import APIRouter, status

from app.schemas.ai import ImproveWritingRequest, ImproveWritingResponse
from app.services.ai_service import improve_writing

router = APIRouter()


@router.post(
    "/improve-writing",
    response_model=ImproveWritingResponse,
    status_code=status.HTTP_200_OK,
)
def improve_writing_endpoint(payload: ImproveWritingRequest) -> ImproveWritingResponse:
    return improve_writing(payload)
