from google import genai
import asyncio

def inspect_client():
    client = genai.Client(api_key="fake_key")
    print("Client attributes:", dir(client))
    if hasattr(client, 'aio'):
        print("Async client available at client.aio")
        print("Aio attributes:", dir(client.aio))
    else:
        print("No client.aio found")

if __name__ == "__main__":
    inspect_client()
