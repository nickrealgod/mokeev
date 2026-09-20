"""List exact duplicate images; --apply rewrites site references before removing copies."""
from pathlib import Path
import hashlib
import json
import sys

root = Path(__file__).resolve().parent.parent / 'dist'
groups = {}
for asset in sorted((root / 'assets').rglob('*')):
    if asset.suffix.lower() in {'.png', '.webp', '.jpg', '.jpeg', '.svg'}:
        groups.setdefault(hashlib.sha256(asset.read_bytes()).hexdigest(), []).append(asset)
replacements = []
for digest, paths in groups.items():
    if len(paths) < 2:
        continue
    paths.sort(key=lambda p: (len(p.name), p.as_posix()))
    original = paths[0]
    for duplicate in paths[1:]:
        replacements.append({'original': str(original.relative_to(root)), 'duplicate': str(duplicate.relative_to(root)), 'sha256': digest, 'bytes': duplicate.stat().st_size})
print(json.dumps(replacements, indent=2))
print('Duplicate bytes:', sum(entry['bytes'] for entry in replacements))
if '--apply' in sys.argv:
    texts = [p for p in root.rglob('*') if p.suffix in {'.js', '.css', '.html', '.json'}]
    for text in texts:
        content = text.read_text()
        updated = content
        for entry in replacements:
            updated = updated.replace(entry['duplicate'], entry['original'])
        if updated != content:
            text.write_text(updated)
    for entry in replacements:
        duplicate, original = root / entry['duplicate'], root / entry['original']
        assert duplicate.read_bytes() == original.read_bytes(), 'Asset changed during deduplication'
        assert not any(entry['duplicate'] in text.read_text() for text in texts), 'Reference still exists'
        duplicate.unlink()
