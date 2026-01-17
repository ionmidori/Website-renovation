from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
from typing import Optional
from src.api.gemini_imagen import generate_image_t2i
from src.storage.upload import upload_base64_image

class GenerateRenderInput(BaseModel):
    """Input schema for generate_render tool."""
    prompt: str = Field(
        ..., 
        description="Detailed description of the interior design to generate (e.g., 'Modern kitchen with white cabinets and marble countertops')"
    )
    room_type: str = Field(
        ..., 
        description="Type of room (e.g., 'kitchen', 'living room', 'bathroom')"
    )
    style: str = Field(
        ..., 
        description="Design style (e.g., 'modern', 'industrial', 'minimalist')"
    )
    structural_elements: Optional[str] = Field(
        None,
        description="Structural elements to include (e.g., 'arched windows, wooden beams')"
    )

async def generate_render_wrapper(
    prompt: str,
    room_type: str,
    style: str,
    session_id: str,
    structural_elements: Optional[str] = None
) -> str:
    """
    Generate a photorealistic interior design rendering from text description.
    This creates a brand new design visualization (Text-to-Image mode).
    """
    try:
        # Build enhanced prompt
        full_prompt = f"{style} style {room_type}. {prompt}"
        if structural_elements:
            full_prompt = f"{structural_elements}. {full_prompt}"
        
        negative_prompt = "low quality, blurry, distorted, unrealistic, cartoon, sketch"
        
        # Generate image
        result = await generate_image_t2i(
            prompt=full_prompt,
            negative_prompt=negative_prompt
        )
        
        if not result["success"]:
            return "Failed to generate image. Please try again."
        
        # Upload to Firebase Storage
        image_url = upload_base64_image(
            base64_data=f"data:{result['mime_type']};base64,{result['image_base64']}",
            session_id=session_id,
            prefix="renders"
        )
        
        return f"✅ Rendering generated successfully!\n\n![Generated Design]({image_url})\n\nWhat do you think of this design?"
        
    except Exception as e:
        return f"Error generating render: {str(e)}"

# Tool definition
GENERATE_RENDER_TOOL_DEF = {
    "name": "generate_render",
    "description": "Generate a photorealistic interior design rendering based on text description.",
    "args_schema": GenerateRenderInput
}
