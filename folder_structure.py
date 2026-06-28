"""
folder_structure.py
Run from your project root OR pass the path as an argument:
    python folder_structure.py
    python folder_structure.py C:/Users/Bhavya/.../digital-wardrobe-ai-stylist

Generates structure.txt in the same folder as this script.
Excludes: node_modules, .next, .firebase, __pycache__, .git, lib (compiled),
          package-lock.json, yarn.lock, *.lock files
"""

import os
import sys
import pathlib

IGNORE_DIRS  = {"node_modules", ".next", ".firebase", "__pycache__", ".git", "lib"}
IGNORE_FILES = {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}

def build_tree(root: pathlib.Path, prefix: str = "") -> list:
    lines = []
    try:
        entries = sorted(root.iterdir(), key=lambda e: (e.is_file(), e.name.lower()))
    except PermissionError:
        return lines

    entries = [e for e in entries if e.name not in IGNORE_DIRS and e.name not in IGNORE_FILES]

    for i, entry in enumerate(entries):
        connector = "└── " if i == len(entries) - 1 else "├── "
        lines.append(f"{prefix}{connector}{entry.name}")
        if entry.is_dir():
            extension = "    " if i == len(entries) - 1 else "│   "
            lines.extend(build_tree(entry, prefix + extension))

    return lines

def main():
    if len(sys.argv) > 1:
        root = pathlib.Path(sys.argv[1]).resolve()
    else:
        root = pathlib.Path.cwd()

    if not root.exists():
        print(f"Error: path does not exist: {root}")
        sys.exit(1)

    print(f"Scanning: {root}\n")
    tree_lines = [root.name + "/"] + build_tree(root)
    output = "\n".join(tree_lines)

    # Save structure.txt next to this script
    script_dir = pathlib.Path(__file__).parent
    out_path = script_dir / "structure.txt"
    out_path.write_text(output, encoding="utf-8")

    print(output)
    print(f"\n✅ Saved to: {out_path}")

if __name__ == "__main__":
    main()