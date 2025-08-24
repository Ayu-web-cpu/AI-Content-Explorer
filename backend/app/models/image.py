from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class ImageHistory(Base):
    __tablename__ = "image_history"

    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(String, nullable=False)
    image_url = Column(Text, nullable=True)
    meta = Column(Text, nullable=True)
    results = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="image_history")

