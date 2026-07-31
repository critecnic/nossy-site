#!/usr/bin/env python3
"""Generate jobs for the 9 new countries and keep existing ng/in/br jobs."""

import json

NEW_COUNTRIES = {
    "za": {"name": "South Africa", "cities": ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Sandton"], "currency": "ZAR", "symbol": "R", "lat": -26.2041, "lng": 28.0473},
    "ke": {"name": "Kenya", "cities": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"], "currency": "KES", "symbol": "KSh", "lat": -1.2921, "lng": 36.8219},
    "eg": {"name": "Egypt", "cities": ["Cairo", "Alexandria", "Giza", "Sharm El Sheikh", "Luxor"], "currency": "EGP", "symbol": "E£", "lat": 30.0444, "lng": 31.2357},
    "ph": {"name": "Philippines", "cities": ["Manila", "Cebu City", "Davao City", "Quezon City", "Makati"], "currency": "PHP", "symbol": "P", "lat": 14.5995, "lng": 120.9842},
    "gh": {"name": "Ghana", "cities": ["Accra", "Kumasi", "Tamale", "Takoradi", "Tema"], "currency": "GHS", "symbol": "GHc", "lat": 5.6037, "lng": -0.1870},
    "pk": {"name": "Pakistan", "cities": ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"], "currency": "PKR", "symbol": "Rs", "lat": 24.8607, "lng": 67.0011},
    "bd": {"name": "Bangladesh", "cities": ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna"], "currency": "BDT", "symbol": "Tk", "lat": 23.8103, "lng": 90.4125},
    "co": {"name": "Colombia", "cities": ["Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena"], "currency": "COP", "symbol": "$", "lat": 4.7110, "lng": -74.0721},
    "ma": {"name": "Morocco", "cities": ["Casablanca", "Rabat", "Marrakech", "Tangier", "Fez"], "currency": "MAD", "symbol": "MAD", "lat": 33.5731, "lng": -7.5898},
}

JOB_TEMPLATES = [
    {"title": "Senior Software Engineer", "sector": "Technology", "type": "Full-time", "desc": "Design and develop scalable web applications using modern frameworks. Collaborate with cross-functional teams to deliver high-quality software solutions. Experience with cloud services and CI/CD pipelines required."},
    {"title": "Data Analyst", "sector": "Data Science", "type": "Full-time", "desc": "Analyze large datasets to extract actionable business insights. Create dashboards and reports using SQL, Python, and visualization tools. Support decision-making with data-driven recommendations."},
    {"title": "Financial Accountant", "sector": "Finance", "type": "Full-time", "desc": "Manage financial reporting, budgeting, and forecasting. Ensure compliance with local regulations and international accounting standards. Prepare monthly and annual financial statements."},
    {"title": "Marketing Manager", "sector": "Marketing", "type": "Full-time", "desc": "Develop and execute marketing strategies across digital channels. Manage campaign budgets, analyze performance metrics, and optimize ROI. Lead a team of marketing specialists."},
    {"title": "UX/UI Designer", "sector": "Design", "type": "Full-time", "desc": "Create user-centered designs for web and mobile applications. Conduct user research, build wireframes and prototypes, and collaborate with developers to implement designs."},
    {"title": "Sales Executive", "sector": "Sales", "type": "Full-time", "desc": "Drive revenue growth by identifying and pursuing new business opportunities. Build and maintain client relationships, negotiate contracts, and exceed sales targets consistently."},
    {"title": "Project Manager", "sector": "Management", "type": "Full-time", "desc": "Oversee project planning, execution, and delivery within scope and budget. Coordinate with stakeholders, manage risks, and ensure timely completion of milestones."},
    {"title": "Registered Nurse", "sector": "Healthcare", "type": "Full-time", "desc": "Provide patient care in clinical settings, administer medications, and monitor patient progress. Collaborate with healthcare teams to develop treatment plans and maintain accurate records."},
    {"title": "Civil Engineer", "sector": "Engineering", "type": "Full-time", "desc": "Plan, design, and oversee construction of infrastructure projects. Conduct site assessments, prepare technical drawings, and ensure compliance with safety and building regulations."},
    {"title": "Remote Customer Support Specialist", "sector": "Technology", "type": "Remote", "desc": "Handle customer inquiries via phone, email, and chat. Troubleshoot technical issues, escalate complex cases, and maintain high customer satisfaction scores."},
    {"title": "DevOps Engineer", "sector": "Technology", "type": "Full-time", "desc": "Build and maintain CI/CD pipelines, manage cloud infrastructure, and automate deployment processes. Monitor system performance and ensure high availability."},
    {"title": "Business Development Manager", "sector": "Management", "type": "Full-time", "desc": "Identify growth opportunities and strategic partnerships. Develop business plans, negotiate deals, and expand market presence in the region."},
]

COMPANIES = {
    "za": ["Standard Bank", "MTN Group", "Sasol", "Discovery Health", "Shoprite", "Naspers", "Anglo American", "Old Mutual"],
    "ke": ["Safaricom", "Equity Bank", "Kenya Commercial Bank", "East African Breweries", "Safaricom", "KCB Group", "NCBA Bank", "Bidco Africa"],
    "eg": ["Orascom Construction", "Vodafone Egypt", "Cairo University", "El Sewedy Electric", "Banque Misr", "QNB AlaAhli", "SODIC", "Talaat Moustafa Group"],
    "ph": ["Ayala Corporation", "SM Investments", "BDO Unibank", "PLDT", "Globe Telecom", "Jollibee Foods", "San Miguel Corp", "Metro Bank"],
    "gh": ["MTN Ghana", "GCB Bank", "Newmont Ghana", "TotalEnergies Ghana", "Unilever Ghana", "Ecobank Ghana", "Fan Milk Ltd", "Guinness Ghana"],
    "pk": ["Engro Corporation", "Habib Bank", "Lucky Cement", "PTCL", "Systems Limited", "Nestle Pakistan", "Unilever Pakistan", "Bank Alfalah"],
    "bd": ["Grameenphone", "bKash", "BRAC", "Robi Axiata", "Square Group", "Pran-RFL", "Beximco", "Standard Chartered BD"],
    "co": ["Bancolombia", "Ecopetrol", "Grupo Aval", "Rappi", "Davivienda", "Carvajal", "Grupo Sura", "Nutresa"],
    "ma": ["OCP Group", "Maroc Telecom", "Attijariwafa Bank", "ONCF", "RAM", "Managem", "Inwi", "Tanger Med"],
}

SALARY_RANGES = {
    "za": {"min": 350000, "max": 960000, "period": "YEAR"},
    "ke": {"min": 60000, "max": 360000, "period": "MONTH"},
    "eg": {"min": 8000, "max": 45000, "period": "MONTH"},
    "ph": {"min": 25000, "max": 85000, "period": "MONTH"},
    "gh": {"min": 3000, "max": 15000, "period": "MONTH"},
    "pk": {"min": 50000, "max": 350000, "period": "MONTH"},
    "bd": {"min": 15000, "max": 80000, "period": "MONTH"},
    "co": {"min": 2500000, "max": 9000000, "period": "MONTH"},
    "ma": {"min": 5000, "max": 30000, "period": "MONTH"},
}

POSTED_OPTIONS = ["2 hours ago", "5 hours ago", "1 day ago", "2 days ago", "3 days ago", "5 days ago", "1 week ago"]

def fmt_salary(smin, smax, sym, cur, period):
    if period == "YEAR":
        return f"{sym}{smin//1000}K - {sym}{smax//1000}K/year"
    else:
        if smax >= 1000000:
            return f"{sym}{smin//1000}K - {sym}{smax//1000000}M/month"
        return f"{sym}{smin//1000:,}K - {sym}{smax//1000:,}K/month"

job_id = 200
new_jobs = []

for code, info in NEW_COUNTRIES.items():
    companies = COMPANIES[code]
    sal = SALARY_RANGES[code]
    for i, tmpl in enumerate(JOB_TEMPLATES):
        job_id += 1
        city = info["cities"][i % len(info["cities"])]
        company = companies[i % len(companies)]
        salary_min = sal["min"] + (i * (sal["max"] - sal["min"]) // 12)
        salary_max = salary_min + (sal["max"] - sal["min"]) // 3
        salary_str = fmt_salary(salary_min, salary_max, info["symbol"], info["currency"], sal["period"])
        
        job = {
            "id": job_id,
            "title": tmpl["title"],
            "company": company,
            "companyUrl": f"https://{company.lower().replace(' ', '').replace('-', '')}.com",
            "location": f"{city}, {info['name']}",
            "country": code,
            "countryName": info["name"],
            "lat": round(info["lat"] + (i * 0.1), 4),
            "lng": round(info["lng"] + (i * 0.1), 4),
            "salary": salary_str,
            "salaryMin": salary_min,
            "salaryMax": salary_max,
            "salaryCurrency": info["currency"],
            "salaryPeriod": sal["period"].lower(),
            "description": tmpl["desc"],
            "sector": tmpl["sector"],
            "posted": POSTED_OPTIONS[i % len(POSTED_OPTIONS)],
            "type": tmpl["type"],
            "contactEmail": f"careers@{company.lower().replace(' ', '').replace('-', '')}.com",
            "paywall": i % 2 == 0,
        }
        new_jobs.append(job)

# Output as TypeScript array entries
for j in new_jobs:
    print(",".join([
        f'  {{',
        f'    id: {j["id"]},',
        f'    title: "{j["title"]}",',
        f'    company: "{j["company"]}",',
        f'    companyUrl: "{j["companyUrl"]}",',
        f'    location: "{j["location"]}",',
        f'    country: "{j["country"]}",',
        f'    countryName: "{j["countryName"]}",',
        f'    lat: {j["lat"]},',
        f'    lng: {j["lng"]},',
        f'    salary: "{j["salary"]}",',
        f'    salaryMin: {j["salaryMin"]},',
        f'    salaryMax: {j["salaryMax"]},',
        f'    salaryCurrency: "{j["salaryCurrency"]}",',
        f'    salaryPeriod: "{j["salaryPeriod"]}",',
        f'    description: "{j["description"]}",',
        f'    sector: "{j["sector"]}",',
        f'    posted: "{j["posted"]}",',
        f'    type: "{j["type"]}",',
        f'    contactEmail: "{j["contactEmail"]}",',
        f'    paywall: {str(j["paywall"]).lower()},',
        f'  }}',
    ]))
    print(",")
