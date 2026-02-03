import sys
import logging
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VERIFY_ORCHESTRATOR")

async def verify_orchestrator():
    try:
        logger.info("Importing AgentOrchestrator...")
        from src.services.agent_orchestrator import AgentOrchestrator
        from src.repositories.conversation_repository import ConversationRepository
        
        logger.info("Instantiating Repository...")
        repo = ConversationRepository()
        
        logger.info("Instantiating Orchestrator...")
        orchestrator = AgentOrchestrator(repo)
        
        logger.info("✅ AgentOrchestrator instantiated successfully.")
        assert hasattr(orchestrator, "stream_chat"), "Missing stream_chat method"
        
    except ImportError as e:
        logger.error(f"❌ ImportError: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Error verifying Orchestrator: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(verify_orchestrator())
