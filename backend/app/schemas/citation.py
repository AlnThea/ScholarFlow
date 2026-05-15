from pydantic import BaseModel, Field


class CitationSearchRequest(BaseModel):
    query: str = Field(min_length=3, max_length=2000)
    limit: int = Field(default=5, ge=1, le=10)


class CitationCandidate(BaseModel):
    source: str
    title: str
    authors: list[str] = Field(default_factory=list)
    year: int | None = None
    doi: str | None = None
    url: str | None = None
    reference_id: str
    citation_label: str
    ranking_score: float = 0.0
    ranking_reason: list[str] = Field(default_factory=list)


class CitationSearchResponse(BaseModel):
    query: str
    results: list[CitationCandidate]
    sources: list[str]
    note: str | None = None
