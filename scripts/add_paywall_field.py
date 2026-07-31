import re

filepath = "/home/z/my-project/src/app/api/jobs/route.ts"
with open(filepath, "r") as f:
    content = f.read()

# Add paywall field to the Job interface
content = content.replace(
    "  contactEmail: string;\n}",
    "  contactEmail: string;\n  paywall: boolean;\n}"
)

# Now add paywall: true/false to each job object
# We'll add it after contactEmail line in each job entry
# Strategy: find pattern 'contactEmail: "..."' and append ',\n    paywall: true/false'

lines = content.split('\n')
new_lines = []
job_counter = 0

for i, line in enumerate(lines):
    new_lines.append(line)
    # Detect contactEmail line inside a job object (indented)
    if line.strip().startswith('contactEmail:') and line.strip().endswith('"'):
        # Determine if this job should have paywall
        # Alternate: odd jobs get paywall, even don't (admin chooses)
        job_counter += 1
        if job_counter % 2 == 1:
            new_lines.append('    paywall: true,')
        else:
            new_lines.append('    paywall: false,')

content = '\n'.join(new_lines)

with open(filepath, "w") as f:
    f.write(content)

print(f"Done. Added paywall field to {job_counter} jobs.")
