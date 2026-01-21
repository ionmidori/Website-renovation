from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """State for the conversational AI agent."""
    messages: Annotated[Sequence[BaseMessage], add_messages]
    session_id: str
    user_id: str
    
    # 🧠 Deterministic State Tracking
    phase: str          # "TRIAGE", "DESIGN", "QUOTE", "COMPLETE"
    active_image_url: str  # URL being analyzed/modified
    generated_render_url: str # Last render URL (to prevent duplicates)
    quote_data: dict    # Partial quote data collected
