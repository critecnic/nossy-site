"""
Clean job data: remove Remote.com, spam/aggregator listings, and external references.
"""
import json
import os

data_dir = "/home/z/my-project/public/data"
output_dir = "/home/z/my-project/download/nossy-github/public/data"
os.makedirs(output_dir, exist_ok=True)

# Also update the nossy-github copy
src_data_dir = "/home/z/my-project/download/nossy-github/public/data"
os.makedirs(src_data_dir, exist_ok=True)

def is_spam(job):
    """Check if a job listing is spam/aggregator/fake."""
    company = job.get('company', '')
    title = job.get('title', '').lower()
    
    # Remove Remote.com
    if company == 'Remote.com':
        return True
    
    # Remove Jobgether and similar aggregators
    if company in ('Jobgether', 'jobgether.com'):
        return True
    
    # Remove by company URL patterns (external job boards)
    company_url = job.get('companyUrl', '')
    spam_domains = ['jobgether.com', 'remotive.com', 'arbeitnow.co.uk', 'remoterocketship.com',
                    'impactfund.org', 'lawclerk.legal']
    if any(d in company_url for d in spam_domains):
        return True
    
    # Remove by title patterns (aggregator-style titles)
    spam_title_patterns = [
        'find remote', 'careers |', 'jobs worldwide', 'jobs now',
        'best platforms', 'where are the', 'open positions',
        'top companies hiring', 'hiring now'
    ]
    for pattern in spam_title_patterns:
        if pattern in title:
            return True
    
    # Remove non-job entries (youtube, reddit, etc.)
    spam_companies = ['www.youtube.com', 'www.reddit.com', 'careers.usahealthsystem.com']
    if company in spam_companies:
        return True
    
    # Remove entries where company is a URL/domain
    if company.startswith('www.') and '.' in company:
        return True
    
    return False

def clean_job(job):
    """Remove external links and clean job data."""
    # Remove companyUrl (external link)
    if 'companyUrl' in job:
        del job['companyUrl']
    return job

# Process all data files
total_removed = 0
total_remaining = 0
files_modified = []

for filename in sorted(os.listdir(data_dir)):
    if not filename.endswith('.json'):
        continue
    if filename in ('countries.json', 'latest_20.json'):
        continue
    
    filepath = os.path.join(data_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        jobs = json.load(f)
    
    original_count = len(jobs)
    cleaned = [clean_job(j) for j in jobs if not is_spam(j)]
    removed = original_count - len(cleaned)
    
    if removed > 0:
        files_modified.append((filename, removed, len(cleaned)))
    
    total_removed += removed
    total_remaining += len(cleaned)
    
    # Write to both locations
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)
    with open(os.path.join(output_dir, filename), 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)
    with open(os.path.join(src_data_dir, filename), 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

print(f"=== DATA CLEANING REPORT ===")
print(f"Files modified: {len(files_modified)}")
print(f"Total jobs removed: {total_removed}")
print(f"Total jobs remaining: {total_remaining}")
print(f"\nBreakdown:")
for fname, removed, remaining in files_modified:
    print(f"  {fname}: -{removed} (now {remaining})")

# Update latest_20.json
for latest_path in [
    os.path.join(data_dir, 'latest_20.json'),
    os.path.join(output_dir, 'latest_20.json'),
    os.path.join(src_data_dir, 'latest_20.json')
]:
    if os.path.exists(latest_path):
        with open(latest_path, 'r', encoding='utf-8') as f:
            latest = json.load(f)
        original = len(latest)
        latest = [clean_job(j) for j in latest if not is_spam(j)]
        # Re-fill to 20 from available jobs if needed
        if len(latest) < 20:
            # Collect jobs from all country files
            all_jobs = []
            for fname in sorted(os.listdir(data_dir)):
                if not fname.endswith('.json') or fname in ('countries.json', 'latest_20.json'):
                    continue
                with open(os.path.join(data_dir, fname), 'r', encoding='utf-8') as f:
                    all_jobs.extend(json.load(f))
            # Sort by posted date descending, take unique
            seen = set(j['id'] for j in latest)
            all_jobs.sort(key=lambda j: j.get('posted', ''), reverse=True)
            for j in all_jobs:
                if j['id'] not in seen and not is_spam(j):
                    latest.append(clean_job(j))
                    seen.add(j['id'])
                    if len(latest) >= 20:
                        break
        latest = latest[:20]
        with open(latest_path, 'w', encoding='utf-8') as f:
            json.dump(latest, f, ensure_ascii=False, indent=2)
        print(f"\nlatest_20.json: {original} -> {len(latest)} entries")
