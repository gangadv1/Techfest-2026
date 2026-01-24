"""
Test script for the plan generation endpoint.

Run this after starting the backend server:
python -m uvicorn app.main:app --reload --port 8000

Then in another terminal:
python backend/test_plan.py
"""
import requests
import json

API_URL = "http://localhost:8000/api/plan/generate"

def test_plan_generation():
    """Test the plan generation endpoint."""
    
    payload = {
        "userId": "demo",
        "pathId": "full-stack",
        "hoursPerDay": 1.0,
        "daysPerWeek": 5,
        "days": 7,
        "maxNodes": 10
    }
    
    print("Testing POST /api/plan/generate")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    print("\nSending request...")
    
    try:
        response = requests.post(API_URL, json=payload, timeout=60)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ Success! Plan generated:")
            print(json.dumps(data, indent=2))
            
            # Print summary
            print("\n📊 Summary:")
            print(f"Total days: {data['estimate']['totalDaysGenerated']}")
            print(f"Total minutes: {data['estimate']['totalMinutesPlanned']}")
            print(f"Minutes per day: {data['estimate']['minutesPerDay']}")
            print(f"\nDaily breakdown:")
            for day in data['plan']:
                print(f"  Day {day['day']}: {day['title']} - {day['totalMinutes']} min ({len(day['items'])} tasks)")
        else:
            print(f"\n❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to server. Is it running?")
        print("Start server with: python -m uvicorn app.main:app --reload --port 8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    test_plan_generation()
