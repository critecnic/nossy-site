"use client";

import React from 'react';
import type { Lang } from '@/lib/i18n';

interface JobDetail {
  id: number; title: string; company: string;
  location: string; countryName: string;
  salary: string; salaryMin: number; salaryMax: number;
  salaryCurrency: string; salaryPeriod: string;
  description: string; sector: string; posted: string; type: string;
  contactEmail: string;
}

const MODAL_LABELS: Record<string, Record<string, string>> = {
  en: {
    title: "Job Details", company: "Company", location: "Location",
    salary: "Salary", category: "Category", workType: "Work Type",
    posted: "Posted", description: "Description", contact: "Contact",
    noContact: "Contact not available", close: "Close",
    perYear: "/year", perMonth: "/month", perHour: "/hour",
    onsite: "On-site", hybrid: "Hybrid", remote: "Remote",
  },
  "pt-br": {
    title: "Detalhes da Vaga", company: "Empresa", location: "Localização",
    salary: "Salário", category: "Categoria", workType: "Tipo de Trabalho",
    posted: "Publicada em", description: "Descrição", contact: "Contato",
    noContact: "Contato não disponível", close: "Fechar",
    perYear: "/ano", perMonth: "/mês", perHour: "/hora",
    onsite: "Presencial", hybrid: "Híbido", remote: "Remoto",
  },
  "pt-pt": {
    title: "Detalhes da Vaga", company: "Empresa", location: "Localização",
    salary: "Salário", category: "Categoria", workType: "Tipo de Trabalho",
    posted: "Publicada em", description: "Descrição", contact: "Contato",
    noContact: "Contato não disponível", close: "Fechar",
    perYear: "/ano", perMonth: "/mês", perHour: "/hora",
    onsite: "Presencial", hybrid: "Híbido", remote: "Remoto",
  },
  es: {
    title: "Detalles del Empleo", company: "Empresa", location: "Ubicación",
    salary: "Salario", category: "Categoría", workType: "Tipo de Trabajo",
    posted: "Publicado", description: "Descripción", contact: "Contacto",
    noContact: "Contacto no disponible", close: "Cerrar",
    perYear: "/año", perMonth: "/mes", perHour: "/hora",
    onsite: "Presencial", hybrid: "Híbido", remote: "Remoto",
  },
  fr: {
    title: "Détails de l'Offre", company: "Entreprise", location: "Localisation",
    salary: "Salaire", category: "Catégorie", workType: "Type de Travail",
    posted: "Publié", description: "Description", contact: "Contact",
    noContact: "Contact non disponible", close: "Fermer",
    perYear: "/an", perMonth: "/mois", perHour: "/heure",
    onsite: "Sur site", hybrid: "Hybride", remote: "Télétravail",
  },
  de: {
    title: "Stellendetails", company: "Unternehmen", location: "Standort",
    salary: "Gehalt", category: "Kategorie", workType: "Arbeitsart",
    posted: "Veröffentlicht", description: "Beschreibung", contact: "Kontakt",
    noContact: "Kein Kontakt verfügbar", close: "Schließen",
    perYear: "/Jahr", perMonth: "/Monat", perHour: "/Stunde",
    onsite: "Vor Ort", hybrid: "Hybrid", remote: "Remote",
  },
  it: {
    title: "Dettagli dell'Offerta", company: "Azienda", location: "Sede",
    salary: "Stipendio", category: "Categoria", workType: "Tipo di Lavoro",
    posted: "Pubblicato", description: "Descrizione", contact: "Contatto",
    noContact: "Contatto non disponibile", close: "Chiudi",
    perYear: "/anno", perMonth: "/mese", perHour: "/ora",
    onsite: "In presenza", hybrid: "Ibrido", remote: "Remoto",
  },
  nl: {
    title: "Vacaturedetails", company: "Bedrijf", location: "Locatie",
    salary: "Salaris", category: "Categorie", workType: "Werktype",
    posted: "Geplaatst", description: "Beschrijving", contact: "Contact",
    noContact: "Geen contact beschikbaar", close: "Sluiten",
    perYear: "/jaar", perMonth: "/maand", perHour: "/uur",
    onsite: "Op locatie", hybrid: "Hybride", remote: "Op afstand",
  },
  pl: {
    title: "Szczegóły Oferty", company: "Firma", location: "Lokalizacja",
    salary: "Wynagrodzenie", category: "Kategoria", workType: "Typ Pracy",
    posted: "Opublikowano", description: "Opis", contact: "Kontakt",
    noContact: "Brak danych kontaktowych", close: "Zamknij",
    perYear: "/rok", perMonth: "/miesiąc", perHour: "/godzina",
    onsite: "Stacjonarnie", hybrid: "Hybrydowo", remote: "Zdalnie",
  },
  ru: {
    title: "Детали вакансии", company: "Компания", location:"Местоположение",
    salary: "Зарплата", category: "Категория", workType: "Тип занятости",
    posted: "Опубликовано", description: "Описание", contact: "Контакт",
    noContact: "Контакт недоступен", close: "Закрыть",
    perYear: "/год", perMonth: "/месяц", perHour: "/час",
    onsite: "В офисе", hybrid: "Гибрид", remote: "Удалённо",
  },
  zh: {
    title: "职位详情", company: "公司", location: "地点",
    salary: "薪资", category: "类别", workType: "工作类型",
    posted: "发布日期", description: "描述", contact: "联系方式",
    noContact: "暂无联系方式", close: "关闭",
    perYear: "/年", perMonth: "/月", perHour: "/小时",
    onsite: "现场", hybrid: "混合", remote: "远程",
  },
  ja: {
    title: "求人詳細", company: "企業", location: "勤務地",
    salary: "給与", category: "カテゴリ", workType: "勤務形態",
    posted: "投稿日", description: "詳細", contact: "連絡先",
    noContact: "連絡先なし", close: "閉じる",
    perYear: "/年", perMonth: "/月", perHour: "/時間",
    onsite: "オフィス", hybrid: "ハイブリッド", remote: "リモート",
  },
  ko: {
    title: "죄의 상세", company: "회사", location: "위치",
    salary: "금여", category: "카테고리", workType: "근무 형태",
    posted: "등록일", description: "설명", contact:"연락처",
    noContact:"연락처 없음", close:"닫기",
    perYear:"년", perMonth:"월", perHour:"시간",
    onsite:"사무소", hybrid:"하이브리드", remote:"원격",
  },
  hi: {
    title: "नौकरी विवरण", company: "कंपनी", location: "स्थान",
    salary: "वेतन", category: "श्रेणी", workType: "कार्य प्रकार",
    posted: "प्रकाशित", description: "विवरण", contact: "संपर्क",
    noContact: "संपर्क उपलब्ध नहीं", close: "बंद करें",
    perYear: "/वर्ष", perMonth: "/माह", perHour: "/घंटा",
    onsite: "ऑनसाइट", hybrid: "हाइब्रिड", remote: "रिमोट",
  },
  bn: {
    title: "চাকরীর বিবরণ", company: "কোম্পানী", location: "অবস্থান",
    salary: "বেতন", category: "বাচনা", workType: "কারের ধরন",
    posted: "প্রকাশিত", description: "বিবরণ", contact: "যোগাযোগ",
    noContact: "যোগাযোগ পাওয়া যায় নী", close: "বন্ধ করুন",
    perYear: "/বছর", perMonth: "/মাস", perHour: "/ঘন্টা",
    onsite: "অফিস", hybrid: "হাইব্রিড", remote: "রিমোট",
  },
  ar: {
    title: "تفاصيل الوظيفة", company: "الشركة", location: "الموقع",
    salary: "الراتب", category: "الفئة", workType: "نوع العمل",
    posted: "تاريخ النشر", description: "الوصف", contact: "التواصل",
    noContact: "لا يوجد تواصل", close: "إغلاق",
    perYear: "/سنة", perMonth: "/شهر", perHour: "/ساعة",
    onsite: "في المقر", hybrid: "هجين", remote: "عن بعد",
  },
  tr: {
    title: "İlan Detayları", company: "Şirket", location: "Konum",
    salary: "Maaş", category: "Kategori", workType: "Çalışma Türü",
    posted: "Yayınlanma", description: "Açıklama", contact: "İletişim",
    noContact:"İletişim yok", close:"Kapat",
    perYear:"/yıl", perMonth:"/ay", perHour:"/saat",
    onsite:"Şirkette", hybrid:"Hibrit", remote:"Uzaktan",
  },
  vi: {
    title: "Chi tiết việc làm", company: "Công ty", location: "Địa điểm",
    salary: "Mức lương", category: "Danh mục", workType: "Loại hình",
    posted: "Đăng ngày", description: "Mô tả", contact: "Liên hệ",
    noContact: "Chưa có liên hệ", close:"Đóng",
    perYear:"/năm", perMonth:"/tháng", perHour:"/giờ",
    onsite:"Tại văn phòng", hybrid:"Kết hợp", remote:"Từ xa",
  },
  th: {
    title: "รายละเอียด", company: "บริษัท", location: "สถานที่",
    salary: "เงินเดือน", category: "หมวด", workType: "ประเภท",
    posted: "วันที่ประกาศ", description: "คำอธิบาย", contact: "ติดต่อ",
    noContact: "ไม่มีข้อมูล", close:"ปิด",
    perYear:"/ปี", perMonth:"เดือน", perHour:"ชั่วโมง",
    onsite:"ที่สำนักงาน", hybrid:"แบบผสมผสาน", remote:"ทำงานทางไกล",
  },
  ur: {
    title: "معلومات نوکری", company: "کمپنی", location: "مقام",
    salary: "تجرت", category: "زمرہ", workType: "کام کی قسم",
    posted: "شائع شد", description: "تفصیل", contact: "رابطہ",
    noContact: "رابطہ موجود نہیں", close: "بند کریں",
    perYear: "/سال", perMonth: "/ماہ", perHour: "/گنتہ",
    onsite: "اوفس", hybrid: "ہائبریڈ", remote: "ریموٹ",
  },
  tl: {
    title: "Detalye ng Trabaho", company: "Kumpanya", location: "Lokasyon",
    salary: "Sweldo", category: "Kategorya", workType: "Uri ng Trabaho",
    posted: "Nai-post", description: "Deskripsyon", contact: "Contact",
    noContact: "Wala pang contact", close: "Isara",
    perYear: "/taon", perMonth: "/buwan", perHour: "/oras",
    onsite: "On-site", hybrid: "Hybrid", remote: "Remote",
  },
  sw: {
    title: "Maelezo ya Kazi", company: "Kampuni", location: "Mahali",
    salary: "Mshahara", category: "Kategoria", workType: "Aina ya Kazi",
    posted: "Imechapishwa", description: "Maelezo", contact: "Mawasiliano",
    noContact: "Hakuna mawasiliano", close: "Funga",
    perYear: "/mwaka", perMonth: "/mwezi", perHour: "/saa",
    onsite: "Kwenye tovuti", hybrid: "Mseto", remote: "Kutoka mbali",
  },
};

