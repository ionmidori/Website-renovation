import re
import json
import logging
from typing import List, Any
from langchain_core.messages import ToolMessage
from src.graph.state import AgentState
from src.prompts.system_prompts import SystemPrompts

logger = logging.getLogger(__name__)

class ContextBuilder:
    """
    Responsible for constructing the final System Prompt by combining:
    1. Static Base Instruction (Persona, Tools, Rules)
    2. Dynamic Context (Auth, Project, Media)
    3. System Status (Loop Guard, Last Tool Execution)
    """

    @staticmethod
    def build_system_prompt(state: AgentState) -> str:
        """
        Dynamically assembles the authoritative system prompt.
        """
        # Supports future A/B testing via state['prompt_version'] if needed
        base_instruction = SystemPrompts.get_instruction("default")
        
        # 1. Media Context
        media_context = ContextBuilder._build_media_context(state)
        
        # 2. Project/Auth Context
        project_context = ContextBuilder._build_project_context(state)
        
        # 3. System Status (Loop Guard)
        system_status = ContextBuilder._build_system_status(state)
        
        # Assemble
        final_prompt = f"{base_instruction}\n\n{media_context}\n\n{project_context}\n\n{system_status}"
        return final_prompt.strip()

    @staticmethod
    def _build_media_context(state: AgentState) -> str:
        messages = state["messages"]
        found_images = []
        
        # Robust image scanning (Reverse order to find latest)
        for msg in reversed(messages):
            if hasattr(msg, 'content') and isinstance(msg.content, str):
                matches = re.findall(r'\[(?:Immagine|Video) allegat[oa]: (https?://[^\]]+)\]', msg.content)
                found_images.extend(matches)
            elif hasattr(msg, 'content') and isinstance(msg.content, list):
                for part in msg.content:
                   if isinstance(part, dict):
                       if part.get("type") == "image_url":
                           url_data = part.get("image_url")
                           if isinstance(url_data, dict): found_images.append(url_data.get("url"))
                           else: found_images.append(url_data)
                       elif part.get("type") == "file_data": 
                           # Handle native file URIs if needed in context
                           pass
            if found_images: break
            
        if found_images:
            return f"[[ACTIVE CONTEXT]]\nLAST_UPLOADED_IMAGE_URL=\"{found_images[-1]}\"\nAVAILABLE_IMAGES={json.dumps(found_images)}"
        return ""

    @staticmethod
    def _build_project_context(state: AgentState) -> str:
        session_id = state.get('session_id', 'unknown')
        is_authenticated = str(state.get('is_authenticated', False)).upper()
        return f"[[PROJECT CONTEXT]]\nSession ID: {session_id}\nIS_AUTHENTICATED={is_authenticated}"

    @staticmethod
    def _build_system_status(state: AgentState) -> str:
        messages = state["messages"]
        last_message = messages[-1] if messages else None
        
        if isinstance(last_message, ToolMessage):
            return (
                f"[[SYSTEM STATUS]]\n"
                f"LAST_TOOL_EXECUTED: {last_message.name}\n"
                f"STATUS: SUCCESS\n"
                f"CRITICAL INSTRUCTION: You have just completed {last_message.name}. "
                f"Do NOT call it again with the same parameters. Move immediately to examining the output or answering the user."
            )
        return ""
