
import asyncio
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))
sys.path.append(os.path.dirname(__file__))

from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from src.graph.agent import get_agent_graph
from dotenv import load_dotenv

load_dotenv()

# Map GEMINI_API_KEY to GOOGLE_API_KEY for LangChain
if os.getenv("GEMINI_API_KEY") and not os.getenv("GOOGLE_API_KEY"):
    os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY")

async def test_quote_to_render_transition():
    print("🧪 TEST: Quote -> Render Transition Context")
    print("=========================================")

    # 1. Initialize Graph
    graph = get_agent_graph()
    
    # 2. Mock History: User uploaded a photo, got a quote for "Modern Walls", but kept the floor.
    # We simulate that 'submit_lead' was just called.
    
    mock_history = [
        HumanMessage(content="Ciao, voglio un preventivo per ristrutturare la mia cucina. [Immagine allegata: https://example.com/photo.jpg]"),
        AIMessage(content="Certamente. Cosa vuoi cambiare?"),
        HumanMessage(content="Voglio pareti moderne grigie e un nuovo piano cottura. Il pavimento in cotto lo tengo."),
        AIMessage(content="Perfetto. Calcolo il preventivo..."),
        AIMessage(content="", tool_calls=[{'name': 'submit_lead', 'args': {'name': 'Mario', 'email': 'm@test.com'}, 'id': 'call_123'}]),
        ToolMessage(content="Lead saved successfully", tool_call_id='call_123'),
        AIMessage(content="Dati salvati! Vuoi vedere un'anteprima realistica del progetto?"),
        HumanMessage(content="Sì, dai procedi.")
    ]
    
    print(f"📥 Input: User accepted render offer after quote.")
    
    # 3. Invoke Agent
    # The System Prompt should trigger "Quote_to_Render_Transition" scenario
    result = await graph.ainvoke({"messages": mock_history})
    
    last_message = result["messages"][-1]
    
    print("\n📤 Agent Response:")
    print(f"Type: {type(last_message)}")
    print(f"Content: {last_message.content}")
    
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        print("\n🔧 Tool Calls:")
        for tc in last_message.tool_calls:
            print(f"- Name: {tc['name']}")
            print(f"- Args: {tc['args']}")
            
            # Validation
            if tc['name'] == 'generate_render':
                args = tc['args']
                print("\n✅ VALIDATION:")
                
                # Check 1: Source Image
                if args.get('source_image_url') == "https://example.com/photo.jpg":
                    print("  [Pass] Used original photo URL")
                else:
                    print(f"  [FAIL] Wrong URL: {args.get('source_image_url')}")
                
                # Check 2: Modification Mode
                if args.get('mode') == "modification":
                    print("  [Pass] Mode is 'modification'")
                else:
                    print(f"  [FAIL] Mode is {args.get('mode')}")
                    
                # Check 3: Keep Elements (Floor should be kept)
                keep = args.get('keep_elements', [])
                # The arg might be 'keep_elements' (list)
                print(f"  [Info] Keep Elements: {keep}")
                if any("pavimento" in k.lower() or "floor" in k.lower() or "cotto" in k.lower() for k in keep):
                     print("  [Pass] Kept the floor")
                else:
                     print("  [WARN] Floor not explicitly in keep_elements (might be in prompt)")

if __name__ == "__main__":
    asyncio.run(test_quote_to_render_transition())
