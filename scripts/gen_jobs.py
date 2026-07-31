#!/usr/bin/env python3
"""Generate jobs for 12 developed countries."""

import json
import random

SECTORS = ["Technology", "Finance", "Design", "Marketing", "Data Science", "Sales", "Management", "Healthcare", "Education", "Engineering", "Legal", "HR"]
TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"]

COUNTRIES = {
    "us": {
        "name": "United States", "currency": "USD", "symbol": "$", "period": "year",
        "cities": [
            ("San Francisco, CA", 37.7749, -122.4194),
            ("New York, NY", 40.7128, -74.0060),
            ("Seattle, WA", 47.6062, -122.3321),
            ("Austin, TX", 30.2672, -97.7431),
            ("Chicago, IL", 41.8781, -87.6298),
            ("Boston, MA", 42.3601, -71.0589),
            ("Los Angeles, CA", 34.0522, -118.2437),
            ("Denver, CO", 39.7392, -104.9903),
            ("Miami, FL", 25.7617, -80.1918),
            ("Washington, DC", 38.9072, -77.0369),
        ],
        "companies": {
            "Technology": [("Google", "https://google.com/careers"), ("Microsoft", "https://microsoft.com/careers"), ("Apple", "https://apple.com/careers"), ("Meta", "https://meta.com/careers"), ("Amazon", "https://amazon.jobs")],
            "Finance": [("JPMorgan Chase", "https://jpmorgan.com/careers"), ("Goldman Sachs", "https://goldmansachs.com/careers"), ("Morgan Stanley", "https://morganstanley.com/careers")],
            "Design": [("Airbnb", "https://airbnb.com/careers"), ("Figma", "https://figma.com/careers")],
            "Marketing": [("Netflix", "https://netflix.com/careers"), ("Salesforce", "https://salesforce.com/careers")],
            "Data Science": [("Palantir", "https://palantir.com/careers"), ("NVIDIA", "https://nvidia.com/careers")],
            "Sales": [("Oracle", "https://oracle.com/careers"), ("Adobe", "https://adobe.com/careers")],
            "Management": [("McKinsey", "https://mckinsey.com/careers"), ("Deloitte", "https://deloitte.com/careers")],
            "Healthcare": [("Johnson & Johnson", "https://jnj.com/careers"), ("Pfizer", "https://pfizer.com/careers")],
            "Education": [("Coursera", "https://coursera.org/careers"), ("edX", "https://edx.org/careers")],
            "Engineering": [("Tesla", "https://tesla.com/careers"), ("SpaceX", "https://spacex.com/careers")],
            "Legal": [("Baker McKenzie", "https://bakermckenzie.com/careers"), ("Latham Watkins", "https://lathamwatkins.com/careers")],
            "HR": [("Workday", "https://workday.com/careers"), ("Gusto", "https://gusto.com/careers")],
        },
        "salary_ranges": {"year": (55000, 280000)},
    },
    "gb": {
        "name": "United Kingdom", "currency": "GBP", "symbol": "£", "period": "year",
        "cities": [
            ("London", 51.5074, -0.1278),
            ("Manchester", 53.4808, -2.2426),
            ("Edinburgh", 55.9533, -3.1883),
            ("Birmingham", 52.4862, -1.8904),
            ("Bristol", 51.4545, -2.5879),
            ("Leeds", 53.8008, -1.5491),
        ],
        "companies": {
            "Technology": [("DeepMind", "https://deepmind.com/careers"), ("ARM", "https://arm.com/careers"), ("Revolut", "https://revolut.com/careers")],
            "Finance": [("Barclays", "https://barclays.com/careers"), ("HSBC", "https://hsbc.com/careers"), ("Standard Chartered", "https://standardchartered.com/careers")],
            "Design": [("BBC Creative", "https://bbc.co.uk/careers"), ("Shazam", "https://shazam.com/careers")],
            "Marketing": [("Unilever", "https://unilever.com/careers"), ("Diageo", "https://diageo.com/careers")],
            "Data Science": [("Quantcast", "https://quantcast.com/careers"), ("Improbable", "https://improbable.io/careers")],
            "Sales": [("SAP UK", "https://sap.com/careers"), ("Cisco UK", "https://cisco.com/careers")],
            "Management": [("PwC UK", "https://pwc.co.uk/careers"), ("KPMG UK", "https://kpmg.co.uk/careers")],
            "Healthcare": [("GSK", "https://gsk.com/careers"), ("AstraZeneca", "https://astrazeneca.com/careers")],
            "Education": [("Open University", "https://open.ac.uk/careers"), ("FutureLearn", "https://futurelearn.com/careers")],
            "Engineering": [(("Rolls-Royce", "https://rolls-royce.com/careers")), ("BAE Systems", "https://baesystems.com/careers")],
            "Legal": [("Clifford Chance", "https://cliffordchance.com/careers"), ("Allen Overy", "https://allenovery.com/careers")],
            "HR": [("Hays", "https://hays.com/careers"), ("Michael Page", "https://michaelpage.com/careers")],
        },
        "salary_ranges": {"year": (35000, 180000)},
    },
    "de": {
        "name": "Germany", "currency": "EUR", "symbol": "€", "period": "year",
        "cities": [
            ("Berlin", 52.5200, 13.4050),
            ("Munich", 48.1351, 11.5820),
            ("Frankfurt", 50.1109, 8.6821),
            ("Hamburg", 53.5511, 9.9937),
            ("Stuttgart", 48.7758, 9.1829),
            ("Dusseldorf", 51.2277, 6.7735),
        ],
        "companies": {
            "Technology": [("SAP", "https://sap.com/careers"), ("Siemens", "https://siemens.com/careers"), ("Bosch", "https://bosch.com/careers")],
            "Finance": [("Deutsche Bank", "https://db.com/careers"), ("Allianz", "https://allianz.com/careers"), ("Commerzbank", "https://commerzbank.com/careers")],
            "Design": [("BMW Design", "https://bmw.com/careers"), ("Porsche Design", "https://porsche.com/careers")],
            "Marketing": [("Adidas", "https://adidas.com/careers"), ("Lufthansa", "https://lufthansa.com/careers")],
            "Data Science": [("Delivery Hero", "https://deliveryhero.com/careers"), ("Celonis", "https://celonis.com/careers")],
            "Sales": [("Siemens Healthineers", "https://siemens-healthineers.com/careers")],
            "Management": [("McKinsey DE", "https://mckinsey.de/careers"), ("BCG DE", "https://bcg.com/careers")],
            "Healthcare": [("Bayer", "https://bayer.com/careers"), ("Merck", "https://merck.com/careers")],
            "Education": [("Humboldt University", "https://hu-berlin.de/careers")],
            "Engineering": [("Volkswagen", "https://volkswagen.com/careers"), ("BMW Group", "https://bmwgroup.com/careers")],
            "Legal": [("Freshfields", "https://freshfields.com/careers")],
            "HR": [("Personio", "https://personio.com/careers")],
        },
        "salary_ranges": {"year": (40000, 160000)},
    },
    "ca": {
        "name": "Canada", "currency": "CAD", "symbol": "C$", "period": "year",
        "cities": [
            ("Toronto, ON", 43.6532, -79.3832),
            ("Vancouver, BC", 49.2827, -123.1207),
            ("Montreal, QC", 45.5017, -73.5673),
            ("Calgary, AB", 51.0447, -114.0719),
            ("Ottawa, ON", 45.4215, -75.6972),
        ],
        "companies": {
            "Technology": [("Shopify", "https://shopify.com/careers"), ("BlackBerry", "https://blackberry.com/careers"), ("Canonical", "https://canonical.com/careers")],
            "Finance": [("RBC", "https://rbc.com/careers"), ("TD Bank", "https://td.com/careers"), ("CIBC", "https://cibc.com/careers")],
            "Design": [("Hootsuite", "https://hootsuite.com/careers")],
            "Marketing": [("Bell Canada", "https://bell.ca/careers")],
            "Data Science": [("Element AI", "https://elementai.com/careers")],
            "Sales": [("Salesforce Canada", "https://salesforce.com/careers")],
            "Management": [("Deloitte Canada", "https://deloitte.ca/careers")],
            "Healthcare": [("Sun Life", "https://sunlife.com/careers")],
            "Education": [("Udemy", "https://udemy.com/careers")],
            "Engineering": [("SNC-Lavalin", "https://snclavalin.com/careers")],
            "Legal": [("Blake Cassels", "https://blakes.com/careers")],
            "HR": [(("Ceridian", "https://ceridian.com/careers"))],
        },
        "salary_ranges": {"year": (45000, 170000)},
    },
    "au": {
        "name": "Australia", "currency": "AUD", "symbol": "A$", "period": "year",
        "cities": [
            ("Sydney, NSW", -33.8688, 151.2093),
            ("Melbourne, VIC", -37.8136, 144.9631),
            ("Brisbane, QLD", -27.4698, 153.0251),
            ("Perth, WA", -31.9505, 115.8605),
            ("Canberra, ACT", -35.2809, 149.1300),
        ],
        "companies": {
            "Technology": [("Atlassian", "https://atlassian.com/careers"), ("Canva", "https://canva.com/careers"), ("SafetyCulture", "https://safetyculture.com/careers")],
            "Finance": [("Commonwealth Bank", "https://commbank.com.au/careers"), ("Westpac", "https://westpac.com.au/careers"), ("ANZ", "https://anz.com/careers")],
            "Design": [(("Canva Design", "https://canva.com/careers"))],
            "Marketing": [("Telstra", "https://telstra.com/careers")],
            "Data Science": [(("CSIRO", "https://csiro.au/careers"))],
            "Sales": [("BHP", "https://bhp.com/careers")],
            "Management": [("PwC Australia", "https://pwc.com.au/careers")],
            "Healthcare": [("Bupa", "https://bupa.com/careers")],
            "Education": [("University of Melbourne", "https://unimelb.edu.au/careers")],
            "Engineering": [("Rio Tinto", "https://riotinto.com/careers"), ("Fortescue", "https://fortescue.com/careers")],
            "Legal": [("Allens", "https://allens.com.au/careers")],
            "HR": [("SEEK", "https://seek.com.au/careers")],
        },
        "salary_ranges": {"year": (55000, 190000)},
    },
    "jp": {
        "name": "Japan", "currency": "JPY", "symbol": "¥", "period": "year",
        "cities": [
            ("Tokyo", 35.6762, 139.6503),
            ("Osaka", 34.6937, 135.5023),
            ("Kyoto", 35.0116, 135.7681),
            ("Yokohama", 35.4437, 139.6380),
            ("Nagoya", 35.1815, 136.9066),
        ],
        "companies": {
            "Technology": [("Sony", "https://sony.com/careers"), ("SoftBank", "https://softbank.jp/careers"), ("Rakuten", "https://rakuten.co.jp/careers")],
            "Finance": [("MUFG", "https://mufg.jp/careers"), ("Nomura", "https://nomura.com/careers"), ("SMBC", "https://smbc.co.jp/careers")],
            "Design": [("Nintendo", "https://nintendo.com/careers")],
            "Marketing": [("Toyota Marketing", "https://toyota-global.com/careers")],
            "Data Science": [("Preferred Networks", "https://preferred-networks.jp/careers")],
            "Sales": [("Honda", "https://honda.com/careers")],
            "Management": [("McKinsey Japan", "https://mckinsey.jp/careers")],
            "Healthcare": [("Takeda", "https://takeda.com/careers")],
            "Education": [(("Benesse", "https://benesse.jp/careers"))],
            "Engineering": [("Toyota", "https://toyota-global.com/careers"), ("Mitsubishi Heavy", "https://mhps.com/careers")],
            "Legal": [("Nishimura Asahi", "https://nashimalaw.com/careers")],
            "HR": [(("PERSOL", "https://persol.co.jp/careers"))],
        },
        "salary_ranges": {"year": (4000000, 15000000)},
    },
    "ch": {
        "name": "Switzerland", "currency": "CHF", "symbol": "CHF", "period": "year",
        "cities": [
            ("Zurich", 47.3769, 8.5417),
            ("Geneva", 46.2044, 6.1432),
            ("Basel", 47.5596, 7.5886),
            ("Bern", 46.9480, 7.4474),
            ("Lausanne", 46.5197, 6.6323),
        ],
        "companies": {
            "Technology": [("Google Zurich", "https://google.ch/careers"), ("EPFL Spinoffs", "https://epfl.ch/careers"), ("IBM Zurich", "https://ibm.com/ch/careers")],
            "Finance": [("UBS", "https://ubs.com/careers"), ("Credit Suisse", "https://credit-suisse.com/careers"), ("Julius Baer", "https://juliusbaer.com/careers")],
            "Design": [("Rolex", "https://rolex.com/careers")],
            "Marketing": [("Nestle", "https://nestle.com/careers")],
            "Data Science": [("ETH Zurich", "https://ethz.ch/careers")],
            "Sales": [("Novartis", "https://novartis.com/careers")],
            "Management": [(("McKinsey CH", "https://mckinsey.ch/careers"))],
            "Healthcare": [("Roche", "https://roche.com/careers"), ("Novartis", "https://novartis.com/careers")],
            "Education": [("IMD", "https://imd.org/careers")],
            "Engineering": [("ABB", "https://abb.com/careers"), ("Alstom", "https://alstom.com/careers")],
            "Legal": [("Homburger", "https://homburger.ch/careers")],
            "HR": [("Globe 24h", "https://globe24h.com/careers")],
        },
        "salary_ranges": {"year": (70000, 250000)},
    },
    "fr": {
        "name": "France", "currency": "EUR", "symbol": "€", "period": "year",
        "cities": [
            ("Paris", 48.8566, 2.3522),
            ("Lyon", 45.7640, 4.8357),
            ("Marseille", 43.2965, 5.3698),
            ("Toulouse", 43.6047, 1.4442),
            ("Bordeaux", 44.8378, -0.5792),
        ],
        "companies": {
            "Technology": [("Capgemini", "https://capgemini.com/careers"), ("Thales", "https://thalesgroup.com/careers"), ("Orange", "https://orange.com/careers")],
            "Finance": [("BNP Paribas", "https://bnpparibas.com/careers"), ("Societe Generale", "https://societegenerale.com/careers"), ("AXA", "https://axa.com/careers")],
            "Design": [("L'Oreal Design", "https://loreal.com/careers")],
            "Marketing": [("LVMH", "https://lvmh.com/careers"), ("Kering", "https://kering.com/careers")],
            "Data Science": [("Criteo", "https://criteo.com/careers")],
            "Sales": [(("Airbus", "https://airbus.com/careers"))],
            "Management": [("McKinsey France", "https://mckinsey.fr/careers")],
            "Healthcare": [("Sanofi", "https://sanofi.com/careers"), ("Danone", "https://danone.com/careers")],
            "Education": [(("INSEAD", "https://insead.edu/careers"))],
            "Engineering": [("TotalEnergies", "https://totalenergies.com/careers"), ("Alstom France", "https://alstom.com/careers")],
            "Legal": [("Gide", "https://gide.com/careers")],
            "HR": [("Manpower France", "https://manpower.fr/careers")],
        },
        "salary_ranges": {"year": (32000, 140000)},
    },
    "nl": {
        "name": "Netherlands", "currency": "EUR", "symbol": "€", "period": "year",
        "cities": [
            ("Amsterdam", 52.3676, 4.9041),
            ("Rotterdam", 51.9244, 4.4777),
            ("The Hague", 52.0705, 4.3007),
            ("Utrecht", 52.0907, 5.1214),
            ("Eindhoven", 51.4416, 5.4697),
        ],
        "companies": {
            "Technology": [("Booking.com", "https://booking.com/careers"), ("ASML", "https://asml.com/careers"), ("Adyen", "https://adyen.com/careers")],
            "Finance": [("ING", "https://ing.com/careers"), ("Rabobank", "https://rabobank.com/careers"), ("ABN AMRO", "https://abnamro.com/careers")],
            "Design": [("Philips Design", "https://philips.com/careers")],
            "Marketing": [("Heineken", "https://heineken.com/careers")],
            "Data Science": [(("Elsevier", "https://elsevier.com/careers"))],
            "Sales": [("AkzoNobel", "https://akzonobel.com/careers")],
            "Management": [("PwC Netherlands", "https://pwc.nl/careers")],
            "Healthcare": [("Philips Healthcare", "https://philips.com/careers")],
            "Education": [("TU Delft", "https://tudelft.nl/careers")],
            "Engineering": [("Shell", "https://shell.com/careers"), ("Uniper", "https://uniper.com/careers")],
            "Legal": [("De Brauw", "https://debrauw.com/careers")],
            "HR": [("Randstad", "https://randstad.com/careers")],
        },
        "salary_ranges": {"year": (38000, 150000)},
    },
    "sg": {
        "name": "Singapore", "currency": "SGD", "symbol": "S$", "period": "year",
        "cities": [
            ("Singapore Central", 1.2903, 103.8520),
            ("Singapore Marina", 1.2814, 103.8636),
            ("Singapore Jurong", 1.3329, 103.7436),
        ],
        "companies": {
            "Technology": [("Grab", "https://grab.com/careers"), ("Shopee", "https://shopee.com/careers"), ("Sea Group", "https://seagroup.com/careers")],
            "Finance": [("DBS", "https://dbs.com/careers"), ("OCBC", "https://ocbc.com/careers"), ("UOB", "https://uob.com.sg/careers")],
            "Design": [("Razer Design", "https://razer.com/careers")],
            "Marketing": [("Singapore Airlines", "https://singaporeair.com/careers")],
            "Data Science": [(("GovTech", "https://tech.gov.sg/careers"))],
            "Sales": [(("SingTel", "https://singtel.com/careers"))],
            "Management": [("McKinsey Singapore", "https://mckinsey.sg/careers")],
            "Healthcare": [("SingHealth", "https://singhealth.com.sg/careers")],
            "Education": [("NUS", "https://nus.edu.sg/careers")],
            "Engineering": [(("ST Engineering", "https://stengg.com/careers"))],
            "Legal": [("Rajah Tann", "https://rajahtann.com/careers")],
            "HR": [(("JobStreet SG", "https://jobstreet.com.sg/careers"))],
        },
        "salary_ranges": {"year": (42000, 200000)},
    },
    "ae": {
        "name": "United Arab Emirates", "currency": "AED", "symbol": "AED", "period": "month",
        "cities": [
            ("Dubai", 25.2048, 55.2708),
            ("Abu Dhabi", 24.4539, 54.3773),
            ("Sharjah", 25.3463, 55.4209),
        ],
        "companies": {
            "Technology": [("Careem", "https://careem.com/careers"), ("Emirates NBD", "https://emiratesnbd.com/careers")],
            "Finance": [("Emirates NBD", "https://emiratesnbd.com/careers"), ("ADCB", "https://adcb.com/careers"), ("FAB", "https://bankfab.com/careers")],
            "Design": [("Emaar", "https://emaar.com/careers")],
            "Marketing": [("Emirates Airlines", "https://emirates.com/careers")],
            "Data Science": [("DEWA", "https://dewa.gov.ae/careers")],
            "Sales": [("Chalhoub Group", "https://chalhoubgroup.com/careers")],
            "Management": [(("McKinsey ME", "https://mckinsey.ae/careers"))],
            "Healthcare": [("Cleveland Clinic Abu Dhabi", "https://clevelandclinicabudhabi.com/careers")],
            "Education": [("NYU Abu Dhabi", "https://nyuad.nyu.edu/careers")],
            "Engineering": [("ADNOC", "https://adnoc.ae/careers"), ("DP World", "https://dpworld.com/careers")],
            "Legal": [(("Al Tamimi", "https://tamimi.com/careers"))],
            "HR": [("Adecco Middle East", "https://adecco.com/careers")],
        },
        "salary_ranges": {"month": (8000, 60000)},
    },
    "br": {
        "name": "Brazil", "currency": "BRL", "symbol": "R$", "period": "month",
        "cities": [
            ("Sao Paulo, SP", -23.5505, -46.6333),
            ("Rio de Janeiro, RJ", -22.9068, -43.1729),
            ("Belo Horizonte, MG", -19.9167, -43.9345),
            ("Curitiba, PR", -25.4284, -49.2733),
            ("Porto Alegre, RS", -30.0346, -51.2177),
            ("Brasilia, DF", -15.7975, -47.8919),
            ("Salvador, BA", -12.9714, -38.5124),
            ("Recife, PE", -8.0476, -34.8770),
            ("Campinas, SP", -22.9099, -47.0626),
            ("Florianopolis, SC", -27.5954, -48.5480),
        ],
        "companies": {
            "Technology": [("Nubank", "https://nubank.com.br/careers"), ("iFood", "https://ifood.com.br/careers"), ("Mercado Livre", "https://mercadolivre.com.br/careers")],
            "Finance": [("Itau Unibanco", "https://itau.com.br/careers"), ("Bradesco", "https://bradesco.com.br/careers"), ("BTG Pactual", "https://btgpactual.com/careers")],
            "Design": [(("Totvs", "https://totvs.com.br/careers"))],
            "Marketing": [("Ambev", "https://ambev.com.br/careers")],
            "Data Science": [(("Stone", "https://stone.com.br/careers"))],
            "Sales": [("Magazine Luiza", "https://magazineluiza.com.br/careers")],
            "Management": [(("McKinsey Brasil", "https://mckinsey.com.br/careers"))],
            "Healthcare": [("Hapvida", "https://hapvida.com.br/careers"), ("Rede D'Or", "https://reachedor.com.br/careers")],
            "Education": [(("EBAC", "https://ebac.com.br/careers"))],
            "Engineering": [("Petrobras", "https://petrobras.com.br/careers"), ("Vale", "https://vale.com/careers")],
            "Legal": [(("Mattos Filho", "https://mattosfilho.com.br/careers"))],
            "HR": [("Gupy", "https://gupy.io/careers")],
        },
        "salary_ranges": {"month": (3000, 35000)},
    },
}

