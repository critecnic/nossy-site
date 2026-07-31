import re

filepath = "/home/z/my-project/src/app/api/jobs/route.ts"
with open(filepath, "r") as f:
    content = f.read()

# Fix: add comma after contactEmail line when followed by paywall
content = re.sub(
    r'(contactEmail: "[^"]*")\s*\n(\s+paywall:)',
    r'\1,\n\2',
    content
)

with open(filepath, "w") as f:
    f.write(content)

print("Fixed commas before paywall fields.")