const FALLBACK = MODAL_LABELS['en'];

export function getWorkTypeLabel(lang: string, type: string): string {
  const L = MODAL_LABELS[lang] || FALLBACK;
  const t = type?.toLowerCase() || '';
  if (t === 'remoto' || t === 'remote') return L.remote;
  if (t === 'hibrido' || t === 'hybrid') return L.hybrid;
  if (t === 'presencial' || t === 'onsite' || t === 'on-site') return L.onsite;
  return type;
}

export function getSalaryLabel(salaryMin: number, salaryMax: number, salary: string, salaryCurrency: string, salaryPeriod: string, lang: string): string {
  const L = MODAL_LABELS[lang] || FALLBACK;
  const periodLabel = salaryPeriod === 'month' ? L.perMonth : salaryPeriod === 'hour' ? L.perHour : L.perYear;
  if (salaryMin && salaryMax) {
    return `${Number(salaryMin).toLocaleString()} - ${Number(salaryMax).toLocaleString()} ${salaryCurrency} ${periodLabel}`;
  }
  if (salary) return `${salary} ${salaryCurrency ? salaryCurrency + ' ' : ''}${periodLabel}`;
  return '—';
}

export default function JobDetailModal({ isOpen, onClose, job, lang }: {
  isOpen: boolean; onClose: () => void; job: JobDetail | null; lang: Lang;
}) {
  if (!isOpen || !job) return null;
  const L = MODAL_LABELS[lang] || FALLBACK;
  const wtLabel = getWorkTypeLabel(lang, job.type);
  const salaryText = getSalaryLabel(job.salaryMin, job.salaryMax, job.salary, job.salaryCurrency, job.salaryPeriod, lang);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-5 pb-4 rounded-t-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{job.title}</h2>
              <p className="text-sm font-semibold text-sky-600 mt-1">{job.company}</p>
            </div>
            <button onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-lg leading-none">
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.company}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{job.company}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.location}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{job.location}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.salary}</p>
              <p className="text-sm font-bold text-sky-600 mt-0.5">{salaryText}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.workType}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{wtLabel}</p>
            </div>
            {job.posted && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.posted}</p>
                <p className="text-sm text-gray-700 mt-0.5">{job.posted}</p>
              </div>
            )}
            {job.sector && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{L.category}</p>
                <p className="text-sm text-gray-700 mt-0.5">{job.sector}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{L.description}</p>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            </div>
          )}

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{L.contact}</p>
            <div className="bg-gray-50 rounded-xl p-4">
              {job.contactEmail ? (
                <p className="text-sm font-semibold text-sky-600">{job.contactEmail}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">{L.noContact}</p>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm">
            {L.close}
          </button>
        </div>
      </div>
    </div>
  );
}
