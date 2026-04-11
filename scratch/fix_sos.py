
import os

file_path = "App.tsx"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific block in the receiver modal
old_block_1 = """                              localStorage.removeItem(alert.key);
                              setReceivedSosAlerts(prev => prev.filter(a => a.key !== alert.key));
                              window.dispatchEvent(new Event('local-storage-update'));"""
new_block_1 = "                              setShowSosAlertModal(false);"

# Replace the "Tutup Semua Peringatan" button logic
old_block_2 = """                        onClick={() => {
                            receivedSosAlerts.forEach(a => localStorage.removeItem(a.key));
                            setReceivedSosAlerts([]);
                            window.dispatchEvent(new Event('local-storage-update'));
                        }}"""
new_block_2 = """                        onClick={() => {
                            setShowSosAlertModal(false);
                        }}"""

content = content.replace(old_block_1, new_block_1)
content = content.replace(old_block_2, new_block_2)

# Also fix the button text
content = content.replace('Tutup Semua Peringatan', 'Tutup Panel Darurat')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement successful")
