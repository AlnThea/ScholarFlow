from __future__ import annotations

import re
from collections.abc import Iterable
from typing import Any

import httpx

from app.core.config import settings
from app.schemas.citation import CitationCandidate, CitationSearchRequest, CitationSearchResponse

OPENALEX_BASE_URL = "https://api.openalex.org"
CROSSREF_BASE_URL = "https://api.crossref.org"
TOKEN_RE = re.compile(r"[A-Za-z0-9]+")


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


def _query_tokens(query: str) -> set[str]:
    return {token for token in TOKEN_RE.findall(query.lower()) if len(token) > 2}


def _score_candidate(query: str, candidate: CitationCandidate) -> tuple[float, list[str]]:
    query_tokens = _query_tokens(query)
    title_tokens = set(TOKEN_RE.findall(candidate.title.lower()))
    author_tokens = set()
    for author in candidate.authors:
        author_tokens.update(TOKEN_RE.findall(author.lower()))

    reasons: list[str] = []
    score = 0.0

    if candidate.doi:
        score += 10.0
        reasons.append("doi")

    title_overlap = query_tokens.intersection(title_tokens)
    if title_overlap:
        score += min(60.0, len(title_overlap) * 12.0)
        reasons.append(f"title:{len(title_overlap)}")

    author_overlap = query_tokens.intersection(author_tokens)
    if author_overlap:
        score += min(15.0, len(author_overlap) * 5.0)
        reasons.append(f"author:{len(author_overlap)}")

    if candidate.year is not None and any(token == str(candidate.year) for token in query_tokens):
        score += 8.0
        reasons.append("year")

    if candidate.source == "OpenAlex":
        score += 4.0
        reasons.append("openalex")
    elif candidate.source == "Crossref":
        score += 3.0
        reasons.append("crossref")

    if query_tokens:
        title_length = max(len(TOKEN_RE.findall(candidate.title.lower())), 1)
        density = len(title_overlap) / title_length
        score += min(8.0, density * 8.0)

    return score, reasons


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
                ranking_score=0.0,
                ranking_reason=[],
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
                ranking_score=0.0,
                ranking_reason=[],
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

    ranked: list[CitationCandidate] = []
    for candidate in merged:
        score, reasons = _score_candidate(payload.query, candidate)
        candidate.ranking_score = round(score, 2)
        candidate.ranking_reason = reasons
        ranked.append(candidate)

    ranked.sort(
        key=lambda candidate: (
            -candidate.ranking_score,
            candidate.year is None,
            -(candidate.year or 0),
            candidate.source != "OpenAlex",
        ),
    )

    ranked = ranked[: payload.limit]

    note: str | None
    if ranked:
        note = None
    elif errors:
        note = "No citation candidates returned from the available sources."
    else:
        note = "No citation candidates found."

    return CitationSearchResponse(
        query=payload.query,
        results=ranked,
        sources=["OpenAlex", "Crossref"],
        note=note,
    )
