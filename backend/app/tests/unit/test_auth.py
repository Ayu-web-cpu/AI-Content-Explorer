
import pytest

@pytest.mark.asyncio
async def test_register_user(async_client):
    resp = await async_client.post("/auth/register", json={
        "email": "newuser@example.com",
        "password": "password123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_user(async_client):
    # Register first
    await async_client.post("/auth/register", json={
        "email": "loginuser@example.com",
        "password": "pass123"
    })
    resp = await async_client.post("/auth/login", json={
        "email": "loginuser@example.com",
        "password": "pass123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_invalid(async_client):
    resp = await async_client.post("/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrong"
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(async_client):
    reg = await async_client.post("/auth/register", json={
        "email": "refreshuser@example.com",
        "password": "pass123"
    })
    refresh = reg.json()["refresh_token"]

    resp = await async_client.post("/auth/refresh", params={"token": refresh})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_refresh_invalid_token(async_client):
    resp = await async_client.post("/auth/refresh", params={"token": "abcd1234"})
    assert resp.status_code == 401
