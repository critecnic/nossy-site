"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { countries, getCountryName } from "@/lib/locations";

type Lang = "en" | "pt" | "es" | "fr" | "de" | "it" | "ja" | "zh" | "ar" | "ru";

interface Job {
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

function FlagUSA({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 30" fill="none">
      <rect width="60" height="30" rx="2" fill="#B22234" />
      {[0,1,2,3,4,5].map((i) => (<line key={i} x1="0" y1={i*5+2.5} x2="60" y2={i*5+2.5} stroke="#fff" strokeWidth="2" />))}
      <rect width="25.7" height="16.2" fill="#3C3B6E" />
      {[0,1,2,3,4].map((row) => [0,1,2,3,4,5].map((col) => (
        <circle key={`${row}-${col}`} cx={col*4.28+(row%2===1?2.14:0)+1.29} cy={row*3.24+1.89} r="0.75" fill="#fff" />
      )))}
    </svg>
  );
}
function FlagBrazil({ className = "w-5 h-5" }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="30" rx="2" fill="#009B3A" /><polygon points="30,4 56,15 30,26 4,15" fill="#FEDF00" /><circle cx="30" cy="15" r="6" fill="#002776" /><path d="M24 15 Q30 18 36 15" stroke="#fff" strokeWidth="1.5" fill="none" /></svg>);
}
function FlagSpain({ className = "w-5 h-5" }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="30" rx="2" fill="#AA151B" /><rect y="8" width="60" height="14" fill="#F1BF00" /></svg>);
}
function FlagFrance({ className = "w-5 h-5" }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="30" rx="2" fill="#002395" /><rect x="20" width="20" height="30" fill="#fff" /><rect x="40" width="20" height="30" fill="#ED2939" /></svg>);
}
function FlagGermany({ className = "w-5 h-5" }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="10" rx="2" fill="#000" /><rect y="10" width="60" height="10" fill="#DD0000" /><rect y="20" width="60" height="10" rx="2" fill="#FFCC00" /></svg>);
}
function FlagItaly({ className = "w-5 h-5" }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="30" rx="2" fill="#009246" /><rect x="20" width="20" height="30" fill="#fff" /><rect x="40" width="20" height="30" fill="#CE2B37" /></svg>);
}
function FlagJapan({ className = "w-5 h-5" }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="30" rx="2" fill="#fff" /><circle cx="30" cy="15" r="9" fill="#BC002D" /></svg>);
}
function FlagChina({ className = "w-5 h-5" }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="30" rx="2" fill="#DE2910" /><circle cx="15" cy="8" r="4" fill="#FFDE00" /></svg>);
}
function FlagRussia({ className = "w-5 h-5" }: { className?: string }) {
  return (<svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="10" rx="2" fill="#fff" /><rect y="10" width="60" height="10" fill="#0039A6" /><rect y="20" width="60" height="10" rx="2" fill="#D52B1E" /></svg>);
}

const langFlags: Record<Lang, React.FC<{ className?: string }>> = {
  en: FlagUSA, pt: FlagBrazil, es: FlagSpain, fr: FlagFrance, de: FlagGermany,
  it: FlagItaly, ja: FlagJapan, zh: FlagChina, ru: FlagRussia,
  ar: ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 60 30" fill="none"><rect width="60" height="30" rx="2" fill="#006C35" /><rect width="10" height="30" fill="#fff" /><polygon points="10,0 20,15 10,30" fill="#000" /><rect width="8" height="30" fill="#CE1126" /></svg>
  ),
};

function WWLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <linearGradient id="lg1" x1="20" y1="30" x2="45" y2="95"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="#38bdf8" /></linearGradient>
        <linearGradient id="lg2" x1="55" y1="30" x2="100" y2="95"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#fff" /></linearGradient>
        <linearGradient id="lbg" x1="0" y1="0" x2="120" y2="120"><stop offset="0%" stopColor="#1e293b" /><stop offset="100%" stopColor="#0f172a" /></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect width="120" height="120" rx="22" fill="url(#lbg)" />
      <rect x="1" y="1" width="118" height="118" rx="21" stroke="rgba(14,165,233,0.3)" strokeWidth="1" fill="none" />
      <text x="18" y="82" fontFamily="Arial Black, sans-serif" fontSize="52" fontWeight="900" fill="url(#lg1)" filter="url(#glow)">W</text>
      <text x="55" y="82" fontFamily="Arial Black, sans-serif" fontSize="52" fontWeight="900" fill="url(#lg2)" filter="url(#glow)">W</text>
      <circle cx="105" cy="20" r="5" fill="#0ea5e9"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" /></circle>
      <text x="14" y="108" fontFamily="Arial, sans-serif" fontSize="9" fontWeight="600" fill="rgba(56,189,248,0.6)" letterSpacing="3">WORLD OF WORK</text>
    </svg>
  );
}

