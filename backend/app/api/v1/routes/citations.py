from fastapi import APIRouter, status

from app.schemas.citation import CitationSearchRequest, CitationSearchResponse
from app.services.citation_service import search_citations

router = APIRouter()


@router.post(
    "/search",
    response_model=CitationSearchResponse,
    status_code=status.HTTP_200_OK,
)
async def citation_search_endpoint(payload: CitationSearchRequest) -> CitationSearchResponse:
    return await search_citations(payload)
