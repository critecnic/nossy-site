#!/usr/bin/env python3
"""Mark jobs as paywall based on:
- 9% of remote (Remoto/Remote) jobs
- 6% of jobs with salaryMin > 300000/year (in USD equivalent)
- Jobs from companies with 'exclusive' email patterns
- Deterministic selection for 'hard to find' companies
"""

import json, os, glob, hashlib

PUBLIC = "/home/z/my-project/public/data"
USD_RATES = {"EUR": 1.08, "GBP": 1.27, "USD": 1.0, "BRL": 0.17, "INR": 0.012, "JPY": 0.0067, "CNY": 0.14, "SGD": 0.74, "KRW": 0.00073}

def to_usd(min_val, max_val, currency, period):
    rate = USD_RATES.get(currency, 1.0)
    if period == "month":
        return min_val * rate * 12, max_val * rate * 12
    return min_val * rate, max_val * rate

def is_exclusive_email(email):
    if not email: return False
    # Custom domain emails (not gmail, yahoo, hotmail, etc)
    free_domains = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com", "aol.com", "icloud.com", "protonmail.com", "mail.com", "zoho.com"}
    domain = email.split("@")[-1].lower() if "@" in email else ""
    return domain != "" and domain not in free_domains

def company_hash_paywall(company, title, job_id):
    """Deterministic selection: ~3% of jobs from companies that are harder to find on web"""
    h = hashlib.md5(f"{company.lower().strip()}:{title.lower().strip()}:{job_id}".encode()).hexdigest()
    return int(h[:8], 16) % 100 < 3

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        jobs = json.load(f)
    
    if not isinstance(jobs, list) or len(jobs) == 0:
        return 0, 0
    
    total = len(jobs)
    paywall_count = 0
    
    # First pass: identify remote jobs and high-salary jobs
    remote_indices = []
    high_salary_indices = []
    
    for i, job in enumerate(jobs):
        job_type = (job.get("type") or "").lower()
        if job_type in ("remoto", "remote"):
            remote_indices.append(i)
        
        salary_min = job.get("salaryMin", 0) or 0
        salary_max = job.get("salaryMax", 0) or 0
        currency = job.get("salaryCurrency", "USD") or "USD"
        period = job.get("salaryPeriod", "year") or "year"
        
        usd_min, usd_max = to_usd(salary_min, salary_max, currency, period)
        if usd_min > 300000:
            high_salary_indices.append(i)
    
    # Mark 9% of remote jobs (deterministic)
    remote_target = max(1, int(len(remote_indices) * 0.09))
    remote_marked = set()
    for idx in remote_indices:
        h = hashlib.md5(str(jobs[idx].get("id", idx)).encode()).hexdigest()
        if int(h[:8], 16) % 100 < 9 and len(remote_marked) < remote_target:
            remote_marked.add(idx)
    
    # Mark 6% of high-salary jobs (deterministic)
    salary_target = max(1, int(len(high_salary_indices) * 0.06))
    salary_marked = set()
    for idx in high_salary_indices:
        h = hashlib.md5(str(jobs[idx].get("id", idx)).encode()).hexdigest()
        if int(h[:8], 16) % 100 < 6 and len(salary_marked) < salary_target:
            salary_marked.add(idx)
    
    # Apply paywall
    for i, job in enumerate(jobs):
        is_paywall = False
        reason = ""
        
        if i in remote_marked:
            is_paywall = True
            reason = "remote"
        elif i in salary_marked:
            is_paywall = True
            reason = "high_salary"
        elif is_exclusive_email(job.get("contactEmail", "")):
            # 15% of exclusive email jobs
            h = hashlib.md5(str(job.get("id", i)).encode()).hexdigest()
            if int(h[:8], 16) % 100 < 15:
                is_paywall = True
                reason = "exclusive_email"
        elif company_hash_paywall(job.get("company", ""), job.get("title", ""), job.get("id", i)):
            is_paywall = True
            reason = "hard_to_find"
        
        job["paywall"] = is_paywall
        if is_paywall:
            paywall_count += 1
            # For paywall jobs, hide the contact email and description details
            if reason != "exclusive_email":
                job["contactEmail"] = ""
            job["paywallReason"] = reason
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, separators=(',', ':'))
    
    return total, paywall_count

def main():
    json_files = sorted(glob.glob(os.path.join(PUBLIC, "*.json")))
    total_jobs = 0
    total_paywall = 0
    for f in json_files:
        bn = os.path.basename(f)
        if bn in ("countries.json", "latest_20.json"):
            continue
        try:
            t, p = process_file(f)
            total_jobs += t
            total_paywall += p
            if p > 0:
                print(f"  {bn}: {t} jobs, {p} paywall ({100*p/t:.1f}%)")
        except Exception as e:
            print(f"  ERR {bn}: {e}")
    print(f"\nTOTAL: {total_jobs} jobs, {total_paywall} paywall ({100*total_paywall/max(1,total_jobs):.1f}%)")

if __name__ == "__main__":
    main()
