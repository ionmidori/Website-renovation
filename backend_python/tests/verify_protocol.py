import asyncio
import json
from src.utils.stream_protocol import stream_text, stream_data, stream_tool_call, stream_tool_result, stream_error

async def verify_protocol():
    print("🧪 Testing Stream Protocol...")
    
    # Test Text
    async for chunk in stream_text("Hello"):
        assert chunk == '0:"Hello"\n', f"Text failed: {chunk}"
        print("✅ Text: OK")

    # Test Data (List)
    test_list = ["a", 1, {"b": 2}]
    async for chunk in stream_data(test_list):
        # Vercel Protocol: 2:[data_array]
        # Our implementation wraps generic data in a list: [data]
        # So stream_data(["a"]) -> 2:[["a"]]\n
        expected_json = json.dumps([test_list])
        expected = f'2:{expected_json}\n'
        assert chunk == expected, f"Data List failed: {chunk} vs {expected}"
        print("✅ Data (List): OK")

    # Test Data (Dict)
    test_dict = {"status": "ok"}
    async for chunk in stream_data(test_dict):
        expected_json = json.dumps([test_dict])
        expected = f'2:{expected_json}\n'
        assert chunk == expected, f"Data Dict failed: {chunk}"
        print("✅ Data (Dict): OK")
        
    print("🎉 All Protocol Tests Passed")

if __name__ == "__main__":
    asyncio.run(verify_protocol())
