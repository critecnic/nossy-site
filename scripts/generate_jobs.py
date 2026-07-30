#!/usr/bin/env python3
"""Generate 8 jobs per country (160 total) for W-W global job platform."""

countries_jobs = {
    "in": {
        "name": "India", "currency": "INR", "symbol": "\u20b9", "period": "year",
        "jobs": [
            ("Senior Software Engineer", "Tata Consultancy Services", "Mumbai, Maharashtra", 19.076, 72.8777, 1800000, 2800000, "Technology", "Build enterprise-scale applications for global Fortune 500 clients. Work with microservices, cloud-native architecture on AWS/Azure. Lead a team of 6 engineers delivering critical banking and retail solutions."),
            ("Data Scientist", "Infosys BPM", "Bengaluru, Karnataka", 12.9716, 77.5946, 1500000, 2200000, "Data Science", "Analyze large datasets to build predictive models for banking and healthcare clients. Use Python, TensorFlow, and Spark. Present findings to C-level stakeholders across Asia-Pacific operations."),
            ("Product Manager", "Flipkart", "Bengaluru, Karnataka", 12.9716, 77.5946, 2200000, 3500000, "Management", "Own the product roadmap for Flipkart supply chain technology. Manage cross-functional teams of 15+ members. Drive user growth initiatives impacting 400M+ registered users across India."),
            ("UX Designer", "Wipro Design", "Pune, Maharashtra", 18.5204, 73.8567, 1200000, 1800000, "Design", "Design intuitive user experiences for enterprise SaaS products used by millions. Conduct user research, create wireframes and prototypes, and collaborate with engineering teams to deliver pixel-perfect interfaces."),
            ("Financial Analyst", "ICICI Bank", "Mumbai, Maharashtra", 19.076, 72.8777, 1000000, 1600000, "Finance", "Conduct financial modeling, risk assessment, and market research for retail banking products. Prepare investment presentations and support strategic planning for one of India largest private banks."),
            ("Marketing Lead", "Zomato", "Gurugram, Haryana", 28.4595, 77.0266, 1400000, 2200000, "Marketing", "Lead digital marketing campaigns across India food delivery market. Manage a team of 12 specialists, oversee annual budget of 50 crore, and develop growth strategies for tier-2 city expansion."),
            ("DevOps Engineer", "Razorpay", "Bengaluru, Karnataka", 12.9716, 77.5946, 1600000, 2400000, "Technology", "Manage CI/CD pipelines and cloud infrastructure on AWS and GCP. Automate deployment processes for payment systems handling 10M+ daily transactions with 99.99% uptime."),
            ("Sales Manager", "Reliance Retail", "Mumbai, Maharashtra", 19.076, 72.8777, 1100000, 1800000, "Sales", "Drive B2B enterprise sales for India largest retail chain. Manage a pipeline of 200 crore+, negotiate contracts with key partners, and exceed quarterly revenue targets across western India."),
        ]
    },
    "us": {
        "name": "United States", "currency": "USD", "symbol": "$", "period": "year",
        "jobs": [
            ("Senior Software Engineer", "TechVision Corp", "San Francisco, CA", 37.7749, -122.4194, 145000, 185000, "Technology", "Build scalable distributed systems powering next-gen cloud infrastructure. Work with microservices architecture, Kubernetes, and real-time data pipelines serving millions of users daily."),
            ("Product Designer", "InnovateUI Labs", "New York, NY", 40.7128, -74.006, 110000, 140000, "Design", "Design intuitive user experiences for enterprise SaaS products. Conduct user research, create wireframes and prototypes, and collaborate closely with engineering teams to deliver pixel-perfect interfaces."),
            ("Sales Executive", "MarketPro Global", "Miami, FL", 25.7617, -80.1918, 75000, 120000, "Sales", "Drive B2B enterprise sales across Latin American markets. Manage a pipeline of $5M+, negotiate contracts with C-suite executives, and exceed quarterly revenue targets consistently."),
            ("Data Engineer", "DataFlow Systems", "Austin, TX", 30.2672, -97.7431, 130000, 170000, "Data Science", "Build and optimize data pipelines processing petabytes of information. Work with Apache Kafka, Spark, and Snowflake to deliver real-time analytics for Fortune 500 clients."),
            ("Marketing Director", "BrandWave Agency", "Chicago, IL", 41.8781, -87.6298, 120000, 160000, "Marketing", "Lead multi-channel marketing campaigns for major consumer brands. Manage a team of 20+ specialists, oversee $10M annual budget, and develop data-driven strategies that increased ROI by 35%."),
            ("HR Business Partner", "PeopleFirst Inc", "Seattle, WA", 47.6062, -122.3321, 95000, 130000, "HR", "Partner with engineering leadership to drive talent strategy for a 2000+ employee tech company. Lead hiring programs, performance management, and employee engagement initiatives."),
            ("Healthcare Administrator", "MedCare Solutions", "Boston, MA", 42.3601, -71.0589, 85000, 115000, "Healthcare", "Oversee operations for a network of 15 healthcare facilities across New England. Manage budgets of $50M+, ensure regulatory compliance, and implement process improvements."),
            ("Mechanical Engineer", "AeroDynamics Corp", "Los Angeles, CA", 34.0522, -118.2437, 105000, 145000, "Engineering", "Design and test aerospace components for commercial aircraft. Use CAD software and simulation tools, collaborate with cross-functional teams on next-generation propulsion systems."),
        ]
    },
    "cn": {
        "name": "China", "currency": "CNY", "symbol": "\u00a5", "period": "year",
        "jobs": [
            ("Full-Stack Developer", "Tencent Cloud", "Shenzhen, Guangdong", 22.5431, 114.0579, 350000, 550000, "Technology", "Develop high-performance web applications serving 1B+ users. Work with React, Go, and distributed databases. Collaborate with international teams on AI-powered products."),
            ("AI Research Scientist", "Baidu Research", "Beijing", 39.9042, 116.4074, 450000, 700000, "Technology", "Conduct research in natural language processing and large language models. Publish papers at top AI conferences. Develop production-ready AI solutions for autonomous driving."),
            ("Product Manager", "Alibaba Group", "Hangzhou, Zhejiang", 30.2741, 120.1551, 400000, 650000, "Management", "Own the product roadmap for Taobao recommendation engine. Manage cross-functional teams of 20+ members and drive personalization features for 800M+ active users."),
            ("UX Researcher", "ByteDance", "Beijing", 39.9042, 116.4074, 300000, 480000, "Design", "Plan and execute user research studies for TikTok and Douyin. Synthesize findings into actionable recommendations, create personas and journey maps for global short-video products."),
            ("Financial Controller", "Huawei Technologies", "Shenzhen, Guangdong", 22.5431, 114.0579, 380000, 580000, "Finance", "Oversee financial planning and analysis for the consumer electronics division. Manage budgets of 10B+ RMB, ensure compliance, and support strategic investment decisions."),
            ("Marketing Manager", "JD.com", "Beijing", 39.9042, 116.4074, 280000, 420000, "Marketing", "Lead digital marketing campaigns for China largest e-commerce platform. Manage a team of 15 specialists, oversee annual campaigns during 618 and Double 11 shopping festivals."),
            ("Data Analyst", "Meituan", "Beijing", 39.9042, 116.4074, 250000, 400000, "Data Science", "Analyze user behavior data for food delivery and local services platform. Build dashboards, develop predictive models, and work with product teams to optimize conversion funnels."),
            ("Sales Director", "Xiaomi Corp", "Beijing", 39.9042, 116.4074, 350000, 550000, "Sales", "Lead enterprise and government sales for IoT and smartphone products across Asia-Pacific. Manage a team of 30+ account managers and exceed annual revenue targets of 5B RMB."),
        ]
    },
    "br": {
        "name": "Brazil", "currency": "BRL", "symbol": "R$", "period": "month",
        "jobs": [
            ("Data Scientist", "DataPulse Analytics", "Sao Paulo, SP", -23.5505, -46.6333, 18000, 25000, "Data Science", "Analyze large datasets to extract actionable business insights. Build predictive models using Python, TensorFlow and Spark. Present findings to C-level stakeholders."),
            ("Backend Developer", "NexaSoft Technologies", "Rio de Janeiro, RJ", -22.9068, -43.1729, 14000, 20000, "Technology", "Develop robust RESTful APIs and microservices using Node.js and PostgreSQL. Implement authentication systems, optimize database queries, and mentor junior developers."),
            ("Product Manager", "Nubank", "Sao Paulo, SP", -23.5505, -46.6333, 22000, 35000, "Management", "Own the product roadmap for digital banking features serving 80M+ customers. Manage cross-functional teams and drive innovation in Latin America largest digital bank."),
            ("UX Designer", "Concrete Solucoes", "Sao Paulo, SP", -23.5505, -46.6333, 12000, 18000, "Design", "Design user experiences for enterprise software and mobile apps. Conduct usability testing, create design systems, and collaborate with development teams on agile projects."),
            ("Marketing Analyst", "Ambev", "Sao Paulo, SP", -23.5505, -46.6333, 8000, 13000, "Marketing", "Develop and execute marketing campaigns for Brazil largest beverage company. Analyze market trends, manage social media strategy, and support brand positioning across national markets."),
            ("Financial Analyst", "Itau Unibanco", "Sao Paulo, SP", -23.5505, -46.6333, 10000, 16000, "Finance", "Conduct financial analysis and risk assessment for corporate banking division. Prepare credit reports, support loan structuring, and assist in portfolio management for top-tier clients."),
            ("Sales Manager", "Magazine Luiza", "Franca, SP", -20.5386, -47.4027, 9000, 15000, "Sales", "Lead B2B sales operations for one of Brazil largest e-commerce retailers. Manage key accounts, negotiate enterprise contracts, and drive revenue growth in the wholesale channel."),
            ("HR Specialist", "WEG S.A.", "Jaragua do Sul, SC", -26.4834, -49.0665, 7000, 11000, "HR", "Manage recruitment and talent development programs for a global manufacturing company. Lead employer branding initiatives and implement performance management systems across 5 facilities."),
        ]
    },
    "gb": {
        "name": "United Kingdom", "currency": "GBP", "symbol": "\u00a3", "period": "year",
        "jobs": [
            ("Financial Analyst", "CapitalEdge Partners", "London", 51.5074, -0.1278, 65000, 85000, "Finance", "Conduct financial modeling, valuation analysis, and market research for M&A transactions. Prepare investment presentations for institutional clients."),
            ("DevOps Engineer", "Barclays Technology", "Manchester", 53.4808, -2.2426, 55000, 75000, "Technology", "Manage CI/CD pipelines and cloud infrastructure on AWS. Automate deployment processes for banking applications, ensure 99.99% uptime for critical financial services."),
            ("Product Designer", "BBC Digital", "London", 51.5074, -0.1278, 50000, 70000, "Design", "Design digital experiences for BBC streaming and news platforms. Conduct user research, create accessible interfaces, and work with content teams to serve 40M+ weekly users."),
            ("Marketing Manager", "Unilever UK", "London", 51.5074, -0.1278, 58000, 78000, "Marketing", "Lead brand marketing campaigns for consumer goods across UK and Ireland. Manage a team of 10 specialists, oversee budget of 20M GBP annual, and develop omnichannel strategies."),
            ("Data Scientist", "Tesco Analytics", "London", 51.5074, -0.1278, 60000, 82000, "Data Science", "Build machine learning models for customer personalization and demand forecasting. Analyze purchasing patterns of 25M+ Clubcard members to optimize retail operations."),
            ("Software Engineer", "Deloitte Digital", "Edinburgh", 55.9533, -3.1883, 52000, 72000, "Technology", "Build custom software solutions for government and financial services clients. Work with modern tech stack including React, Node.js, and cloud platforms."),
            ("HR Director", "Vodafone UK", "Newbury", 51.3984, -1.3175, 70000, 95000, "HR", "Lead people strategy for Vodafone UK operations with 10,000+ employees. Drive talent acquisition, diversity initiatives, and organizational development programs."),
            ("Healthcare Consultant", "NHS Digital", "Leeds", 53.7965, -1.5479, 48000, 68000, "Healthcare", "Consult on digital transformation projects for the National Health Service. Analyze healthcare data, implement EHR systems, and improve patient care delivery across trusts."),
        ]
    },
    "de": {
        "name": "Germany", "currency": "EUR", "symbol": "\u20ac", "period": "year",
        "jobs": [
            ("UX Researcher", "SAP Design", "Berlin", 52.52, 13.405, 52000, 68000, "Design", "Plan and execute qualitative and quantitative user research studies for enterprise software. Synthesize findings into actionable recommendations for B2B SaaS products."),
            ("Mechanical Engineer", "BMW Group", "Munich, Bavaria", 48.1351, 11.582, 58000, 78000, "Engineering", "Design and test components for electric vehicle powertrains. Use CAD software and simulation tools. Collaborate with cross-functional teams on next-generation EV platforms."),
            ("Software Developer", "SAP SE", "Walldorf, Baden-Wuerttemberg", 49.2963, 8.6555, 55000, 75000, "Technology", "Develop enterprise resource planning modules serving 400,000+ customers worldwide. Work with ABAP, JavaScript, and HANA database for business-critical applications."),
            ("Data Analyst", "Siemens AG", "Munich, Bavaria", 48.1351, 11.582, 50000, 70000, "Data Science", "Analyze industrial IoT data from smart factories across Europe. Build dashboards, develop predictive maintenance models, and optimize manufacturing processes."),
            ("Marketing Specialist", "Adidas AG", "Herzogenaurach, Bavaria", 49.5686, 10.8876, 48000, 65000, "Marketing", "Execute digital marketing campaigns for DACH region. Manage social media, influencer partnerships, and e-commerce marketing for key product launches."),
            ("Financial Controller", "Deutsche Bank", "Frankfurt, Hesse", 50.1109, 8.6821, 65000, 88000, "Finance", "Oversee financial reporting and compliance for the investment banking division. Manage budgets, prepare regulatory filings, and support audit processes."),
            ("Sales Manager", "Bosch Group", "Stuttgart, Baden-Wuerttemberg", 48.7758, 9.1829, 56000, 76000, "Sales", "Manage B2B sales for industrial technology solutions across Central Europe. Lead a team of 15 account managers, negotiate contracts with automotive OEMs."),
            ("HR Manager", "Allianz SE", "Munich, Bavaria", 48.1351, 11.582, 52000, 72000, "HR", "Lead talent management and organizational development for 150,000+ employee insurance group. Drive employer branding, training programs, and international mobility initiatives."),
        ]
    },
    "fr": {
        "name": "France", "currency": "EUR", "symbol": "\u20ac", "period": "year",
        "jobs": [
            ("DevOps Engineer", "CloudNine Systems", "Paris", 48.8566, 2.3522, 60000, 80000, "Technology", "Manage CI/CD pipelines and cloud infrastructure on AWS and GCP. Automate deployment processes and ensure 99.99% uptime for critical production services."),
            ("AI/ML Engineer", "DeepCore AI", "Lyon", 45.764, 4.8357, 55000, 75000, "Technology", "Design and deploy machine learning models for NLP and computer vision applications. Optimize model inference for edge devices and collaborate with research teams."),
            ("Product Manager", "Ubisoft", "Montreuil", 48.8645, 2.4429, 52000, 72000, "Management", "Own the product roadmap for Ubisoft mobile gaming division. Manage cross-functional teams and drive features for games with 50M+ monthly active players."),
            ("UX Designer", "Airbus", "Toulouse", 43.6047, 1.4442, 48000, 65000, "Design", "Design user interfaces for aircraft cockpit systems and maintenance platforms. Ensure compliance with aviation safety standards and collaborate with engineers."),
            ("Marketing Manager", "LOreal", "Paris", 48.8566, 2.3522, 50000, 70000, "Marketing", "Lead digital marketing strategy for luxury beauty brands across France and Benelux. Manage a team of 8, oversee budget of 15M EUR, and develop influencer strategies."),
            ("Financial Analyst", "BNP Paribas", "Paris", 48.8566, 2.3522, 55000, 75000, "Finance", "Conduct financial analysis for corporate banking clients. Prepare credit assessments, support loan structuring for mid-cap companies, and manage risk portfolios."),
            ("Data Scientist", "Orange Telecom", "Paris", 48.8566, 2.3522, 58000, 78000, "Data Science", "Build predictive models for customer churn and network optimization. Analyze data from 30M+ subscribers to improve service quality and reduce operational costs."),
            ("Sales Executive", "Schneider Electric", "Grenoble", 45.1885, 5.7245, 45000, 65000, "Sales", "Drive enterprise sales for energy management solutions across Southern Europe. Manage key accounts, negotiate contracts, and achieve annual targets of 20M EUR."),
        ]
    },
    "jp": {
        "name": "Japan", "currency": "JPY", "symbol": "\u00a5", "period": "year",
        "jobs": [
            ("Frontend Engineer", "Sony Interactive", "Tokyo", 35.6762, 139.6503, 7000000, 10000000, "Technology", "Build high-performance web interfaces for PlayStation Network services. Work with React, TypeScript, and WebGL. Optimize for performance across 100M+ active users."),
            ("Marketing Manager", "Toyota Motor Corp", "Nagoya, Aichi", 35.1815, 136.9066, 8500000, 12000000, "Marketing", "Lead digital marketing campaigns for Toyota EV lineup across Asia-Pacific. Manage a team of 12 specialists, oversee 500M JPY annual budget."),
            ("Data Scientist", "Rakuten", "Tokyo", 35.6762, 139.6503, 8000000, 11000000, "Data Science", "Build recommendation systems for Japan largest e-commerce ecosystem. Analyze data from 100M+ members to optimize personalization and increase conversion rates."),
            ("Mechanical Engineer", "Mitsubishi Heavy Industries", "Yokohama", 35.4437, 139.638, 6000000, 8500000, "Engineering", "Design components for industrial machinery and defense systems. Use advanced simulation tools, manage testing protocols, and collaborate with international engineering teams."),
            ("UX Designer", "LINE Corp", "Tokyo", 35.6762, 139.6503, 7500000, 10500000, "Design", "Design messaging and fintech features for LINE app with 90M+ Japanese users. Conduct user research, create prototypes, and iterate based on A/B testing results."),
            ("Financial Analyst", "Nomura Securities", "Tokyo", 35.6762, 139.6503, 9000000, 13000000, "Finance", "Conduct equity research and financial modeling for Japanese and Asian markets. Prepare investment reports for institutional clients and support IPO processes."),
            ("HR Business Partner", "SoftBank Group", "Tokyo", 35.6762, 139.6503, 7000000, 9500000, "HR", "Partner with technology leadership on talent strategy for SoftBank portfolio companies. Drive recruitment programs for AI and robotics divisions across Japan."),
            ("Sales Director", "Nintendo", "Kyoto", 35.0116, 135.7681, 8000000, 12000000, "Sales", "Lead sales operations for gaming hardware and software across Asia-Pacific. Manage distribution partnerships, achieve annual revenue targets of 500B JPY."),
        ]
    },
    "ca": {
        "name": "Canada", "currency": "CAD", "symbol": "C$", "period": "year",
        "jobs": [
            ("Project Manager", "BuildRight Consulting", "Toronto, ON", 43.6532, -79.3832, 85000, 110000, "Management", "Oversee large-scale IT implementation projects from initiation to delivery. Manage cross-functional teams of 20+ members using Agile methodologies."),
            ("Healthcare Data Analyst", "Maple Health Tech", "Vancouver, BC", 49.2827, -123.1207, 70000, 95000, "Healthcare", "Analyze healthcare data to improve patient outcomes across British Columbia. Build dashboards, develop predictive models for hospital resource planning."),
            ("Software Developer", "Shopify", "Ottawa, ON", 45.4215, -75.6972, 90000, 130000, "Technology", "Build e-commerce platform features serving 2M+ merchants worldwide. Work with React, Ruby on Rails, and distributed systems at massive scale."),
            ("Marketing Specialist", "Bell Media", "Toronto, ON", 43.6532, -79.3832, 60000, 82000, "Marketing", "Execute multi-channel marketing campaigns for Canada largest telecom. Manage digital advertising, content strategy, and brand partnerships."),
            ("Financial Advisor", "RBC Wealth Management", "Toronto, ON", 43.6532, -79.3832, 75000, 110000, "Finance", "Provide financial planning and investment advice to high-net-worth clients. Manage portfolios of 50M+ CAD and develop tailored wealth strategies."),
            ("UX Researcher", "Collabora", "Montreal, QC", 45.5017, -73.5673, 65000, 88000, "Design", "Conduct user research for open-source software products. Plan usability studies, create personas, and deliver insights for global developer communities."),
            ("Data Engineer", "TD Bank", "Toronto, ON", 43.6532, -79.3832, 88000, 120000, "Data Science", "Build data pipelines for banking analytics and fraud detection systems. Work with Apache Spark, Kafka, and cloud data warehouses."),
            ("Sales Manager", "Lululemon", "Vancouver, BC", 49.2827, -123.1207, 70000, 95000, "Sales", "Lead enterprise and franchise sales for athletic apparel across North America. Manage key accounts, develop wholesale strategies, and expand retail partnerships."),
        ]
    },
    "au": {
        "name": "Australia", "currency": "AUD", "symbol": "A$", "period": "year",
        "jobs": [
            ("Mining Engineer", "BHP Group", "Perth, WA", -31.9505, 115.8605, 120000, 160000, "Engineering", "Plan and optimize mining operations across Western Australia. Use advanced simulation software, manage drilling schedules, and implement safety protocols."),
            ("Full-Stack Developer", "Atlassian", "Sydney, NSW", -33.8688, 151.2093, 130000, 170000, "Technology", "Build collaboration tools used by 250K+ organizations worldwide. Work with React, Node.js, and microservices. Ship features to millions of users."),
            ("Marketing Director", "Qantas Airways", "Sydney, NSW", -33.8688, 151.2093, 110000, 150000, "Marketing", "Lead brand marketing for Australia flagship airline. Manage a team of 15, oversee 30M AUD budget, and drive loyalty program growth for 12M+ members."),
            ("Financial Analyst", "Commonwealth Bank", "Sydney, NSW", -33.8688, 151.2093, 95000, 130000, "Finance", "Conduct financial analysis for retail and institutional banking products. Prepare risk assessments, support loan approvals, and develop forecasting models."),
            ("UX Designer", "Canva", "Sydney, NSW", -33.8688, 151.2093, 100000, 140000, "Design", "Design features for the world leading online design platform with 170M+ monthly users. Conduct user research, create prototypes, and A/B test new features."),
            ("Data Scientist", "CSIRO", "Melbourne, VIC", -37.8136, 144.9631, 105000, 145000, "Data Science", "Apply machine learning to environmental and agricultural research. Build predictive models for climate change impact, crop yield optimization, and resource management."),
            ("HR Manager", "Telstra", "Melbourne, VIC", -37.8136, 144.9631, 90000, 120000, "HR", "Lead people operations for Australia largest telecommunications company. Drive talent acquisition, employee engagement, and organizational transformation initiatives."),
            ("Sales Executive", "Wesfarmers", "Perth, WA", -31.9505, 115.8605, 85000, 115000, "Sales", "Drive B2B sales for retail conglomerate spanning hardware, chemicals, and supermarkets. Manage key accounts and develop strategic partnerships across ANZ."),
        ]
    },
    "mx": {
        "name": "Mexico", "currency": "MXN", "symbol": "MX$", "period": "month",
        "jobs": [
            ("Manufacturing Engineer", "Grupo Bimbo", "Mexico City, CDMX", 19.4326, -99.1332, 35000, 55000, "Engineering", "Optimize production lines across 200+ manufacturing facilities in Latin America. Implement Lean Six Sigma methodologies and improve throughput."),
            ("Software Developer", "Rappi", "Mexico City, CDMX", 19.4326, -99.1332, 30000, 48000, "Technology", "Build delivery platform features serving 30M+ users across Latin America. Work with React Native, Node.js, and real-time tracking systems."),
            ("Marketing Manager", "Grupo Modelo", "Mexico City, CDMX", 19.4326, -99.1332, 28000, 42000, "Marketing", "Lead marketing campaigns for Mexico largest beverage brands. Manage a team of 10, oversee 200M MXN annual budget, and drive market share growth."),
            ("Financial Analyst", "Banorte", "Mexico City, CDMX", 19.4326, -99.1332, 25000, 40000, "Finance", "Conduct financial analysis for commercial banking products. Prepare credit risk assessments, support corporate lending decisions, and manage portfolio analytics."),
            ("Data Scientist", "Kueski", "Mexico City, CDMX", 19.4326, -99.1332, 35000, 52000, "Data Science", "Build credit scoring models and fraud detection systems for fintech platform. Analyze alternative data sources to serve underbanked populations in Mexico."),
            ("UX Designer", "Softtek", "Monterrey, NL", 25.6866, -100.3161, 22000, 35000, "Design", "Design enterprise software interfaces for Fortune 500 clients. Create design systems, conduct usability testing, and collaborate with development teams."),
            ("Sales Director", "FEMSA", "Monterrey, NL", 25.6866, -100.3161, 38000, 58000, "Sales", "Lead commercial operations for convenience store chain OXXO across Latin America. Manage distribution partnerships, expand franchise network, and drive revenue."),
            ("HR Manager", "CEMEX", "Monterrey, NL", 25.6866, -100.3161, 28000, 42000, "HR", "Manage talent development for global building materials company. Lead recruitment, training programs, and employee engagement across 10+ Mexican facilities."),
        ]
    },
    "id": {
        "name": "Indonesia", "currency": "IDR", "symbol": "Rp", "period": "month",
        "jobs": [
            ("Mobile Developer", "Gojek", "Jakarta", -6.2088, 106.8456, 25000000, 40000000, "Technology", "Build super-app features serving 190M+ users across Southeast Asia. Work with React Native and Kotlin. Implement real-time tracking and payment integration."),
            ("Data Analyst", "Tokopedia", "Jakarta", -6.2088, 106.8456, 22000000, 35000000, "Data Science", "Analyze e-commerce data for Indonesia largest marketplace. Build dashboards, develop recommendation algorithms, and optimize seller performance metrics."),
            ("Product Manager", "Traveloka", "Jakarta", -6.2088, 106.8456, 30000000, 48000000, "Management", "Own the product roadmap for travel booking platform. Manage cross-functional teams and drive features serving 60M+ monthly active users across 6 countries."),
            ("Marketing Specialist", "Bukalapak", "Jakarta", -6.2088, 106.8456, 18000000, 28000000, "Marketing", "Execute digital marketing campaigns for Indonesia e-commerce platform. Manage social media, performance marketing, and brand partnerships."),
            ("Financial Analyst", "Bank Mandiri", "Jakarta", -6.2088, 106.8456, 20000000, 32000000, "Finance", "Conduct financial analysis for Indonesia largest bank. Prepare credit assessments, support corporate lending, and develop financial forecasting models."),
            ("UX Designer", "Shopee Indonesia", "Jakarta", -6.2088, 106.8456, 20000000, 32000000, "Design", "Design shopping and payment features for Southeast Asia leading e-commerce app. Conduct user research, create prototypes, and optimize conversion funnels."),
            ("Backend Engineer", "Dana", "Jakarta", -6.2088, 106.8456, 25000000, 40000000, "Technology", "Build payment and financial services infrastructure for Indonesia leading digital wallet. Work with microservices architecture handling millions of daily transactions."),
            ("Sales Manager", "Unilever Indonesia", "Jakarta", -6.2088, 106.8456, 22000000, 35000000, "Sales", "Lead sales operations for FMCG products across Indonesian archipelago. Manage distribution networks, key accounts, and achieve annual revenue targets."),
        ]
    },
    "kr": {
        "name": "South Korea", "currency": "KRW", "symbol": "\u20a9", "period": "year",
        "jobs": [
            ("Semiconductor Engineer", "Samsung Electronics", "Suwon, Gyeonggi", 37.2636, 127.0286, 60000000, 90000000, "Engineering", "Design and test next-generation semiconductor chips for mobile and data center applications. Work with cutting-edge lithography processes."),
            ("Software Engineer", "Kakao Corp", "Jeonju", 35.8242, 127.148, 50000000, 75000000, "Technology", "Build features for Korea super-app ecosystem with 50M+ users. Work with microservices, React Native, and large-scale distributed systems."),
            ("Product Manager", "Coupang", "Seoul", 37.5665, 126.978, 65000000, 95000000, "Management", "Own the product roadmap for Korea leading e-commerce platform. Drive logistics optimization, same-day delivery features, and membership growth."),
            ("Data Scientist", "Naver Corp", "Seongnam", 37.4386, 127.1378, 55000000, 80000000, "Data Science", "Build AI-powered search and recommendation systems for Korea largest portal. Develop NLP models for Korean language processing and content personalization."),
            ("Marketing Manager", "LG Electronics", "Seoul", 37.5665, 126.978, 48000000, 70000000, "Marketing", "Lead global marketing campaigns for consumer electronics. Manage a team of 15, oversee 50B KRW budget, and develop brand strategies for global markets."),
            ("Financial Analyst", "Shinhan Bank", "Seoul", 37.5665, 126.978, 52000000, 78000000, "Finance", "Conduct financial analysis for Korea second-largest bank. Prepare risk assessments, support corporate banking decisions, and manage portfolio analytics."),
            ("UX Designer", "NCSoft", "Pangyo", 37.3944, 127.1112, 45000000, 68000000, "Design", "Design game UI/UX for MMORPG titles with millions of global players. Create immersive interfaces, conduct playtesting, and iterate on player feedback."),
            ("HR Director", "Hyundai Motor", "Seoul", 37.5665, 126.978, 60000000, 85000000, "HR", "Lead people strategy for Korea largest automotive group with 70,000+ employees. Drive talent acquisition, leadership development, and global mobility programs."),
        ]
    },
    "sa": {
        "name": "Saudi Arabia", "currency": "SAR", "symbol": "SAR", "period": "month",
        "jobs": [
            ("Infrastructure Project Manager", "NEOM", "Riyadh", 24.7136, 46.6753, 35000, 55000, "Management", "Lead mega-infrastructure projects as part of Vision 2030. Manage multi-billion riyal construction programs and coordinate with international contractors."),
            ("Software Engineer", "STC Solutions", "Riyadh", 24.7136, 46.6753, 25000, 40000, "Technology", "Build digital transformation solutions for Saudi Arabia telecom sector. Work with cloud platforms, API development, and 5G network applications."),
            ("Financial Analyst", "Saudi Aramco", "Dhahran", 26.3927, 49.9777, 30000, 48000, "Finance", "Conduct financial analysis for the world largest oil company. Prepare investment appraisals, support capital allocation decisions, and manage financial planning."),
            ("Marketing Manager", "Almarai", "Riyadh", 24.7136, 46.6753, 22000, 35000, "Marketing", "Lead marketing for Saudi Arabia largest food and beverage company. Manage brand campaigns, oversee digital transformation of marketing channels."),
            ("Mechanical Engineer", "SABIC", "Riyadh", 24.7136, 46.6753, 28000, 42000, "Engineering", "Design and optimize chemical processing equipment for petrochemical operations. Ensure compliance with international safety and environmental standards."),
            ("Data Scientist", "Noon", "Riyadh", 24.7136, 46.6753, 30000, 45000, "Data Science", "Build recommendation and search algorithms for e-commerce platform. Analyze customer behavior data to optimize product discovery and conversion."),
            ("HR Manager", "Pfizer Saudi", "Jeddah", 21.4858, 39.1925, 20000, 32000, "HR", "Manage talent acquisition and development for pharmaceutical operations. Drive Saudi nationalization programs and implement performance management systems."),
            ("Sales Executive", "Emaar EC", "Riyadh", 24.7136, 46.6753, 25000, 40000, "Sales", "Drive real estate sales for luxury developments in Riyadh and Jeddah. Manage key accounts, negotiate high-value contracts, and achieve annual sales targets."),
        ]
    },
    "ae": {
        "name": "UAE", "currency": "AED", "symbol": "AED", "period": "month",
        "jobs": [
            ("FinTech Product Manager", "Careem", "Dubai", 25.2048, 55.2708, 35000, 55000, "Finance", "Lead product strategy for Careem Pay, the region leading super-app payment platform. Define roadmap, manage a team of 10 product managers."),
            ("Software Developer", "Dubai Electricity", "Dubai", 25.2048, 55.2708, 25000, 40000, "Technology", "Build smart city applications for Dubai utility services. Work with IoT platforms, real-time monitoring dashboards, and AI-powered analytics."),
            ("Marketing Director", "Emirates Airlines", "Dubai", 25.2048, 55.2708, 40000, 65000, "Marketing", "Lead global marketing for one of the world most iconic airlines. Manage a team of 25, oversee 500M AED budget, and drive brand campaigns globally."),
            ("Financial Controller", "Emirates NBD", "Dubai", 25.2048, 55.2708, 30000, 48000, "Finance", "Oversee financial reporting for the UAE largest banking group. Manage budgets, regulatory compliance, and strategic financial planning."),
            ("UX Designer", "Careem", "Dubai", 25.2048, 55.2708, 22000, 35000, "Design", "Design super-app experiences for ride-hailing, delivery, and payments. Conduct user research, create prototypes, and optimize for diverse Middle Eastern markets."),
            ("Data Engineer", "Majid Al Futtaim", "Dubai", 25.2048, 55.2708, 28000, 42000, "Data Science", "Build data pipelines for retail and entertainment conglomerate. Develop analytics solutions for 30M+ customers across malls and hotels."),
            ("Sales Manager", "Chalhoub Group", "Dubai", 25.2048, 55.2708, 25000, 40000, "Sales", "Lead luxury retail sales across the Middle East. Manage relationships with 300+ luxury brands, develop wholesale strategies, and drive revenue growth."),
            ("HR Business Partner", "DP World", "Dubai", 25.2048, 55.2708, 25000, 38000, "HR", "Partner with operations leadership on talent strategy for global ports operator. Drive recruitment for 50,000+ employee workforce across 40 countries."),
        ]
    },
    "es": {
        "name": "Spain", "currency": "EUR", "symbol": "\u20ac", "period": "year",
        "jobs": [
            ("Marketing Manager", "GrowthHub Digital", "Madrid", 40.4168, -3.7038, 55000, 72000, "Marketing", "Lead multi-channel marketing campaigns across EMEA markets. Manage a team of 8 marketing specialists and develop brand strategies."),
            ("Mobile Developer", "AppForge Studio", "Barcelona", 41.3874, 2.1686, 48000, 65000, "Technology", "Build cross-platform mobile applications using React Native and Swift. Implement push notifications, offline sync, and biometric authentication."),
            ("Data Scientist", "Telefonica", "Madrid", 40.4168, -3.7038, 52000, 70000, "Data Science", "Build machine learning models for telecommunications fraud detection and customer analytics. Analyze data from 350M+ global customers."),
            ("Financial Analyst", "Santander Bank", "Madrid", 40.4168, -3.7038, 45000, 62000, "Finance", "Conduct financial analysis for one of Europe largest banks. Prepare credit risk assessments, support corporate lending, and manage portfolio analytics."),
            ("Product Manager", "Glovo", "Barcelona", 41.3874, 2.1686, 55000, 75000, "Management", "Own the product roadmap for food delivery platform operating in 25+ countries. Manage cross-functional teams and drive growth initiatives."),
            ("UX Designer", "Zara", "A Coruna", 43.3623, -8.4115, 40000, 58000, "Design", "Design e-commerce and in-store digital experiences for the world largest fashion retailer. Create responsive designs for 50M+ monthly online visitors."),
            ("Software Engineer", "Globant", "Madrid", 40.4168, -3.7038, 48000, 68000, "Technology", "Build digital solutions for enterprise clients across industries. Work with modern tech stacks including cloud, AI, and agile development practices."),
            ("Sales Executive", "Mahou San Miguel", "Madrid", 40.4168, -3.7038, 42000, 58000, "Sales", "Drive B2B sales for Spain largest beverage company. Manage key accounts, negotiate distribution agreements, and expand market presence nationally."),
        ]
    },
    "it": {
        "name": "Italy", "currency": "EUR", "symbol": "\u20ac", "period": "year",
        "jobs": [
            ("Fashion E-Commerce Manager", "YOOX NET-A-PORTER", "Milan, Lombardy", 45.4642, 9.19, 50000, 70000, "Marketing", "Manage the luxury e-commerce platform for the Italian market. Optimize conversion funnels and collaborate with fashion brands on exclusive launches."),
            ("Software Developer", "Deliveroo Italy", "Milan, Lombardy", 45.4642, 9.19, 42000, 58000, "Technology", "Build delivery platform features serving Italian market. Work with real-time logistics systems, payment integration, and restaurant management tools."),
            ("Financial Analyst", "UniCredit", "Milan, Lombardy", 45.4642, 9.19, 48000, 68000, "Finance", "Conduct financial analysis for one of Europe largest banking groups. Prepare risk assessments, support investment banking, and manage portfolio analytics."),
            ("UX Designer", "Ferrari", "Maranello, Emilia-Romagna", 44.5314, 10.8658, 45000, 62000, "Design", "Design digital experiences for Ferrari online sales and brand platforms. Create premium user interfaces that reflect the luxury brand identity."),
            ("Data Scientist", "Enel", "Rome, Lazio", 41.9028, 12.4964, 50000, 70000, "Data Science", "Build predictive models for energy consumption and renewable energy optimization. Analyze data from 70M+ customers across 30 countries."),
            ("Mechanical Engineer", "Leonardo S.p.A.", "Rome, Lazio", 41.9028, 12.4964, 46000, 65000, "Engineering", "Design aerospace and defense systems. Use advanced CAD and simulation tools for helicopter and aircraft component development."),
            ("HR Manager", "Luxeottica", "Milan, Lombardy", 45.4642, 9.19, 42000, 58000, "HR", "Lead talent management for global eyewear manufacturer. Drive recruitment, training programs, and organizational development across European operations."),
            ("Sales Manager", "Barilla Group", "Parma, Emilia-Romagna", 44.8015, 10.3279, 40000, 56000, "Sales", "Lead commercial operations for Italy largest food company. Manage distribution networks, key accounts, and export sales across 100+ countries."),
        ]
    },
    "pt": {
        "name": "Portugal", "currency": "EUR", "symbol": "\u20ac", "period": "year",
        "jobs": [
            ("Customer Success Manager", "Remote Portugal", "Lisbon", 38.7223, -9.1393, 35000, 48000, "Management", "Manage enterprise client relationships for a leading remote work platform. Drive product adoption, reduce churn, and expand accounts across EMEA."),
            ("Software Engineer", "OutSystems", "Lisbon", 38.7223, -9.1393, 38000, 55000, "Technology", "Build low-code platform features used by Fortune 500 companies. Work with React, Java, and cloud-native architecture serving millions of developers."),
            ("Data Analyst", "Worten", "Lisbon", 38.7223, -9.1393, 28000, 40000, "Data Science", "Analyze retail data for Portugal largest electronics retailer. Build dashboards, develop demand forecasting models, and optimize inventory management."),
            ("UX Designer", "Farfetch", "Porto", 41.1579, -8.6291, 32000, 46000, "Design", "Design luxury fashion e-commerce experiences for global platform. Create responsive designs, conduct A/B testing, and optimize for mobile-first shopping."),
            ("Marketing Specialist", "Super Bock Group", "Lisbon", 38.7223, -9.1393, 26000, 38000, "Marketing", "Execute marketing campaigns for Portugal leading beverage brand. Manage digital marketing, event sponsorships, and brand partnerships."),
            ("Financial Analyst", "Caixa Geral de Depositos", "Lisbon", 38.7223, -9.1393, 30000, 42000, "Finance", "Conduct financial analysis for Portugal largest bank. Prepare credit assessments, support corporate lending, and develop financial forecasting models."),
            ("DevOps Engineer", "Talkdesk", "Lisbon", 38.7223, -9.1393, 36000, 52000, "Technology", "Manage cloud infrastructure and CI/CD pipelines for cloud contact center platform. Automate deployments and ensure high availability for enterprise clients."),
            ("HR Specialist", "Vodafone Portugal", "Lisbon", 38.7223, -9.1393, 25000, 36000, "HR", "Manage recruitment and employee development programs. Lead employer branding initiatives and support organizational change management."),
        ]
    },
    "ng": {
        "name": "Nigeria", "currency": "NGN", "symbol": "NGN", "period": "year",
        "jobs": [
            ("Fintech Software Developer", "Flutterwave", "Lagos", 6.5244, 3.3792, 12000000, 20000000, "Finance", "Build payment processing infrastructure serving 30+ African countries. Work with Java, Go, and distributed systems. Handle millions of transactions daily."),
            ("Product Manager", "Jumia", "Lagos", 6.5244, 3.3792, 10000000, 16000000, "Management", "Own the product roadmap for Africa largest e-commerce platform. Manage cross-functional teams and drive features serving 30M+ monthly active users."),
            ("Data Analyst", "Interswitch", "Lagos", 6.5244, 3.3792, 8000000, 14000000, "Data Science", "Analyze transaction data for Africa largest payment processing company. Build dashboards, develop fraud detection models, and optimize payment flows."),
            ("Software Engineer", "Andela", "Lagos", 6.5244, 3.3792, 10000000, 18000000, "Technology", "Build talent marketplace platform connecting African developers with global companies. Work with React, Node.js, and AI-powered matching algorithms."),
            ("Marketing Manager", "Dangote Group", "Lagos", 6.5244, 3.3792, 9000000, 15000000, "Marketing", "Lead marketing for Africa largest conglomerate. Manage brand campaigns across FMCG, cement, and sugar divisions. Oversee multi-million dollar budgets."),
            ("Financial Analyst", "Access Bank", "Lagos", 6.5244, 3.3792, 7000000, 12000000, "Finance", "Conduct financial analysis for Africa largest bank by customer base. Prepare credit assessments, support corporate lending decisions."),
            ("UX Designer", "Paystack", "Lagos", 6.5244, 3.3792, 8000000, 13000000, "Design", "Design payment and merchant dashboard experiences serving 60,000+ businesses. Create intuitive interfaces for diverse African markets with varying tech literacy."),
            ("Sales Director", "MTN Nigeria", "Lagos", 6.5244, 3.3792, 11000000, 18000000, "Sales", "Lead enterprise sales for Nigeria largest telecom. Manage key accounts, drive B2B revenue growth, and expand market share across Nigerian states."),
        ]
    },
    "tr": {
        "name": "Turkey", "currency": "TRY", "symbol": "TRY", "period": "month",
        "jobs": [
            ("Game Developer", "Peak Games", "Istanbul", 41.0082, 28.9784, 60000, 95000, "Technology", "Develop casual mobile games with millions of daily active players. Work with Unity and C#, implement real-time multiplayer features."),
            ("Software Engineer", "Trendyol", "Istanbul", 41.0082, 28.9784, 55000, 85000, "Technology", "Build e-commerce platform features for Turkey largest online shopping destination. Work with microservices, React, and distributed systems."),
            ("Product Manager", "Getir", "Istanbul", 41.0082, 28.9784, 65000, 100000, "Management", "Own the product roadmap for quick commerce delivery app. Manage cross-functional teams and drive growth across 9 countries."),
            ("Marketing Manager", "Turkcell", "Istanbul", 41.0082, 28.9784, 45000, 70000, "Marketing", "Lead marketing campaigns for Turkey leading mobile operator. Manage digital transformation, 5G launch campaigns, and brand partnerships."),
            ("Financial Analyst", "Is Bankasi", "Istanbul", 41.0082, 28.9784, 40000, 62000, "Finance", "Conduct financial analysis for one of Turkey largest private banks. Prepare risk assessments, support corporate lending, and manage portfolio analytics."),
            ("Data Scientist", "Garanti BBVA", "Istanbul", 41.0082, 28.9784, 50000, 78000, "Data Science", "Build machine learning models for credit scoring and customer analytics. Analyze data from 20M+ customers to optimize banking products and services."),
            ("UX Designer", "Yemeksepeti", "Istanbul", 41.0082, 28.9784, 38000, 58000, "Design", "Design food delivery app experiences for 30M+ users. Conduct user research, create prototypes, and optimize ordering flows for Turkish market."),
            ("Sales Executive", "Eczacibasi Group", "Istanbul", 41.0082, 28.9784, 42000, 65000, "Sales", "Drive B2B sales for building materials and consumer products conglomerate. Manage key accounts and develop strategic partnerships across Turkey."),
        ]
    },
}

