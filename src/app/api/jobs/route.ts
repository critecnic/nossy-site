import { NextResponse } from "next/server";

export interface Job {
  id: number;
  title: string;
  company: string;
  companyUrl: string;
  location: string;
  country: string;       // Country config code: 'in', 'us', 'cn'
  countryName: string;   // Display name
  lat: number;
  lng: number;
  salary: string;        // Formatted display salary
  salaryMin: number;     // For JSON-LD
  salaryMax: number;     // For JSON-LD
  salaryCurrency: string; // ISO 4217
  salaryPeriod: string;  // 'year', 'month', 'hour'
  description: string;
  sector: string;
  posted: string;
  type: string;
}

const jobs: Job[] = [
  // ========== INDIA (Priority 1) ==========
  {
    id: 1, title: "Senior Software Engineer", company: "Tata Consultancy Services",
    companyUrl: "https://tcs.com/careers", location: "Mumbai, Maharashtra",
    country: "in", countryName: "India", lat: 19.076, lng: 72.8777,
    salary: "₹18,00,000 - ₹28,00,000/yr", salaryMin: 1800000, salaryMax: 2800000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Build enterprise-scale applications for global Fortune 500 clients. Work with microservices, cloud-native architecture on AWS/Azure. Lead a team of 6 engineers delivering critical banking and retail solutions.",
    sector: "Technology", posted: "1 day ago", type: "Full-time"
  },
  {
    id: 2, title: "Data Scientist", company: "Infosys BPM",
    companyUrl: "https://infosys.com/careers", location: "Bengaluru, Karnataka",
    country: "in", countryName: "India", lat: 12.9716, lng: 77.5946,
    salary: "₹15,00,000 - ₹22,00,000/yr", salaryMin: 1500000, salaryMax: 2200000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Analyze large datasets to build predictive models for banking and healthcare clients. Use Python, TensorFlow, and Spark. Present findings to C-level stakeholders across Asia-Pacific operations.",
    sector: "Data Science", posted: "2 days ago", type: "Full-time"
  },
  {
    id: 3, title: "Product Manager", company: "Flipkart",
    companyUrl: "https://flipkart.com/careers", location: "Bengaluru, Karnataka",
    country: "in", countryName: "India", lat: 12.9716, lng: 77.5946,
    salary: "₹22,00,000 - ₹35,00,000/yr", salaryMin: 2200000, salaryMax: 3500000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Own the product roadmap for Flipkart's supply chain technology. Manage cross-functional teams of 15+ members. Drive user growth initiatives impacting 400M+ registered users across India.",
    sector: "Management", posted: "3 days ago", type: "Full-time"
  },

  // ========== USA (Priority 2) ==========
  {
    id: 4, title: "Senior Software Engineer", company: "TechVision Corp",
    companyUrl: "https://techvision.example.com/careers", location: "San Francisco, CA",
    country: "us", countryName: "United States", lat: 37.7749, lng: -122.4194,
    salary: "$145,000 - $185,000/yr", salaryMin: 145000, salaryMax: 185000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Build scalable distributed systems powering next-gen cloud infrastructure. Work with microservices architecture, Kubernetes, and real-time data pipelines. Join a team of 50+ engineers shipping to millions of users daily.",
    sector: "Technology", posted: "2 days ago", type: "Full-time"
  },
  {
    id: 5, title: "Product Designer", company: "InnovateUI Labs",
    companyUrl: "https://innovateui.example.com/jobs", location: "New York, NY",
    country: "us", countryName: "United States", lat: 40.7128, lng: -74.006,
    salary: "$110,000 - $140,000/yr", salaryMin: 110000, salaryMax: 140000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Design intuitive user experiences for enterprise SaaS products. Conduct user research, create wireframes and prototypes, and collaborate closely with engineering teams to deliver pixel-perfect interfaces.",
    sector: "Design", posted: "5 days ago", type: "Full-time"
  },
  {
    id: 6, title: "Sales Executive", company: "MarketPro Global",
    companyUrl: "https://marketpro.example.com/careers", location: "Miami, FL",
    country: "us", countryName: "United States", lat: 25.7617, lng: -80.1918,
    salary: "$75,000 - $120,000/yr", salaryMin: 75000, salaryMax: 120000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Drive B2B enterprise sales across Latin American markets. Manage a pipeline of $5M+, negotiate contracts with C-suite executives, and exceed quarterly revenue targets consistently.",
    sector: "Sales", posted: "5 days ago", type: "Full-time"
  },

  // ========== CHINA (Priority 3) ==========
  {
    id: 7, title: "Full-Stack Developer", company: "Tencent Cloud",
    companyUrl: "https://tencent.com/careers", location: "Shenzhen, Guangdong",
    country: "cn", countryName: "China", lat: 22.5431, lng: 114.0579,
    salary: "¥350,000 - ¥550,000/yr", salaryMin: 350000, salaryMax: 550000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Develop high-performance web applications serving 1B+ users. Work with React, Go, and distributed databases. Collaborate with international teams on cutting-edge AI-powered products.",
    sector: "Technology", posted: "1 day ago", type: "Full-time"
  },
  {
    id: 8, title: "AI Research Scientist", company: "Baidu Research",
    companyUrl: "https://baidu.com/careers", location: "Beijing",
    country: "cn", countryName: "China", lat: 39.9042, lng: 116.4074,
    salary: "¥450,000 - ¥700,000/yr", salaryMin: 450000, salaryMax: 700000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Conduct research in natural language processing and large language models. Publish papers at top AI conferences. Develop production-ready AI solutions for autonomous driving and search.",
    sector: "Technology", posted: "3 days ago", type: "Full-time"
  },

  // ========== BRAZIL (Priority 4) ==========
  {
    id: 9, title: "Data Scientist", company: "DataPulse Analytics",
    companyUrl: "https://datapulse.example.com/careers", location: "São Paulo, SP",
    country: "br", countryName: "Brazil", lat: -23.5505, lng: -46.6333,
    salary: "R$ 18,000 - R$ 25,000/mo", salaryMin: 18000, salaryMax: 25000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Analyze large datasets to extract actionable business insights. Build predictive models using Python, TensorFlow and Spark. Present findings to C-level stakeholders and drive data-informed decisions.",
    sector: "Data Science", posted: "1 day ago", type: "Full-time"
  },
  {
    id: 10, title: "Backend Developer", company: "NexaSoft Technologies",
    companyUrl: "https://nexasoft.example.com/jobs", location: "Rio de Janeiro, RJ",
    country: "br", countryName: "Brazil", lat: -22.9068, lng: -43.1729,
    salary: "R$ 14,000 - R$ 20,000/mo", salaryMin: 14000, salaryMax: 20000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Develop robust RESTful APIs and microservices using Node.js and PostgreSQL. Implement authentication systems, optimize database queries, and mentor junior developers on best practices.",
    sector: "Technology", posted: "2 days ago", type: "Full-time"
  },

  // ========== UK (Priority 5) ==========
  {
    id: 11, title: "Financial Analyst", company: "CapitalEdge Partners",
    companyUrl: "https://capitaledge.example.com/jobs", location: "London",
    country: "gb", countryName: "United Kingdom", lat: 51.5074, lng: -0.1278,
    salary: "£65,000 - £85,000/yr", salaryMin: 65000, salaryMax: 85000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Conduct financial modeling, valuation analysis, and market research for M&A transactions. Prepare investment presentations for institutional clients and support deal teams through the full transaction lifecycle.",
    sector: "Finance", posted: "4 days ago", type: "Full-time"
  },
  {
    id: 12, title: "DevOps Engineer", company: "Barclays Technology",
    companyUrl: "https://barclays.com/careers", location: "Manchester",
    country: "gb", countryName: "United Kingdom", lat: 53.4808, lng: -2.2426,
    salary: "£55,000 - £75,000/yr", salaryMin: 55000, salaryMax: 75000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Manage CI/CD pipelines and cloud infrastructure on AWS. Automate deployment processes for banking applications, monitor system health, and ensure 99.99% uptime for critical financial services.",
    sector: "Technology", posted: "1 week ago", type: "Full-time"
  },

  // ========== GERMANY (Priority 6) ==========
  {
    id: 13, title: "UX Researcher", company: "SAP Design",
    companyUrl: "https://sap.com/careers", location: "Berlin",
    country: "de", countryName: "Germany", lat: 52.52, lng: 13.405,
    salary: "€52,000 - €68,000/yr", salaryMin: 52000, salaryMax: 68000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Plan and execute qualitative and quantitative user research studies for enterprise software. Synthesize findings into actionable recommendations, create personas and journey maps for B2B SaaS products.",
    sector: "Design", posted: "6 days ago", type: "Full-time"
  },
  {
    id: 14, title: "Mechanical Engineer", company: "BMW Group",
    companyUrl: "https://bmw.com/careers", location: "Munich, Bavaria",
    country: "de", countryName: "Germany", lat: 48.1351, lng: 11.582,
    salary: "€58,000 - €78,000/yr", salaryMin: 58000, salaryMax: 78000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design and test components for electric vehicle powertrains. Use CAD software and simulation tools. Collaborate with cross-functional teams on next-generation EV platforms.",
    sector: "Engineering", posted: "3 days ago", type: "Full-time"
  },

  // ========== FRANCE (Priority 7) ==========
  {
    id: 15, title: "DevOps Engineer", company: "CloudNine Systems",
    companyUrl: "https://cloudnine.example.com/careers", location: "Paris",
    country: "fr", countryName: "France", lat: 48.8566, lng: 2.3522,
    salary: "€60,000 - €80,000/yr", salaryMin: 60000, salaryMax: 80000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage CI/CD pipelines and cloud infrastructure on AWS and GCP. Automate deployment processes, monitor system health, and ensure 99.99% uptime for critical production services.",
    sector: "Technology", posted: "1 week ago", type: "Full-time"
  },
  {
    id: 16, title: "AI/ML Engineer", company: "DeepCore AI",
    companyUrl: "https://deepcore.example.com/jobs", location: "Lyon",
    country: "fr", countryName: "France", lat: 45.764, lng: 4.8357,
    salary: "€55,000 - €75,000/yr", salaryMin: 55000, salaryMax: 75000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design and deploy machine learning models for NLP and computer vision applications. Optimize model inference for edge devices and collaborate with research teams on cutting-edge AI publications.",
    sector: "Technology", posted: "2 days ago", type: "Full-time"
  },

  // ========== JAPAN (Priority 8) ==========
  {
    id: 17, title: "Frontend Engineer", company: "Sony Interactive",
    companyUrl: "https://sony.com/careers", location: "Tokyo",
    country: "jp", countryName: "Japan", lat: 35.6762, lng: 139.6503,
    salary: "¥7,000,000 - ¥10,000,000/yr", salaryMin: 7000000, salaryMax: 10000000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Build high-performance web interfaces for PlayStation Network services. Work with React, TypeScript, and WebGL. Optimize for performance across devices used by 100M+ active users.",
    sector: "Technology", posted: "2 days ago", type: "Full-time"
  },
  {
    id: 18, title: "Marketing Manager", company: "Toyota Motor Corp",
    companyUrl: "https://toyota.com/careers", location: "Nagoya, Aichi",
    country: "jp", countryName: "Japan", lat: 35.1815, lng: 136.9066,
    salary: "¥8,500,000 - ¥12,000,000/yr", salaryMin: 8500000, salaryMax: 12000000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Lead digital marketing campaigns for Toyota's EV lineup across Asia-Pacific. Manage a team of 12 specialists, oversee ¥500M annual budget, and develop brand strategies for emerging markets.",
    sector: "Marketing", posted: "4 days ago", type: "Full-time"
  },

  // ========== CANADA (Priority 9) ==========
  {
    id: 19, title: "Project Manager", company: "BuildRight Consulting",
    companyUrl: "https://buildright.example.com/careers", location: "Toronto, ON",
    country: "ca", countryName: "Canada", lat: 43.6532, lng: -79.3832,
    salary: "C$85,000 - C$110,000/yr", salaryMin: 85000, salaryMax: 110000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Oversee large-scale IT implementation projects from initiation to delivery. Manage cross-functional teams of 20+ members, coordinate with vendors, and ensure projects are delivered on time using Agile methodologies.",
    sector: "Management", posted: "3 days ago", type: "Full-time"
  },
  {
    id: 20, title: "Healthcare Data Analyst", company: "Maple Health Tech",
    companyUrl: "https://maplehealth.example.com/careers", location: "Vancouver, BC",
    country: "ca", countryName: "Canada", lat: 49.2827, lng: -123.1207,
    salary: "C$70,000 - C$95,000/yr", salaryMin: 70000, salaryMax: 95000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Analyze healthcare data to improve patient outcomes across British Columbia. Build dashboards, develop predictive models for hospital resource planning, and work with provincial health authorities.",
    sector: "Healthcare", posted: "5 days ago", type: "Full-time"
  },

  // ========== AUSTRALIA (Priority 10) ==========
  {
    id: 21, title: "Mining Engineer", company: "BHP Group",
    companyUrl: "https://bhpcareers.com", location: "Perth, WA",
    country: "au", countryName: "Australia", lat: -31.9505, lng: 115.8605,
    salary: "A$120,000 - A$160,000/yr", salaryMin: 120000, salaryMax: 160000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Plan and optimize mining operations across Western Australia. Use advanced simulation software, manage drilling schedules, and implement safety protocols for large-scale resource extraction.",
    sector: "Engineering", posted: "1 week ago", type: "Full-time"
  },
  {
    id: 22, title: "Full-Stack Developer", company: "Atlassian",
    companyUrl: "https://atlassian.com/company/careers", location: "Sydney, NSW",
    country: "au", countryName: "Australia", lat: -33.8688, lng: 151.2093,
    salary: "A$130,000 - A$170,000/yr", salaryMin: 130000, salaryMax: 170000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Build collaboration tools used by 250K+ organizations worldwide. Work with React, Node.js, and microservices. Contribute to open-source projects and ship features to millions of users.",
    sector: "Technology", posted: "2 days ago", type: "Full-time"
  },

  // ========== MEXICO (Priority 11) ==========
  {
    id: 23, title: "Manufacturing Engineer", company: "Grupo Bimbo",
    companyUrl: "https://grupobimbo.com/carreras", location: "Mexico City, CDMX",
    country: "mx", countryName: "Mexico", lat: 19.4326, lng: -99.1332,
    salary: "MX$35,000 - MX$55,000/mo", salaryMin: 35000, salaryMax: 55000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Optimize production lines across 200+ manufacturing facilities in Latin America. Implement Lean Six Sigma methodologies, reduce waste, and improve throughput for one of the world's largest bakery companies.",
    sector: "Engineering", posted: "3 days ago", type: "Full-time"
  },

  // ========== INDONESIA (Priority 12) ==========
  {
    id: 24, title: "Mobile Developer", company: "Gojek",
    companyUrl: "https://gojek.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 25,000,000 - Rp 40,000,000/mo", salaryMin: 25000000, salaryMax: 40000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Build super-app features serving 190M+ users across Southeast Asia. Work with React Native and Kotlin. Implement real-time tracking, payment integration, and push notification systems.",
    sector: "Technology", posted: "1 day ago", type: "Full-time"
  },

  // ========== SOUTH KOREA (Priority 13) ==========
  {
    id: 25, title: "Semiconductor Engineer", company: "Samsung Electronics",
    companyUrl: "https://samsung.com/careers", location: "Suwon, Gyeonggi",
    country: "kr", countryName: "South Korea", lat: 37.2636, lng: 127.0286,
    salary: "₩60,000,000 - ₩90,000,000/yr", salaryMin: 60000000, salaryMax: 90000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Design and test next-generation semiconductor chips for mobile and data center applications. Work with cutting-edge lithography processes and collaborate with global R&D teams.",
    sector: "Engineering", posted: "2 days ago", type: "Full-time"
  },

  // ========== SAUDI ARABIA (Priority 14) ==========
  {
    id: 26, title: "Infrastructure Project Manager", company: "NEOM",
    companyUrl: "https://neom.com/careers", location: "Riyadh",
    country: "sa", countryName: "Saudi Arabia", lat: 24.7136, lng: 46.6753,
    salary: "﷼ 35,000 - ﷼ 55,000/mo", salaryMin: 35000, salaryMax: 55000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Lead mega-infrastructure projects as part of Vision 2030. Manage multi-billion riyal construction programs, coordinate with international contractors, and oversee project delivery across NEOM's smart city development.",
    sector: "Management", posted: "1 week ago", type: "Full-time"
  },

  // ========== UAE (Priority 15) ==========
  {
    id: 27, title: "FinTech Product Manager", company: "Careem",
    companyUrl: "https://careem.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 35,000 - AED 55,000/mo", salaryMin: 35000, salaryMax: 55000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Lead product strategy for Careem Pay, the region's leading super-app payment platform. Define roadmap, manage a team of 10 product managers, and drive financial inclusion across the Middle East.",
    sector: "Finance", posted: "3 days ago", type: "Full-time"
  },

  // ========== SPAIN (Priority 16) ==========
  {
    id: 28, title: "Marketing Manager", company: "GrowthHub Digital",
    companyUrl: "https://growthhub.example.com/jobs", location: "Madrid",
    country: "es", countryName: "Spain", lat: 40.4168, lng: -3.7038,
    salary: "€55,000 - €72,000/yr", salaryMin: 55000, salaryMax: 72000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Lead multi-channel marketing campaigns across EMEA markets. Manage a team of 8 marketing specialists, oversee budget, and develop brand strategies that increased market share by 15% year-over-year.",
    sector: "Marketing", posted: "3 days ago", type: "Full-time"
  },
  {
    id: 29, title: "Mobile Developer (iOS/Android)", company: "AppForge Studio",
    companyUrl: "https://appforge.example.com/jobs", location: "Barcelona",
    country: "es", countryName: "Spain", lat: 41.3874, lng: 2.1686,
    salary: "€48,000 - €65,000/yr", salaryMin: 48000, salaryMax: 65000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Build cross-platform mobile applications using React Native and Swift. Implement push notifications, offline sync, and biometric authentication. Published 5+ apps with 2M+ combined downloads.",
    sector: "Technology", posted: "1 day ago", type: "Full-time"
  },

  // ========== ITALY (Priority 17) ==========
  {
    id: 30, title: "Fashion E-Commerce Manager", company: "YOOX NET-A-PORTER",
    companyUrl: "https://ynap.com/careers", location: "Milan, Lombardy",
    country: "it", countryName: "Italy", lat: 45.4642, lng: 9.19,
    salary: "€50,000 - €70,000/yr", salaryMin: 50000, salaryMax: 70000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage the luxury e-commerce platform for the Italian market. Optimize conversion funnels, oversee digital merchandising, and collaborate with fashion brands on exclusive online launches.",
    sector: "Marketing", posted: "4 days ago", type: "Full-time"
  },

  // ========== PORTUGAL (Priority 18) ==========
  {
    id: 31, title: "Customer Success Manager", company: "Remote Portugal",
    companyUrl: "https://remote.com/careers", location: "Lisbon",
    country: "pt", countryName: "Portugal", lat: 38.7223, lng: -9.1393,
    salary: "€35,000 - €48,000/yr", salaryMin: 35000, salaryMax: 48000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage enterprise client relationships for a leading remote work platform. Drive product adoption, reduce churn, and expand accounts across EMEA. Work remotely from Lisbon or Porto.",
    sector: "Management", posted: "5 days ago", type: "Full-time"
  },

  // ========== NIGERIA (Priority 19) ==========
  {
    id: 32, title: "Fintech Software Developer", company: "Flutterwave",
    companyUrl: "https://flutterwave.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "₦12,000,000 - ₦20,000,000/yr", salaryMin: 12000000, salaryMax: 20000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Build payment processing infrastructure serving 30+ African countries. Work with Java, Go, and distributed systems. Handle millions of transactions daily and ensure PCI-DSS compliance.",
    sector: "Finance", posted: "2 days ago", type: "Full-time"
  },

  // ========== TURKEY (Priority 20) ==========
  {
    id: 33, title: "Game Developer", company: "Peak Games",
    companyUrl: "https://peak.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺60,000 - ₺95,000/mo", salaryMin: 60000, salaryMax: 95000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Develop casual mobile games with millions of daily active players. Work with Unity and C#, implement real-time multiplayer features, and optimize game performance across Android and iOS devices.",
    sector: "Technology", posted: "3 days ago", type: "Full-time"
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector")?.toLowerCase() || "";
  const location = searchParams.get("location")?.toLowerCase() || "";
  const search = searchParams.get("search")?.toLowerCase() || "";
  const country = searchParams.get("country")?.toLowerCase() || "";

  let filtered = [...jobs];

  if (country) {
    filtered = filtered.filter((j) => j.country === country);
  }
  if (sector) {
    filtered = filtered.filter(
      (j) => j.title.toLowerCase().includes(sector) || j.sector.toLowerCase().includes(sector)
    );
  }
  if (location) {
    filtered = filtered.filter(
      (j) => j.location.toLowerCase().includes(location) || j.countryName.toLowerCase().includes(location)
    );
  }
  if (search) {
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(search) ||
        j.company.toLowerCase().includes(search) ||
        j.description.toLowerCase().includes(search) ||
        j.sector.toLowerCase().includes(search) ||
        j.location.toLowerCase().includes(search) ||
        j.countryName.toLowerCase().includes(search)
    );
  }

  return NextResponse.json(filtered);
}
