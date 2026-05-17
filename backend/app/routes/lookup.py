from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from ..database import get_db
from ..models.card_lookup import CardLookup
from ..services.url_builder import build_urls

router = APIRouter()


class LookupRequest(BaseModel):
    card_type: str
    card_name: str
    card_number: str = ""


@router.post("/lookup")
async def create_lookup(req: LookupRequest, db: AsyncSession = Depends(get_db)):
    if req.card_type not in ("pokemon", "yugioh"):
        raise HTTPException(400, "card_type must be 'pokemon' or 'yugioh'")

    urls = build_urls(req.card_type, req.card_name.strip(), req.card_number.strip())

    lookup = CardLookup(
        card_type=req.card_type,
        card_name=req.card_name.strip(),
        card_number=req.card_number.strip(),
        urls=urls,
    )
    db.add(lookup)
    await db.commit()
    await db.refresh(lookup)

    return _serialize(lookup)


def _serialize(l: CardLookup) -> dict:
    return {
        "id": str(l.id),
        "card_type": l.card_type,
        "card_name": l.card_name,
        "card_number": l.card_number,
        "urls": l.urls,
        "my_price": float(l.my_price) if l.my_price is not None else None,
        "currency": l.currency,
        "vinted_suggestion": l.vinted_suggestion,
        "notes": l.notes,
        "created_at": l.created_at.isoformat() if l.created_at else None,
    }
