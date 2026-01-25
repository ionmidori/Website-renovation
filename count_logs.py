import subprocess
import json
import datetime

def count_logs():
    cmd = [
        "gcloud", "logging", "read",
        'resource.labels.service_name="syd-brain" AND textPayload:"Generating I2I image"',
        "--project=chatbotluca-a8a73",
        "--limit=200",
        "--format=json(timestamp)"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        logs = json.loads(result.stdout)
        
        count = 0
        target_date = "2026-01-24"
        
        for log in logs:
            ts = log.get("timestamp", "")
            if ts.startswith(target_date):
                count += 1
                
        print(f"COUNT_JAN_24: {count}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    count_logs()