const i18n: Record<Lang, Record<string, string>> = {
  en: { heroTitle:"Find Your Dream Job Worldwide", heroSub:"Connect with top companies across the globe. Your next career move starts here.", search:"Search jobs, companies, keywords...", allCountries:"All Countries", allStates:"All States", allCities:"All Cities", selectCountry:"Select a country...", selectState:"Select a state...", sectors:"Work Sectors", allSectors:"All Sectors", results:"results found", posted:"Posted", type:"Type", unlock:"Unlock Company Details", newsletter:"Stay Updated", newsletterSub:"Subscribe to receive the latest job opportunities in your area of interest.", name:"Full Name", email:"Email Address", subscribe:"Subscribe Now", subscribed:"You are subscribed! Check your inbox.", statsJobs:"Jobs Available", statsCompanies:"Companies Hiring", statsCountries:"Countries Covered", statsUsers:"Active Users", footer:"\u00a9 2026 W-W (World of Work). All rights reserved.", exploreMap:"Explore Opportunities Worldwide", recentJobs:"Latest Opportunities", filterByLocation:"Filter by Location", clearFilters:"Clear Filters" },
  pt: { heroTitle:"Encontre Seu Emprego dos Sonhos no Mundo Todo", heroSub:"Conecte-se com as melhores empresas do globo. Sua pr\u00f3xima carreira come\u00e7a aqui.", search:"Buscar vagas, empresas, palavras-chave...", allCountries:"Todos os Pa\u00edses", allStates:"Todos os Estados", allCities:"Todas as Cidades", selectCountry:"Selecione um pa\u00eds...", selectState:"Selecione um estado...", sectors:"Setores de Trabalho", allSectors:"Todos os Setores", results:"resultados encontrados", posted:"Publicada", type:"Tipo", unlock:"Desbloquear Detalhes da Empresa", newsletter:"Fique Atualizado", newsletterSub:"Inscreva-se para receber as \u00faltimas oportunidades de emprego na sua \u00e1rea.", name:"Nome Completo", email:"Endere\u00e7o de Email", subscribe:"Inscrever-se Agora", subscribed:"Voc\u00ea est\u00e1 inscrito! Verifique seu email.", statsJobs:"Vagas Dispon\u00edveis", statsCompanies:"Empresas Contratando", statsCountries:"Pa\u00edses Cobertos", statsUsers:"Usu\u00e1rios Ativos", footer:"\u00a9 2026 W-W (World of Work). Todos os direitos reservados.", exploreMap:"Explore Oportunidades no Mundo Todo", recentJobs:"\u00daltimas Oportunidades", filterByLocation:"Filtrar por Localiza\u00e7\u00e3o", clearFilters:"Limpar Filtros" },
  es: { heroTitle:"Encuentra tu Empleo en todo el Mundo", heroSub:"Con\u00e9ctate con las mejores empresas del mundo. Tu pr\u00f3ximo paso comienza aqu\u00ed.", search:"Buscar empleos, empresas, palabras clave...", allCountries:"Todos los Pa\u00edses", allStates:"Todos los Estados", allCities:"Todas las Ciudades", selectCountry:"Selecciona un pa\u00eds...", selectState:"Selecciona un estado...", sectors:"Sectores Laborales", allSectors:"Todos los Sectores", results:"resultados encontrados", posted:"Publicada", type:"Tipo", unlock:"Desbloquear Datos de la Empresa", newsletter:"Mant\u00e9ngase Actualizado", newsletterSub:"Suscr\u00edbete para recibir las \u00faltimas oportunidades laborales.", name:"Nombre Completo", email:"Correo Electr\u00f3nico", subscribe:"Suscribirse Ahora", subscribed:"\u00a1Est\u00e1s suscrito! Revisa tu bandeja.", statsJobs:"Empleos Disponibles", statsCompanies:"Empresas Contratando", statsCountries:"Pa\u00edses Cubiertos", statsUsers:"Usuarios Activos", footer:"\u00a9 2026 W-W (World of Work). Todos los derechos reservados.", exploreMap:"Explora Oportunidades en todo el Mundo", recentJobs:"\u00daltimas Oportunidades", filterByLocation:"Filtrar por Ubicaci\u00f3n", clearFilters:"Limpiar Filtros" },
  fr: { heroTitle:"Trouvez Votre Emploi dans le Monde Entier", heroSub:"Connectez-vous avec les meilleures entreprises mondiales.", search:"Rechercher des emplois, entreprises, mots-cl\u00e9s...", allCountries:"Tous les Pays", allStates:"Toutes les R\u00e9gions", allCities:"Toutes les Villes", selectCountry:"S\u00e9lectionnez un pays...", selectState:"S\u00e9lectionnez une r\u00e9gion...", sectors:"Secteurs d\u2019Activit\u00e9", allSectors:"Tous les Secteurs", results:"r\u00e9sultats trouv\u00e9s", posted:"Publi\u00e9e", type:"Type", unlock:"D\u00e9bloquer les D\u00e9tails", newsletter:"Restez Inform\u00e9", newsletterSub:"Abonnez-vous pour recevoir les derni\u00e8res opportunit\u00e9s.", name:"Nom Complet", email:"Adresse E-mail", subscribe:"S\u2019abonner Maintenant", subscribed:"Vous \u00eates inscrit!", statsJobs:"Emplois Disponibles", statsCompanies:"Entreprises Recrutant", statsCountries:"Pays Couverts", statsUsers:"Utilisateurs Actifs", footer:"\u00a9 2026 W-W (World of Work). Tous droits r\u00e9serv\u00e9s.", exploreMap:"Explorez les Opportunit\u00e9s Mondiales", recentJobs:"Derni\u00e8res Opportunit\u00e9s", filterByLocation:"Filtrer par Emplacement", clearFilters:"R\u00e9initialiser" },
  de: { heroTitle:"Finden Sie Ihren Traumjob Weltweit", heroSub:"Verbinden Sie sich mit Top-Unternehmen weltweit.", search:"Jobs, Unternehmen, Schl\u00fcsselw\u00f6rter suchen...", allCountries:"Alle L\u00e4nder", allStates:"Alle Bundesl\u00e4nder", allCities:"Alle St\u00e4dte", selectCountry:"Land ausw\u00e4hlen...", selectState:"Bundesland ausw\u00e4hlen...", sectors:"Arbeitsbereiche", allSectors:"Alle Bereiche", results:"Ergebnisse gefunden", posted:"Ver\u00f6ffentlicht", type:"Typ", unlock:"Details Freischalten", newsletter:"Bleiben Sie Informiert", newsletterSub:"Abonnieren Sie die neuesten Jobm\u00f6glichkeiten.", name:"Vollst\u00e4ndiger Name", email:"E-Mail-Adresse", subscribe:"Jetzt Abonnieren", subscribed:"Sie sind abonniert!", statsJobs:"Verf\u00fcgbare Jobs", statsCompanies:"Unternehmen", statsCountries:"L\u00e4nder", statsUsers:"Nutzer", footer:"\u00a9 2026 W-W (World of Work). Alle Rechte vorbehalten.", exploreMap:"Erkunden Sie Weltweite M\u00f6glichkeiten", recentJobs:"Neueste M\u00f6glichkeiten", filterByLocation:"Nach Standort Filtern", clearFilters:"Filter L\u00f6schen" },
  it: { heroTitle:"Trova il Tuo Lavoro dei Sogni nel Mondo", heroSub:"Connettiti con le migliori aziende a livello globale.", search:"Cerca lavoro, aziende, parole chiave...", allCountries:"Tutti i Paesi", allStates:"Tutte le Regioni", allCities:"Tutte le Citt\u00e0", selectCountry:"Seleziona un paese...", selectState:"Seleziona una regione...", sectors:"Settori Lavorativi", allSectors:"Tutti i Settori", results:"risultati trovati", posted:"Pubblicato", type:"Tipo", unlock:"Sblocca Dettagli Azienda", newsletter:"Resta Aggiornato", newsletterSub:"Iscriviti per ricevere le ultime opportunit\u00e0.", name:"Nome Completo", email:"Indirizzo Email", subscribe:"Iscriviti Ora", subscribed:"Sei iscritto!", statsJobs:"Lavori Disponibili", statsCompanies:"Aziende", statsCountries:"Paesi Coperti", statsUsers:"Utenti Attivi", footer:"\u00a9 2026 W-W (World of Work). Tutti i diritti riservati.", exploreMap:"Esplora Opportunit\u00e0 Mondiali", recentJobs:"Ultime Opportunit\u00e0", filterByLocation:"Filtra per Localit\u00e0", clearFilters:"Cancella Filtri" },
  ja: { heroTitle:"\u4e16\u754c\u4e2d\u306e\u5922\u306e\u4ed5\u4e8b\u3092\u898b\u3064\u3051\u3088\u3046", heroSub:"\u4e16\u754c\u306e\u30c8\u30c3\u30d7\u4f01\u696d\u3068\u3064\u306a\u304c\u308a\u307e\u3057\u3087\u3046\u3002", search:"\u6c42\u4eba\u3001\u4f01\u696d\u3001\u30ad\u30fc\u30ef\u30fc\u30c9\u3092\u691c\u7d22...", allCountries:"\u3059\u3079\u3066\u306e\u56fd", allStates:"\u3059\u3079\u3066\u306e\u5730\u57df", allCities:"\u3059\u3079\u3066\u306e\u90fd\u5e02", selectCountry:"\u56fd\u3092\u9078\u629e...", selectState:"\u5730\u57df\u3092\u9078\u629e...", sectors:"\u8077\u7a2e", allSectors:"\u3059\u3079\u3066\u306e\u8077\u7a2e", results:"\u4ef6\u306e\u7d50\u679c", posted:"\u6295\u7a3f", type:"\u30bf\u30a4\u30d7", unlock:"\u4f01\u696d\u8a73\u7d30\u3092\u89e3\u9664", newsletter:"\u66f4\u65b0\u60c5\u5831\u3092\u53d7\u4fe1", newsletterSub:"\u6700\u65b0\u306e\u6c42\u4eba\u60c5\u5831\u3092\u304a\u5c4a\u3051\u3057\u307e\u3059\u3002", name:"\u30d5\u30eb\u30cd\u30fc\u30e0", email:"\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9", subscribe:"\u767b\u9332\u3059\u308b", subscribed:"\u767b\u9332\u5b8c\u4e86\uff01", statsJobs:"\u6c42\u4eba\u6570", statsCompanies:"\u4f01\u696d\u6570", statsCountries:"\u5bfe\u5fdc\u56fd", statsUsers:"\u30e6\u30fc\u30b6\u30fc", footer:"\u00a9 2026 W-W (World of Work).", exploreMap:"\u4e16\u754c\u306e\u6a5f\u4f1a\u3092\u63a2\u7d22", recentJobs:"\u6700\u65b0\u306e\u6c42\u4eba", filterByLocation:"\u4f4d\u7f6e\u3067\u30d5\u30a3\u30eb\u30bf\u30fc", clearFilters:"\u30af\u30ea\u30a2" },
  zh: { heroTitle:"\u5728\u5168\u7403\u5bfb\u627e\u4f60\u7684\u68a6\u60f3\u5de5\u4f5c", heroSub:"\u4e0e\u5168\u7403\u9876\u7ea7\u4f01\u4e1a\u8fde\u63a5\u3002", search:"\u641c\u7d22\u804c\u4f4d\u3001\u516c\u53f8...", allCountries:"\u6240\u6709\u56fd\u5bb6", allStates:"\u6240\u6709\u5dde\u7701", allCities:"\u6240\u6709\u57ce\u5e02", selectCountry:"\u9009\u62e9\u56fd\u5bb6...", selectState:"\u9009\u62e9\u5dde\u7701...", sectors:"\u5de5\u4f5c\u884c\u4e1a", allSectors:"\u6240\u6709\u884c\u4e1a", results:"\u6761\u7ed3\u679c", posted:"\u53d1\u5e03", type:"\u7c7b\u578b", unlock:"\u89e3\u9501\u8be6\u60c5", newsletter:"\u4fdd\u6301\u66f4\u65b0", newsletterSub:"\u8ba2\u9605\u4ee5\u83b7\u53d6\u6700\u65b0\u673a\u4f1a\u3002", name:"\u5168\u540d", email:"\u90ae\u7bb1\u5730\u5740", subscribe:"\u7acb\u5373\u8ba2\u9605", subscribed:"\u8ba2\u9605\u6210\u529f\uff01", statsJobs:"\u53ef\u7528\u804c\u4f4d", statsCompanies:"\u62db\u8058\u4f01\u4e1a", statsCountries:"\u8986\u76d6\u56fd\u5bb6", statsUsers:"\u6d3b\u8dc3\u7528\u6237", footer:"\u00a9 2026 W-W (World of Work).", exploreMap:"\u63a2\u7d22\u5168\u7403\u673a\u4f1a", recentJobs:"\u6700\u65b0\u673a\u4f1a", filterByLocation:"\u6309\u4f4d\u7f6e\u7b5b\u9009", clearFilters:"\u6e05\u9664" },
  ar: { heroTitle:"\u0627\u0628\u062d\u062b \u0639\u0646 \u0648\u0638\u064a\u0641\u062a\u0643 \u0639\u0627\u0644\u0645\u064a\u0627\u064b", heroSub:"\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0623\u0641\u0636\u0644 \u0627\u0644\u0634\u0631\u0643\u0627\u062a \u0641\u064a \u0627\u0644\u0639\u0627\u0644\u0645.", search:"\u0628\u062d\u062b \u0648\u0638\u0627\u0626\u0641...", allCountries:"\u062c\u0645\u064a\u0639 \u0627\u0644\u0628\u0644\u062f\u0627\u0646", allStates:"\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0646\u0627\u0637\u0642", allCities:"\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u062f\u0646", selectCountry:"\u0627\u062e\u062a\u0631 \u0628\u0644\u062f\u0627\u064b...", selectState:"\u0627\u062e\u062a\u0631 \u0645\u0646\u0637\u0642\u0629...", sectors:"\u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062a", allSectors:"\u062c\u0645\u064a\u0639 \u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062a", results:"\u0646\u062a\u064a\u062c\u0629", posted:"\u0646\u0634\u0631", type:"\u0627\u0644\u0646\u0648\u0639", unlock:"\u0641\u0643 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644", newsletter:"\u0627\u0628\u0642\u064e \u0645\u0637\u0644\u0639\u0627\u064b", newsletterSub:"\u0627\u0634\u062a\u0631\u0643 \u0644\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u062d\u062f\u062b \u0627\u0644\u0641\u0631\u0635.", name:"\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644", email:"\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a", subscribe:"\u0627\u0634\u062a\u0631\u0643 \u0627\u0644\u0622\u0646", subscribed:"\u062a\u0645 \u0627\u0644\u062a\u0633\u062c\u064a\u0644!", statsJobs:"\u0648\u0638\u0627\u0626\u0641", statsCompanies:"\u0634\u0631\u0643\u0627\u062a", statsCountries:"\u062f\u0648\u0644", statsUsers:"\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646", footer:"\u00a9 2026 W-W.", exploreMap:"\u0627\u0633\u062a\u0643\u0634\u0641 \u0627\u0644\u0641\u0631\u0635", recentJobs:"\u0623\u062d\u062f\u062b \u0627\u0644\u0641\u0631\u0635", filterByLocation:"\u0641\u0644\u062a\u0631 \u0628\u0627\u0644\u0645\u0648\u0642\u0639", clearFilters:"\u0645\u0633\u062d" },
  ru: { heroTitle:"\u041d\u0430\u0439\u0434\u0438\u0442\u0435 \u0420\u0430\u0431\u043e\u0442\u0443 \u041c\u0435\u0447\u0442\u044b \u041f\u043e \u0412\u0441\u0435\u043c\u0443 \u041c\u0438\u0440\u0443", heroSub:"\u0421\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043b\u0443\u0447\u0448\u0438\u043c\u0438 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u044f\u043c\u0438 \u043c\u0438\u0440\u0430.", search:"\u041f\u043e\u0438\u0441\u043a \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0439...", allCountries:"\u0412\u0441\u0435 \u0421\u0442\u0440\u0430\u043d\u044b", allStates:"\u0412\u0441\u0435 \u0420\u0435\u0433\u0438\u043e\u043d\u044b", allCities:"\u0412\u0441\u0435 \u0413\u043e\u0440\u043e\u0434\u0430", selectCountry:"\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043d\u0443...", selectState:"\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u0433\u0438\u043e\u043d...", sectors:"\u041e\u0442\u0440\u0430\u0441\u043b\u0438", allSectors:"\u0412\u0441\u0435 \u041e\u0442\u0440\u0430\u0441\u043b\u0438", results:"\u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442\u043e\u0432", posted:"\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043e", type:"\u0422\u0438\u043f", unlock:"\u0420\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u0442\u044c", newsletter:"\u0411\u0443\u0434\u044c\u0442\u0435 \u0432 \u043a\u0443\u0440\u0441\u0435", newsletterSub:"\u041f\u043e\u0434\u043f\u0438\u0448\u0438\u0442\u0435\u0441\u044c \u043d\u0430 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 \u0432\u0430\u043a\u0430\u043d\u0441\u0438\u0438.", name:"\u041f\u043e\u043b\u043d\u043e\u0435 \u0418\u043c\u044f", email:"\u042d\u043b. \u041f\u043e\u0447\u0442\u0430", subscribe:"\u041f\u043e\u0434\u043f\u0438\u0441\u0430\u0442\u044c\u0441\u044f", subscribed:"\u0412\u044b \u043f\u043e\u0434\u043f\u0438\u0441\u0430\u043d\u044b!", statsJobs:"\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u0439", statsCompanies:"\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u0439", statsCountries:"\u0421\u0442\u0440\u0430\u043d", statsUsers:"\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439", footer:"\u00a9 2026 W-W (World of Work).", exploreMap:"\u0418\u0441\u0441\u043b\u0435\u0434\u0443\u0439\u0442\u0435", recentJobs:"\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435", filterByLocation:"\u0424\u0438\u043b\u044c\u0442\u0440", clearFilters:"\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c" },
};

