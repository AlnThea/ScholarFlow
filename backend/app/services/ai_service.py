from app.schemas.ai import ImproveWritingRequest, ImproveWritingResponse


def improve_writing(payload: ImproveWritingRequest) -> ImproveWritingResponse:
    cleaned_text = " ".join(payload.text.split())
    improved_text = cleaned_text

    if cleaned_text:
        improved_text = cleaned_text[0].upper() + cleaned_text[1:]
        if not improved_text.endswith("."):
            improved_text += "."

    return ImproveWritingResponse(
        original_text=payload.text,
        improved_text=improved_text,
        tone=payload.tone,
        disclaimer="Placeholder implementation. Replace with Gemini-backed rewrite logic.",
    )