TITLES = {
    "Technology": ["Senior Software Engineer", "Full Stack Developer", "Cloud Architect", "DevOps Engineer", "Frontend Developer", "Backend Developer", "Mobile Developer", "ML Engineer", "Cybersecurity Analyst", "Platform Engineer", "QA Engineer", "Tech Lead"],
    "Finance": ["Financial Analyst", "Investment Banker", "Risk Manager", "Portfolio Manager", "Compliance Officer", "Credit Analyst", "Treasury Analyst", "Wealth Manager"],
    "Design": ["UX Designer", "UI Designer", "Product Designer", "Design Lead", "UX Researcher", "Brand Designer"],
    "Marketing": ["Marketing Manager", "Growth Hacker", "Content Strategist", "Digital Marketing Lead", "Brand Manager", "SEO Specialist"],
    "Data Science": ["Data Scientist", "Data Engineer", "ML Researcher", "Analytics Manager", "BI Analyst", "NLP Engineer"],
    "Sales": ["Account Executive", "Sales Manager", "Business Development Rep", "Enterprise Sales Lead", "Key Account Manager"],
    "Management": ["Product Manager", "Project Manager", "Program Manager", "Operations Director", "Strategy Consultant", "Business Analyst"],
    "Healthcare": ["Registered Nurse", "Medical Doctor", "Pharmacist", "Clinical Researcher", "Health Informatics Specialist", "Biomedical Engineer"],
    "Education": ["Curriculum Developer", "E-learning Specialist", "Academic Researcher", "Instructional Designer", "Education Technology Manager"],
    "Engineering": ["Mechanical Engineer", "Electrical Engineer", "Civil Engineer", "Chemical Engineer", "Aerospace Engineer", "Systems Engineer"],
    "Legal": ["Corporate Lawyer", "Legal Counsel", "Compliance Officer", "Patent Attorney", "Contract Specialist"],
    "HR": ["HR Business Partner", "Talent Acquisition Lead", "People Operations Manager", "Compensation Analyst", "L&D Specialist"],
}

