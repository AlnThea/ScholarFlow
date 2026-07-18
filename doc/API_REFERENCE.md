# ScholarFlow API Reference

This document outlines the API endpoints exposed by the Next.js serverless routes, detailing their request payloads, response structures, and business logic.

---

## ✍️ 1. Writing Improvements

### `POST /api/improve-writing`
Simplistic writing improvement endpoint that directly forwards text input to Gemini.

- **Request Body**:
  ```json
  {
    "text": "The input sentence that needs rewriting.",
    "tone": "academic"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "improved": "The rewritten academic text."
  }
  ```

---

### `POST /api/v1/ai/improve`
A more robust and customized writing improvement endpoint. It wraps inputs inside a structured prompt template, configures generation temperature, and implements a fallback helper if the Gemini API key is missing or fails.

- **Request Body**:
  ```json
  {
    "text": "Original text selection to improve.",
    "tone": "academic"
  }
  ```
- **Response (200 OK - Successful Gemini Response)**:
  ```json
  {
    "original_text": "Original text selection to improve.",
    "improved_text": "Rewritten scholarly phrasing output.",
    "tone": "academic",
    "disclaimer": null
  }
  ```
- **Response (200 OK - Fallback Mock Mode)**:
  Returned if `GEMINI_API_KEY` is not found or Gemini returns status errors.
  ```json
  {
    "original_text": "Original text selection to improve.",
    "improved_text": "Original Text selection to improve.",
    "tone": "academic",
    "disclaimer": "Gemini API key is not configured. Set GEMINI_API_KEY in .env to enable AI rewriting."
  }
  ```

---

## 🔍 2. Citation Lookup

### `POST /api/citations/search`
The core engine for querying academic databases. It manages performance and cost by caching queries into Supabase.

#### Execution Workflow
1. **MD5 Hashing**: Normalizes and hashes the input query to check the `citation_cache` table.
2. **Cache Hit**: If a non-expired cache record exists, returns the cached candidates immediately.
3. **Refine Query**: If a cache miss occurs, the query is parsed to remove common Indonesian/English stop words and isolate technical keywords.
4. **Parallel Fetching**: Queries both **OpenAlex API** and **Crossref API** in parallel.
5. **Deduplication**: Combines results and filters out duplicates by comparing normalized DOIs or titles.
6. **Heuristic Ranking**: Scores candidates based on:
   - Keyword overlaps in titles.
   - Presence of DOI.
   - Presence of authors list.
   - Publication year ($\ge 2015$ gains extra points).
7. **Cache Save & Return**: Stores ranked results to `citation_cache` (expiring in 7 days) and returns them.

- **Request Body**:
  ```json
  {
    "query": "Machine learning algorithms for climate prediction",
    "limit": 5
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "query": "Machine learning algorithms for climate prediction",
    "results": [
      {
        "source": "OpenAlex",
        "title": "Machine learning for climate prediction: A survey",
        "authors": [
          "Smith, John",
          "Doe, Jane"
        ],
        "year": 2021,
        "doi": "10.1007/s00382-021-05700-1",
        "url": "https://doi.org/10.1007/s00382-021-05700-1",
        "reference_id": "10.1007/s00382-021-05700-1",
        "citation_label": "Smith 2021",
        "ranking_score": 88,
        "ranking_reason": [],
        "abstract": "Abstract text reconstruct from OpenAlex word index...",
        "journal": "Climate Dynamics",
        "cited_by_count": 34
      }
    ],
    "sources": [
      "OpenAlex",
      "Crossref"
    ],
    "cached": false,
    "note": null
  }
  ```

---

## 📁 3. PDF Metadata Extraction (Library Upload)

### `POST /api/library/upload`
Serverless-friendly PDF text extraction and database cataloging route.

#### Execution Workflow
1. **Buffer Processing**: Reads the incoming `File` upload directly into memory as a buffer.
2. **PDF Parsing**: Invokes `pdf-parse` library in memory to convert raw binary buffer to text strings.
3. **Metadata Extraction**: Analyzes the first 2 pages of extracted text to heuristically identify:
   - Publication Year (detects 4-digit numbers between 1900 and 2026).
   - Jurnal Title (first non-empty lines).
   - DOI (searches matching DOI regular expressions).
4. **Database Insertion**: Saves the structured metadata object directly to Supabase table `citation_library`.
5. **Immediate Cleanup**: Erases binary buffers to avoid exceeding serverless memory execution limit.

- **Request Payload**:
  - `Multipart/form-data` containing `file` key (raw binary PDF file, max 10MB).
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "citation": {
      "title": "Extracted Research Title",
      "authors": ["Unknown"],
      "year": 2023,
      "doi": "10.1109/some.doi",
      "journal": "Extracted Journal Name"
    }
  }
  ```
- **Response (400/500 Error)**:
  ```json
  {
    "error": "Failed to parse PDF contents."
  }
  ```
