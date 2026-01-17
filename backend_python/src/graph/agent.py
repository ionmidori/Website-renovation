import os
import logging
from typing import Any, Dict
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from src.graph.state import AgentState
from src.tools.submit_lead import SUBMIT_LEAD_TOOL_DEF
from src.tools.market_prices import MARKET_PRICES_TOOL_DEF
from src.tools.generate_render import generate_render_wrapper, GENERATE_RENDER_TOOL_DEF
from src.prompts.system_instruction import SYSTEM_INSTRUCTION

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    google_api_key=GEMINI_API_KEY,
    temperature=0.7,
)

# Create LangChain Tools from our wrappers
# Note: LangChain tools expect synchronous functions, we'll need to adapt
from langchain_core.tools import StructuredTool

# For now, we'll use the tool definitions directly
# In production, we'll need to properly bind these as LangChain tools

def create_agent_graph():
    """Create LangGraph StateGraph with Gemini LLM and tools."""
    
    # Define the agent node
    def agent_node(state: AgentState) -> Dict[str, Any]:
        """Run the agent with current state."""
        messages = state["messages"]
        
        # Add system instruction to first message if not present
        if not any(isinstance(msg, SystemMessage) for msg in messages):
            messages = [SystemMessage(content=SYSTEM_INSTRUCTION)] + list(messages)
        
        # Invoke LLM
        response = llm.invoke(messages)
        
        return {"messages": [response]}
    
    # Build graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("agent", agent_node)
    
    # Set entry point
    workflow.set_entry_point("agent")
    
    # Add conditional edges (will expand with tool routing)
    workflow.add_edge("agent", END)
    
    # Compile graph
    return workflow.compile()

# Export compiled graph
agent_graph = create_agent_graph()
