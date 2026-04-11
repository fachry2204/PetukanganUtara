
import os
import re

file_path = "App.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_until = None

for i, line in enumerate(lines):
    if skip_until and i < skip_until:
        continue
    
    # Target 1: Inside the map alert loop
    if "localStorage.removeItem(alert.key);" in line and "receivedSosAlerts.map" in "".join(lines[max(0, i-20):i]):
        # We found the problematic block.
        # Find the start of the onClick and rewrite it
        # Actually it's easier to just find the exact lines since I know them
        pass # Handle below

    new_lines.append(line)

# Let's try re.sub for a more reliable match
content = "".join(lines)

# Modal button fix
content = re.sub(
    r"localStorage\.removeItem\(alert\.key\);\s*setReceivedSosAlerts\(prev => prev\.filter\(a => a\.key !== alert\.key\)\);\s*window\.dispatchEvent\(new Event\('local-storage-update'\)\);",
    "setShowSosAlertModal(false);",
    content
)

# Bottom button fix
content = re.sub(
    r"receivedSosAlerts\.forEach\(a => localStorage\.removeItem\(a\.key\)\);\s*setReceivedSosAlerts\(\[\]\);\s*window\.dispatchEvent\(new Event\('local-storage-update'\)\);",
    "setShowSosAlertModal(false);",
    content
)

content = content.replace("Detail</span>", "Peta</span>")
content = content.replace("Tutup Semua Peringatan", "Tutup Panel")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
