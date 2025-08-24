from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_session
from app.models.saved_item import SavedItem
from app.core.security import require_admin

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

dashboard_router = router   # alias bana liya

# -------------------------
# Admin APIs
# -------------------------

# ✅ Admin: list items of a specific user
@router.get("/admin/{user_id}")
async def admin_list_user_items(
    user_id: int,
    session: AsyncSession = Depends(get_session),
    admin=Depends(require_admin)
):
    result = await session.execute(select(SavedItem).where(SavedItem.owner_id == user_id))
    items = result.scalars().all()
    return [i.to_dict() for i in items]  # <-- make sure SavedItem has .to_dict() or use Pydantic schema


# ✅ Admin: list all items of all users
@router.get("/admin/users/all")
async def admin_list_all_items(
    session: AsyncSession = Depends(get_session),
    admin=Depends(require_admin)
):
    result = await session.execute(select(SavedItem))
    items = result.scalars().all()
    return [i.to_dict() for i in items]


# ✅ Admin: update a specific item
@router.put("/admin/{item_id}")
async def admin_update_item(
    item_id: int,
    payload: dict,
    session: AsyncSession = Depends(get_session),
    admin=Depends(require_admin)
):
    item = await session.get(SavedItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item.title = payload.get("title", item.title)
    item.content = payload.get("content", item.content)
    item.item_type = payload.get("item_type", item.item_type)

    session.add(item)
    await session.commit()
    await session.refresh(item)

    return item.to_dict()



