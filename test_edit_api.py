import asyncio
import httpx
import sys

async def main():
    base_url = "http://localhost:8000"
    
    # 1. Start by getting a meeting ID (or assume there are none yet)
    async with httpx.AsyncClient() as client:
        try:
            r = await client.get(f"{base_url}/meetings")
            meetings = r.json()
            if not meetings:
                print("No meetings in the DB to test edit. Skipping end-to-end edit test.")
                return
            
            target_id = meetings[0]["id"]
            
            # Fetch full
            r2 = await client.get(f"{base_url}/meetings/{target_id}")
            meeting_detail = r2.json()
            old_segments = meeting_detail.get("transcript", [])
            
            if not old_segments:
                print(f"Meeting {target_id} has no transcript to edit.")
                return

            # Simulate edit
            new_segments = old_segments.copy()
            new_segments[0]["speaker"] = "SPEAKER_EDIT_TEST"
            
            r3 = await client.patch(
                f"{base_url}/meetings/{target_id}",
                json={"segments": new_segments}
            )

            if r3.status_code == 200:
                print(f"Successfully patched meeting {target_id}")
            else:
                print(f"Failed to patch meeting: {r3.status_code} {r3.text}")
                
        except Exception as e:
            print(f"Could not connect to backend to test API: {e}")

if __name__ == "__main__":
    asyncio.run(main())