# Format salary strings
formatted_salaries = {
    "INR": lambda mn, mx: f"{mn//100000},{(mn%100000)//100:02d},{(mn%10000)//100:02d} - {mx//100000},{(mx%100000)//100:02d},{(mx%10000)//100:02d}/yr",
    "USD": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/yr",
    "CNY": lambda mn, mx: f"{mn//10000},{(mn%10000)//100:02d} - {mx//10000},{(mx%10000)//100:02d}/yr",
    "BRL": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/mo",
    "GBP": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/yr",
    "EUR": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/yr",
    "JPY": lambda mn, mx: f"{mn//10000:,.0f}M - {mx//10000:,.0f}M/yr",
    "CAD": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/yr",
    "AUD": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/yr",
    "MXN": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/mo",
    "IDR": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/mo",
    "KRW": lambda mn, mx: f"{mn//10000:,.0f}M - {mx//10000:,.0f}M/yr",
    "SAR": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/mo",
    "AED": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/mo",
    "NGN": lambda mn, mx: f"{mn//1000000:,.0f}M - {mx//1000000:,.0f}M/yr",
    "TRY": lambda mn, mx: f"{mn:,.0f} - {mx:,.0f}/mo",
}

salary_prefix = {
    "INR": "\u20b9", "USD": "$", "CNY": "\u00a5", "BRL": "R$ ", "GBP": "\u00a3",
    "EUR": "\u20ac", "JPY": "\u00a5", "CAD": "C$ ", "AUD": "A$ ", "MXN": "MX$ ",
    "IDR": "Rp ", "KRW": "\u20a9", "SAR": "SAR ", "AED": "AED ",
    "NGN": "NGN ", "TRY": "\u20ba ",
}

