from pydantic import BaseModel, Field


class ImproveWritingRequest(BaseModel):
    text: str = Field(min_length=1, max_length=12000)
    tone: str = Field(default="academic", min_length=1, max_length=50)


class ImproveWritingResponse(BaseModel):
    original_text: str
    improved_text: str
    tone: str
    disclaimer: str
