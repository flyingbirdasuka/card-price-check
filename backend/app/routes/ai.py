from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from ..database import get_db
from ..models.card_lookup import CardLookup
from ..services.claude_service import scan_card_photo, suggest_vinted_price, translate_card_name

router = APIRouter()

CLAUDE_SUPPORTED = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/ai/scan-photo")
async def scan_photo(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    mime = file.content_type
    if mime not in CLAUDE_SUPPORTED:
        raise HTTPException(415, f"Unsupported image format '{mime}'. Please use JPEG, PNG, or WebP.")
    data = await file.read()
    return await scan_card_photo(data, mime)


class TranslateRequest(BaseModel):
    card_name: str
    card_type: str


@router.post("/ai/translate")
async def translate(req: TranslateRequest):
    english_name = await translate_card_name(req.card_name, req.card_type)
    return {"english_name": english_name}


class VintedRequest(BaseModel):
    lookup_id: str
    my_price: float
    condition: str


@router.post("/ai/vinted-suggest")
async def vinted_suggest(req: VintedRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CardLookup).where(CardLookup.id == req.lookup_id))
    lookup = result.scalar_one_or_none()
    if not lookup:
        raise HTTPException(404, "Lookup not found")

    suggestion = await suggest_vinted_price(
        card_name=lookup.card_name,
        card_type=lookup.card_type,
        card_number=lookup.card_number or "",
        my_price=req.my_price,
        condition=req.condition,
    )

    lookup.my_price = req.my_price
    lookup.vinted_suggestion = suggestion
    await db.commit()

    return suggestion