posted_times = ["1 day ago", "2 days ago", "3 days ago", "4 days ago", "5 days ago", "1 week ago", "1 week ago", "2 weeks ago"]
types = ["Full-time", "Full-time", "Full-time", "Full-time", "Full-time", "Full-time", "Remote", "Hybrid"]

job_id = 1
output_lines = []

for country_code, data in countries_jobs.items():
    country_name = data["name"]
    currency = data["currency"]
    period = data["period"]
    prefix = salary_prefix[currency]

    output_lines.append(f'  // ========== {country_name.upper()} ==========')

    for i, (title, company, location, lat, lng, sal_min, sal_max, sector, desc) in enumerate(data["jobs"]):
        salary_str = prefix + formatted_salaries[currency](sal_min, sal_max)
        company_url = f"https://{company.lower().replace(' ', '').replace('.', '').replace(',', '').replace('(', '').replace(')', '').replace('&', '')}.com/careers"
        job_type = types[i % len(types)]
        posted = posted_times[i % len(posted_times)]
        # Generate mock contact email
        email_domain = company.split()[0].lower().replace('.', '').replace(',', '').replace('&', '') + ".com"
        contact_email = f"careers@{email_domain}"

        output_lines.append('  {')
        output_lines.append(f'    id: {job_id}, title: "{title}", company: "{company}",')
        output_lines.append(f'    companyUrl: "{company_url}", location: "{location}",')
        output_lines.append(f'    country: "{country_code}", countryName: "{country_name}", lat: {lat}, lng: {lng},')
        output_lines.append(f'    salary: "{salary_str}", salaryMin: {sal_min}, salaryMax: {sal_max}, salaryCurrency: "{currency}", salaryPeriod: "{period}",')
        output_lines.append(f'    description: "{desc}",')
        output_lines.append(f'    sector: "{sector}", posted: "{posted}", type: "{job_type}",')
        output_lines.append(f'    contactEmail: "{contact_email}"')
        output_lines.append('  },')
        job_id += 1
    output_lines.append('')

