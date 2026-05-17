import uuid
from sqlalchemy import Column, String, Numeric, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from ..database import Base


class CardLookup(Base):
    __tablename__ = "card_lookups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    card_type = Column(String, nullable=False)
    card_name = Column(String, nullable=False)
    card_number = Column(String, nullable=True)
    urls = Column(JSONB, nullable=False)
    my_price = Column(Numeric(10, 2), nullable=True)
    currency = Column(String, default="EUR")
    vinted_suggestion = Column(JSONB, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
