#!/usr/bin/env python3
"""Rebuild the jobs API route.ts: keep ng/in/br from original, add 9 new countries."""

import re

# Read original file from git
with open("/tmp/original_jobs.ts", "r") as f:
    original = f.read()

# Extract individual job blocks
job_pattern = re.compile(r'  \{[^}]*\},', re.DOTALL)
all_job_blocks = job_pattern.findall(original)

keep_jobs = []
for jb in all_job_blocks:
    for cc in ['"ng"', '"in"', '"br"']:
        if f'country: {cc}' in jb or f"country: {cc}" in jb:
            keep_jobs.append(jb)
            break

print(f"Kept {len(keep_jobs)} existing jobs (ng/in/br)")

# Now generate new jobs
NEW_COUNTRIES = {
    "za": {"name": "South Africa", "cities": [("Johannesburg", -26.2041, 28.0473), ("Cape Town", -33.9249, 18.4241), ("Durban", -29.8587, 31.0218), ("Pretoria", -25.7479, 28.2293), ("Sandton", -26.1076, 28.0546)], "currency": "ZAR", "symbol": "R"},
    "ke": {"name": "Kenya", "cities": [("Nairobi", -1.2921, 36.8219), ("Mombasa", -4.0435, 39.6682), ("Kisumu", -0.1022, 34.7617), ("Nakuru", -0.3031, 36.0800), ("Eldoret", 0.5143, 35.2698)], "currency": "KES", "symbol": "KSh"},
    "eg": {"name": "Egypt", "cities": [("Cairo", 30.0444, 31.2357), ("Alexandria", 31.2001, 29.9187), ("Giza", 29.9765, 31.1313), ("Sharm El Sheikh", 27.9158, 34.3300), ("Luxor", 25.6872, 32.6396)], "currency": "EGP", "symbol": "E£"},
    "ph": {"name": "Philippines", "cities": [("Manila", 14.5995, 120.9842), ("Cebu City", 10.3157, 123.8854), ("Davao City", 7.1907, 125.4553), ("Quezon City", 14.6760, 121.0437), ("Makati", 14.5547, 121.0244)], "currency": "PHP", "symbol": "₱"},
    "gh": {"name": "Ghana", "cities": [("Accra", 5.6037, -0.1870), ("Kumasi", 6.6884, -1.6244), ("Tamale", 9.4034, -0.8393), ("Takoradi", 4.8983, -1.7607), ("Tema", 5.6692, -0.0166)], "currency": "GHS", "symbol": "GH¢"},
    "pk": {"name": "Pakistan", "cities": [("Karachi", 24.8607, 67.0011), ("Lahore", 31.5204, 74.3587), ("Islamabad", 33.6844, 73.0479), ("Rawalpindi", 33.5651, 73.0169), ("Faisalabad", 31.4504, 73.1350)], "currency": "PKR", "symbol": "Rs"},
    "bd": {"name": "Bangladesh", "cities": [("Dhaka", 23.8103, 90.4125), ("Chittagong", 22.3569, 91.7832), ("Sylhet", 24.8949, 91.8687), ("Rajshahi", 24.3745, 88.6042), ("Khulna", 22.8456, 89.5403)], "currency": "BDT", "symbol": "৳"},
    "co": {"name": "Colombia", "cities": [("Bogota", 4.7110, -74.0721), ("Medellin", 6.2442, -75.5812), ("Cali", 3.4516, -76.5320), ("Barranquilla", 10.9639, -74.7813), ("Cartagena", 10.3910, -75.5364)], "currency": "COP", "symbol": "$"},
    "ma": {"name": "Morocco", "cities": [("Casablanca", 33.5731, -7.5898), ("Rabat", 34.0209, -6.8416), ("Marrakech", 31.6295, -7.9811), ("Tangier", 35.7595, -5.8340), ("Fez", 34.0331, -5.0003)], "currency": "MAD", "symbol": "MAD"},
}

