# --- make 'app' importable during tests ---
import os, sys
THIS_DIR = os.path.dirname(__file__)                           # .../backend/app/tests
BACKEND_ROOT = os.path.abspath(os.path.join(THIS_DIR, "..", ".."))  # .../backend
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)
# ------------------------------------------

# app/tests/conftest.py
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import get_session
from app.models.base import Base
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

TEST_DATABASE_URL = "postgresql+asyncpg://postgres:ayush@localhost:5432/test_db"

# Engine with NullPool (important for asyncpg tests)
engine_test = create_async_engine(TEST_DATABASE_URL, future=True, echo=False, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(engine_test, expire_on_commit=False, class_=AsyncSession)

# Create/drop schema once
@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepare_database():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

# DB override (transaction per test)
@pytest_asyncio.fixture
async def db_session():
    async with engine_test.connect() as conn:
        trans = await conn.begin()
        session = AsyncSession(bind=conn, expire_on_commit=False)
        try:
            yield session
        finally:
            await session.close()
            await trans.rollback()  # rollback after test

async def override_get_session():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_session] = override_get_session

# HTTP client
@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


#Get-ChildItem -Recurse -Include "__pycache__", ".pytest_cache", "tempCodeRunnerFile.py" | Remove-Item -Recurse -Force


