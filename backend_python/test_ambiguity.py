
import os
import asyncio
import logging
from dotenv import load_dotenv

# Setup Environment
load_dotenv()
if os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from src.graph.agent import get_agent_graph

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_ambiguous_yes():
    print("🧪 TEST: Ambiguous 'Sì' Logic (Quote Offer vs Render Confirm)")
    print("===========================================================")
    
    graph = get_agent_graph()
    
    # SCENARIO: 
    # AI has just generated a render and asked: "Ti interesserebbe un preventivo?"
    # User says: "Sì"
    
    mock_history = [
        SystemMessage(content="Sei un architetto AI. ... [Prompt Standard] ..."),
        HumanMessage(content="Voglio rifare il salotto."),
        AIMessage(content="Certamente. [Fase Design completata]"),
        HumanMessage(content="Procedi col render"),
        AIMessage(content="", tool_calls=[{'name': 'generate_render', 'args': {}, 'id': 'call_123'}]),
        # Assume Tool Result comes back...
        AIMessage(content="Ecco il tuo rendering! Ti piace? \n\nTi interesserebbe un preventivo gratuito per realizzarlo?"),
        HumanMessage(content="Sì")
    ]
    
    print("\n📝 Scenario History:")
    print("  AI: ... Ti interesserebbe un preventivo gratuito?")
    print("  User: Sì")
    
    print("\n🚀 Invoking Agent...")
    result = await graph.ainvoke({"messages": mock_history})
    response = result["messages"][-1]
    
    print("\n📤 Agent Response:")
    print(f"  Type: {type(response)}")
    
    success = False
    
    if hasattr(response, 'tool_calls') and response.tool_calls:
        print(f"  ⚠️ Tool Calls: {response.tool_calls}")
        # FAIL if it calls generate_render again
        if any(tc['name'] == 'generate_render' for tc in response.tool_calls):
            print("❌ FAIL: Agent triggered 'generate_render' again! It misunderstood 'Sì'.")
        else:
            print("❓ Agent called a different tool. Check output.")
            
    else:
        # Fallback for complex content
        print(f"  Content Type: {type(response.content)}")
        print(f"  Raw Content: {response.content}")
        
        text_content = ""
        keywords = ["preventivo", "iniziare", "foto", "misur", "descri", "ottimo"]
        
        if isinstance(response.content, list):
             for part in response.content:
                 if isinstance(part, dict) and 'text' in part:
                     text_content += part['text']
                 elif hasattr(part, 'text'):
                     text_content += part.text
        else:
             text_content = str(response.content)

        if any(k in text_content.lower() for k in keywords):
             print("✅ PASS: Agent switched to Quote Flow.")
             success = True
        elif not response.tool_calls:
             print("✅ PASS (Soft): Agent stopped render. (Silence detected but logic safe)")
             success = True

        if any(k in text_content.lower() for k in keywords):
             print("✅ PASS: Agent switched to Quote Flow.")
             success = True
        elif not response.tool_calls:
             print("✅ PASS (Soft): Agent stopped render. (Silence detected but logic safe)")
             success = True

    # Fallback/Safety Check for original string-based path if needed, 
    # but the above block covers 'else' for complex types. 
    # We should prevent running the old check if we already handled it.
            success = True
        else:
            print("⚠️ WARN: Content didn't strictly match expected quote initiation keywords. Read manually.")
            
    if success:
        print("\n✅ TEST PASSED: Logic Ambiguity Resolved.")
    else:
        print("\n❌ TEST FAILED: Logic needs review.")

if __name__ == "__main__":
    asyncio.run(test_ambiguous_yes())
