
import logging
import asyncio
from langchain_core.messages import HumanMessage
from src.services.intent_classifier import IntentClassifier
from src.graph.context_builder import ContextBuilder
from src.prompts.system_prompts import SystemPrompts

# Mock State
mock_state = {
    "messages": [
        HumanMessage(content="Hello world"),
        HumanMessage(content="Describe this image [Immagine allegata: http://example.com/foo.jpg]"),
    ],
    "session_id": "test_session",
    "is_authenticated": True
}

async def test_intent_classifier():
    print("Testing IntentClassifier (Async)...")
    
    # Reasoning case (complex)
    complex_msg = [HumanMessage(content="I need a full renovation plan for my kitchen with 5000 budget")]
    res = await IntentClassifier.classify_intent(complex_msg)
    assert res == "reasoning", "Complex should be reasoning"
    
    # Execution case (greeting)
    greet_msg = [HumanMessage(content="Ciao")]
    res = await IntentClassifier.classify_intent(greet_msg)
    assert res == "execution", "Greeting should be execution"
    
    # Limit check
    long_msg = [HumanMessage(content="One two three four five six")]
    res = await IntentClassifier.classify_intent(long_msg)
    assert res == "reasoning", "Long message should be reasoning"
    print("✅ IntentClassifier Passed")

def test_context_builder():
    print("Testing ContextBuilder...")
    prompt = ContextBuilder.build_system_prompt(mock_state)
    assert "[[ACTIVE CONTEXT]]" in prompt, "Missing Media Context"
    assert "IS_AUTHENTICATED=TRUE" in prompt, "Missing Auth Context"
    print("✅ ContextBuilder Passed")

def test_prompt_manager():
    print("Testing SystemPrompts Versioning...")
    default = SystemPrompts.get_instruction()
    v1 = SystemPrompts.get_instruction("v1")
    invalid = SystemPrompts.get_instruction("invalid_version")
    
    assert default is not None
    assert default == v1
    assert default == invalid # Fallback behavior
    print("✅ PromptManager Passed")

async def main():
    await test_intent_classifier()
    test_context_builder()
    test_prompt_manager()

if __name__ == "__main__":
    asyncio.run(main())
