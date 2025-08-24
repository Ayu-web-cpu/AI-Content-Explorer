import pytest


async def create_user_and_login(async_client, email, password, role="user"):
    """Helper: Register + Login to get access token"""
    # Register user
    resp = await async_client.post("/auth/register", json={
        "email": email,
        "password": password,
        "role": role
    })
    assert resp.status_code in (200, 201), resp.text

    # Login to get token
    resp = await async_client.post("/auth/login", data={
        "username": email,
        "password": password
    })
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_mcp_search_integration(async_client):
    """✅ Integration: MCP search call should return results & create SavedItem/SearchHistory"""
    headers = await create_user_and_login(
        async_client, "mcp_search@example.com", "pass123", role="user"
    )

    # 🔍 Call search MCP API
    resp = await async_client.get("/search/", headers=headers, params={"query": "FastAPI MCP"})
    assert resp.status_code == 200, resp.text

    data = resp.json()
    assert "results" in data
    assert isinstance(data["results"], list)
    assert "saved_item_id" in data      # 👈 updated (API returns saved_item_id not saved_item)

    # 🔄 Verify history endpoint reflects it
    hist_resp = await async_client.get("/search/history", headers=headers)
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert any("FastAPI" in h["query"] for h in hist_data["search_history"])


@pytest.mark.asyncio
async def test_mcp_image_integration(async_client):
    """✅ Integration: MCP image call should return image URL & create SavedItem/ImageHistory"""
    headers = await create_user_and_login(
        async_client, "mcp_image@example.com", "pass123", role="user"
    )

    # 🖼 Call image MCP API
    resp = await async_client.post("/image/", headers=headers, params={"prompt": "mountain landscape"})
    assert resp.status_code == 200, resp.text

    data = resp.json()
    assert "image_url" in data
    assert "saved_item" in data
    assert data["saved_item"]["item_type"] == "image"

    # 🔄 Verify history endpoint reflects it
    hist_resp = await async_client.get("/image/history", headers=headers)
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert any("mountain" in h["prompt"] for h in hist_data["image_history"])
