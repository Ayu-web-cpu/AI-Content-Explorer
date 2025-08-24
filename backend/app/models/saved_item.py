from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.models.base import Base


class SavedItem(Base):
    __tablename__ = "saved_items"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)   # ✅ FK to User
    item_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=True)
    name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # ✅ auto timestamp

    # Relationship back to User
    user = relationship("User", back_populates="saved_items")


    def to_dict(self):
        return {
            "id": self.id,
            "owner_id": self.owner_id,
            "item_type": self.item_type,
            "title": self.title,
            "content": self.content,
            "name": self.name,
            "created_at": str(self.created_at),
        }