DESCS = {
    "Technology": [
        "Build and scale distributed systems serving millions of users. Work with cutting-edge cloud infrastructure on AWS/Azure/GCP. Collaborate with cross-functional teams in an agile environment.",
        "Design and implement user-facing features using React, TypeScript, and modern web frameworks. Optimize performance and deliver pixel-perfect interfaces for global users.",
        "Lead the design and implementation of microservices architecture. Mentor junior engineers and drive technical decisions across multiple product teams.",
    ],
    "Finance": [
        "Analyze financial statements and market trends to support investment decisions. Prepare detailed reports for C-level stakeholders and present quarterly performance reviews.",
        "Manage risk assessment frameworks and ensure regulatory compliance across multiple jurisdictions. Develop strategies to mitigate financial and operational risks.",
    ],
    "Design": [
        "Create intuitive user experiences through research-driven design. Conduct user interviews, build wireframes and prototypes, and collaborate with engineering to ship polished products.",
        "Lead the visual identity and design system for the product. Ensure brand consistency across all touchpoints and mentor the design team.",
    ],
    "Marketing": [
        "Develop and execute multi-channel marketing strategies to drive user acquisition and retention. Manage campaigns across digital platforms with measurable KPIs.",
        "Create compelling content strategies that engage target audiences. Manage social media, email campaigns, and SEO optimization for maximum reach.",
    ],
    "Data Science": [
        "Build predictive models and analyze large datasets to drive business decisions. Use Python, TensorFlow, and SQL to extract insights and present findings to leadership.",
        "Design and maintain data pipelines and ETL processes. Build dashboards and reporting systems for real-time business intelligence.",
    ],
    "Sales": [
        "Drive revenue growth by identifying and closing enterprise deals. Build relationships with C-suite executives and manage the full sales cycle from prospecting to close.",
        "Develop strategic partnerships and expand market presence. Lead a team of sales representatives to exceed quarterly targets.",
    ],
    "Management": [
        "Own the product roadmap and prioritize features based on user research and business impact. Manage cross-functional teams and drive product launches.",
        "Lead complex consulting engagements with Fortune 500 clients. Deliver actionable recommendations and manage project delivery across global teams.",
    ],
    "Healthcare": [
        "Provide high-quality patient care and collaborate with multidisciplinary medical teams. Contribute to clinical research and quality improvement initiatives.",
        "Conduct clinical trials and research studies to advance medical treatments. Analyze data and publish findings in peer-reviewed journals.",
    ],
    "Education": [
        "Develop innovative curriculum and learning materials for online and in-person programs. Leverage technology to create engaging educational experiences.",
        "Manage educational technology platforms and ensure seamless learning experiences. Analyze student data to improve course outcomes.",
    ],
    "Engineering": [
        "Design and oversee construction projects from conception to completion. Ensure compliance with safety standards and manage engineering teams on-site.",
        "Develop innovative engineering solutions for complex technical challenges. Lead testing, validation, and quality assurance processes.",
    ],
    "Legal": [
        "Provide expert legal counsel on corporate transactions, M&A deals, and regulatory matters. Draft and negotiate complex commercial agreements.",
        "Ensure organizational compliance with local and international regulations. Manage legal risk and advise on strategic business decisions.",
    ],
    "HR": [
        "Develop and implement talent acquisition strategies to attract top candidates. Manage the full recruitment lifecycle and build employer branding.",
        "Design compensation and benefits programs that attract and retain talent. Analyze market data and ensure competitive positioning.",
    ],
}

