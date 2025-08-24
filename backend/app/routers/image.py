import json, traceback
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from mcp.client.streamable_http import streamablehttp_client
from mcp.client.session import ClientSession
from app.db.session import get_session
from app.models.image import ImageHistory
from app.models.saved_item import SavedItem
from app.core.security import get_current_user
import httpx

router = APIRouter(prefix="/image", tags=["MCP Image"])


image_router = router

MCP_IMAGE_URL = "https://server.smithery.ai/@falahgs/flux-imagegen-mcp-server/mcp"
API_KEY = "73dfbc49-709d-41a2-b868-3ac58a0a2dc4"
PROFILE = "mixed-viper-NggMmT"


@image_router.post("/")
async def generate_image(
    prompt: str = Query(..., description="Prompt to generate image"),
    db: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    try:
        url = f"{MCP_IMAGE_URL}?api_key={API_KEY}&profile={PROFILE}"
        print(f" Connecting to MCP Server: {url}")

        async with streamablehttp_client(url) as (read_stream, write_stream, _):
            async with ClientSession(read_stream, write_stream) as sess:
                await sess.initialize()
                print(" Session initialized")

                # List tools
                tools = await sess.list_tools()
                tool_names = [t.name for t in tools.tools]
                print(" Available Tools:", tool_names)

                # Prefer "generateImageUrl" if available
                tool_to_use = "generateImageUrl" if "generateImageUrl" in tool_names else "generateImage"

                print(f" Calling '{tool_to_use}' tool with prompt: {prompt}")
                res = await sess.call_tool(tool_to_use, {"prompt": prompt, "model": "flux"})
                outputs = res.dict().get("content", [])

                # Extract image_url safely
                image_url = None
                if outputs and isinstance(outputs, list):
                    try:
                        parsed = json.loads(outputs[0]["text"])
                        image_url = parsed.get("imageUrl")
                    except Exception:
                        image_url = None

               
                history = ImageHistory(
                    prompt=prompt,
                    image_url=image_url or "",
                    meta=json.dumps({"model": "flux"}),
                    results=json.dumps(outputs),
                    user_id=int(current_user["sub"]),
                )
                db.add(history)

     
                saved_item = SavedItem(
                    owner_id=int(current_user["sub"]),
                    item_type="image",
                    title=f"Image: {prompt[:30]}",
                    content=image_url or "",  
                    name=current_user.get("role", "user"),
                )
                db.add(saved_item)

                await db.commit()
                await db.refresh(history)
                await db.refresh(saved_item)

                return {
                    "prompt": prompt,
                    "image_url": image_url,
                    "results": outputs,
                    "timestamp": history.timestamp,
                    "user_id": int(current_user["sub"]),
                    "saved_item": saved_item.to_dict(), 
                }

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Image MCP server unavailable: {str(e)}")

    except Exception as e:
        print("⚠️ MCP ERROR TRACE:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Image MCP error: {str(e)}")



@image_router.get("/history")
async def get_image_history(
    db: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(ImageHistory)
        .where(ImageHistory.user_id == int(current_user["sub"]))
        .order_by(ImageHistory.timestamp.desc())
    )
    history = result.scalars().all()

    return {
        "user_id": int(current_user["sub"]),
        "role": current_user["role"],
        "image_history": [
            {
                "id": h.id,
                "prompt": h.prompt,
                "image_url": h.image_url,
                "meta": json.loads(h.meta) if h.meta else None,
                "results": json.loads(h.results) if h.results else None,
                "timestamp": h.timestamp,
            }
            for h in history
        ],
    }


@image_router.delete("/history/{image_id}")
async def delete_image_history(
    image_id: int,
    db: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(ImageHistory).where(
            ImageHistory.id == image_id,
            ImageHistory.user_id == int(current_user["sub"])  # ✅ apna hi record delete
        )
    )
    record = result.scalar_one_or_none()

    if not record:
        raise HTTPException(status_code=404, detail="Image record not found")

    await db.delete(record)
    await db.commit()

    return {"status": "deleted", "image_id": image_id}

