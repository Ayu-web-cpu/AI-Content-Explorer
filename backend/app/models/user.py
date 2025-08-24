from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)


    search_history = relationship("SearchHistory", back_populates="owner", cascade="all, delete-orphan")
    image_history = relationship("ImageHistory", back_populates="owner", cascade="all, delete-orphan")



    saved_items = relationship("SavedItem", back_populates="user", cascade="all, delete-orphan")
