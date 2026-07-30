import { NextResponse } from "next/server";

export interface Job {
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
}

const jobs: Job[] = [
  // ========== INDIA ==========
  {
    id: 1, title: "Senior Software Engineer", company: "Tata Consultancy Services",
    companyUrl: "https://tataconsultancyservices.com/careers", location: "Mumbai, Maharashtra",
    country: "in", countryName: "India", lat: 19.076, lng: 72.8777,
    salary: "₹18,00,00 - 28,00,00/yr", salaryMin: 1800000, salaryMax: 2800000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Build enterprise-scale applications for global Fortune 500 clients. Work with microservices, cloud-native architecture on AWS/Azure. Lead a team of 6 engineers delivering critical banking and retail solutions.",
    sector: "Technology", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@tata.com"
  },
  {
    id: 2, title: "Data Scientist", company: "Infosys BPM",
    companyUrl: "https://infosysbpm.com/careers", location: "Bengaluru, Karnataka",
    country: "in", countryName: "India", lat: 12.9716, lng: 77.5946,
    salary: "₹15,00,00 - 22,00,00/yr", salaryMin: 1500000, salaryMax: 2200000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Analyze large datasets to build predictive models for banking and healthcare clients. Use Python, TensorFlow, and Spark. Present findings to C-level stakeholders across Asia-Pacific operations.",
    sector: "Data Science", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@infosys.com"
  },
  {
    id: 3, title: "Product Manager", company: "Flipkart",
    companyUrl: "https://flipkart.com/careers", location: "Bengaluru, Karnataka",
    country: "in", countryName: "India", lat: 12.9716, lng: 77.5946,
    salary: "₹22,00,00 - 35,00,00/yr", salaryMin: 2200000, salaryMax: 3500000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Own the product roadmap for Flipkart supply chain technology. Manage cross-functional teams of 15+ members. Drive user growth initiatives impacting 400M+ registered users across India.",
    sector: "Management", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@flipkart.com"
  },
  {
    id: 4, title: "UX Designer", company: "Wipro Design",
    companyUrl: "https://wiprodesign.com/careers", location: "Pune, Maharashtra",
    country: "in", countryName: "India", lat: 18.5204, lng: 73.8567,
    salary: "₹12,00,00 - 18,00,00/yr", salaryMin: 1200000, salaryMax: 1800000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Design intuitive user experiences for enterprise SaaS products used by millions. Conduct user research, create wireframes and prototypes, and collaborate with engineering teams to deliver pixel-perfect interfaces.",
    sector: "Design", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@wipro.com"
  },
  {
    id: 5, title: "Financial Analyst", company: "ICICI Bank",
    companyUrl: "https://icicibank.com/careers", location: "Mumbai, Maharashtra",
    country: "in", countryName: "India", lat: 19.076, lng: 72.8777,
    salary: "₹10,00,00 - 16,00,00/yr", salaryMin: 1000000, salaryMax: 1600000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Conduct financial modeling, risk assessment, and market research for retail banking products. Prepare investment presentations and support strategic planning for one of India largest private banks.",
    sector: "Finance", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@icici.com"
  },
  {
    id: 6, title: "Marketing Lead", company: "Zomato",
    companyUrl: "https://zomato.com/careers", location: "Gurugram, Haryana",
    country: "in", countryName: "India", lat: 28.4595, lng: 77.0266,
    salary: "₹14,00,00 - 22,00,00/yr", salaryMin: 1400000, salaryMax: 2200000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Lead digital marketing campaigns across India food delivery market. Manage a team of 12 specialists, oversee annual budget of 50 crore, and develop growth strategies for tier-2 city expansion.",
    sector: "Marketing", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@zomato.com"
  },
  {
    id: 7, title: "DevOps Engineer", company: "Razorpay",
    companyUrl: "https://razorpay.com/careers", location: "Bengaluru, Karnataka",
    country: "in", countryName: "India", lat: 12.9716, lng: 77.5946,
    salary: "₹16,00,00 - 24,00,00/yr", salaryMin: 1600000, salaryMax: 2400000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Manage CI/CD pipelines and cloud infrastructure on AWS and GCP. Automate deployment processes for payment systems handling 10M+ daily transactions with 99.99% uptime.",
    sector: "Technology", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@razorpay.com"
  },
  {
    id: 8, title: "Sales Manager", company: "Reliance Retail",
    companyUrl: "https://relianceretail.com/careers", location: "Mumbai, Maharashtra",
    country: "in", countryName: "India", lat: 19.076, lng: 72.8777,
    salary: "₹11,00,00 - 18,00,00/yr", salaryMin: 1100000, salaryMax: 1800000, salaryCurrency: "INR", salaryPeriod: "year",
    description: "Drive B2B enterprise sales for India largest retail chain. Manage a pipeline of 200 crore+, negotiate contracts with key partners, and exceed quarterly revenue targets across western India.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@reliance.com"
  },

  // ========== UNITED STATES ==========
  {
    id: 9, title: "Senior Software Engineer", company: "TechVision Corp",
    companyUrl: "https://techvisioncorp.com/careers", location: "San Francisco, CA",
    country: "us", countryName: "United States", lat: 37.7749, lng: -122.4194,
    salary: "$145,000 - 185,000/yr", salaryMin: 145000, salaryMax: 185000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Build scalable distributed systems powering next-gen cloud infrastructure. Work with microservices architecture, Kubernetes, and real-time data pipelines serving millions of users daily.",
    sector: "Technology", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@techvision.com"
  },
  {
    id: 10, title: "Product Designer", company: "InnovateUI Labs",
    companyUrl: "https://innovateuilabs.com/careers", location: "New York, NY",
    country: "us", countryName: "United States", lat: 40.7128, lng: -74.006,
    salary: "$110,000 - 140,000/yr", salaryMin: 110000, salaryMax: 140000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Design intuitive user experiences for enterprise SaaS products. Conduct user research, create wireframes and prototypes, and collaborate closely with engineering teams to deliver pixel-perfect interfaces.",
    sector: "Design", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@innovateui.com"
  },
  {
    id: 11, title: "Sales Executive", company: "MarketPro Global",
    companyUrl: "https://marketproglobal.com/careers", location: "Miami, FL",
    country: "us", countryName: "United States", lat: 25.7617, lng: -80.1918,
    salary: "$75,000 - 120,000/yr", salaryMin: 75000, salaryMax: 120000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Drive B2B enterprise sales across Latin American markets. Manage a pipeline of $5M+, negotiate contracts with C-suite executives, and exceed quarterly revenue targets consistently.",
    sector: "Sales", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@marketpro.com"
  },
  {
    id: 12, title: "Data Engineer", company: "DataFlow Systems",
    companyUrl: "https://dataflowsystems.com/careers", location: "Austin, TX",
    country: "us", countryName: "United States", lat: 30.2672, lng: -97.7431,
    salary: "$130,000 - 170,000/yr", salaryMin: 130000, salaryMax: 170000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Build and optimize data pipelines processing petabytes of information. Work with Apache Kafka, Spark, and Snowflake to deliver real-time analytics for Fortune 500 clients.",
    sector: "Data Science", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@dataflow.com"
  },
  {
    id: 13, title: "Marketing Director", company: "BrandWave Agency",
    companyUrl: "https://brandwaveagency.com/careers", location: "Chicago, IL",
    country: "us", countryName: "United States", lat: 41.8781, lng: -87.6298,
    salary: "$120,000 - 160,000/yr", salaryMin: 120000, salaryMax: 160000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Lead multi-channel marketing campaigns for major consumer brands. Manage a team of 20+ specialists, oversee $10M annual budget, and develop data-driven strategies that increased ROI by 35%.",
    sector: "Marketing", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@brandwave.com"
  },
  {
    id: 14, title: "HR Business Partner", company: "PeopleFirst Inc",
    companyUrl: "https://peoplefirstinc.com/careers", location: "Seattle, WA",
    country: "us", countryName: "United States", lat: 47.6062, lng: -122.3321,
    salary: "$95,000 - 130,000/yr", salaryMin: 95000, salaryMax: 130000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Partner with engineering leadership to drive talent strategy for a 2000+ employee tech company. Lead hiring programs, performance management, and employee engagement initiatives.",
    sector: "HR", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@peoplefirst.com"
  },
  {
    id: 15, title: "Healthcare Administrator", company: "MedCare Solutions",
    companyUrl: "https://medcaresolutions.com/careers", location: "Boston, MA",
    country: "us", countryName: "United States", lat: 42.3601, lng: -71.0589,
    salary: "$85,000 - 115,000/yr", salaryMin: 85000, salaryMax: 115000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Oversee operations for a network of 15 healthcare facilities across New England. Manage budgets of $50M+, ensure regulatory compliance, and implement process improvements.",
    sector: "Healthcare", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@medcare.com"
  },
  {
    id: 16, title: "Mechanical Engineer", company: "AeroDynamics Corp",
    companyUrl: "https://aerodynamicscorp.com/careers", location: "Los Angeles, CA",
    country: "us", countryName: "United States", lat: 34.0522, lng: -118.2437,
    salary: "$105,000 - 145,000/yr", salaryMin: 105000, salaryMax: 145000, salaryCurrency: "USD", salaryPeriod: "year",
    description: "Design and test aerospace components for commercial aircraft. Use CAD software and simulation tools, collaborate with cross-functional teams on next-generation propulsion systems.",
    sector: "Engineering", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@aerodynamics.com"
  },

  // ========== CHINA ==========
  {
    id: 17, title: "Full-Stack Developer", company: "Tencent Cloud",
    companyUrl: "https://tencentcloud.com/careers", location: "Shenzhen, Guangdong",
    country: "cn", countryName: "China", lat: 22.5431, lng: 114.0579,
    salary: "¥35,00 - 55,00/yr", salaryMin: 350000, salaryMax: 550000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Develop high-performance web applications serving 1B+ users. Work with React, Go, and distributed databases. Collaborate with international teams on AI-powered products.",
    sector: "Technology", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@tencent.com"
  },
  {
    id: 18, title: "AI Research Scientist", company: "Baidu Research",
    companyUrl: "https://baiduresearch.com/careers", location: "Beijing",
    country: "cn", countryName: "China", lat: 39.9042, lng: 116.4074,
    salary: "¥45,00 - 70,00/yr", salaryMin: 450000, salaryMax: 700000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Conduct research in natural language processing and large language models. Publish papers at top AI conferences. Develop production-ready AI solutions for autonomous driving.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@baidu.com"
  },
  {
    id: 19, title: "Product Manager", company: "Alibaba Group",
    companyUrl: "https://alibabagroup.com/careers", location: "Hangzhou, Zhejiang",
    country: "cn", countryName: "China", lat: 30.2741, lng: 120.1551,
    salary: "¥40,00 - 65,00/yr", salaryMin: 400000, salaryMax: 650000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Own the product roadmap for Taobao recommendation engine. Manage cross-functional teams of 20+ members and drive personalization features for 800M+ active users.",
    sector: "Management", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@alibaba.com"
  },
  {
    id: 20, title: "UX Researcher", company: "ByteDance",
    companyUrl: "https://bytedance.com/careers", location: "Beijing",
    country: "cn", countryName: "China", lat: 39.9042, lng: 116.4074,
    salary: "¥30,00 - 48,00/yr", salaryMin: 300000, salaryMax: 480000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Plan and execute user research studies for TikTok and Douyin. Synthesize findings into actionable recommendations, create personas and journey maps for global short-video products.",
    sector: "Design", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@bytedance.com"
  },
  {
    id: 21, title: "Financial Controller", company: "Huawei Technologies",
    companyUrl: "https://huaweitechnologies.com/careers", location: "Shenzhen, Guangdong",
    country: "cn", countryName: "China", lat: 22.5431, lng: 114.0579,
    salary: "¥38,00 - 58,00/yr", salaryMin: 380000, salaryMax: 580000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Oversee financial planning and analysis for the consumer electronics division. Manage budgets of 10B+ RMB, ensure compliance, and support strategic investment decisions.",
    sector: "Finance", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@huawei.com"
  },
  {
    id: 22, title: "Marketing Manager", company: "JD.com",
    companyUrl: "https://jdcom.com/careers", location: "Beijing",
    country: "cn", countryName: "China", lat: 39.9042, lng: 116.4074,
    salary: "¥28,00 - 42,00/yr", salaryMin: 280000, salaryMax: 420000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Lead digital marketing campaigns for China largest e-commerce platform. Manage a team of 15 specialists, oversee annual campaigns during 618 and Double 11 shopping festivals.",
    sector: "Marketing", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@jdcom.com"
  },
  {
    id: 23, title: "Data Analyst", company: "Meituan",
    companyUrl: "https://meituan.com/careers", location: "Beijing",
    country: "cn", countryName: "China", lat: 39.9042, lng: 116.4074,
    salary: "¥25,00 - 40,00/yr", salaryMin: 250000, salaryMax: 400000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Analyze user behavior data for food delivery and local services platform. Build dashboards, develop predictive models, and work with product teams to optimize conversion funnels.",
    sector: "Data Science", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@meituan.com"
  },
  {
    id: 24, title: "Sales Director", company: "Xiaomi Corp",
    companyUrl: "https://xiaomicorp.com/careers", location: "Beijing",
    country: "cn", countryName: "China", lat: 39.9042, lng: 116.4074,
    salary: "¥35,00 - 55,00/yr", salaryMin: 350000, salaryMax: 550000, salaryCurrency: "CNY", salaryPeriod: "year",
    description: "Lead enterprise and government sales for IoT and smartphone products across Asia-Pacific. Manage a team of 30+ account managers and exceed annual revenue targets of 5B RMB.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@xiaomi.com"
  },

  // ========== BRAZIL ==========
  {
    id: 25, title: "Data Scientist", company: "DataPulse Analytics",
    companyUrl: "https://datapulseanalytics.com/careers", location: "Sao Paulo, SP",
    country: "br", countryName: "Brazil", lat: -23.5505, lng: -46.6333,
    salary: "R$ 18,000 - 25,000/mo", salaryMin: 18000, salaryMax: 25000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Analyze large datasets to extract actionable business insights. Build predictive models using Python, TensorFlow and Spark. Present findings to C-level stakeholders.",
    sector: "Data Science", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@datapulse.com"
  },
  {
    id: 26, title: "Backend Developer", company: "NexaSoft Technologies",
    companyUrl: "https://nexasofttechnologies.com/careers", location: "Rio de Janeiro, RJ",
    country: "br", countryName: "Brazil", lat: -22.9068, lng: -43.1729,
    salary: "R$ 14,000 - 20,000/mo", salaryMin: 14000, salaryMax: 20000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Develop robust RESTful APIs and microservices using Node.js and PostgreSQL. Implement authentication systems, optimize database queries, and mentor junior developers.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@nexasoft.com"
  },
  {
    id: 27, title: "Product Manager", company: "Nubank",
    companyUrl: "https://nubank.com/careers", location: "Sao Paulo, SP",
    country: "br", countryName: "Brazil", lat: -23.5505, lng: -46.6333,
    salary: "R$ 22,000 - 35,000/mo", salaryMin: 22000, salaryMax: 35000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Own the product roadmap for digital banking features serving 80M+ customers. Manage cross-functional teams and drive innovation in Latin America largest digital bank.",
    sector: "Management", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@nubank.com"
  },
  {
    id: 28, title: "UX Designer", company: "Concrete Solucoes",
    companyUrl: "https://concretesolucoes.com/careers", location: "Sao Paulo, SP",
    country: "br", countryName: "Brazil", lat: -23.5505, lng: -46.6333,
    salary: "R$ 12,000 - 18,000/mo", salaryMin: 12000, salaryMax: 18000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Design user experiences for enterprise software and mobile apps. Conduct usability testing, create design systems, and collaborate with development teams on agile projects.",
    sector: "Design", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@concrete.com"
  },
  {
    id: 29, title: "Marketing Analyst", company: "Ambev",
    companyUrl: "https://ambev.com/careers", location: "Sao Paulo, SP",
    country: "br", countryName: "Brazil", lat: -23.5505, lng: -46.6333,
    salary: "R$ 8,000 - 13,000/mo", salaryMin: 8000, salaryMax: 13000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Develop and execute marketing campaigns for Brazil largest beverage company. Analyze market trends, manage social media strategy, and support brand positioning across national markets.",
    sector: "Marketing", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@ambev.com"
  },
  {
    id: 30, title: "Financial Analyst", company: "Itau Unibanco",
    companyUrl: "https://itauunibanco.com/careers", location: "Sao Paulo, SP",
    country: "br", countryName: "Brazil", lat: -23.5505, lng: -46.6333,
    salary: "R$ 10,000 - 16,000/mo", salaryMin: 10000, salaryMax: 16000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Conduct financial analysis and risk assessment for corporate banking division. Prepare credit reports, support loan structuring, and assist in portfolio management for top-tier clients.",
    sector: "Finance", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@itau.com"
  },
  {
    id: 31, title: "Sales Manager", company: "Magazine Luiza",
    companyUrl: "https://magazineluiza.com/careers", location: "Franca, SP",
    country: "br", countryName: "Brazil", lat: -20.5386, lng: -47.4027,
    salary: "R$ 9,000 - 15,000/mo", salaryMin: 9000, salaryMax: 15000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Lead B2B sales operations for one of Brazil largest e-commerce retailers. Manage key accounts, negotiate enterprise contracts, and drive revenue growth in the wholesale channel.",
    sector: "Sales", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@magazine.com"
  },
  {
    id: 32, title: "HR Specialist", company: "WEG S.A.",
    companyUrl: "https://wegsa.com/careers", location: "Jaragua do Sul, SC",
    country: "br", countryName: "Brazil", lat: -26.4834, lng: -49.0665,
    salary: "R$ 7,000 - 11,000/mo", salaryMin: 7000, salaryMax: 11000, salaryCurrency: "BRL", salaryPeriod: "month",
    description: "Manage recruitment and talent development programs for a global manufacturing company. Lead employer branding initiatives and implement performance management systems across 5 facilities.",
    sector: "HR", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@weg.com"
  },

  // ========== UNITED KINGDOM ==========
  {
    id: 33, title: "Financial Analyst", company: "CapitalEdge Partners",
    companyUrl: "https://capitaledgepartners.com/careers", location: "London",
    country: "gb", countryName: "United Kingdom", lat: 51.5074, lng: -0.1278,
    salary: "£65,000 - 85,000/yr", salaryMin: 65000, salaryMax: 85000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Conduct financial modeling, valuation analysis, and market research for M&A transactions. Prepare investment presentations for institutional clients.",
    sector: "Finance", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@capitaledge.com"
  },
  {
    id: 34, title: "DevOps Engineer", company: "Barclays Technology",
    companyUrl: "https://barclaystechnology.com/careers", location: "Manchester",
    country: "gb", countryName: "United Kingdom", lat: 53.4808, lng: -2.2426,
    salary: "£55,000 - 75,000/yr", salaryMin: 55000, salaryMax: 75000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Manage CI/CD pipelines and cloud infrastructure on AWS. Automate deployment processes for banking applications, ensure 99.99% uptime for critical financial services.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@barclays.com"
  },
  {
    id: 35, title: "Product Designer", company: "BBC Digital",
    companyUrl: "https://bbcdigital.com/careers", location: "London",
    country: "gb", countryName: "United Kingdom", lat: 51.5074, lng: -0.1278,
    salary: "£50,000 - 70,000/yr", salaryMin: 50000, salaryMax: 70000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Design digital experiences for BBC streaming and news platforms. Conduct user research, create accessible interfaces, and work with content teams to serve 40M+ weekly users.",
    sector: "Design", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@bbc.com"
  },
  {
    id: 36, title: "Marketing Manager", company: "Unilever UK",
    companyUrl: "https://unileveruk.com/careers", location: "London",
    country: "gb", countryName: "United Kingdom", lat: 51.5074, lng: -0.1278,
    salary: "£58,000 - 78,000/yr", salaryMin: 58000, salaryMax: 78000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Lead brand marketing campaigns for consumer goods across UK and Ireland. Manage a team of 10 specialists, oversee budget of 20M GBP annual, and develop omnichannel strategies.",
    sector: "Marketing", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@unilever.com"
  },
  {
    id: 37, title: "Data Scientist", company: "Tesco Analytics",
    companyUrl: "https://tescoanalytics.com/careers", location: "London",
    country: "gb", countryName: "United Kingdom", lat: 51.5074, lng: -0.1278,
    salary: "£60,000 - 82,000/yr", salaryMin: 60000, salaryMax: 82000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Build machine learning models for customer personalization and demand forecasting. Analyze purchasing patterns of 25M+ Clubcard members to optimize retail operations.",
    sector: "Data Science", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@tesco.com"
  },
  {
    id: 38, title: "Software Engineer", company: "Deloitte Digital",
    companyUrl: "https://deloittedigital.com/careers", location: "Edinburgh",
    country: "gb", countryName: "United Kingdom", lat: 55.9533, lng: -3.1883,
    salary: "£52,000 - 72,000/yr", salaryMin: 52000, salaryMax: 72000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Build custom software solutions for government and financial services clients. Work with modern tech stack including React, Node.js, and cloud platforms.",
    sector: "Technology", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@deloitte.com"
  },
  {
    id: 39, title: "HR Director", company: "Vodafone UK",
    companyUrl: "https://vodafoneuk.com/careers", location: "Newbury",
    country: "gb", countryName: "United Kingdom", lat: 51.3984, lng: -1.3175,
    salary: "£70,000 - 95,000/yr", salaryMin: 70000, salaryMax: 95000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Lead people strategy for Vodafone UK operations with 10,000+ employees. Drive talent acquisition, diversity initiatives, and organizational development programs.",
    sector: "HR", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@vodafone.com"
  },
  {
    id: 40, title: "Healthcare Consultant", company: "NHS Digital",
    companyUrl: "https://nhsdigital.com/careers", location: "Leeds",
    country: "gb", countryName: "United Kingdom", lat: 53.7965, lng: -1.5479,
    salary: "£48,000 - 68,000/yr", salaryMin: 48000, salaryMax: 68000, salaryCurrency: "GBP", salaryPeriod: "year",
    description: "Consult on digital transformation projects for the National Health Service. Analyze healthcare data, implement EHR systems, and improve patient care delivery across trusts.",
    sector: "Healthcare", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@nhs.com"
  },

  // ========== GERMANY ==========
  {
    id: 41, title: "UX Researcher", company: "SAP Design",
    companyUrl: "https://sapdesign.com/careers", location: "Berlin",
    country: "de", countryName: "Germany", lat: 52.52, lng: 13.405,
    salary: "€52,000 - 68,000/yr", salaryMin: 52000, salaryMax: 68000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Plan and execute qualitative and quantitative user research studies for enterprise software. Synthesize findings into actionable recommendations for B2B SaaS products.",
    sector: "Design", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@sap.com"
  },
  {
    id: 42, title: "Mechanical Engineer", company: "BMW Group",
    companyUrl: "https://bmwgroup.com/careers", location: "Munich, Bavaria",
    country: "de", countryName: "Germany", lat: 48.1351, lng: 11.582,
    salary: "€58,000 - 78,000/yr", salaryMin: 58000, salaryMax: 78000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design and test components for electric vehicle powertrains. Use CAD software and simulation tools. Collaborate with cross-functional teams on next-generation EV platforms.",
    sector: "Engineering", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@bmw.com"
  },
  {
    id: 43, title: "Software Developer", company: "SAP SE",
    companyUrl: "https://sapse.com/careers", location: "Walldorf, Baden-Wuerttemberg",
    country: "de", countryName: "Germany", lat: 49.2963, lng: 8.6555,
    salary: "€55,000 - 75,000/yr", salaryMin: 55000, salaryMax: 75000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Develop enterprise resource planning modules serving 400,000+ customers worldwide. Work with ABAP, JavaScript, and HANA database for business-critical applications.",
    sector: "Technology", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@sap.com"
  },
  {
    id: 44, title: "Data Analyst", company: "Siemens AG",
    companyUrl: "https://siemensag.com/careers", location: "Munich, Bavaria",
    country: "de", countryName: "Germany", lat: 48.1351, lng: 11.582,
    salary: "€50,000 - 70,000/yr", salaryMin: 50000, salaryMax: 70000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Analyze industrial IoT data from smart factories across Europe. Build dashboards, develop predictive maintenance models, and optimize manufacturing processes.",
    sector: "Data Science", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@siemens.com"
  },
  {
    id: 45, title: "Marketing Specialist", company: "Adidas AG",
    companyUrl: "https://adidasag.com/careers", location: "Herzogenaurach, Bavaria",
    country: "de", countryName: "Germany", lat: 49.5686, lng: 10.8876,
    salary: "€48,000 - 65,000/yr", salaryMin: 48000, salaryMax: 65000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Execute digital marketing campaigns for DACH region. Manage social media, influencer partnerships, and e-commerce marketing for key product launches.",
    sector: "Marketing", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@adidas.com"
  },
  {
    id: 46, title: "Financial Controller", company: "Deutsche Bank",
    companyUrl: "https://deutschebank.com/careers", location: "Frankfurt, Hesse",
    country: "de", countryName: "Germany", lat: 50.1109, lng: 8.6821,
    salary: "€65,000 - 88,000/yr", salaryMin: 65000, salaryMax: 88000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Oversee financial reporting and compliance for the investment banking division. Manage budgets, prepare regulatory filings, and support audit processes.",
    sector: "Finance", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@deutsche.com"
  },
  {
    id: 47, title: "Sales Manager", company: "Bosch Group",
    companyUrl: "https://boschgroup.com/careers", location: "Stuttgart, Baden-Wuerttemberg",
    country: "de", countryName: "Germany", lat: 48.7758, lng: 9.1829,
    salary: "€56,000 - 76,000/yr", salaryMin: 56000, salaryMax: 76000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage B2B sales for industrial technology solutions across Central Europe. Lead a team of 15 account managers, negotiate contracts with automotive OEMs.",
    sector: "Sales", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@bosch.com"
  },
  {
    id: 48, title: "HR Manager", company: "Allianz SE",
    companyUrl: "https://allianzse.com/careers", location: "Munich, Bavaria",
    country: "de", countryName: "Germany", lat: 48.1351, lng: 11.582,
    salary: "€52,000 - 72,000/yr", salaryMin: 52000, salaryMax: 72000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Lead talent management and organizational development for 150,000+ employee insurance group. Drive employer branding, training programs, and international mobility initiatives.",
    sector: "HR", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@allianz.com"
  },

  // ========== FRANCE ==========
  {
    id: 49, title: "DevOps Engineer", company: "CloudNine Systems",
    companyUrl: "https://cloudninesystems.com/careers", location: "Paris",
    country: "fr", countryName: "France", lat: 48.8566, lng: 2.3522,
    salary: "€60,000 - 80,000/yr", salaryMin: 60000, salaryMax: 80000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage CI/CD pipelines and cloud infrastructure on AWS and GCP. Automate deployment processes and ensure 99.99% uptime for critical production services.",
    sector: "Technology", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@cloudnine.com"
  },
  {
    id: 50, title: "AI/ML Engineer", company: "DeepCore AI",
    companyUrl: "https://deepcoreai.com/careers", location: "Lyon",
    country: "fr", countryName: "France", lat: 45.764, lng: 4.8357,
    salary: "€55,000 - 75,000/yr", salaryMin: 55000, salaryMax: 75000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design and deploy machine learning models for NLP and computer vision applications. Optimize model inference for edge devices and collaborate with research teams.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@deepcore.com"
  },
  {
    id: 51, title: "Product Manager", company: "Ubisoft",
    companyUrl: "https://ubisoft.com/careers", location: "Montreuil",
    country: "fr", countryName: "France", lat: 48.8645, lng: 2.4429,
    salary: "€52,000 - 72,000/yr", salaryMin: 52000, salaryMax: 72000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Own the product roadmap for Ubisoft mobile gaming division. Manage cross-functional teams and drive features for games with 50M+ monthly active players.",
    sector: "Management", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@ubisoft.com"
  },
  {
    id: 52, title: "UX Designer", company: "Airbus",
    companyUrl: "https://airbus.com/careers", location: "Toulouse",
    country: "fr", countryName: "France", lat: 43.6047, lng: 1.4442,
    salary: "€48,000 - 65,000/yr", salaryMin: 48000, salaryMax: 65000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design user interfaces for aircraft cockpit systems and maintenance platforms. Ensure compliance with aviation safety standards and collaborate with engineers.",
    sector: "Design", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@airbus.com"
  },
  {
    id: 53, title: "Marketing Manager", company: "LOreal",
    companyUrl: "https://loreal.com/careers", location: "Paris",
    country: "fr", countryName: "France", lat: 48.8566, lng: 2.3522,
    salary: "€50,000 - 70,000/yr", salaryMin: 50000, salaryMax: 70000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Lead digital marketing strategy for luxury beauty brands across France and Benelux. Manage a team of 8, oversee budget of 15M EUR, and develop influencer strategies.",
    sector: "Marketing", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@loreal.com"
  },
  {
    id: 54, title: "Financial Analyst", company: "BNP Paribas",
    companyUrl: "https://bnpparibas.com/careers", location: "Paris",
    country: "fr", countryName: "France", lat: 48.8566, lng: 2.3522,
    salary: "€55,000 - 75,000/yr", salaryMin: 55000, salaryMax: 75000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Conduct financial analysis for corporate banking clients. Prepare credit assessments, support loan structuring for mid-cap companies, and manage risk portfolios.",
    sector: "Finance", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@bnp.com"
  },
  {
    id: 55, title: "Data Scientist", company: "Orange Telecom",
    companyUrl: "https://orangetelecom.com/careers", location: "Paris",
    country: "fr", countryName: "France", lat: 48.8566, lng: 2.3522,
    salary: "€58,000 - 78,000/yr", salaryMin: 58000, salaryMax: 78000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Build predictive models for customer churn and network optimization. Analyze data from 30M+ subscribers to improve service quality and reduce operational costs.",
    sector: "Data Science", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@orange.com"
  },
  {
    id: 56, title: "Sales Executive", company: "Schneider Electric",
    companyUrl: "https://schneiderelectric.com/careers", location: "Grenoble",
    country: "fr", countryName: "France", lat: 45.1885, lng: 5.7245,
    salary: "€45,000 - 65,000/yr", salaryMin: 45000, salaryMax: 65000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Drive enterprise sales for energy management solutions across Southern Europe. Manage key accounts, negotiate contracts, and achieve annual targets of 20M EUR.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@schneider.com"
  },

  // ========== JAPAN ==========
  {
    id: 57, title: "Frontend Engineer", company: "Sony Interactive",
    companyUrl: "https://sonyinteractive.com/careers", location: "Tokyo",
    country: "jp", countryName: "Japan", lat: 35.6762, lng: 139.6503,
    salary: "¥700M - 1,000M/yr", salaryMin: 7000000, salaryMax: 10000000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Build high-performance web interfaces for PlayStation Network services. Work with React, TypeScript, and WebGL. Optimize for performance across 100M+ active users.",
    sector: "Technology", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@sony.com"
  },
  {
    id: 58, title: "Marketing Manager", company: "Toyota Motor Corp",
    companyUrl: "https://toyotamotorcorp.com/careers", location: "Nagoya, Aichi",
    country: "jp", countryName: "Japan", lat: 35.1815, lng: 136.9066,
    salary: "¥850M - 1,200M/yr", salaryMin: 8500000, salaryMax: 12000000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Lead digital marketing campaigns for Toyota EV lineup across Asia-Pacific. Manage a team of 12 specialists, oversee 500M JPY annual budget.",
    sector: "Marketing", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@toyota.com"
  },
  {
    id: 59, title: "Data Scientist", company: "Rakuten",
    companyUrl: "https://rakuten.com/careers", location: "Tokyo",
    country: "jp", countryName: "Japan", lat: 35.6762, lng: 139.6503,
    salary: "¥800M - 1,100M/yr", salaryMin: 8000000, salaryMax: 11000000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Build recommendation systems for Japan largest e-commerce ecosystem. Analyze data from 100M+ members to optimize personalization and increase conversion rates.",
    sector: "Data Science", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@rakuten.com"
  },
  {
    id: 60, title: "Mechanical Engineer", company: "Mitsubishi Heavy Industries",
    companyUrl: "https://mitsubishiheavyindustries.com/careers", location: "Yokohama",
    country: "jp", countryName: "Japan", lat: 35.4437, lng: 139.638,
    salary: "¥600M - 850M/yr", salaryMin: 6000000, salaryMax: 8500000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Design components for industrial machinery and defense systems. Use advanced simulation tools, manage testing protocols, and collaborate with international engineering teams.",
    sector: "Engineering", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@mitsubishi.com"
  },
  {
    id: 61, title: "UX Designer", company: "LINE Corp",
    companyUrl: "https://linecorp.com/careers", location: "Tokyo",
    country: "jp", countryName: "Japan", lat: 35.6762, lng: 139.6503,
    salary: "¥750M - 1,050M/yr", salaryMin: 7500000, salaryMax: 10500000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Design messaging and fintech features for LINE app with 90M+ Japanese users. Conduct user research, create prototypes, and iterate based on A/B testing results.",
    sector: "Design", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@line.com"
  },
  {
    id: 62, title: "Financial Analyst", company: "Nomura Securities",
    companyUrl: "https://nomurasecurities.com/careers", location: "Tokyo",
    country: "jp", countryName: "Japan", lat: 35.6762, lng: 139.6503,
    salary: "¥900M - 1,300M/yr", salaryMin: 9000000, salaryMax: 13000000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Conduct equity research and financial modeling for Japanese and Asian markets. Prepare investment reports for institutional clients and support IPO processes.",
    sector: "Finance", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@nomura.com"
  },
  {
    id: 63, title: "HR Business Partner", company: "SoftBank Group",
    companyUrl: "https://softbankgroup.com/careers", location: "Tokyo",
    country: "jp", countryName: "Japan", lat: 35.6762, lng: 139.6503,
    salary: "¥700M - 950M/yr", salaryMin: 7000000, salaryMax: 9500000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Partner with technology leadership on talent strategy for SoftBank portfolio companies. Drive recruitment programs for AI and robotics divisions across Japan.",
    sector: "HR", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@softbank.com"
  },
  {
    id: 64, title: "Sales Director", company: "Nintendo",
    companyUrl: "https://nintendo.com/careers", location: "Kyoto",
    country: "jp", countryName: "Japan", lat: 35.0116, lng: 135.7681,
    salary: "¥800M - 1,200M/yr", salaryMin: 8000000, salaryMax: 12000000, salaryCurrency: "JPY", salaryPeriod: "year",
    description: "Lead sales operations for gaming hardware and software across Asia-Pacific. Manage distribution partnerships, achieve annual revenue targets of 500B JPY.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@nintendo.com"
  },

  // ========== CANADA ==========
  {
    id: 65, title: "Project Manager", company: "BuildRight Consulting",
    companyUrl: "https://buildrightconsulting.com/careers", location: "Toronto, ON",
    country: "ca", countryName: "Canada", lat: 43.6532, lng: -79.3832,
    salary: "C$ 85,000 - 110,000/yr", salaryMin: 85000, salaryMax: 110000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Oversee large-scale IT implementation projects from initiation to delivery. Manage cross-functional teams of 20+ members using Agile methodologies.",
    sector: "Management", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@buildright.com"
  },
  {
    id: 66, title: "Healthcare Data Analyst", company: "Maple Health Tech",
    companyUrl: "https://maplehealthtech.com/careers", location: "Vancouver, BC",
    country: "ca", countryName: "Canada", lat: 49.2827, lng: -123.1207,
    salary: "C$ 70,000 - 95,000/yr", salaryMin: 70000, salaryMax: 95000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Analyze healthcare data to improve patient outcomes across British Columbia. Build dashboards, develop predictive models for hospital resource planning.",
    sector: "Healthcare", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@maple.com"
  },
  {
    id: 67, title: "Software Developer", company: "Shopify",
    companyUrl: "https://shopify.com/careers", location: "Ottawa, ON",
    country: "ca", countryName: "Canada", lat: 45.4215, lng: -75.6972,
    salary: "C$ 90,000 - 130,000/yr", salaryMin: 90000, salaryMax: 130000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Build e-commerce platform features serving 2M+ merchants worldwide. Work with React, Ruby on Rails, and distributed systems at massive scale.",
    sector: "Technology", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@shopify.com"
  },
  {
    id: 68, title: "Marketing Specialist", company: "Bell Media",
    companyUrl: "https://bellmedia.com/careers", location: "Toronto, ON",
    country: "ca", countryName: "Canada", lat: 43.6532, lng: -79.3832,
    salary: "C$ 60,000 - 82,000/yr", salaryMin: 60000, salaryMax: 82000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Execute multi-channel marketing campaigns for Canada largest telecom. Manage digital advertising, content strategy, and brand partnerships.",
    sector: "Marketing", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@bell.com"
  },
  {
    id: 69, title: "Financial Advisor", company: "RBC Wealth Management",
    companyUrl: "https://rbcwealthmanagement.com/careers", location: "Toronto, ON",
    country: "ca", countryName: "Canada", lat: 43.6532, lng: -79.3832,
    salary: "C$ 75,000 - 110,000/yr", salaryMin: 75000, salaryMax: 110000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Provide financial planning and investment advice to high-net-worth clients. Manage portfolios of 50M+ CAD and develop tailored wealth strategies.",
    sector: "Finance", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@rbc.com"
  },
  {
    id: 70, title: "UX Researcher", company: "Collabora",
    companyUrl: "https://collabora.com/careers", location: "Montreal, QC",
    country: "ca", countryName: "Canada", lat: 45.5017, lng: -73.5673,
    salary: "C$ 65,000 - 88,000/yr", salaryMin: 65000, salaryMax: 88000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Conduct user research for open-source software products. Plan usability studies, create personas, and deliver insights for global developer communities.",
    sector: "Design", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@collabora.com"
  },
  {
    id: 71, title: "Data Engineer", company: "TD Bank",
    companyUrl: "https://tdbank.com/careers", location: "Toronto, ON",
    country: "ca", countryName: "Canada", lat: 43.6532, lng: -79.3832,
    salary: "C$ 88,000 - 120,000/yr", salaryMin: 88000, salaryMax: 120000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Build data pipelines for banking analytics and fraud detection systems. Work with Apache Spark, Kafka, and cloud data warehouses.",
    sector: "Data Science", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@td.com"
  },
  {
    id: 72, title: "Sales Manager", company: "Lululemon",
    companyUrl: "https://lululemon.com/careers", location: "Vancouver, BC",
    country: "ca", countryName: "Canada", lat: 49.2827, lng: -123.1207,
    salary: "C$ 70,000 - 95,000/yr", salaryMin: 70000, salaryMax: 95000, salaryCurrency: "CAD", salaryPeriod: "year",
    description: "Lead enterprise and franchise sales for athletic apparel across North America. Manage key accounts, develop wholesale strategies, and expand retail partnerships.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@lululemon.com"
  },

  // ========== AUSTRALIA ==========
  {
    id: 73, title: "Mining Engineer", company: "BHP Group",
    companyUrl: "https://bhpgroup.com/careers", location: "Perth, WA",
    country: "au", countryName: "Australia", lat: -31.9505, lng: 115.8605,
    salary: "A$ 120,000 - 160,000/yr", salaryMin: 120000, salaryMax: 160000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Plan and optimize mining operations across Western Australia. Use advanced simulation software, manage drilling schedules, and implement safety protocols.",
    sector: "Engineering", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@bhp.com"
  },
  {
    id: 74, title: "Full-Stack Developer", company: "Atlassian",
    companyUrl: "https://atlassian.com/careers", location: "Sydney, NSW",
    country: "au", countryName: "Australia", lat: -33.8688, lng: 151.2093,
    salary: "A$ 130,000 - 170,000/yr", salaryMin: 130000, salaryMax: 170000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Build collaboration tools used by 250K+ organizations worldwide. Work with React, Node.js, and microservices. Ship features to millions of users.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@atlassian.com"
  },
  {
    id: 75, title: "Marketing Director", company: "Qantas Airways",
    companyUrl: "https://qantasairways.com/careers", location: "Sydney, NSW",
    country: "au", countryName: "Australia", lat: -33.8688, lng: 151.2093,
    salary: "A$ 110,000 - 150,000/yr", salaryMin: 110000, salaryMax: 150000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Lead brand marketing for Australia flagship airline. Manage a team of 15, oversee 30M AUD budget, and drive loyalty program growth for 12M+ members.",
    sector: "Marketing", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@qantas.com"
  },
  {
    id: 76, title: "Financial Analyst", company: "Commonwealth Bank",
    companyUrl: "https://commonwealthbank.com/careers", location: "Sydney, NSW",
    country: "au", countryName: "Australia", lat: -33.8688, lng: 151.2093,
    salary: "A$ 95,000 - 130,000/yr", salaryMin: 95000, salaryMax: 130000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Conduct financial analysis for retail and institutional banking products. Prepare risk assessments, support loan approvals, and develop forecasting models.",
    sector: "Finance", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@commonwealth.com"
  },
  {
    id: 77, title: "UX Designer", company: "Canva",
    companyUrl: "https://canva.com/careers", location: "Sydney, NSW",
    country: "au", countryName: "Australia", lat: -33.8688, lng: 151.2093,
    salary: "A$ 100,000 - 140,000/yr", salaryMin: 100000, salaryMax: 140000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Design features for the world leading online design platform with 170M+ monthly users. Conduct user research, create prototypes, and A/B test new features.",
    sector: "Design", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@canva.com"
  },
  {
    id: 78, title: "Data Scientist", company: "CSIRO",
    companyUrl: "https://csiro.com/careers", location: "Melbourne, VIC",
    country: "au", countryName: "Australia", lat: -37.8136, lng: 144.9631,
    salary: "A$ 105,000 - 145,000/yr", salaryMin: 105000, salaryMax: 145000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Apply machine learning to environmental and agricultural research. Build predictive models for climate change impact, crop yield optimization, and resource management.",
    sector: "Data Science", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@csiro.com"
  },
  {
    id: 79, title: "HR Manager", company: "Telstra",
    companyUrl: "https://telstra.com/careers", location: "Melbourne, VIC",
    country: "au", countryName: "Australia", lat: -37.8136, lng: 144.9631,
    salary: "A$ 90,000 - 120,000/yr", salaryMin: 90000, salaryMax: 120000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Lead people operations for Australia largest telecommunications company. Drive talent acquisition, employee engagement, and organizational transformation initiatives.",
    sector: "HR", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@telstra.com"
  },
  {
    id: 80, title: "Sales Executive", company: "Wesfarmers",
    companyUrl: "https://wesfarmers.com/careers", location: "Perth, WA",
    country: "au", countryName: "Australia", lat: -31.9505, lng: 115.8605,
    salary: "A$ 85,000 - 115,000/yr", salaryMin: 85000, salaryMax: 115000, salaryCurrency: "AUD", salaryPeriod: "year",
    description: "Drive B2B sales for retail conglomerate spanning hardware, chemicals, and supermarkets. Manage key accounts and develop strategic partnerships across ANZ.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@wesfarmers.com"
  },

  // ========== MEXICO ==========
  {
    id: 81, title: "Manufacturing Engineer", company: "Grupo Bimbo",
    companyUrl: "https://grupobimbo.com/careers", location: "Mexico City, CDMX",
    country: "mx", countryName: "Mexico", lat: 19.4326, lng: -99.1332,
    salary: "MX$ 35,000 - 55,000/mo", salaryMin: 35000, salaryMax: 55000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Optimize production lines across 200+ manufacturing facilities in Latin America. Implement Lean Six Sigma methodologies and improve throughput.",
    sector: "Engineering", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@grupo.com"
  },
  {
    id: 82, title: "Software Developer", company: "Rappi",
    companyUrl: "https://rappi.com/careers", location: "Mexico City, CDMX",
    country: "mx", countryName: "Mexico", lat: 19.4326, lng: -99.1332,
    salary: "MX$ 30,000 - 48,000/mo", salaryMin: 30000, salaryMax: 48000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Build delivery platform features serving 30M+ users across Latin America. Work with React Native, Node.js, and real-time tracking systems.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@rappi.com"
  },
  {
    id: 83, title: "Marketing Manager", company: "Grupo Modelo",
    companyUrl: "https://grupomodelo.com/careers", location: "Mexico City, CDMX",
    country: "mx", countryName: "Mexico", lat: 19.4326, lng: -99.1332,
    salary: "MX$ 28,000 - 42,000/mo", salaryMin: 28000, salaryMax: 42000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Lead marketing campaigns for Mexico largest beverage brands. Manage a team of 10, oversee 200M MXN annual budget, and drive market share growth.",
    sector: "Marketing", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@grupo.com"
  },
  {
    id: 84, title: "Financial Analyst", company: "Banorte",
    companyUrl: "https://banorte.com/careers", location: "Mexico City, CDMX",
    country: "mx", countryName: "Mexico", lat: 19.4326, lng: -99.1332,
    salary: "MX$ 25,000 - 40,000/mo", salaryMin: 25000, salaryMax: 40000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Conduct financial analysis for commercial banking products. Prepare credit risk assessments, support corporate lending decisions, and manage portfolio analytics.",
    sector: "Finance", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@banorte.com"
  },
  {
    id: 85, title: "Data Scientist", company: "Kueski",
    companyUrl: "https://kueski.com/careers", location: "Mexico City, CDMX",
    country: "mx", countryName: "Mexico", lat: 19.4326, lng: -99.1332,
    salary: "MX$ 35,000 - 52,000/mo", salaryMin: 35000, salaryMax: 52000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Build credit scoring models and fraud detection systems for fintech platform. Analyze alternative data sources to serve underbanked populations in Mexico.",
    sector: "Data Science", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@kueski.com"
  },
  {
    id: 86, title: "UX Designer", company: "Softtek",
    companyUrl: "https://softtek.com/careers", location: "Monterrey, NL",
    country: "mx", countryName: "Mexico", lat: 25.6866, lng: -100.3161,
    salary: "MX$ 22,000 - 35,000/mo", salaryMin: 22000, salaryMax: 35000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Design enterprise software interfaces for Fortune 500 clients. Create design systems, conduct usability testing, and collaborate with development teams.",
    sector: "Design", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@softtek.com"
  },
  {
    id: 87, title: "Sales Director", company: "FEMSA",
    companyUrl: "https://femsa.com/careers", location: "Monterrey, NL",
    country: "mx", countryName: "Mexico", lat: 25.6866, lng: -100.3161,
    salary: "MX$ 38,000 - 58,000/mo", salaryMin: 38000, salaryMax: 58000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Lead commercial operations for convenience store chain OXXO across Latin America. Manage distribution partnerships, expand franchise network, and drive revenue.",
    sector: "Sales", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@femsa.com"
  },
  {
    id: 88, title: "HR Manager", company: "CEMEX",
    companyUrl: "https://cemex.com/careers", location: "Monterrey, NL",
    country: "mx", countryName: "Mexico", lat: 25.6866, lng: -100.3161,
    salary: "MX$ 28,000 - 42,000/mo", salaryMin: 28000, salaryMax: 42000, salaryCurrency: "MXN", salaryPeriod: "month",
    description: "Manage talent development for global building materials company. Lead recruitment, training programs, and employee engagement across 10+ Mexican facilities.",
    sector: "HR", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@cemex.com"
  },

  // ========== INDONESIA ==========
  {
    id: 89, title: "Mobile Developer", company: "Gojek",
    companyUrl: "https://gojek.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 25,000,000 - 40,000,000/mo", salaryMin: 25000000, salaryMax: 40000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Build super-app features serving 190M+ users across Southeast Asia. Work with React Native and Kotlin. Implement real-time tracking and payment integration.",
    sector: "Technology", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@gojek.com"
  },
  {
    id: 90, title: "Data Analyst", company: "Tokopedia",
    companyUrl: "https://tokopedia.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 22,000,000 - 35,000,000/mo", salaryMin: 22000000, salaryMax: 35000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Analyze e-commerce data for Indonesia largest marketplace. Build dashboards, develop recommendation algorithms, and optimize seller performance metrics.",
    sector: "Data Science", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@tokopedia.com"
  },
  {
    id: 91, title: "Product Manager", company: "Traveloka",
    companyUrl: "https://traveloka.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 30,000,000 - 48,000,000/mo", salaryMin: 30000000, salaryMax: 48000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Own the product roadmap for travel booking platform. Manage cross-functional teams and drive features serving 60M+ monthly active users across 6 countries.",
    sector: "Management", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@traveloka.com"
  },
  {
    id: 92, title: "Marketing Specialist", company: "Bukalapak",
    companyUrl: "https://bukalapak.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 18,000,000 - 28,000,000/mo", salaryMin: 18000000, salaryMax: 28000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Execute digital marketing campaigns for Indonesia e-commerce platform. Manage social media, performance marketing, and brand partnerships.",
    sector: "Marketing", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@bukalapak.com"
  },
  {
    id: 93, title: "Financial Analyst", company: "Bank Mandiri",
    companyUrl: "https://bankmandiri.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 20,000,000 - 32,000,000/mo", salaryMin: 20000000, salaryMax: 32000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Conduct financial analysis for Indonesia largest bank. Prepare credit assessments, support corporate lending, and develop financial forecasting models.",
    sector: "Finance", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@bank.com"
  },
  {
    id: 94, title: "UX Designer", company: "Shopee Indonesia",
    companyUrl: "https://shopeeindonesia.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 20,000,000 - 32,000,000/mo", salaryMin: 20000000, salaryMax: 32000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Design shopping and payment features for Southeast Asia leading e-commerce app. Conduct user research, create prototypes, and optimize conversion funnels.",
    sector: "Design", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@shopee.com"
  },
  {
    id: 95, title: "Backend Engineer", company: "Dana",
    companyUrl: "https://dana.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 25,000,000 - 40,000,000/mo", salaryMin: 25000000, salaryMax: 40000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Build payment and financial services infrastructure for Indonesia leading digital wallet. Work with microservices architecture handling millions of daily transactions.",
    sector: "Technology", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@dana.com"
  },
  {
    id: 96, title: "Sales Manager", company: "Unilever Indonesia",
    companyUrl: "https://unileverindonesia.com/careers", location: "Jakarta",
    country: "id", countryName: "Indonesia", lat: -6.2088, lng: 106.8456,
    salary: "Rp 22,000,000 - 35,000,000/mo", salaryMin: 22000000, salaryMax: 35000000, salaryCurrency: "IDR", salaryPeriod: "month",
    description: "Lead sales operations for FMCG products across Indonesian archipelago. Manage distribution networks, key accounts, and achieve annual revenue targets.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@unilever.com"
  },

  // ========== SOUTH KOREA ==========
  {
    id: 97, title: "Semiconductor Engineer", company: "Samsung Electronics",
    companyUrl: "https://samsungelectronics.com/careers", location: "Suwon, Gyeonggi",
    country: "kr", countryName: "South Korea", lat: 37.2636, lng: 127.0286,
    salary: "₩6,000M - 9,000M/yr", salaryMin: 60000000, salaryMax: 90000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Design and test next-generation semiconductor chips for mobile and data center applications. Work with cutting-edge lithography processes.",
    sector: "Engineering", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@samsung.com"
  },
  {
    id: 98, title: "Software Engineer", company: "Kakao Corp",
    companyUrl: "https://kakaocorp.com/careers", location: "Jeonju",
    country: "kr", countryName: "South Korea", lat: 35.8242, lng: 127.148,
    salary: "₩5,000M - 7,500M/yr", salaryMin: 50000000, salaryMax: 75000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Build features for Korea super-app ecosystem with 50M+ users. Work with microservices, React Native, and large-scale distributed systems.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@kakao.com"
  },
  {
    id: 99, title: "Product Manager", company: "Coupang",
    companyUrl: "https://coupang.com/careers", location: "Seoul",
    country: "kr", countryName: "South Korea", lat: 37.5665, lng: 126.978,
    salary: "₩6,500M - 9,500M/yr", salaryMin: 65000000, salaryMax: 95000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Own the product roadmap for Korea leading e-commerce platform. Drive logistics optimization, same-day delivery features, and membership growth.",
    sector: "Management", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@coupang.com"
  },
  {
    id: 100, title: "Data Scientist", company: "Naver Corp",
    companyUrl: "https://navercorp.com/careers", location: "Seongnam",
    country: "kr", countryName: "South Korea", lat: 37.4386, lng: 127.1378,
    salary: "₩5,500M - 8,000M/yr", salaryMin: 55000000, salaryMax: 80000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Build AI-powered search and recommendation systems for Korea largest portal. Develop NLP models for Korean language processing and content personalization.",
    sector: "Data Science", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@naver.com"
  },
  {
    id: 101, title: "Marketing Manager", company: "LG Electronics",
    companyUrl: "https://lgelectronics.com/careers", location: "Seoul",
    country: "kr", countryName: "South Korea", lat: 37.5665, lng: 126.978,
    salary: "₩4,800M - 7,000M/yr", salaryMin: 48000000, salaryMax: 70000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Lead global marketing campaigns for consumer electronics. Manage a team of 15, oversee 50B KRW budget, and develop brand strategies for global markets.",
    sector: "Marketing", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@lg.com"
  },
  {
    id: 102, title: "Financial Analyst", company: "Shinhan Bank",
    companyUrl: "https://shinhanbank.com/careers", location: "Seoul",
    country: "kr", countryName: "South Korea", lat: 37.5665, lng: 126.978,
    salary: "₩5,200M - 7,800M/yr", salaryMin: 52000000, salaryMax: 78000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Conduct financial analysis for Korea second-largest bank. Prepare risk assessments, support corporate banking decisions, and manage portfolio analytics.",
    sector: "Finance", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@shinhan.com"
  },
  {
    id: 103, title: "UX Designer", company: "NCSoft",
    companyUrl: "https://ncsoft.com/careers", location: "Pangyo",
    country: "kr", countryName: "South Korea", lat: 37.3944, lng: 127.1112,
    salary: "₩4,500M - 6,800M/yr", salaryMin: 45000000, salaryMax: 68000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Design game UI/UX for MMORPG titles with millions of global players. Create immersive interfaces, conduct playtesting, and iterate on player feedback.",
    sector: "Design", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@ncsoft.com"
  },
  {
    id: 104, title: "HR Director", company: "Hyundai Motor",
    companyUrl: "https://hyundaimotor.com/careers", location: "Seoul",
    country: "kr", countryName: "South Korea", lat: 37.5665, lng: 126.978,
    salary: "₩6,000M - 8,500M/yr", salaryMin: 60000000, salaryMax: 85000000, salaryCurrency: "KRW", salaryPeriod: "year",
    description: "Lead people strategy for Korea largest automotive group with 70,000+ employees. Drive talent acquisition, leadership development, and global mobility programs.",
    sector: "HR", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@hyundai.com"
  },

  // ========== SAUDI ARABIA ==========
  {
    id: 105, title: "Infrastructure Project Manager", company: "NEOM",
    companyUrl: "https://neom.com/careers", location: "Riyadh",
    country: "sa", countryName: "Saudi Arabia", lat: 24.7136, lng: 46.6753,
    salary: "SAR 35,000 - 55,000/mo", salaryMin: 35000, salaryMax: 55000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Lead mega-infrastructure projects as part of Vision 2030. Manage multi-billion riyal construction programs and coordinate with international contractors.",
    sector: "Management", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@neom.com"
  },
  {
    id: 106, title: "Software Engineer", company: "STC Solutions",
    companyUrl: "https://stcsolutions.com/careers", location: "Riyadh",
    country: "sa", countryName: "Saudi Arabia", lat: 24.7136, lng: 46.6753,
    salary: "SAR 25,000 - 40,000/mo", salaryMin: 25000, salaryMax: 40000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Build digital transformation solutions for Saudi Arabia telecom sector. Work with cloud platforms, API development, and 5G network applications.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@stc.com"
  },
  {
    id: 107, title: "Financial Analyst", company: "Saudi Aramco",
    companyUrl: "https://saudiaramco.com/careers", location: "Dhahran",
    country: "sa", countryName: "Saudi Arabia", lat: 26.3927, lng: 49.9777,
    salary: "SAR 30,000 - 48,000/mo", salaryMin: 30000, salaryMax: 48000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Conduct financial analysis for the world largest oil company. Prepare investment appraisals, support capital allocation decisions, and manage financial planning.",
    sector: "Finance", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@saudi.com"
  },
  {
    id: 108, title: "Marketing Manager", company: "Almarai",
    companyUrl: "https://almarai.com/careers", location: "Riyadh",
    country: "sa", countryName: "Saudi Arabia", lat: 24.7136, lng: 46.6753,
    salary: "SAR 22,000 - 35,000/mo", salaryMin: 22000, salaryMax: 35000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Lead marketing for Saudi Arabia largest food and beverage company. Manage brand campaigns, oversee digital transformation of marketing channels.",
    sector: "Marketing", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@almarai.com"
  },
  {
    id: 109, title: "Mechanical Engineer", company: "SABIC",
    companyUrl: "https://sabic.com/careers", location: "Riyadh",
    country: "sa", countryName: "Saudi Arabia", lat: 24.7136, lng: 46.6753,
    salary: "SAR 28,000 - 42,000/mo", salaryMin: 28000, salaryMax: 42000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Design and optimize chemical processing equipment for petrochemical operations. Ensure compliance with international safety and environmental standards.",
    sector: "Engineering", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@sabic.com"
  },
  {
    id: 110, title: "Data Scientist", company: "Noon",
    companyUrl: "https://noon.com/careers", location: "Riyadh",
    country: "sa", countryName: "Saudi Arabia", lat: 24.7136, lng: 46.6753,
    salary: "SAR 30,000 - 45,000/mo", salaryMin: 30000, salaryMax: 45000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Build recommendation and search algorithms for e-commerce platform. Analyze customer behavior data to optimize product discovery and conversion.",
    sector: "Data Science", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@noon.com"
  },
  {
    id: 111, title: "HR Manager", company: "Pfizer Saudi",
    companyUrl: "https://pfizersaudi.com/careers", location: "Jeddah",
    country: "sa", countryName: "Saudi Arabia", lat: 21.4858, lng: 39.1925,
    salary: "SAR 20,000 - 32,000/mo", salaryMin: 20000, salaryMax: 32000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Manage talent acquisition and development for pharmaceutical operations. Drive Saudi nationalization programs and implement performance management systems.",
    sector: "HR", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@pfizer.com"
  },
  {
    id: 112, title: "Sales Executive", company: "Emaar EC",
    companyUrl: "https://emaarec.com/careers", location: "Riyadh",
    country: "sa", countryName: "Saudi Arabia", lat: 24.7136, lng: 46.6753,
    salary: "SAR 25,000 - 40,000/mo", salaryMin: 25000, salaryMax: 40000, salaryCurrency: "SAR", salaryPeriod: "month",
    description: "Drive real estate sales for luxury developments in Riyadh and Jeddah. Manage key accounts, negotiate high-value contracts, and achieve annual sales targets.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@emaar.com"
  },

  // ========== UAE ==========
  {
    id: 113, title: "FinTech Product Manager", company: "Careem",
    companyUrl: "https://careem.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 35,000 - 55,000/mo", salaryMin: 35000, salaryMax: 55000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Lead product strategy for Careem Pay, the region leading super-app payment platform. Define roadmap, manage a team of 10 product managers.",
    sector: "Finance", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@careem.com"
  },
  {
    id: 114, title: "Software Developer", company: "Dubai Electricity",
    companyUrl: "https://dubaielectricity.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 25,000 - 40,000/mo", salaryMin: 25000, salaryMax: 40000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Build smart city applications for Dubai utility services. Work with IoT platforms, real-time monitoring dashboards, and AI-powered analytics.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@dubai.com"
  },
  {
    id: 115, title: "Marketing Director", company: "Emirates Airlines",
    companyUrl: "https://emiratesairlines.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 40,000 - 65,000/mo", salaryMin: 40000, salaryMax: 65000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Lead global marketing for one of the world most iconic airlines. Manage a team of 25, oversee 500M AED budget, and drive brand campaigns globally.",
    sector: "Marketing", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@emirates.com"
  },
  {
    id: 116, title: "Financial Controller", company: "Emirates NBD",
    companyUrl: "https://emiratesnbd.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 30,000 - 48,000/mo", salaryMin: 30000, salaryMax: 48000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Oversee financial reporting for the UAE largest banking group. Manage budgets, regulatory compliance, and strategic financial planning.",
    sector: "Finance", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@emirates.com"
  },
  {
    id: 117, title: "UX Designer", company: "Careem",
    companyUrl: "https://careem.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 22,000 - 35,000/mo", salaryMin: 22000, salaryMax: 35000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Design super-app experiences for ride-hailing, delivery, and payments. Conduct user research, create prototypes, and optimize for diverse Middle Eastern markets.",
    sector: "Design", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@careem.com"
  },
  {
    id: 118, title: "Data Engineer", company: "Majid Al Futtaim",
    companyUrl: "https://majidalfuttaim.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 28,000 - 42,000/mo", salaryMin: 28000, salaryMax: 42000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Build data pipelines for retail and entertainment conglomerate. Develop analytics solutions for 30M+ customers across malls and hotels.",
    sector: "Data Science", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@majid.com"
  },
  {
    id: 119, title: "Sales Manager", company: "Chalhoub Group",
    companyUrl: "https://chalhoubgroup.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 25,000 - 40,000/mo", salaryMin: 25000, salaryMax: 40000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Lead luxury retail sales across the Middle East. Manage relationships with 300+ luxury brands, develop wholesale strategies, and drive revenue growth.",
    sector: "Sales", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@chalhoub.com"
  },
  {
    id: 120, title: "HR Business Partner", company: "DP World",
    companyUrl: "https://dpworld.com/careers", location: "Dubai",
    country: "ae", countryName: "UAE", lat: 25.2048, lng: 55.2708,
    salary: "AED 25,000 - 38,000/mo", salaryMin: 25000, salaryMax: 38000, salaryCurrency: "AED", salaryPeriod: "month",
    description: "Partner with operations leadership on talent strategy for global ports operator. Drive recruitment for 50,000+ employee workforce across 40 countries.",
    sector: "HR", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@dp.com"
  },

  // ========== SPAIN ==========
  {
    id: 121, title: "Marketing Manager", company: "GrowthHub Digital",
    companyUrl: "https://growthhubdigital.com/careers", location: "Madrid",
    country: "es", countryName: "Spain", lat: 40.4168, lng: -3.7038,
    salary: "€55,000 - 72,000/yr", salaryMin: 55000, salaryMax: 72000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Lead multi-channel marketing campaigns across EMEA markets. Manage a team of 8 marketing specialists and develop brand strategies.",
    sector: "Marketing", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@growthhub.com"
  },
  {
    id: 122, title: "Mobile Developer", company: "AppForge Studio",
    companyUrl: "https://appforgestudio.com/careers", location: "Barcelona",
    country: "es", countryName: "Spain", lat: 41.3874, lng: 2.1686,
    salary: "€48,000 - 65,000/yr", salaryMin: 48000, salaryMax: 65000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Build cross-platform mobile applications using React Native and Swift. Implement push notifications, offline sync, and biometric authentication.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@appforge.com"
  },
  {
    id: 123, title: "Data Scientist", company: "Telefonica",
    companyUrl: "https://telefonica.com/careers", location: "Madrid",
    country: "es", countryName: "Spain", lat: 40.4168, lng: -3.7038,
    salary: "€52,000 - 70,000/yr", salaryMin: 52000, salaryMax: 70000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Build machine learning models for telecommunications fraud detection and customer analytics. Analyze data from 350M+ global customers.",
    sector: "Data Science", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@telefonica.com"
  },
  {
    id: 124, title: "Financial Analyst", company: "Santander Bank",
    companyUrl: "https://santanderbank.com/careers", location: "Madrid",
    country: "es", countryName: "Spain", lat: 40.4168, lng: -3.7038,
    salary: "€45,000 - 62,000/yr", salaryMin: 45000, salaryMax: 62000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Conduct financial analysis for one of Europe largest banks. Prepare credit risk assessments, support corporate lending, and manage portfolio analytics.",
    sector: "Finance", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@santander.com"
  },
  {
    id: 125, title: "Product Manager", company: "Glovo",
    companyUrl: "https://glovo.com/careers", location: "Barcelona",
    country: "es", countryName: "Spain", lat: 41.3874, lng: 2.1686,
    salary: "€55,000 - 75,000/yr", salaryMin: 55000, salaryMax: 75000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Own the product roadmap for food delivery platform operating in 25+ countries. Manage cross-functional teams and drive growth initiatives.",
    sector: "Management", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@glovo.com"
  },
  {
    id: 126, title: "UX Designer", company: "Zara",
    companyUrl: "https://zara.com/careers", location: "A Coruna",
    country: "es", countryName: "Spain", lat: 43.3623, lng: -8.4115,
    salary: "€40,000 - 58,000/yr", salaryMin: 40000, salaryMax: 58000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design e-commerce and in-store digital experiences for the world largest fashion retailer. Create responsive designs for 50M+ monthly online visitors.",
    sector: "Design", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@zara.com"
  },
  {
    id: 127, title: "Software Engineer", company: "Globant",
    companyUrl: "https://globant.com/careers", location: "Madrid",
    country: "es", countryName: "Spain", lat: 40.4168, lng: -3.7038,
    salary: "€48,000 - 68,000/yr", salaryMin: 48000, salaryMax: 68000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Build digital solutions for enterprise clients across industries. Work with modern tech stacks including cloud, AI, and agile development practices.",
    sector: "Technology", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@globant.com"
  },
  {
    id: 128, title: "Sales Executive", company: "Mahou San Miguel",
    companyUrl: "https://mahousanmiguel.com/careers", location: "Madrid",
    country: "es", countryName: "Spain", lat: 40.4168, lng: -3.7038,
    salary: "€42,000 - 58,000/yr", salaryMin: 42000, salaryMax: 58000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Drive B2B sales for Spain largest beverage company. Manage key accounts, negotiate distribution agreements, and expand market presence nationally.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@mahou.com"
  },

  // ========== ITALY ==========
  {
    id: 129, title: "Fashion E-Commerce Manager", company: "YOOX NET-A-PORTER",
    companyUrl: "https://yooxnet-a-porter.com/careers", location: "Milan, Lombardy",
    country: "it", countryName: "Italy", lat: 45.4642, lng: 9.19,
    salary: "€50,000 - 70,000/yr", salaryMin: 50000, salaryMax: 70000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage the luxury e-commerce platform for the Italian market. Optimize conversion funnels and collaborate with fashion brands on exclusive launches.",
    sector: "Marketing", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@yoox.com"
  },
  {
    id: 130, title: "Software Developer", company: "Deliveroo Italy",
    companyUrl: "https://deliverooitaly.com/careers", location: "Milan, Lombardy",
    country: "it", countryName: "Italy", lat: 45.4642, lng: 9.19,
    salary: "€42,000 - 58,000/yr", salaryMin: 42000, salaryMax: 58000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Build delivery platform features serving Italian market. Work with real-time logistics systems, payment integration, and restaurant management tools.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@deliveroo.com"
  },
  {
    id: 131, title: "Financial Analyst", company: "UniCredit",
    companyUrl: "https://unicredit.com/careers", location: "Milan, Lombardy",
    country: "it", countryName: "Italy", lat: 45.4642, lng: 9.19,
    salary: "€48,000 - 68,000/yr", salaryMin: 48000, salaryMax: 68000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Conduct financial analysis for one of Europe largest banking groups. Prepare risk assessments, support investment banking, and manage portfolio analytics.",
    sector: "Finance", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@unicredit.com"
  },
  {
    id: 132, title: "UX Designer", company: "Ferrari",
    companyUrl: "https://ferrari.com/careers", location: "Maranello, Emilia-Romagna",
    country: "it", countryName: "Italy", lat: 44.5314, lng: 10.8658,
    salary: "€45,000 - 62,000/yr", salaryMin: 45000, salaryMax: 62000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design digital experiences for Ferrari online sales and brand platforms. Create premium user interfaces that reflect the luxury brand identity.",
    sector: "Design", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@ferrari.com"
  },
  {
    id: 133, title: "Data Scientist", company: "Enel",
    companyUrl: "https://enel.com/careers", location: "Rome, Lazio",
    country: "it", countryName: "Italy", lat: 41.9028, lng: 12.4964,
    salary: "€50,000 - 70,000/yr", salaryMin: 50000, salaryMax: 70000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Build predictive models for energy consumption and renewable energy optimization. Analyze data from 70M+ customers across 30 countries.",
    sector: "Data Science", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@enel.com"
  },
  {
    id: 134, title: "Mechanical Engineer", company: "Leonardo S.p.A.",
    companyUrl: "https://leonardospa.com/careers", location: "Rome, Lazio",
    country: "it", countryName: "Italy", lat: 41.9028, lng: 12.4964,
    salary: "€46,000 - 65,000/yr", salaryMin: 46000, salaryMax: 65000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design aerospace and defense systems. Use advanced CAD and simulation tools for helicopter and aircraft component development.",
    sector: "Engineering", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@leonardo.com"
  },
  {
    id: 135, title: "HR Manager", company: "Luxeottica",
    companyUrl: "https://luxeottica.com/careers", location: "Milan, Lombardy",
    country: "it", countryName: "Italy", lat: 45.4642, lng: 9.19,
    salary: "€42,000 - 58,000/yr", salaryMin: 42000, salaryMax: 58000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Lead talent management for global eyewear manufacturer. Drive recruitment, training programs, and organizational development across European operations.",
    sector: "HR", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@luxeottica.com"
  },
  {
    id: 136, title: "Sales Manager", company: "Barilla Group",
    companyUrl: "https://barillagroup.com/careers", location: "Parma, Emilia-Romagna",
    country: "it", countryName: "Italy", lat: 44.8015, lng: 10.3279,
    salary: "€40,000 - 56,000/yr", salaryMin: 40000, salaryMax: 56000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Lead commercial operations for Italy largest food company. Manage distribution networks, key accounts, and export sales across 100+ countries.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@barilla.com"
  },

  // ========== PORTUGAL ==========
  {
    id: 137, title: "Customer Success Manager", company: "Remote Portugal",
    companyUrl: "https://remoteportugal.com/careers", location: "Lisbon",
    country: "pt", countryName: "Portugal", lat: 38.7223, lng: -9.1393,
    salary: "€35,000 - 48,000/yr", salaryMin: 35000, salaryMax: 48000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage enterprise client relationships for a leading remote work platform. Drive product adoption, reduce churn, and expand accounts across EMEA.",
    sector: "Management", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@remote.com"
  },
  {
    id: 138, title: "Software Engineer", company: "OutSystems",
    companyUrl: "https://outsystems.com/careers", location: "Lisbon",
    country: "pt", countryName: "Portugal", lat: 38.7223, lng: -9.1393,
    salary: "€38,000 - 55,000/yr", salaryMin: 38000, salaryMax: 55000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Build low-code platform features used by Fortune 500 companies. Work with React, Java, and cloud-native architecture serving millions of developers.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@outsystems.com"
  },
  {
    id: 139, title: "Data Analyst", company: "Worten",
    companyUrl: "https://worten.com/careers", location: "Lisbon",
    country: "pt", countryName: "Portugal", lat: 38.7223, lng: -9.1393,
    salary: "€28,000 - 40,000/yr", salaryMin: 28000, salaryMax: 40000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Analyze retail data for Portugal largest electronics retailer. Build dashboards, develop demand forecasting models, and optimize inventory management.",
    sector: "Data Science", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@worten.com"
  },
  {
    id: 140, title: "UX Designer", company: "Farfetch",
    companyUrl: "https://farfetch.com/careers", location: "Porto",
    country: "pt", countryName: "Portugal", lat: 41.1579, lng: -8.6291,
    salary: "€32,000 - 46,000/yr", salaryMin: 32000, salaryMax: 46000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Design luxury fashion e-commerce experiences for global platform. Create responsive designs, conduct A/B testing, and optimize for mobile-first shopping.",
    sector: "Design", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@farfetch.com"
  },
  {
    id: 141, title: "Marketing Specialist", company: "Super Bock Group",
    companyUrl: "https://superbockgroup.com/careers", location: "Lisbon",
    country: "pt", countryName: "Portugal", lat: 38.7223, lng: -9.1393,
    salary: "€26,000 - 38,000/yr", salaryMin: 26000, salaryMax: 38000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Execute marketing campaigns for Portugal leading beverage brand. Manage digital marketing, event sponsorships, and brand partnerships.",
    sector: "Marketing", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@super.com"
  },
  {
    id: 142, title: "Financial Analyst", company: "Caixa Geral de Depositos",
    companyUrl: "https://caixageraldedepositos.com/careers", location: "Lisbon",
    country: "pt", countryName: "Portugal", lat: 38.7223, lng: -9.1393,
    salary: "€30,000 - 42,000/yr", salaryMin: 30000, salaryMax: 42000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Conduct financial analysis for Portugal largest bank. Prepare credit assessments, support corporate lending, and develop financial forecasting models.",
    sector: "Finance", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@caixa.com"
  },
  {
    id: 143, title: "DevOps Engineer", company: "Talkdesk",
    companyUrl: "https://talkdesk.com/careers", location: "Lisbon",
    country: "pt", countryName: "Portugal", lat: 38.7223, lng: -9.1393,
    salary: "€36,000 - 52,000/yr", salaryMin: 36000, salaryMax: 52000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage cloud infrastructure and CI/CD pipelines for cloud contact center platform. Automate deployments and ensure high availability for enterprise clients.",
    sector: "Technology", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@talkdesk.com"
  },
  {
    id: 144, title: "HR Specialist", company: "Vodafone Portugal",
    companyUrl: "https://vodafoneportugal.com/careers", location: "Lisbon",
    country: "pt", countryName: "Portugal", lat: 38.7223, lng: -9.1393,
    salary: "€25,000 - 36,000/yr", salaryMin: 25000, salaryMax: 36000, salaryCurrency: "EUR", salaryPeriod: "year",
    description: "Manage recruitment and employee development programs. Lead employer branding initiatives and support organizational change management.",
    sector: "HR", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@vodafone.com"
  },

  // ========== NIGERIA ==========
  {
    id: 145, title: "Fintech Software Developer", company: "Flutterwave",
    companyUrl: "https://flutterwave.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "NGN 12M - 20M/yr", salaryMin: 12000000, salaryMax: 20000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Build payment processing infrastructure serving 30+ African countries. Work with Java, Go, and distributed systems. Handle millions of transactions daily.",
    sector: "Finance", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@flutterwave.com"
  },
  {
    id: 146, title: "Product Manager", company: "Jumia",
    companyUrl: "https://jumia.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "NGN 10M - 16M/yr", salaryMin: 10000000, salaryMax: 16000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Own the product roadmap for Africa largest e-commerce platform. Manage cross-functional teams and drive features serving 30M+ monthly active users.",
    sector: "Management", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@jumia.com"
  },
  {
    id: 147, title: "Data Analyst", company: "Interswitch",
    companyUrl: "https://interswitch.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "NGN 8M - 14M/yr", salaryMin: 8000000, salaryMax: 14000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Analyze transaction data for Africa largest payment processing company. Build dashboards, develop fraud detection models, and optimize payment flows.",
    sector: "Data Science", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@interswitch.com"
  },
  {
    id: 148, title: "Software Engineer", company: "Andela",
    companyUrl: "https://andela.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "NGN 10M - 18M/yr", salaryMin: 10000000, salaryMax: 18000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Build talent marketplace platform connecting African developers with global companies. Work with React, Node.js, and AI-powered matching algorithms.",
    sector: "Technology", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@andela.com"
  },
  {
    id: 149, title: "Marketing Manager", company: "Dangote Group",
    companyUrl: "https://dangotegroup.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "NGN 9M - 15M/yr", salaryMin: 9000000, salaryMax: 15000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Lead marketing for Africa largest conglomerate. Manage brand campaigns across FMCG, cement, and sugar divisions. Oversee multi-million dollar budgets.",
    sector: "Marketing", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@dangote.com"
  },
  {
    id: 150, title: "Financial Analyst", company: "Access Bank",
    companyUrl: "https://accessbank.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "NGN 7M - 12M/yr", salaryMin: 7000000, salaryMax: 12000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Conduct financial analysis for Africa largest bank by customer base. Prepare credit assessments, support corporate lending decisions.",
    sector: "Finance", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@access.com"
  },
  {
    id: 151, title: "UX Designer", company: "Paystack",
    companyUrl: "https://paystack.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "NGN 8M - 13M/yr", salaryMin: 8000000, salaryMax: 13000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Design payment and merchant dashboard experiences serving 60,000+ businesses. Create intuitive interfaces for diverse African markets with varying tech literacy.",
    sector: "Design", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@paystack.com"
  },
  {
    id: 152, title: "Sales Director", company: "MTN Nigeria",
    companyUrl: "https://mtnnigeria.com/careers", location: "Lagos",
    country: "ng", countryName: "Nigeria", lat: 6.5244, lng: 3.3792,
    salary: "NGN 11M - 18M/yr", salaryMin: 11000000, salaryMax: 18000000, salaryCurrency: "NGN", salaryPeriod: "year",
    description: "Lead enterprise sales for Nigeria largest telecom. Manage key accounts, drive B2B revenue growth, and expand market share across Nigerian states.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@mtn.com"
  },

  // ========== TURKEY ==========
  {
    id: 153, title: "Game Developer", company: "Peak Games",
    companyUrl: "https://peakgames.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺ 60,000 - 95,000/mo", salaryMin: 60000, salaryMax: 95000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Develop casual mobile games with millions of daily active players. Work with Unity and C#, implement real-time multiplayer features.",
    sector: "Technology", posted: "1 day ago", type: "Full-time",
    contactEmail: "careers@peak.com"
  },
  {
    id: 154, title: "Software Engineer", company: "Trendyol",
    companyUrl: "https://trendyol.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺ 55,000 - 85,000/mo", salaryMin: 55000, salaryMax: 85000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Build e-commerce platform features for Turkey largest online shopping destination. Work with microservices, React, and distributed systems.",
    sector: "Technology", posted: "2 days ago", type: "Full-time",
    contactEmail: "careers@trendyol.com"
  },
  {
    id: 155, title: "Product Manager", company: "Getir",
    companyUrl: "https://getir.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺ 65,000 - 100,000/mo", salaryMin: 65000, salaryMax: 100000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Own the product roadmap for quick commerce delivery app. Manage cross-functional teams and drive growth across 9 countries.",
    sector: "Management", posted: "3 days ago", type: "Full-time",
    contactEmail: "careers@getir.com"
  },
  {
    id: 156, title: "Marketing Manager", company: "Turkcell",
    companyUrl: "https://turkcell.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺ 45,000 - 70,000/mo", salaryMin: 45000, salaryMax: 70000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Lead marketing campaigns for Turkey leading mobile operator. Manage digital transformation, 5G launch campaigns, and brand partnerships.",
    sector: "Marketing", posted: "4 days ago", type: "Full-time",
    contactEmail: "careers@turkcell.com"
  },
  {
    id: 157, title: "Financial Analyst", company: "Is Bankasi",
    companyUrl: "https://isbankasi.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺ 40,000 - 62,000/mo", salaryMin: 40000, salaryMax: 62000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Conduct financial analysis for one of Turkey largest private banks. Prepare risk assessments, support corporate lending, and manage portfolio analytics.",
    sector: "Finance", posted: "5 days ago", type: "Full-time",
    contactEmail: "careers@is.com"
  },
  {
    id: 158, title: "Data Scientist", company: "Garanti BBVA",
    companyUrl: "https://garantibbva.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺ 50,000 - 78,000/mo", salaryMin: 50000, salaryMax: 78000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Build machine learning models for credit scoring and customer analytics. Analyze data from 20M+ customers to optimize banking products and services.",
    sector: "Data Science", posted: "1 week ago", type: "Full-time",
    contactEmail: "careers@garanti.com"
  },
  {
    id: 159, title: "UX Designer", company: "Yemeksepeti",
    companyUrl: "https://yemeksepeti.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺ 38,000 - 58,000/mo", salaryMin: 38000, salaryMax: 58000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Design food delivery app experiences for 30M+ users. Conduct user research, create prototypes, and optimize ordering flows for Turkish market.",
    sector: "Design", posted: "1 week ago", type: "Remote",
    contactEmail: "careers@yemeksepeti.com"
  },
  {
    id: 160, title: "Sales Executive", company: "Eczacibasi Group",
    companyUrl: "https://eczacibasigroup.com/careers", location: "Istanbul",
    country: "tr", countryName: "Turkey", lat: 41.0082, lng: 28.9784,
    salary: "₺ 42,000 - 65,000/mo", salaryMin: 42000, salaryMax: 65000, salaryCurrency: "TRY", salaryPeriod: "month",
    description: "Drive B2B sales for building materials and consumer products conglomerate. Manage key accounts and develop strategic partnerships across Turkey.",
    sector: "Sales", posted: "2 weeks ago", type: "Hybrid",
    contactEmail: "careers@eczacibasi.com"
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
