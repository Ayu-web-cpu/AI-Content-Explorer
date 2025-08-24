from pydantic import BaseModel
from typing import Optional


class SavedItemBase(BaseModel):
    item_type: str
    title: str
    content: Optional[str] = None


class SavedItemCreate(SavedItemBase):
    pass


class SavedItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class SavedItemOut(SavedItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

