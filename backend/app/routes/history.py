import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from ..database import get_db
from ..models.card_lookup import CardLookup

router = APIRouter()


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


@router.get("/history")
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CardLookup).order_by(desc(CardLookup.created_at)))
    return [_serialize(l) for l in result.scalars().all()]


class UpdateRequest(BaseModel):
    my_price: Optional[float] = None
    notes: Optional[str] = None


@router.patch("/history/{id}")
async def update_lookup(id: str, body: UpdateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CardLookup).where(CardLookup.id == id))
    lookup = result.scalar_one_or_none()
    if not lookup:
        raise HTTPException(404, "Not found")
    if body.my_price is not None:
        lookup.my_price = body.my_price
    if body.notes is not None:
        lookup.notes = body.notes
    await db.commit()
    await db.refresh(lookup)
    return _serialize(lookup)


@router.delete("/history/{id}")
async def delete_lookup(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CardLookup).where(CardLookup.id == id))
    lookup = result.scalar_one_or_none()
    if not lookup:
        raise HTTPException(404, "Not found")
    await db.delete(lookup)
    await db.commit()
    return {"ok": True}


@router.get("/export")
async def export_csv(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CardLookup).order_by(desc(CardLookup.created_at)))
    lookups = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Type", "Name", "Number",
        "My Price (EUR)", "Vinted Suggestion (EUR)",
        "PriceCharting", "Cardmarket", "eBay", "Notes",
    ])

    for l in lookups:
        urls = l.urls or {}
        vs = l.vinted_suggestion
        writer.writerow([
            l.created_at.strftime("%Y-%m-%d %H:%M") if l.created_at else "",
            l.card_type,
            l.card_name,
            l.card_number or "",
            float(l.my_price) if l.my_price else "",
            vs.get("suggested_price", "") if vs else "",
            urls.get("pricecharting", ""),
            urls.get("cardmarket", ""),
            urls.get("ebay", ""),
            l.notes or "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=card-lookups.csv"},
    )