# Now write the full route.ts file
jobs_str = '\n'.join(output_lines)

with open('/home/z/my-project/src/app/api/jobs/route.ts', 'w', encoding='utf-8') as f:
    f.write(f'''import {{ NextResponse }} from "next/server";

export interface Job {{
  id: number;
  title: string;
  company: string;
  companyUrl: string;
  location: string;
  country: string;
  countryName: string;
  lat: number;
  lng: number;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  description: string;
  sector: string;
  posted: string;
  type: string;
  contactEmail: string;
}}

const jobs: Job[] = [
{jobs_str}
];

export async function GET(request: Request) {{
  const {{ searchParams }} = new URL(request.url);
  const sector = searchParams.get("sector")?.toLowerCase() || "";
  const location = searchParams.get("location")?.toLowerCase() || "";
  const search = searchParams.get("search")?.toLowerCase() || "";
  const country = searchParams.get("country")?.toLowerCase() || "";

  let filtered = [...jobs];

  if (country) {{
    filtered = filtered.filter((j) => j.country === country);
  }}
  if (sector) {{
    filtered = filtered.filter(
      (j) => j.title.toLowerCase().includes(sector) || j.sector.toLowerCase().includes(sector)
    );
  }}
  if (location) {{
    filtered = filtered.filter(
      (j) => j.location.toLowerCase().includes(location) || j.countryName.toLowerCase().includes(location)
    );
  }}
  if (search) {{
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(search) ||
        j.company.toLowerCase().includes(search) ||
        j.description.toLowerCase().includes(search) ||
        j.sector.toLowerCase().includes(search) ||
        j.location.toLowerCase().includes(search) ||
        j.countryName.toLowerCase().includes(search)
    );
  }}

  return NextResponse.json(filtered);
}}
''')

print(f'Generated {job_id - 1} jobs across {len(countries_jobs)} countries')
print('Done!')