const SECTORS = [
  { key: "Technology", icon: "\uD83D\uDCBB", color: "from-blue-500 to-cyan-400" },
  { key: "Finance", icon: "\uD83D\uDCB0", color: "from-emerald-500 to-green-400" },
  { key: "Design", icon: "\uD83C\uDFA8", color: "from-purple-500 to-pink-400" },
  { key: "Marketing", icon: "\uD83D\uDCE3", color: "from-orange-500 to-amber-400" },
  { key: "Data Science", icon: "\uD83D\uDCCA", color: "from-indigo-500 to-violet-400" },
  { key: "Sales", icon: "\uD83D\uDCC8", color: "from-red-500 to-rose-400" },
  { key: "Management", icon: "\uD83D\uDC65", color: "from-teal-500 to-emerald-400" },
  { key: "Healthcare", icon: "\uD83E\uDEBA", color: "from-pink-500 to-red-400" },
  { key: "Education", icon: "\uD83C\uDF93", color: "from-yellow-500 to-orange-400" },
  { key: "Engineering", icon: "\uD83D\uDD27", color: "from-slate-500 to-gray-400" },
  { key: "Legal", icon: "\u2696\uFE0F", color: "from-amber-600 to-yellow-500" },
  { key: "HR", icon: "\uD83E\uDD1D", color: "from-sky-500 to-blue-400" },
];

