"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TOTAL_JOBS } from "@/lib/countries";
import { LANGUAGES, LANG_SLUGS, i18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { getRegionName } from "@/lib/shared";
import SiteLogo from "@/components/SiteLogo";
import NossyBrand from "@/components/NossyBrand";
import LangSelector from "@/components/LangSelector";

export default function HowToFindTechJobsInEurope({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const [langCode, setLangCode] = useState("");
  const lang = (LANGUAGES.find(l => l.code === langCode)?.code || "en") as Lang;

  useEffect(() => { params.then(p => setLangCode(p.lang)); }, [params]);

  const T = i18n[lang] || i18n["en"];
  const isRtl = LANGUAGES.find(l => l.code === lang)?.dir === "rtl";
  const homeHref = "/" + lang + "/" + LANG_SLUGS[lang];

  return (
    <div dir={isRtl ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href={homeHref} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <SiteLogo size={38} />
            <NossyBrand variant="dark" size={28} className="h-7 w-auto" />
          </Link>
          <LangSelector lang={lang} switchLang={(l) => { const path = window.location.pathname; const rest = path.replace(/^\/[a-z]+\/[a-z-]+/, ""); window.location.href = "/" + l + "/" + LANG_SLUGS[l] + rest; }} />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link href={homeHref} className="hover:text-sky-600 transition-colors">{T.backToHome}</Link>
          <span>/</span>
          <span className="text-gray-400">Guides</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">How to Find Tech Jobs in Europe</span>
        </nav>

        <article>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">How to Find Tech Jobs in Europe: The Complete 2025 Guide</h1>
          <p className="text-gray-500 text-sm mb-10">Published January 2025 · 12 min read</p>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg text-gray-600">
              Europe has rapidly become one of the most attractive destinations for technology professionals worldwide. With thriving startup ecosystems in Berlin, Amsterdam, and Lisbon, established tech giants in Dublin and London, and a growing demand for software engineers, data scientists, and cybersecurity experts across the continent, 2025 presents an exceptional window of opportunity for tech job seekers. This comprehensive guide covers everything you need to know about finding, applying for, and landing tech jobs in Europe.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why Europe Is a Top Destination for Tech Professionals</h2>
            <p>
              The European tech scene has experienced remarkable growth over the past decade. According to recent industry reports, European tech companies raised over $40 billion in venture capital funding, and the continent now hosts more than 150 technology companies valued at over $1 billion. Countries like Germany, France, the Netherlands, and Sweden have become global innovation hubs, while smaller nations like Estonia, Portugal, and Ireland punch well above their weight in per-capita tech investment.
            </p>
            <p>
              Beyond the professional opportunities, Europe offers an outstanding quality of life: universal healthcare, robust labor protections, generous paid leave (typically 25 to 30 days annually), strong work-life balance norms, and the ability to travel freely across 27 Schengen Area countries. For tech workers from outside the EU, many countries have introduced dedicated visa programs designed specifically to attract skilled technology talent.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Top European Countries for Tech Jobs in 2025</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Germany</h3>
            <p>
              Germany is Europe's largest economy and its biggest tech employment market. Berlin has earned a reputation as the startup capital of Europe, home to companies like N26, Zalando, Delivery Hero, and Celonis. Munich and Hamburg are strongholds for enterprise technology, automotive software, and industrial IoT. The country faces a critical shortage of IT professionals, with an estimated 137,000 unfilled tech positions. Germany introduced the Chancenkarte (Opportunity Card) in 2024, a points-based immigration system that makes it easier for qualified tech workers to enter the country. Average software engineer salaries range from €55,000 to €85,000, with senior roles in Munich commanding €90,000 or more.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Netherlands</h3>
            <p>
              The Netherlands consistently ranks among the world's best countries for work-life balance and tech career growth. Amsterdam is a major European tech hub, hosting offices for Netflix, Uber, Booking.com, Tesla, and Adyen. The Dutch tech sector is particularly strong in fintech, e-commerce, and AI research. The Netherlands offers a 30% tax ruling for qualifying expatriates, which significantly reduces your tax burden for the first five years. Software engineer salaries typically range from €50,000 to €80,000, with Amsterdam-based roles at major tech companies often exceeding €90,000 for mid-level positions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Ireland</h3>
            <p>
              Ireland, and Dublin in particular, serves as the European headquarters for many of the world's largest technology companies, including Google, Meta, Apple, Microsoft, and Amazon. This concentration of multinational tech firms creates an enormous demand for software engineers, product managers, data analysts, and cloud architects. Ireland's Critical Skills Employment Permit allows qualified tech professionals to obtain a work visa in as little as six to eight weeks. Salaries for software engineers range from €45,000 to €85,000, and the country's low corporate tax rate (12.5%) has fostered a remarkably vibrant tech ecosystem.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">France</h3>
            <p>
              France has built one of Europe's most dynamic tech ecosystems, with Paris leading the charge. French Tech, a government-backed initiative, has propelled the growth of companies like BlaBlaCar, Datadog, Criteo, and Mirakl. Station F in Paris is the world's largest startup campus. The French tech passport visa program streamlines the immigration process for skilled workers, and salaries for software engineers typically range from €40,000 to €75,000. France also offers a flat 30% income tax rate for qualifying tech employees, making it financially attractive despite the country's generally high tax rates.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Portugal</h3>
            <p>
              Portugal has emerged as one of Europe's most appealing destinations for remote tech workers and digital nomads. Lisbon and Porto have become hotspots for startups, SaaS companies, and Web3 projects. The country offers an affordable cost of living compared to Western European peers, a warm climate, and a welcoming international community. Portugal's Tech Visa program provides a fast-track residence permit for tech professionals. Average software engineer salaries range from €30,000 to €60,000, though salaries at international companies and remote positions for foreign employers can be considerably higher.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Sweden and the Nordic Countries</h3>
            <p>
              Sweden, Denmark, Finland, and Norway consistently rank at the top of global innovation and quality-of-life indices. Stockholm has produced more billion-dollar tech companies per capita than any city outside Silicon Valley, including Spotify, Klarna, King, and iZettle. The Nordic countries offer some of the highest tech salaries in Europe, with senior engineers in Sweden earning €65,000 to €100,000, and the emphasis on flat organizational structures, parental leave, and work-life balance is unmatched. These countries also have highly efficient immigration processes for skilled workers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Visa and Work Permit Options for Tech Workers</h2>
            <p>
              Navigating European immigration can seem daunting, but the continent has made significant progress in simplifying visa processes for tech talent. Here are the main pathways available in 2025:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>EU Blue Card:</strong> Available in 25 EU member states, the Blue Card is designed for highly qualified professionals. You need a recognized university degree and a job offer with a minimum salary threshold (varies by country, typically around €50,000–€60,000 annually). It leads to permanent residency after 33 months of continuous employment and allows family reunification.</li>
              <li><strong>Germany's Chancenkarte (Opportunity Card):</strong> A points-based system introduced in 2024 that allows qualified professionals to enter Germany to search for work for up to one year. Points are awarded for qualifications, language skills, professional experience, age, and connection to Germany.</li>
              <li><strong>Netherlands 30% Ruling + Highly Skilled Migrant Visa:</strong> Employers can sponsor foreign tech workers through an accelerated visa process. Combined with the 30% tax ruling, this makes the Netherlands one of the most financially attractive options for expat tech workers.</li>
              <li><strong>Ireland's Critical Skills Employment Permit:</strong> Covers roles in software development, data science, cybersecurity, and other in-demand tech fields. Processing times are typically six to eight weeks, and it leads to permanent residency after two years.</li>
              <li><strong>Portugal Tech Visa:</strong> A fast-track residence permit specifically for tech professionals. The process can be completed in as little as 30 to 60 days and is available to both employees and freelancers working in technology.</li>
              <li><strong>France's French Tech Visa:</strong> A simplified, fast-track procedure for tech talent. It functions as a residence permit valid for up to four years and is available to both employees and their immediate family members.</li>
              <li><strong>Digital Nomad Visas:</strong> Countries like Portugal, Spain, Greece, Croatia, and Estonia offer dedicated digital nomad visas that allow remote tech workers to live in Europe while working for foreign employers. These typically require proof of income above a minimum threshold.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Best Job Boards and Platforms for European Tech Jobs</h2>
            <p>
              Finding the right tech job in Europe requires casting a wide net across multiple platforms. Here are the most effective channels:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>NOSSY (nossy.pro):</strong> A dedicated tech jobs aggregator that surfaces opportunities from across 58 countries. With its powerful filtering by region, country, category, and work type, NOSSY is an excellent starting point for discovering tech roles throughout Europe and beyond.</li>
              <li><strong>LinkedIn:</strong> Remains the dominant professional network in Europe. Many European companies post exclusively on LinkedIn, and the platform's Easy Apply feature makes submitting applications quick and straightforward. Optimize your profile with European-standard formatting and keywords relevant to your target roles.</li>
              <li><strong>Wellfound (formerly AngelList):</strong> The premier platform for startup jobs. European startups from Berlin to Lisbon post thousands of roles here, many offering equity compensation alongside salary.</li>
              <li><strong>Indeed and Glassdoor:</strong> Both platforms have strong European coverage. Glassdoor is particularly valuable for researching company culture, interview processes, and salary benchmarks for specific countries.</li>
              <li><strong>Country-specific boards:</strong> Each European country has its own popular job platforms. In Germany, StepStone and Xing are essential. In France, refer to Welcome to the Jungle and Apec. In the Netherlands, check Hays and IamExpat Jobs. In Ireland, IrishJobs.ie is the leading platform.</li>
              <li><strong>EuroBrussels:</strong> For those interested in working for EU institutions and international organizations based in Brussels, this specialized platform lists hundreds of tech and digital policy roles.</li>
              <li><strong>Otta:</strong> A curated job search platform focused on fast-growing tech companies, with excellent coverage of European startups and scale-ups.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Tips for Standing Out in the European Tech Job Market</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Tailor Your CV to European Standards</h3>
            <p>
              European CVs differ significantly from American resumes. In most European countries, it is standard to include a professional photo, your date of birth, nationality, and marital status. CVs are typically two to three pages long and include detailed descriptions of your education, work experience, and technical skills. In Germany, the "Lebenslauf" format is highly structured, while in the UK and Ireland, the one-page CV remains common. Always research the specific conventions of your target country and consider creating country-specific versions of your CV.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Learn the Local Language (Even Just the Basics)</h3>
            <p>
              While English is widely spoken in European tech companies, especially in startups and multinational firms, learning the local language dramatically improves your chances of landing a job and integrating into the workplace. In countries like Germany, France, and Spain, many companies require at least B1-level proficiency in the local language, even for technical roles. Even in more English-friendly markets like the Netherlands and Scandinavia, demonstrating effort to learn the language signals commitment and cultural respect.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Build a Strong GitHub and Online Presence</h3>
            <p>
              European tech recruiters increasingly rely on GitHub profiles, personal websites, and technical blogs to evaluate candidates. Maintain an active GitHub with well-documented projects, contribute to open-source software, and consider writing technical articles on platforms like Medium or Dev.to. A strong online presence can compensate for a lack of local experience and demonstrate your technical competence to hiring managers across borders.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Network Actively in European Tech Communities</h3>
            <p>
              Attending tech meetups, conferences, and hackathons is one of the most effective ways to find job opportunities in Europe. Major European tech conferences like Web Summit in Lisbon, Slush in Helsinki, TechCrunch Disrupt in Berlin, and The Next Web in Amsterdam attract thousands of attendees and often feature on-site recruiting. Join online communities like European tech Slack groups, Discord servers, and Facebook groups where job opportunities are shared daily.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Understand the Interview Process</h3>
            <p>
              European tech interviews vary by country but generally follow a structured format. Most companies conduct two to four rounds, including an initial HR screen, a technical assessment (coding challenge, system design, or take-home project), and a culture-fit interview. In Germany and the Netherlands, interviews tend to be formal and thorough. In France, cultural fit and team dynamics are heavily emphasized. In Nordic countries, the process is typically more egalitarian and conversational. Prepare for both technical excellence and the ability to articulate your soft skills and cultural adaptability.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Consider Relocation Packages and Benefits</h3>
            <p>
              Many European tech companies offer comprehensive relocation packages for international hires. These may include visa sponsorship, flight reimbursement, temporary housing, language courses, and assistance with finding permanent accommodation. When evaluating job offers, consider the full benefits package, including pension contributions, health insurance, meal vouchers (common in France and Belgium), transportation subsidies, and stock option programs. In some countries, the total value of benefits can add 20 to 40% on top of your base salary.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">In-Demand Tech Roles in Europe for 2025</h2>
            <p>
              The European tech job market is particularly hungry for professionals in several key areas. Software engineers with expertise in cloud-native development (AWS, Azure, GCP), full-stack development (React, Node.js, Python), and DevOps practices are in constant demand across all major markets. Data scientists and machine learning engineers are sought after in finance, healthcare, and automotive sectors. Cybersecurity professionals are urgently needed as European companies comply with stricter data protection regulations under GDPR and the upcoming NIS2 Directive. Product managers with technical backgrounds and UX/UI designers with experience in design systems are also highly valued.
            </p>
            <p>
              Emerging specializations gaining traction in 2025 include AI engineers, blockchain developers, quantum computing researchers, and sustainability-focused tech roles. The European Union's Green Deal and digital transformation initiatives have created significant demand for professionals who can bridge technology and sustainability.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Conclusion</h2>
            <p>
              Finding a tech job in Europe in 2025 is more accessible than ever, thanks to streamlined visa programs, thriving tech ecosystems, and a continent-wide shortage of skilled technology professionals. By understanding the local job markets, preparing your application materials to European standards, leveraging the right platforms, and building a strong professional network, you can position yourself for a successful and rewarding tech career in one of the world's most desirable regions to live and work. Start your search on NOSSY today and take the first step toward your European tech career.
            </p>
          </div>

          <div className="mt-12 p-6 bg-sky-50 border border-sky-200 rounded-xl">
            <p className="text-sky-800 font-semibold mb-2">Ready to explore tech jobs in Europe?</p>
            <p className="text-sky-700 text-sm mb-4">Browse thousands of verified tech positions across 58 countries on NOSSY.</p>
            <Link href={homeHref} className="inline-flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors">
              {T.backToHome}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </article>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-5">
            <Link href={homeHref} className="flex items-center gap-4">
              <SiteLogo size={48} />
              <div>
                <NossyBrand variant="white" size={36} className="h-9 w-auto" />
                <p className="text-sky-400 text-sm font-medium italic">Seek and you shall find.</p>
              </div>
            </Link>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>{TOTAL_JOBS.toLocaleString()}+ {T.vacancies}</span>
              <span className="text-gray-600">|</span>
              <span>58 {T.countries}</span>
              <span className="text-gray-600">|</span>
              <span>{T.footerText}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