POSTED = ["1 day ago", "2 days ago", "3 days ago", "4 days ago", "5 days ago", "1 week ago"]

def fmt_salary(val, symbol, period, code):
    if period == "year":
        if code == "JPY":
            return f"¥{val//10000:,}0,000/yr"
        return f"{symbol}{val:,.0f}/yr"
    else:
        return f"{symbol}{val:,.0f}/mo"

def gen_jobs():
    jobs = []
    job_id = 1
    random.seed(42)

    for cc, cfg in COUNTRIES.items():
        used = set()
        sectors_shuffled = list(SECTORS)
        random.shuffle(sectors_shuffled)

        for sector in sectors_shuffled:
            if sector not in cfg["companies"]:
                continue
            comps = cfg["companies"][sector]
            comp = random.choice(comps)
            title = random.choice(TITLES.get(sector, ["Analyst"]))
            city = random.choice(cfg["cities"])
            jtype = random.choice(TYPES)
            smin, smax = cfg["salary_ranges"][cfg["period"]]
            sal_min = random.randint(smin, int(smin + (smax - smin) * 0.4))
            sal_max = random.randint(int(smin + (smax - smin) * 0.5), smax)
            desc = random.choice(DESCS.get(sector, ["Responsible for key business operations and delivering results."]))
            paywall = random.random() < 0.3
            posted = random.choice(POSTED)

            key = f"{cc}-{sector}-{comp[0]}"
            if key in used:
                continue
            used.add(key)

            jobs.append({
                "id": job_id,
                "title": title,
                "company": comp[0],
                "companyUrl": comp[1],
                "location": city[0],
                "country": cc,
                "countryName": cfg["name"],
                "lat": city[1],
                "lng": city[2],
                "salary": fmt_salary(sal_max, cfg["symbol"], cfg["period"], cfg["currency"]),
                "salaryMin": sal_min,
                "salaryMax": sal_max,
                "salaryCurrency": cfg["currency"],
                "salaryPeriod": cfg["period"],
                "description": desc,
                "sector": sector,
                "posted": posted,
                "type": jtype,
                "contactEmail": f"careers@{comp[0].lower().replace(' ', '').replace('.','').replace("'","")}.com",
                "paywall": paywall,
            })
            job_id += 1

    return jobs

