import json
import random

# Load raw jobs
with open('data/all_jobs.json', 'r') as f:
    all_jobs = json.load(f)

# Normalize functions into main categories
CATEGORY_MAP = {
    # Software Engineering
    'Software Engineering': 'Software Engineering',
    'Software Development': 'Software Engineering',
    'Full-Stack': 'Software Engineering',
    'Full Stack Development': 'Software Engineering',
    'Full-Stack Development': 'Software Engineering',
    'Backend': 'Software Engineering',
    'Backend Development': 'Software Engineering',
    'Frontend': 'Software Engineering',
    'Frontend Development': 'Software Engineering',
    'Tecnologia/Software': 'Software Engineering',
    'Technology': 'Software Engineering',
    'Geral': 'Software Engineering',
    
    # AI & Machine Learning
    'AI & Machine Learning': 'AI & Machine Learning',
    'AI/ML Specialized': 'AI & Machine Learning',
    'Artificial Intelligence': 'AI & Machine Learning',
    'Machine Learning': 'AI & Machine Learning',
    'Data Science/ML': 'AI & Machine Learning',
    'Dados/IA': 'AI & Machine Learning',
    
    # Data Science & Analytics
    'Data Science': 'Data Science & Analytics',
    'Data Science & Analytics': 'Data Science & Analytics',
    'Data Analytics': 'Data Science & Analytics',
    'Business Intelligence': 'Data Science & Analytics',
    'Quantitative Development': 'Data Science & Analytics',
    
    # Data Engineering
    'Data Engineering': 'Data Engineering',
    'Database': 'Data Engineering',
    'Database Administration': 'Data Engineering',
    
    # Cloud & DevOps
    'Cloud & DevOps': 'Cloud & DevOps',
    'Cloud Engineering': 'Cloud & DevOps',
    'DevOps Engineering': 'Cloud & DevOps',
    'DevOps/CI-CD': 'Cloud & DevOps',
    'DevOps/Cloud': 'Cloud & DevOps',
    'DevOps/Infrastructure': 'Cloud & DevOps',
    'Site Reliability Engineering': 'Cloud & DevOps',
    'Reliability Engineering': 'Cloud & DevOps',
    'Systems Administration': 'Cloud & DevOps',
    'SysAdmin/Network': 'Cloud & DevOps',
    'Network Engineering': 'Cloud & DevOps',
    'Network/Telecommunications': 'Cloud & DevOps',
    
    # Cybersecurity
    'Cybersecurity': 'Cybersecurity',
    'Data Privacy & Compliance': 'Cybersecurity',
    'Identity & Access Management': 'Cybersecurity',
    'Legal/Compliance': 'Cybersecurity',
    
    # Mobile Development
    'Mobile': 'Mobile Development',
    'Mobile Development': 'Mobile Development',
    
    # UX/UI & Design
    'UX/UI Design': 'UX/UI & Design',
    'Product Design': 'UX/UI & Design',
    'Product Design/UX': 'UX/UI & Design',
    'Design': 'UX/UI & Design',
    
    # Product Management
    'Product Management': 'Product Management',
    'IT Project Management': 'Product Management',
    'Project Management': 'Product Management',
    'Project/Program Management': 'Product Management',
    'Projeto': 'Product Management',
    'Scrum Master / Agile': 'Product Management',
    
    # QA & Testing
    'QA & Testing': 'QA & Testing',
    'QA/Testing': 'QA & Testing',
    'Quality Assurance': 'QA & Testing',
    
    # Engineering Leadership
    'CTO / VP Engineering': 'Engineering Leadership',
    'Engineering Leadership': 'Engineering Leadership',
    'Engineering Management': 'Engineering Leadership',
    'Senior Individual Contributor': 'Engineering Leadership',
    
    # Research & Development
    'Research & Development': 'Research & Development',
    'Research': 'Research & Development',
    'Research Engineering': 'Research & Development',
    'Bioinformatics': 'Research & Development',
    
    # Embedded Systems & IoT
    'Embedded Systems': 'Embedded & IoT',
    'Embedded/IoT': 'Embedded & IoT',
    'Robotics & IoT': 'Embedded & IoT',
    'Robotics/Autonomous Systems': 'Embedded & IoT',
    'Hardware Engineering': 'Embedded & IoT',
    'Hardware/Embedded': 'Embedded & IoT',
    
    # Game Development
    'Game Design': 'Game Development',
    'Game Development': 'Game Development',
    'AR/VR Development': 'Game Development',
    
    # Sales & Marketing
    'Sales/Customer Success': 'Sales & Marketing',
    'IT Sales & Pre-Sales': 'Sales & Marketing',
    'Marketing': 'Sales & Marketing',
    'Marketing/Growth': 'Sales & Marketing',
    'Vendas': 'Sales & Marketing',
    
    # Consulting
    'Consulting': 'Consulting',
    'Consultoria': 'Consulting',
    'Technology Consulting': 'Consulting',
    'Solutions Architecture': 'Consulting',
    'Architecture': 'Consulting',
    
    # IT Support & Operations
    'IT Support': 'IT Support & Operations',
    'Technical Support': 'IT Support & Operations',
    'Implementation/Field': 'IT Support & Operations',
    
    # Finance Technology
    'Finance Technology': 'Finance Technology',
    'Finanças': 'Finance Technology',
    
    # Specialized Development
    'Blockchain Development': 'Specialized Development',
    'Low-Code/No-Code': 'Specialized Development',
    'SAP Development': 'Specialized Development',
    'Salesforce Development': 'Specialized Development',
    
    # Writing & Content
    'Technical Writing': 'Writing & Content',
    'Escrita/Tradução': 'Writing & Content',
    'Mídia': 'Writing & Content',
    
    # Other/General
    'Human Resources': 'Other',
    'Recursos Humanos': 'Other',
    'IT Recruiting': 'Other',
    'Administração': 'Other',
    'Atendimento': 'Other',
    'Educação': 'Other',
    'Saúde': 'Other',
    'Jurídico': 'Other',
    'Logística': 'Other',
    'Developer Relations': 'Other',
    'Biotech/Health Tech': 'Other',
    'Aerospace/Defense': 'Other',
    'Engenharia': 'Other',
}

# Normalize all jobs
for job in all_jobs:
    raw_func = job['funcao']
    job['categoria'] = CATEGORY_MAP.get(raw_func, raw_func)

# Count per category
cat_counts = {}
for job in all_jobs:
    c = job['categoria']
    cat_counts[c] = cat_counts.get(c, 0) + 1

print('=== Jobs per category ===')
for cat, count in sorted(cat_counts.items(), key=lambda x: -x[1]):
    print(f'  {cat}: {count}')

# Save normalized data
with open('data/all_jobs_normalized.json', 'w') as f:
    json.dump(all_jobs, f, ensure_ascii=False)

print(f'\nSaved {len(all_jobs)} normalized jobs')
