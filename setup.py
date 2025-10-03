import os
from pathlib import Path

# Define your project structure
structure = {
    "backend": {
        "api": {},
        "rag": {},
        "utils": {},
        "main.py": None
    },
    "frontend": {},
    "ingest": {},
    "docs": {},
    "requirements.txt": None,
    "Dockerfile": None,
    ".env.example": None,
    "README.md": None,
    ".gitignore": None,
}

def create_structure(base_path, struct):
    for name, content in struct.items():
        path = Path(base_path) / name
        if content is None:  
            # Create file
            path.touch(exist_ok=True)
            print(f"Created file: {path}")
        else:
            # Create directory
            path.mkdir(parents=True, exist_ok=True)
            print(f"Created directory: {path}")
            create_structure(path, content)  # Recurse inside

if __name__ == "__main__":
    project_root = Path(".")  # current directory
    create_structure(project_root, structure)
    print("\n✅ Project structure created successfully.")