jobs = gen_jobs()

# Write TypeScript file
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

for i, j in enumerate(jobs):
    comma = "," if i < len(jobs) - 1 else ""
    lines.append('  {')
    lines.append(f'    id: {j["id"]}, title: "{j["title"]}", company: "{j["company"]}",')
    lines.append(f'    companyUrl: "{j["companyUrl"]}", location: "{j["location"]}",')
    lines.append(f'    country: "{j["country"]}", countryName: "{j["countryName"]}",')
    lines.append(f'    lat: {j["lat"]}, lng: {j["lng"]},')
    lines.append(f'    salary: "{j["salary"]}", salaryMin: {j["salaryMin"]}, salaryMax: {j["salaryMax"]},')
    lines.append(f'    salaryCurrency: "{j["salaryCurrency"]}", salaryPeriod: "{j["salaryPeriod"]}",')
    desc = j["description"].replace('"', '\\"')
    lines.append(f'    description: "{desc}",')
    lines.append(f'    sector: "{j["sector"]}", posted: "{j["posted"]}", type: "{j["type"]}",')
    lines.append(f'    contactEmail: "{j["contactEmail"]}",')
    lines.append(f'    paywall: {"true" if j["paywall"] else "false"},')
    lines.append(f'  }}{comma}')
    lines.append('')

