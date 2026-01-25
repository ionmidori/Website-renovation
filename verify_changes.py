
import sys
import os

# Add src to path
sys.path.append(os.path.join(os.getcwd(), 'backend_python'))

print("Checking imports...")
try:
    from src.utils.download import download_image_smart
    print("✅ src.utils.download imported successfully")
except Exception as e:
    print(f"❌ Failed to import src.utils.download: {e}")
    sys.exit(1)

try:
    from src.tools.sync_wrappers import analyze_room_sync, plan_renovation_sync
    print("✅ src.tools.sync_wrappers imported successfully")
except Exception as e:
    print(f"❌ Failed to import src.tools.sync_wrappers: {e}")
    sys.exit(1)

try:
    from src.tools.generate_render import generate_render_wrapper
    print("✅ src.tools.generate_render imported successfully")
except Exception as e:
    print(f"❌ Failed to import src.tools.generate_render: {e}")
    sys.exit(1)

print("🎉 All syntax checks passed!")