TEMPLATES = [
    ("Senior Software Engineer", "Technology", "Full-time", "Design and develop scalable web applications using modern frameworks. Collaborate with cross-functional teams to deliver high-quality software solutions. Experience with cloud services and CI/CD pipelines required."),
    ("Data Analyst", "Data Science", "Full-time", "Analyze large datasets to extract actionable business insights. Create dashboards and reports using SQL, Python, and visualization tools. Support decision-making with data-driven recommendations."),
    ("Financial Accountant", "Finance", "Full-time", "Manage financial reporting, budgeting, and forecasting. Ensure compliance with local regulations and international accounting standards. Prepare monthly and annual financial statements."),
    ("Marketing Manager", "Marketing", "Full-time", "Develop and execute marketing strategies across digital channels. Manage campaign budgets, analyze performance metrics, and optimize ROI. Lead a team of marketing specialists."),
    ("UX/UI Designer", "Design", "Full-time", "Create user-centered designs for web and mobile applications. Conduct user research, build wireframes and prototypes, and collaborate with developers to implement designs."),
    ("Sales Executive", "Sales", "Full-time", "Drive revenue growth by identifying and pursuing new business opportunities. Build and maintain client relationships, negotiate contracts, and exceed sales targets consistently."),
    ("Project Manager", "Management", "Full-time", "Oversee project planning, execution, and delivery within scope and budget. Coordinate with stakeholders, manage risks, and ensure timely completion of milestones."),
    ("Registered Nurse", "Healthcare", "Full-time", "Provide patient care in clinical settings, administer medications, and monitor patient progress. Collaborate with healthcare teams to develop treatment plans and maintain accurate records."),
    ("Civil Engineer", "Engineering", "Full-time", "Plan, design, and oversee construction of infrastructure projects. Conduct site assessments, prepare technical drawings, and ensure compliance with safety and building regulations."),
    ("Remote Customer Support Specialist", "Technology", "Remote", "Handle customer inquiries via phone, email, and chat. Troubleshoot technical issues, escalate complex cases, and maintain high customer satisfaction scores."),
    ("DevOps Engineer", "Technology", "Full-time", "Build and maintain CI/CD pipelines, manage cloud infrastructure, and automate deployment processes. Monitor system performance and ensure high availability."),
    ("Business Development Manager", "Management", "Full-time", "Identify growth opportunities and strategic partnerships. Develop business plans, negotiate deals, and expand market presence in the region."),
]

COMPANIES = {
    "za": ["Standard Bank", "MTN Group", "Sasol", "Discovery Health", "Shoprite", "Naspers", "Anglo American", "Old Mutual"],
    "ke": ["Safaricom", "Equity Bank", "Kenya Commercial Bank", "East African Breweries", "KCB Group", "NCBA Bank", "Bidco Africa", "Britam"],
    "eg": ["Orascom Construction", "Vodafone Egypt", "El Sewedy Electric", "Banque Misr", "QNB AlaAhli", "SODIC", "Talaat Moustafa Group", "Cairo Bank"],
    "ph": ["Ayala Corporation", "SM Investments", "BDO Unibank", "PLDT", "Globe Telecom", "Jollibee Foods", "San Miguel Corp", "Metro Bank"],
    "gh": ["MTN Ghana", "GCB Bank", "Newmont Ghana", "TotalEnergies Ghana", "Unilever Ghana", "Ecobank Ghana", "Fan Milk Ltd", "Guinness Ghana"],
    "pk": ["Engro Corporation", "Habib Bank", "Lucky Cement", "PTCL", "Systems Limited", "Nestle Pakistan", "Unilever Pakistan", "Bank Alfalah"],
    "bd": ["Grameenphone", "bKash", "BRAC", "Robi Axiata", "Square Group", "Pran-RFL", "Beximco", "Standard Chartered BD"],
    "co": ["Bancolombia", "Ecopetrol", "Grupo Aval", "Rappi", "Davivienda", "Carvajal", "Grupo Sura", "Nutresa"],
    "ma": ["OCP Group", "Maroc Telecom", "Attijariwafa Bank", "ONCF", "RAM", "Managem", "Inwi", "Tanger Med"],
}

