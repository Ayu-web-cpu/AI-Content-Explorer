import asyncio
import json
from urllib.parse import urlparse

MCP_URL = "https://server.smithery.ai/@nickclyde/duckduckgo-mcp-server/mcp?api_key=6aa8df08-ffd6-46a7-9036-f9b28a29871e&profile=mixed-viper-NggMmT"

async def run_mcp(query: str):
    url = urlparse(MCP_URL)
    host = url.hostname
    port = 443 if url.scheme == "https" else 80
    path = url.path + ("?" + url.query if url.query else "")

    reader, writer = await asyncio.open_connection(host, port, ssl=True)

    # Prepare HTTP headers (keep-alive)
    headers = (
        f"POST {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        "Content-Type: application/json\r\n"
        "Accept: application/json, text/event-stream\r\n"
        "Connection: keep-alive\r\n"
        "\r\n"
    )

    writer.write(headers.encode())
    await writer.drain()

    # 1️⃣ Send initialize
    init_msg = {
        "jsonrpc": "2.0",
        "id": "1",
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-01-01",
            "capabilities": {},
            "clientInfo": {"name": "fastapi-client", "version": "0.1.0"},
        },
    }
    body = json.dumps(init_msg) + "\n"
    writer.write(body.encode())
    await writer.drain()
    print("➡️ Sent initialize")

    # 2️⃣ Send search
    await asyncio.sleep(1)
    search_msg = {
        "jsonrpc": "2.0",
        "id": "2",
        "method": "tools/call",
        "params": {"name": "search", "arguments": {"query": query}},
    }
    body = json.dumps(search_msg) + "\n"
    writer.write(body.encode())
    await writer.drain()
    print("➡️ Sent search")

    # 3️⃣ Read SSE response
    while True:
        line = await reader.readline()
        if not line:
            break
        line = line.decode().strip()
        if line.startswith("data: "):
            try:
                event = json.loads(line.replace("data: ", ""))
                print("📩 EVENT:", json.dumps(event, indent=2))
            except Exception:
                print("⚠️ RAW:", line)


if __name__ == "__main__":
    asyncio.run(run_mcp("what is AI"))

