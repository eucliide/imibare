#!/bin/bash

# Generate tasteful icons for all three projects

SKILL_DIR="$HOME/.kiro/skills/tasteful-icons"
SPEC_FILE="icons-spec.json"
OUTPUT_DIR="icons-output"

# Generate the icons
python3 "$SKILL_DIR/scripts/tasteful_icons.py" build "$OUTPUT_DIR" --spec "$SPEC_FILE" --sizes 1024,512,128

echo "✓ Icons generated in $OUTPUT_DIR"
echo ""
echo "Icon files created:"
ls -lh "$OUTPUT_DIR/svg/"
echo ""
echo "Preview created: $OUTPUT_DIR/preview.png"
