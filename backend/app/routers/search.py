from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_session
from app.models.search import SearchHistory
from app.models.saved_item import SavedItem
from app.core.security import get_current_user

from mcp.client.streamable_http import streamablehttp_client
from mcp.client.session import ClientSession
import json
router = APIRouter(prefix="/search", tags=["MCP Search"])

# ... tumhara pura code ...

# ✅ Export with correct name
search_router = router

# ✅ Router with clear name

# ✅ MCP Config
MCP_URL = "https://server.smithery.ai/@nickclyde/duckduckgo-mcp-server/mcp"
API_KEY = "775e8343-7c8c-47b0-8d12-93f9b45c293c"
PROFILE = "developing-marten-gJ1abJ"


# =============================
# 🔍 Perform Search + Save Data
# =============================
@search_router.get("/")
async def search_duckduckgo(
    query: str = Query(..., description="Search query string"),
    db: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    try:
        url = f"{MCP_URL}?api_key={API_KEY}&profile={PROFILE}"

        async with streamablehttp_client(url) as (read_stream, write_stream, _):
            async with ClientSession(read_stream, write_stream) as sess:
                # Init MCP
                await sess.initialize()

                # Check tools
                tools = await sess.list_tools()
                tool_names = [t.name for t in tools.tools]
                if "search" not in tool_names:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Tool 'search' not found. Available: {tool_names}",
                    )

                # Call tool
                res = await sess.call_tool("search", {"query": query, "max_results": 5})
                outputs = res.dict().get("content", [])

                # ✅ Save to SearchHistory
                history = SearchHistory(
                    query=query,
                    results=json.dumps(outputs),
                    user_id=int(current_user["sub"]),
                )
                db.add(history)

                # ✅ Save to SavedItem (Dashboard integration)
                saved_item = SavedItem(
                    owner_id=int(current_user["sub"]),
                    item_type="search",
                    title=f"Search: {query[:30]}",
                    content=json.dumps(outputs[:1]) if outputs else "",
                    name=current_user.get("role", "user"),
                )
                db.add(saved_item)

                await db.commit()
                await db.refresh(history)
                await db.refresh(saved_item)

                return {
                    "query": query,
                    "results": outputs,
                    "timestamp": history.timestamp,
                    "user_id": int(current_user["sub"]),
                    "saved_item_id": saved_item.id,
                }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MCP error: {str(e)}")


# =============================
# 📜 Get User Search History
# =============================
@search_router.get("/history")
async def get_search_history(
    db: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(SearchHistory)
        .where(SearchHistory.user_id == int(current_user["sub"]))
        .order_by(SearchHistory.timestamp.desc())
    )
    history = result.scalars().all()

    return {
        "user_id": int(current_user["sub"]),
        "role": current_user["role"],
        "search_history": [
            {
                "id": h.id,
                "query": h.query,
                "results": json.loads(h.results),
                "timestamp": h.timestamp,
            }
            for h in history
        ],
    }
__all__ = ["search_router"]

@search_router.delete("/history/{search_id}")
async def delete_search_history(
    search_id: int,
    db: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(SearchHistory).where(
            SearchHistory.id == search_id,
            SearchHistory.user_id == int(current_user["sub"])  # ✅ apna hi record delete
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Search record not found")

    await db.delete(record)
    await db.commit()

    return {"status": "deleted", "search_id": search_id}
#curl -H "Authorization: Bearer 6aa8df08-ffd6-46a7-9036-f9b28a29871e" "https://server.smithery.ai/@nickclyde/duckduckgo-mcp-server/mcp?q=what+is+quantum+computing%3F"

