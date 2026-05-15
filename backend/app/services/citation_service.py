from __future__ import annotations

from collections.abc import Iterable
from typing import Any

import httpx

from app.core.config import settings
from app.schemas.citation import CitationCandidate, CitationSearchRequest, CitationSearchResponse

OPENALEX_BASE_URL = "https://api.openalex.org"
CROSSREF_BASE_URL = "https://api.crossref.org"


def _normalize_year(value: Any) -> int | None:
    if isinstance(value, int):
        return value
    if isinstance(value, str) and value.isdigit():
        return int(value)
    if isinstance(value, list) and value:
        first = value[0]
        if isinstance(first, int):
            return first
        if isinstance(first, str) and first.isdigit():
            return int(first)
    return None


def _collect_authors(authors: Iterable[Any]) -> list[str]:
    names: list[str] = []
    for author in authors:
        if isinstance(author, dict):
            name = author.get("display_name") or author.get("name")
            if name:
                names.append(str(name))
        elif isinstance(author, str) and author.strip():
            names.append(author.strip())
    return names


def _short_label(authors: list[str], year: int | None) -> str:
    author_name = authors[0].split(",")[0] if authors else "Unknown"
    if year is None:
        return author_name
    return f"{author_name} {year}"


def _dedupe_key(candidate: CitationCandidate) -> str:
    return candidate.doi.lower() if candidate.doi else candidate.reference_id.lower()


async def _search_openalex(client: httpx.AsyncClient, query: str, limit: int) -> list[CitationCandidate]:
    params: dict[str, Any] = {
        "search": query,
        "per_page": limit,
        "select": "id,display_name,title,authorships,publication_year,doi,url",
    }
    if settings.openalex_api_key:
        params["api_key"] = settings.openalex_api_key

    response = await client.get(f"{OPENALEX_BASE_URL}/works", params=params)
    response.raise_for_status()
    payload = response.json()

    results: list[CitationCandidate] = []
    for item in payload.get("results", [])[:limit]:
        authors = _collect_authors(item.get("authorships", []))
        year = _normalize_year(item.get("publication_year"))
        doi = item.get("doi")
        reference_id = str(item.get("id") or doi or item.get("title") or query)
        title = str(item.get("display_name") or item.get("title") or "Untitled work")

        results.append(
            CitationCandidate(
                source="OpenAlex",
                title=title,
                authors=authors,
                year=year,
                doi=str(doi) if doi else None,
                url=str(item.get("url") or ""),
                reference_id=reference_id,
                citation_label=_short_label(authors, year),
            )
        )
    return results


async def _search_crossref(client: httpx.AsyncClient, query: str, limit: int) -> list[CitationCandidate]:
    params: dict[str, Any] = {
        "query.bibliographic": query,
        "rows": limit,
    }
    if settings.crossref_mailto:
        params["mailto"] = settings.crossref_mailto

    response = await client.get(f"{CROSSREF_BASE_URL}/works", params=params)
    response.raise_for_status()
    payload = response.json()

    results: list[CitationCandidate] = []
    for item in payload.get("message", {}).get("items", [])[:limit]:
        authors = _collect_authors(item.get("author", []))
        year = None
        issued = item.get("issued", {}).get("date-parts", [])
        if issued and isinstance(issued, list) and issued[0]:
            year = _normalize_year(issued[0][0])

        doi = item.get("DOI")
        reference_id = str(doi or item.get("URL") or item.get("title", ["Untitled work"])[0])
        title_values = item.get("title") or ["Untitled work"]
        title = str(title_values[0])

        results.append(
            CitationCandidate(
                source="Crossref",
                title=title,
                authors=authors,
                year=year,
                doi=str(doi) if doi else None,
                url=str(item.get("URL") or ""),
                reference_id=reference_id,
                citation_label=_short_label(authors, year),
            )
        )
    return results


async def search_citations(payload: CitationSearchRequest) -> CitationSearchResponse:
    timeout = httpx.Timeout(15.0, connect=10.0)
    headers = {
        "User-Agent": "ScholarFlow/0.1.0 (citation-search)",
    }

    async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
        openalex_results: list[CitationCandidate] = []
        crossref_results: list[CitationCandidate] = []
        errors: list[str] = []

        try:
            openalex_results = await _search_openalex(client, payload.query, payload.limit)
        except Exception:
            errors.append("OpenAlex search unavailable")

        try:
            crossref_results = await _search_crossref(client, payload.query, payload.limit)
        except Exception:
            errors.append("Crossref search unavailable")

    merged: list[CitationCandidate] = []
    seen: set[str] = set()
    for candidate in [*openalex_results, *crossref_results]:
        key = _dedupe_key(candidate)
        if key in seen:
            continue
        seen.add(key)
        merged.append(candidate)

    merged = merged[: payload.limit]

    note: str | None
    if merged:
        note = None
    elif errors:
        note = "No citation candidates returned from the available sources."
    else:
        note = "No citation candidates found."

    return CitationSearchResponse(
        query=payload.query,
        results=merged,
        sources=["OpenAlex", "Crossref"],
        note=note,
    )
