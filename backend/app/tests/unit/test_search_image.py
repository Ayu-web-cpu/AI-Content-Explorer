import pytest
from app.core.security import create_access_token


async def create_user_and_login(async_client, email, password, role="user"):
    """Helper: Register + Login via API to get access token"""
    # Register
    await async_client.post("/auth/register", json={
        "email": email,
        "password": password,
        "role": role
    })

    # Login (normal user ke liye)
    resp = await async_client.post("/auth/login", data={
        "username": email,
        "password": password
    })
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    user_id = resp.json().get("user_id")

    if role == "admin":
        token = create_access_token(str(user_id), role="admin")

    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_search_creates_saved_item_and_dashboard(async_client):
    """✅ Search API should create SavedItem, visible in dashboard"""
    user_headers = await create_user_and_login(async_client, "suser@example.com", "pass123", role="user")
    admin_headers = await create_user_and_login(async_client, "sadmin@example.com", "pass123", role="admin")

    # 🔍 Call search API
    resp = await async_client.get("/search/", headers=user_headers, params={"query": "fastapi tutorial"})
    assert resp.status_code == 200, resp.text

    # Admin can see it in dashboard
    resp_admin = await async_client.get("/dashboard/admin/users/all", headers=admin_headers)
    assert resp_admin.status_code == 200, resp_admin.text
    items = resp_admin.json()
    assert any("fastapi" in (i.get("title") or "").lower() for i in items)


@pytest.mark.asyncio
async def test_search_history_and_delete(async_client):
    """User can fetch and delete search history"""
    user_headers = await create_user_and_login(async_client, "huser@example.com", "pass123", role="user")

    # Perform search
    await async_client.get("/search/", headers=user_headers, params={"query": "python async"})

    # Get history
    resp = await async_client.get("/search/history", headers=user_headers)
    history = resp.json()["search_history"]
    assert any("python" in h["query"] for h in history)

    # Delete first record
    first_id = history[0]["id"]
    del_resp = await async_client.delete(f"/search/history/{first_id}", headers=user_headers)
    assert del_resp.status_code == 200


@pytest.mark.asyncio
async def test_image_creates_saved_item_and_dashboard(async_client):
    """ Image API should create SavedItem, visible in dashboard"""
    user_headers = await create_user_and_login(async_client, "iuser@example.com", "pass123", role="user")
    admin_headers = await create_user_and_login(async_client, "iadmin@example.com", "pass123", role="admin")

  
    resp = await async_client.post("/image/", headers=user_headers, params={"prompt": "dog photo"})
    assert resp.status_code == 200, resp.text


    resp_admin = await async_client.get("/dashboard/admin/users/all", headers=admin_headers)
    assert resp_admin.status_code == 200, resp_admin.text
    items = resp_admin.json()
    assert any("dog" in (i.get("title") or "").lower() for i in items)


@pytest.mark.asyncio
async def test_image_history_and_delete(async_client):
    """ User can fetch and delete image history"""
    user_headers = await create_user_and_login(async_client, "ihuser@example.com", "pass123", role="user")

    # Generate image
    await async_client.post("/image/", headers=user_headers, params={"prompt": "cat drawing"})

    # Get history
    resp = await async_client.get("/image/history", headers=user_headers)
    history = resp.json()["image_history"]
    assert any("cat" in h["prompt"] for h in history)

    # Delete first record
    first_id = history[0]["id"]
    del_resp = await async_client.delete(f"/image/history/{first_id}", headers=user_headers)
    assert del_resp.status_code == 200
