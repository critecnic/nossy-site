import { NextResponse } from "next/server";

export interface Job {
  id: number;
  title: string;
  company: string;
  companyUrl: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  salary: string;
  description: string;
  sector: string;
  posted: string;
  type: string;
}

const jobs: Job[] = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechVision Corp",
    companyUrl: "https://techvision.example.com/careers",
    location: "San Francisco, CA",
    country: "USA",
    lat: 37.7749,
    lng: -122.4194,
    salary: "$145,000 - $185,000/yr",
    description: "Build scalable distributed systems powering next-gen cloud infrastructure. Work with microservices architecture, Kubernetes, and real-time data pipelines. Join a team of 50+ engineers shipping to millions of users daily.",
    sector: "Technology",
    posted: "2 days ago",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Product Designer",
    company: "InnovateUI Labs",
    companyUrl: "https://innovateui.example.com/jobs",
    location: "New York, NY",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    salary: "$110,000 - $140,000/yr",
    description: "Design intuitive user experiences for enterprise SaaS products. Conduct user research, create wireframes and prototypes, and collaborate closely with engineering teams to deliver pixel-perfect interfaces.",
    sector: "Design",
    posted: "5 days ago",
    type: "Full-time",
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "DataPulse Analytics",
    companyUrl: "https://datapulse.example.com/careers",
    location: "São Paulo, SP",
    country: "Brasil",
    lat: -23.5505,
    lng: -46.6333,
    salary: "R$ 18,000 - R$ 25,000/mo",
    description: "Analyze large datasets to extract actionable business insights. Build predictive models using Python, TensorFlow and Spark. Present findings to C-level stakeholders and drive data-informed decisions across departments.",
    sector: "Data Science",
    posted: "1 day ago",
    type: "Full-time",
  },
  {
    id: 4,
    title: "Marketing Manager",
    company: "GrowthHub Digital",
    companyUrl: "https://growthhub.example.com/jobs",
    location: "Madrid, España",
    country: "España",
    lat: 40.4168,
    lng: -3.7038,
    salary: "€55,000 - €72,000/yr",
    description: "Lead multi-channel marketing campaigns across EMEA markets. Manage a team of 8 marketing specialists, oversee €2M annual budget, and develop brand strategies that increased market share by 15% year-over-year.",
    sector: "Marketing",
    posted: "3 days ago",
    type: "Full-time",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "CloudNine Systems",
    companyUrl: "https://cloudnine.example.com/careers",
    location: "Paris, France",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    salary: "€60,000 - €80,000/yr",
    description: "Manage CI/CD pipelines and cloud infrastructure on AWS and GCP. Automate deployment processes, monitor system health, and ensure 99.99% uptime for critical production services serving 10M+ requests daily.",
    sector: "Technology",
    posted: "1 week ago",
    type: "Full-time",
  },
  {
    id: 6,
    title: "Financial Analyst",
    company: "CapitalEdge Partners",
    companyUrl: "https://capitaledge.example.com/jobs",
    location: "London, UK",
    country: "United Kingdom",
    lat: 51.5074,
    lng: -0.1278,
    salary: "£65,000 - £85,000/yr",
    description: "Conduct financial modeling, valuation analysis, and market research for M&A transactions. Prepare investment presentations for institutional clients and support deal teams through the full transaction lifecycle.",
    sector: "Finance",
    posted: "4 days ago",
    type: "Full-time",
  },
  {
    id: 7,
    title: "UX Researcher",
    company: "HumanFirst Design",
    companyUrl: "https://humanfirst.example.com/careers",
    location: "Berlin, Germany",
    country: "Germany",
    lat: 52.52,
    lng: 13.405,
    salary: "€52,000 - €68,000/yr",
    description: "Plan and execute qualitative and quantitative user research studies. Synthesize findings into actionable recommendations, create personas and journey maps, and champion user-centric design across product teams.",
    sector: "Design",
    posted: "6 days ago",
    type: "Full-time",
  },
  {
    id: 8,
    title: "Backend Developer",
    company: "NexaSoft Technologies",
    companyUrl: "https://nexasoft.example.com/jobs",
    location: "Rio de Janeiro, RJ",
    country: "Brasil",
    lat: -22.9068,
    lng: -43.1729,
    salary: "R$ 14,000 - R$ 20,000/mo",
    description: "Develop robust RESTful APIs and microservices using Node.js and PostgreSQL. Implement authentication systems, optimize database queries, and mentor junior developers on best practices and coding standards.",
    sector: "Technology",
    posted: "2 days ago",
    type: "Full-time",
  },
  {
    id: 9,
    title: "Project Manager",
    company: "BuildRight Consulting",
    companyUrl: "https://buildright.example.com/careers",
    location: "Toronto, Canada",
    country: "Canada",
    lat: 43.6532,
    lng: -79.3832,
    salary: "C$85,000 - C$110,000/yr",
    description: "Oversee large-scale IT implementation projects from initiation to delivery. Manage cross-functional teams of 20+ members, coordinate with vendors, and ensure projects are delivered on time and within budget using Agile methodologies.",
    sector: "Management",
    posted: "3 days ago",
    type: "Full-time",
  },
  {
    id: 10,
    title: "Mobile Developer (iOS/Android)",
    company: "AppForge Studio",
    companyUrl: "https://appforge.example.com/jobs",
    location: "Barcelona, España",
    country: "España",
    lat: 41.3874,
    lng: 2.1686,
    salary: "€48,000 - €65,000/yr",
    description: "Build cross-platform mobile applications using React Native and Swift. Implement push notifications, offline sync, and biometric authentication. Published 5+ apps with combined 2M+ downloads on App Store and Google Play.",
    sector: "Technology",
    posted: "1 day ago",
    type: "Full-time",
  },
  {
    id: 11,
    title: "Sales Executive",
    company: "MarketPro Global",
    companyUrl: "https://marketpro.example.com/careers",
    location: "Miami, FL",
    country: "USA",
    lat: 25.7617,
    lng: -80.1918,
    salary: "$75,000 - $120,000/yr",
    description: "Drive B2B enterprise sales across Latin American markets. Manage a pipeline of $5M+, negotiate contracts with C-suite executives, and exceed quarterly revenue targets consistently while expanding the client portfolio.",
    sector: "Sales",
    posted: "5 days ago",
    type: "Full-time",
  },
  {
    id: 12,
    title: "AI/ML Engineer",
    company: "DeepCore AI",
    companyUrl: "https://deepcore.example.com/jobs",
    location: "Lyon, France",
    country: "France",
    lat: 45.764,
    lng: 4.8357,
    salary: "€55,000 - €75,000/yr",
    description: "Design and deploy machine learning models for natural language processing and computer vision applications. Optimize model inference for edge devices and collaborate with research teams on cutting-edge AI publications.",
    sector: "Technology",
    posted: "2 days ago",
    type: "Full-time",
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector")?.toLowerCase() || "";
  const location = searchParams.get("location")?.toLowerCase() || "";

  let filtered = [...jobs];

  if (sector) {
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(sector) ||
        j.sector.toLowerCase().includes(sector)
    );
  }
  if (location) {
    filtered = filtered.filter(
      (j) =>
        j.location.toLowerCase().includes(location) ||
        j.country.toLowerCase().includes(location)
    );
  }

  return NextResponse.json(filtered);
}