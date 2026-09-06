#!/usr/bin/env python3
"""
Dynamic Security & GitHub Activity Updater (Python Version)
Author: DntdToM
Focus: Malware Research & Threat Detection Engineering
"""

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone, timedelta

USERNAME = "DntdToM"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
README_PATH = os.path.join(SCRIPT_DIR, "..", "README.md")

def fetch_json(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "DntdToM-Security-Bot",
            "Accept": "application/vnd.github.v3+json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            if 200 <= response.status < 300:
                return json.loads(response.read().decode("utf-8"))
    except Exception as e:
        print(f"[!] Warning fetching {url}: {e}", file=sys.stderr)
    return None

def get_vietnam_time():
    utc_now = datetime.now(timezone.utc)
    vn_time = utc_now + timedelta(hours=7)
    return vn_time.strftime("%Y-%m-%d %H:%M:%S (UTC+7)")

def update_readme():
    print(f"[+] Initializing Security Telemetry synchronization for @{USERNAME}...")

    profile = fetch_json(f"https://api.github.com/users/{USERNAME}")
    repos = fetch_json(f"https://api.github.com/users/{USERNAME}/repos?per_page=100&sort=updated")

    public_repos = profile.get("public_repos", "Active") if profile else "Active"
    followers = profile.get("followers", "0") if profile else "0"

    total_stars = 0
    top_repo = "Malware-Analysis-Lab"
    top_stars = 0

    if isinstance(repos, list):
        for repo in repos:
            stars = repo.get("stargazers_count", 0)
            total_stars += stars
            if stars >= top_stars and not repo.get("fork", False):
                top_stars = stars
                top_repo = repo.get("name", top_repo)

    timestamp = get_vietnam_time()

    terminal_block = f"""```bash
┌──(root㉿dntdtom)-[~/threat-radar]
└─# ./check_telemetry.sh --verbose

[+] CONNECTION STATUS   : [ENCRYPTED // TLSv1.3]
[+] TARGET NODE         : github.com/{USERNAME}
[+] RESEARCH DOMAIN     : Malware Analysis, Reverse Engineering & Detection
[+] TELEMETRY TIMESTAMP : {timestamp}
[+] LAB METRICS:
    ├── Public Arsenals : {public_repos} repositories
    ├── Network Stars   : {total_stars} ★
    ├── Watcher Nodes   : {followers} operators
    └── Prime Vector    : {top_repo}
[+] LAB SANDBOX HEALTH  : ALL CONTAINERS HEALTHY (0 ESCAPES DETECTED)
[+] SYSTEM CLEARANCE    : LEVEL-4 RESEARCH ACCESS GRANTED
```"""

    if not os.path.exists(README_PATH):
        print(f"[-] Error: {README_PATH} not found", file=sys.stderr)
        return

    with open(README_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    start_marker = "<!-- SECURITY_FEED:START -->"
    end_marker = "<!-- SECURITY_FEED:END -->"

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print(f"[!] Markers {start_marker} and {end_marker} not found", file=sys.stderr)
        return

    new_content = (
        content[: start_idx + len(start_marker)]
        + "\n"
        + terminal_block
        + "\n"
        + content[end_idx:]
    )

    with open(README_PATH, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("[+] Successfully synced README.md with live telemetry data!")

if __name__ == "__main__":
    update_readme()