SALARY = {
    "za": (350000, 960000, "YEAR"),
    "ke": (60000, 360000, "MONTH"),
    "eg": (8000, 45000, "MONTH"),
    "ph": (25000, 85000, "MONTH"),
    "gh": (3000, 15000, "MONTH"),
    "pk": (50000, 350000, "MONTH"),
    "bd": (15000, 80000, "MONTH"),
    "co": (2500000, 9000000, "MONTH"),
    "ma": (5000, 30000, "MONTH"),
}

POSTED = ["2 hours ago", "5 hours ago", "1 day ago", "2 days ago", "3 days ago", "5 days ago", "1 week ago"]

def sal_str(smin, smax, sym, period):
    if period == "YEAR":
        return f"{sym}{smin//1000}K - {sym}{smax//1000}K/year"
    else:
        if smax >= 1000000:
            return f"{sym}{smin//1000}K - {sym}{smax//1000000}M/month"
        return f"{sym}{smin//1000}K - {sym}{smax//1000}K/month"

def slug(s):
    return s.lower().replace(' ', '').replace('-', '').replace('.','').replace('&','')

job_id = 200
new_jobs = []

for code, info in NEW_COUNTRIES.items():
    comps = COMPANIES[code]
    smin_b, smax_b, period = SALARY[code]
    for i, (title, sector, jtype, desc) in enumerate(TEMPLATES):
        job_id += 1
        city, lat, lng = info["cities"][i % len(info["cities"])];
        company = comps[i % len(comps)]
        ratio = i / 12
        salary_min = int(smin_b + ratio * (smax_b - smin_b))
        salary_max = int(salary_min + (smax_b - smin_b) / 3)
        cs = slug(company)
        
        new_jobs.append(f'''  {{
    id: {job_id}, title: "{title}", company: "{company}",
    companyUrl: "https://{cs}.com",
    location: "{city}, {info['name']}", country: "{code}", countryName: "{info['name']}",
    lat: {lat}, lng: {lng},
    salary: "{sal_str(salary_min, salary_max, info['symbol'], period)}",
    salaryMin: {salary_min}, salaryMax: {salary_max},
    salaryCurrency: "{info['currency']}", salaryPeriod: "{period.lower()}",
    description: "{desc}", sector: "{sector}",
    posted: "{POSTED[i % len(POSTED)]}", type: "{jtype}",
    contactEmail: "careers@{cs}.com",
    paywall: {str(i % 2 == 0).lower()},
  }},''')

print(f"Generated {len(new_jobs)} new jobs")

# Build file
lines = []
lines.append('import { NextResponse } from "next/server";')
lines.append('')
lines.append('export interface Job {')
lines.append('  id: number; title: string; company: string; companyUrl: string;')
lines.append('  location: string; country: string; countryName: string;')
lines.append('  lat: number; lng: number;')
lines.append('  salary: string; salaryMin: number; salaryMax: number;')
lines.append('  salaryCurrency: string; salaryPeriod: string;')
lines.append('  description: string; sector: string; posted: string; type: string;')
lines.append('  contactEmail: string;')
lines.append('  paywall: boolean;')
lines.append('}')
lines.append('')
lines.append('export const jobs: Job[] = [')

for j in keep_jobs:
    lines.append(j.rstrip().rstrip(','))
    lines.append(',')

for j in new_jobs:
    lines.append(j)

lines.append('];')
lines.append('')
lines.append('export async function GET(request: Request) {')
lines.append('  const { searchParams } = new URL(request.url);')
lines.append('  const country = searchParams.get("country");')
lines.append('  let filtered = jobs;')
lines.append('  if (country) {')
lines.append('    filtered = jobs.filter(j => j.country === country);')
lines.append('  }')
lines.append('  return NextResponse.json(filtered);')
lines.append('}')

with open("/home/z/my-project/src/app/api/jobs/route.ts", "w") as f:
    f.write("\n".join(lines))

print(f"Total file: {len(keep_jobs)} kept + {len(new_jobs)} new = {len(keep_jobs) + len(new_jobs)} jobs")