lines.append('];')
lines.append('')
lines.append('// In-memory store for company-submitted jobs')
lines.append('const companyJobs: Job[] = [];')
lines.append('')
lines.append('export async function GET(request: Request) {')
lines.append('  const { searchParams } = new URL(request.url);')
lines.append('  const country = searchParams.get("country");')
lines.append('  const type = searchParams.get("type");')
lines.append('  const sector = searchParams.get("sector");')
lines.append('  let filtered = [...jobs, ...companyJobs];')
lines.append('  if (country) {')
lines.append('    filtered = filtered.filter(j => j.country === country);')
lines.append('  }')
lines.append('  if (type && type !== "all") {')
lines.append('    filtered = filtered.filter(j => j.type.toLowerCase() === type.toLowerCase());')
lines.append('  }')
lines.append('  if (sector && sector !== "all") {')
lines.append('    filtered = filtered.filter(j => j.sector === sector);')
lines.append('  }')
lines.append('  return NextResponse.json(filtered);')
lines.append('}')
lines.append('')
lines.append('export async function POST(request: Request) {')
lines.append('  try {')
lines.append('    const body = await request.json();')
lines.append('    const {')
lines.append('      companyName, companyUrl, companyEmail,')
lines.append('      title, location, country, countryName,')
lines.append('      salary, salaryMin, salaryMax, salaryCurrency, salaryPeriod,')
lines.append('      description, sector, type, remote')
lines.append('    } = body;')
lines.append('')
lines.append('    if (!companyName || !title || !location || !country || !description || !sector || !type) {')
lines.append('      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });')
lines.append('    }')
lines.append('')
lines.append('    const newJob: Job = {')
lines.append('      id: jobs.length + companyJobs.length + 1,')
lines.append('      title,')
lines.append('      company: companyName,')
lines.append('      companyUrl: companyUrl || "",')
lines.append('      location,')
lines.append('      country,')
lines.append('      countryName: countryName || country,')
lines.append('      lat: 0, lng: 0,')
lines.append('      salary: salary || "Negotiable",')
lines.append('      salaryMin: salaryMin || 0,')
lines.append('      salaryMax: salaryMax || 0,')
lines.append('      salaryCurrency: salaryCurrency || "USD",')
lines.append('      salaryPeriod: salaryPeriod || "month",')
lines.append('      description,')
lines.append('      sector,')
lines.append('      type: type === "remote" ? "Remote" : type,')
lines.append('      contactEmail: companyEmail || "",')
lines.append('      paywall: false,')
lines.append('    };')
lines.append('')
lines.append('    companyJobs.push(newJob);')
lines.append('    return NextResponse.json({ success: true, job: newJob }, { status: 201 });')
lines.append('  } catch {')
lines.append('    return NextResponse.json({ error: "Invalid request" }, { status: 400 });')
lines.append('  }')
lines.append('}')

with open('/home/z/my-project/src/app/api/jobs/route.ts', 'w') as f:
    f.write('\n'.join(lines))

print(f'Generated {len(jobs)} jobs')
print(f'Countries: {sorted(set(j["country"] for j in jobs))}')