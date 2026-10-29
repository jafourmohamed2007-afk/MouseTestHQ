#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RESTORE Amazon affiliate links + buy buttons.
Run:  python restore_affiliate.py
Extracts the saved snapshot (pre-removal state) back over the site.
"""
import zipfile
import sys
import shutil
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(r'C:\Users\Bra3b\.minimax\sessions\mvs_be568df763c74eddb03a13d7fe50bcaa\workspace\mousetesthq')
SNAP = ROOT / 'affiliate_backup_with_links.zip'

if not SNAP.exists():
    print('ERROR: snapshot not found ->', SNAP.name)
    sys.exit(1)

print(f'Restoring from {SNAP.name} ...')
count = 0
with zipfile.ZipFile(SNAP, 'r') as z:
    for member in z.namelist():
        if member.endswith('/') or not member.endswith('.html'):
            continue
        target = ROOT / member
        target.parent.mkdir(parents=True, exist_ok=True)
        with z.open(member) as src, open(target, 'wb') as dst:
            shutil.copyfileobj(src, dst)
        count += 1

print(f'Restored {count} HTML files with affiliate links.')
print('')
print('Next steps:')
print('  1. git add -A')
print('  2. git commit -m "Restore Amazon affiliate links"')
print('  3. git push origin main')
print('')
print('Links: verify with  grep -r "amazon.com/s?k=" . | wc -l')