function PayPalIcon() {
  return (<svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>);
}

function SimulatedMap({ jobs, onMarkerClick }: { jobs: Job[]; onMarkerClick: (job: Job) => void }) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const w = 900, h = 450;
  const toX = (lng: number) => ((lng + 180) / 360) * w;
  const toY = (lat: number) => ((90 - lat) / 180) * h;
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox={`0 0 ${w} ${h}`}>
        {Array.from({ length: 7 }, (_, i) => (<line key={`h${i}`} x1="0" y1={i*75} x2={w} y2={i*75} stroke="#38bdf8" strokeWidth="0.5" />))}
        {Array.from({ length: 13 }, (_, i) => (<line key={`v${i}`} x1={i*75} y1="0" x2={i*75} y2={h} stroke="#38bdf8" strokeWidth="0.5" />))}
        <ellipse cx="260" cy="180" rx="120" ry="80" fill="#38bdf8" opacity="0.08" />
        <ellipse cx="500" cy="160" rx="100" ry="70" fill="#38bdf8" opacity="0.06" />
        <ellipse cx="430" cy="300" rx="70" ry="90" fill="#38bdf8" opacity="0.07" />
        <ellipse cx="650" cy="200" rx="130" ry="80" fill="#38bdf8" opacity="0.06" />
        <ellipse cx="780" cy="280" rx="60" ry="40" fill="#38bdf8" opacity="0.05" />
      </svg>
      <svg className="relative w-full" viewBox={`0 0 ${w} ${h}`} style={{ height: "auto" }}>
        {jobs.map((job) => {
          const x = toX(job.lng), y = toY(job.lat);
          const isH = hoveredId === job.id;
          return (
            <g key={job.id} className="cursor-pointer" onClick={() => onMarkerClick(job)} onMouseEnter={() => setHoveredId(job.id)} onMouseLeave={() => setHoveredId(null)}>
              <circle cx={x} cy={y} r={isH ? 14 : 10} fill="#0ea5e9" opacity="0.2"><animate attributeName="r" values="8;14;8" dur="3s" repeatCount="indefinite" /></circle>
              <circle cx={x} cy={y} r={isH ? 6 : 4} fill="#0ea5e9" className={isH ? "" : "marker-bounce"} />
              {isH && (<g className="animate-scale-in"><rect x={x-70} y={y-40} width="140" height="28" rx="6" fill="rgba(15,23,42,0.9)" stroke="#0ea5e9" strokeWidth="1" /><text x={x} y={y-22} textAnchor="middle" fill="white" fontSize="11" fontWeight="600">{job.title.length > 22 ? job.title.slice(0,22)+"..." : job.title}</text></g>)}
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-sky-300 backdrop-blur-sm">
        <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />{jobs.length} active positions
      </div>
    </div>
  );
}

function JobCard({ job, index, lang }: { job: Job; index: number; lang: Lang }) {
  const [revealed, setRevealed] = useState(false);
  const T = i18n[lang];
  const sd = SECTORS.find((s) => s.key === job.sector);
  return (
    <article className={`card-hover animate-fade-in-up stagger-${(index % 12) + 1} group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm`}>
      <div className={`h-1 w-full bg-gradient-to-r ${sd?.color || "from-sky-400 to-blue-500"}`} />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">{job.type}</span>
          <span className="text-xs text-gray-400">{T.posted} {job.posted}</span>
        </div>
        <h3 className="mb-1 text-lg font-bold text-gray-900 transition-colors group-hover:text-sky-600">{job.title}</h3>
        <div className="relative my-3">
          <p className={`text-sm text-gray-600 transition-all duration-300 ${!revealed ? "blur-[4px] select-none" : ""}`}>{job.company}</p>
          {!revealed && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] paywall-pulse">
              <button onClick={() => setRevealed(true)} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-amber-600 hover:shadow-lg hover:scale-105 active:scale-95">
                <PayPalIcon />{T.unlock}
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {job.location}
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-emerald-600">{job.salary}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">{job.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${sd?.color || "from-sky-400 to-blue-500"} px-3 py-1 text-xs font-medium text-white`}>{sd?.icon} {job.sector}</span>
          <a href={job.companyUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-sky-600 hover:text-sky-800 transition-colors">View Details &rarr;</a>
        </div>
      </div>
    </article>
  );
}

function AnimatedCounter({ end, label, suffix = "" }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const step = Math.max(1, Math.floor(end / 125));
        let c = 0;
        const t = setInterval(() => { c += step; if (c >= end) { setCount(end); clearInterval(t); } else setCount(c); }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (<div ref={ref} className="text-center"><div className="text-3xl font-black text-white animate-count">{count.toLocaleString()}{suffix}</div><div className="mt-1 text-sm font-medium text-sky-200">{label}</div></div>);
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const [search, setSearch] = useState("");
  const [selCountry, setSelCountry] = useState("");
  const [selState, setSelState] = useState("");
  const [selCity, setSelCity] = useState("");
  const [selSector, setSelSector] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [nlName, setNlName] = useState("");
  const [nlEmail, setNlEmail] = useState("");
  const [nlSent, setNlSent] = useState(false);
  const T = i18n[lang];

  const countriesSorted = useMemo(() => [...countries].sort((a, b) => getCountryName(a, lang).localeCompare(getCountryName(b, lang))), [lang]);
  const states = useMemo(() => { if (!selCountry) return []; return countries.find((c) => c.code === selCountry)?.states || []; }, [selCountry]);
  const cities = useMemo(() => { if (!selCountry || !selState) return []; const s = countries.find((c) => c.code === selCountry)?.states.find((s) => s.name === selState); return s?.cities || []; }, [selCountry, selState]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (selSector) p.set("sector", selSector);
      if (selCity) p.set("location", selCity);
      else if (selState) p.set("location", selState);
      else if (selCountry) { const c = countries.find((co) => co.code === selCountry); if (c) p.set("location", c.name); }
      if (search) p.set("search", search);
      const r = await fetch(`/api/jobs?${p.toString()}`);
      setJobs(await r.json());
    } catch { setJobs([]); }
    setLoading(false);
  }, [selSector, selCity, selState, selCountry, search]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  const clearFilters = () => { setSelCountry(""); setSelState(""); setSelCity(""); setSelSector(""); setSearch(""); };
  const hasFilters = selCountry || selState || selCity || selSector || search;
  const FlagComp = langFlags[lang];
  const langOpts: Lang[] = ["en", "pt", "es", "fr", "de", "it", "ja", "zh", "ar", "ru"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <WWLogo size={36} />
            <span className="hidden sm:block text-lg font-bold tracking-tight text-gray-900">W-W</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#jobs" className="transition-colors hover:text-sky-600">Jobs</a>
            <a href="#map" className="transition-colors hover:text-sky-600">Map</a>
            <a href="#newsletter" className="transition-colors hover:text-sky-600">Newsletter</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={() => document.getElementById("lang-drop")?.classList.toggle("hidden")} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm transition-all hover:border-sky-300 hover:shadow-sm">
                <FlagComp className="w-5 h-5" />
                <span className="hidden sm:inline uppercase text-xs font-semibold text-gray-600">{lang}</span>
                <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div id="lang-drop" className="hidden absolute right-0 mt-1 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-xl animate-scale-in">
                {langOpts.map((l) => { const F = langFlags[l]; return (
                  <button key={l} onClick={() => { setLang(l); document.getElementById("lang-drop")?.classList.add("hidden"); }} className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-sky-50 ${l === lang ? "bg-sky-50 text-sky-700 font-semibold" : "text-gray-700"}`}>
                    <F className="w-4 h-4" /><span className="uppercase font-medium">{l}</span>
                  </button>
                ); })}
              </div>
            </div>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileMenu ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 animate-fade-in-up">
            <a href="#jobs" onClick={() => setMobileMenu(false)} className="block py-2 text-sm font-medium text-gray-600 hover:text-sky-600">Jobs</a>
            <a href="#map" onClick={() => setMobileMenu(false)} className="block py-2 text-sm font-medium text-gray-600 hover:text-sky-600">Map</a>
            <a href="#newsletter" onClick={() => setMobileMenu(false)} className="block py-2 text-sm font-medium text-gray-600 hover:text-sky-600">Newsletter</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-sky-600/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="mb-6 animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-4 py-1.5 text-sm font-medium text-sky-300 backdrop-blur-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />{T.statsJobs}: 12,450+
            </span>
          </div>
          <h1 className="animate-fade-in-up stagger-1 text-3xl sm:text-5xl font-black text-white leading-tight mb-4">{T.heroTitle}</h1>
          <p className="animate-fade-in-up stagger-2 mx-auto max-w-2xl text-base sm:text-lg text-gray-300 mb-8">{T.heroSub}</p>
          <div className="animate-fade-in-up stagger-3 mx-auto max-w-2xl">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 p-2 backdrop-blur-md">
              <svg className="ml-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={T.search} className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder-gray-400 outline-none" />
              <button onClick={fetchJobs} className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-sky-600 hover:shadow-lg active:scale-95">Search</button>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION SELECTOR */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {T.filterByLocation}
            </div>
            <select value={selCountry} onChange={(e) => { setSelCountry(e.target.value); setSelState(""); setSelCity(""); }} className="location-select custom-scrollbar rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-100 cursor-pointer">
              <option value="">{T.allCountries}</option>
              {countriesSorted.map((c) => (<option key={c.code} value={c.code}>{c.flag} {getCountryName(c, lang)}</option>))}
            </select>
            <select value={selState} onChange={(e) => { setSelState(e.target.value); setSelCity(""); }} disabled={!selCountry} className="location-select custom-scrollbar rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <option value="">{selCountry ? T.allStates : T.selectCountry}</option>
              {states.map((s) => (<option key={s.name} value={s.name}>{s.name}</option>))}
            </select>
            <select value={selCity} onChange={(e) => setSelCity(e.target.value)} disabled={!selState} className="location-select custom-scrollbar rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pr-8 text-sm font-medium text-gray-700 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <option value="">{selState ? T.allCities : T.selectState}</option>
              {cities.map((c) => (<option key={c.name} value={c.name}>{c.name}</option>))}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                {T.clearFilters}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-bold text-gray-700">{T.sectors}</h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          <div className="flex gap-2 overflow-x-auto sector-scroll pb-1">
            <button onClick={() => setSelSector("")} className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${!selSector ? "bg-slate-800 text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:border-sky-300 hover:text-sky-600"}`}>{T.allSectors}</button>
            {SECTORS.map((s) => (
              <button key={s.key} onClick={() => setSelSector(selSector === s.key ? "" : s.key)} className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 active:scale-95 ${selSector === s.key ? `bg-gradient-to-r ${s.color} text-white shadow-md` : "bg-white text-gray-600 border border-gray-200 hover:border-sky-300 hover:text-sky-600"}`}>
                <span>{s.icon}</span><span>{s.key}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:px-6 sm:grid-cols-4">
          <AnimatedCounter end={12450} suffix="+" label={T.statsJobs} />
          <AnimatedCounter end={3200} suffix="+" label={T.statsCompanies} />
          <AnimatedCounter end={85} suffix="+" label={T.statsCountries} />
          <AnimatedCounter end={45000} suffix="+" label={T.statsUsers} />
        </div>
      </section>

      {/* MAP */}
      <section id="map" className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">{T.exploreMap}</h2>
        <SimulatedMap jobs={jobs} onMarkerClick={(j) => { document.getElementById("jobs")?.scrollIntoView({ behavior: "smooth" }); }} />
      </section>

      {/* JOBS */}
      <section id="jobs" className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{T.recentJobs}</h2>
          <span className="text-sm text-gray-500">{jobs.length} {T.results}</span>
        </div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="shimmer h-5 w-20 rounded-full mb-3" />
                <div className="shimmer h-6 w-3/4 rounded mb-2" />
                <div className="shimmer h-4 w-1/2 rounded mb-4" />
                <div className="shimmer h-4 w-full rounded mb-2" />
                <div className="shimmer h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl">{"\uD83D\uDD0D"}</div>
            <h3 className="text-lg font-semibold text-gray-700">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
            {hasFilters && (<button onClick={clearFilters} className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition-colors">{T.clearFilters}</button>)}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, i) => (<JobCard key={job.id} job={job} index={i} lang={lang} />))}
          </div>
        )}
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="newsletter-gradient py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm">
            <svg className="h-7 w-7 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{T.newsletter}</h2>
          <p className="mb-8 text-sky-200">{T.newsletterSub}</p>
          {!nlSent ? (
            <div className="mx-auto max-w-md space-y-3">
              <input type="text" value={nlName} onChange={(e) => setNlName(e.target.value)} placeholder={T.name} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-sky-200/60 outline-none backdrop-blur-sm transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30" />
              <input type="email" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} placeholder={T.email} className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-sky-200/60 outline-none backdrop-blur-sm transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30" />
              <button onClick={() => { if (nlName && nlEmail) setNlSent(true); }} className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-400 hover:shadow-xl active:scale-[0.98]">{T.subscribe}</button>
            </div>
          ) : (
            <div className="animate-scale-in rounded-2xl bg-white/10 border border-white/20 px-6 py-8 backdrop-blur-sm">
              <div className="mb-3 text-4xl">{"\u2705"}</div>
              <p className="text-lg font-semibold text-white">{T.subscribed}</p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <WWLogo size={24} />
            <span className="text-sm text-gray-500">{T.footer}</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="transition-colors hover:text-sky-600">Privacy</a>
            <a href="#" className="transition-colors hover:text-sky-600">Terms</a>
            <a href="#" className="transition-colors hover:text-sky-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
