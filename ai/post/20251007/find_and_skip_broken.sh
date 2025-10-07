#!/bin/bash

cd "D:/app/zsp/zshipu-blog-gen/ai"

# Test each file and move broken ones
while true; do
    # Run hugo and capture error
    error_file=$(timeout 3 hugo server 2>&1 | grep "failed to unmarshal YAML" | head -1 | sed -n 's/.*"\([^"]*\)".*/\1/p')

    if [ -z "$error_file" ]; then
        echo "No more YAML errors found!"
        break
    fi

    if [ -f "$error_file" ]; then
        echo "Skipping: $error_file"
        mv "$error_file" "$error_file.skip"
    else
        echo "File not found: $error_file"
        break
    fi
done

echo "Done! Testing final result..."
timeout 5 hugo server 2>&1 | grep -E "(Built|Error|Web Server)" | head -3
