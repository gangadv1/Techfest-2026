import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Optional
from app.models.roadmap import StateData, UserState

# Import file locking library based on OS
if sys.platform == "win32":
    import msvcrt
else:
    import fcntl

STATE_FILE = Path(__file__).parent.parent.parent / "data" / "state.json"

def _ensure_state_file():
    """Ensure state.json exists."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        with open(STATE_FILE, 'w') as f:
            json.dump({"users": {}}, f)

def _lock_file(f, exclusive=False):
    """Lock file - works on Windows and Unix."""
    if sys.platform == "win32":
        # Windows file locking
        msvcrt.locking(f.fileno(), msvcrt.LK_LOCK if exclusive else msvcrt.LK_NBLCK, 1)
    else:
        # Unix file locking
        fcntl.flock(f.fileno(), fcntl.LOCK_EX if exclusive else fcntl.LOCK_SH)

def _unlock_file(f):
    """Unlock file - works on Windows and Unix."""
    if sys.platform == "win32":
        msvcrt.locking(f.fileno(), msvcrt.LK_UNLCK, 1)
    else:
        fcntl.flock(f.fileno(), fcntl.LOCK_UN)

def read_state() -> StateData:
    """Read state.json with file locking."""
    _ensure_state_file()
    
    with open(STATE_FILE, 'r') as f:
        try:
            _lock_file(f, exclusive=False)
            data = json.load(f)
            return StateData(**data)
        finally:
            _unlock_file(f)

def write_state(state: StateData):
    """Write state.json with file locking."""
    _ensure_state_file()
    
    with open(STATE_FILE, 'w') as f:
        try:
            _lock_file(f, exclusive=True)
            json.dump(state.dict(), f, indent=2)
        finally:
            _unlock_file(f)

def get_user_state(user_id: str) -> UserState:
    """Get state for a user."""
    state = read_state()
    if user_id not in state.users:
        return UserState(
            userId=user_id,
            currentStreak=0,
            longestStreak=0,
            lastCheckin=None,
            totalCheckins=0
        )
    return state.users[user_id]

def update_user_state(user_id: str, user_state: UserState):
    """Update state for a user."""
    state = read_state()
    state.users[user_id] = user_state
    write_state(state)

def checkin(user_id: str) -> UserState:
    """
    Check in for today. Updates streak logic:
    - If last checkin was yesterday, increment streak
    - If last checkin was today, no change
    - Otherwise, reset streak to 1
    """
    user_state = get_user_state(user_id)
    today = datetime.now().date().isoformat()
    
    if user_state.lastCheckin == today:
        # Already checked in today
        return user_state
    
    # Parse last checkin date
    if user_state.lastCheckin:
        last_date = datetime.fromisoformat(user_state.lastCheckin).date()
        today_date = datetime.now().date()
        days_diff = (today_date - last_date).days
        
        if days_diff == 1:
            # Yesterday - increment streak
            user_state.currentStreak += 1
        else:
            # Gap - reset streak
            user_state.currentStreak = 1
    else:
        # First checkin
        user_state.currentStreak = 1
    
    # Update longest streak
    if user_state.currentStreak > user_state.longestStreak:
        user_state.longestStreak = user_state.currentStreak
    
    user_state.lastCheckin = today
    user_state.totalCheckins += 1
    
    update_user_state(user_id, user_state)
    return user_state
