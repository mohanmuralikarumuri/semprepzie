export const programsData = {
  "subjects": {
    "data-structures": {
      "title": "Data Structures",
      "description": "Learn fundamental data structures with hands-on programming",
      "icon": "🗃️",
      "categories": {
        "arrays": {
          "title": "Arrays",
          "programs": [
            {
              "id": "array-basic",
              "title": "Array Basic Operations",
              "description": "Learn basic array operations like insertion, deletion, and traversal",
              "language": "c" as const,
              "difficulty": "beginner" as const,
              "estimatedTime": "15 min",
              "code": "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int arr[10] = {1, 2, 3, 4, 5};\n    int size = 5;\n    \n    printf(\"Original Array: \");\n    for(int i = 0; i < size; i++) {\n        printf(\"%d \", arr[i]);\n    }\n    printf(\"\\n\");\n    \n    // Insert element at position\n    int pos = 2, element = 99;\n    for(int i = size; i > pos; i--) {\n        arr[i] = arr[i-1];\n    }\n    arr[pos] = element;\n    size++;\n    \n    printf(\"After insertion: \");\n    for(int i = 0; i < size; i++) {\n        printf(\"%d \", arr[i]);\n    }\n    printf(\"\\n\");\n    \n    return 0;\n}",
              "expectedOutput": "Original Array: 1 2 3 4 5 \\nAfter insertion: 1 2 99 3 4 5",
              "concepts": ["arrays", "insertion", "traversal"]
            },
            {
              "id": "array-search",
              "title": "Linear Search in Array",
              "description": "Implement linear search algorithm",
              "language": "python" as const,
              "difficulty": "beginner" as const,
              "estimatedTime": "10 min",
              "code": "def linear_search(arr, target):\n    \"\"\"Linear search implementation\"\"\"\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1\n\n# Test the function\narr = [64, 34, 25, 12, 22, 11, 90]\ntarget = 22\n\nprint(f\"Array: {arr}\")\nprint(f\"Searching for: {target}\")\n\nresult = linear_search(arr, target)\nif result != -1:\n    print(f\"Element {target} found at index {result}\")\nelse:\n    print(f\"Element {target} not found\")\n\n# Search for another element\ntarget2 = 100\nresult2 = linear_search(arr, target2)\nif result2 != -1:\n    print(f\"Element {target2} found at index {result2}\")\nelse:\n    print(f\"Element {target2} not found\")",
              "expectedOutput": "Array: [64, 34, 25, 12, 22, 11, 90]\\nSearching for: 22\\nElement 22 found at index 4\\nElement 100 not found",
              "concepts": ["searching", "linear search", "algorithms"]
            }
          ]
        }
      }
    }
  }
};
