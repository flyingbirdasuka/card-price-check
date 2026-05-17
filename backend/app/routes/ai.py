from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from ..database import get_db
from ..models.card_lookup import CardLookup
from ..services.claude_service import scan_card_photo, suggest_vinted_price

router = APIRouter()

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp", "image/gif"}


@router.post("/ai/scan-photo")
async def scan_photo(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(400, "File must be a JPEG, PNG, WebP, or GIF image")
    data = await file.read()
    return await scan_card_photo(data, file.content_type)


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
