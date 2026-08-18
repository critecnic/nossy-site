"use client";

import React, { useState } from 'react';
import type { Lang } from '@/lib/i18n';

const CURRENCY_SYMBOL = 'R$';

const PRICES: Record<string, { amount: number; label: string; popular?: boolean }> = {
  single: { amount: 34.90, label: 'singleJob' },
  pack5: { amount: 59.90, label: 'pack5' },
  pack10: { amount: 89.90, label: 'pack10', popular: true },
  lifetime: { amount: 599.00, label: 'lifetime' },
};

const LABELS: Record<string, Record<string, string>> = {
  en: {
    title: 'Unlock Contact Details', subtitle: 'Get exclusive access to employer contact information',
    singleJob: '1 Contact', pack5: '5 Contacts Pack', pack10: '10 Contacts Pack', lifetime: 'Lifetime Unlimited',
    cta: 'Unlock Now', close: 'Close', secure: 'Secure payment via Stripe',
    perJob: '/contact', feature1: 'Direct company email', feature2: 'Full job description', feature3: 'Priority application support',
    mostPopular: 'Most Popular',
  },
  "pt-br": {
    title: 'Desbloqueie Contatos', subtitle: 'Acesse informações exclusivas de contato das empresas',
    singleJob: '1 Contato', pack5: 'Pacote 5 Contatos', pack10: 'Pacote 10 Contatos', lifetime: 'Vitalício Ilimitado',
    cta: 'Desbloquear Agora', close: 'Fechar', secure: 'Pagamento seguro via Stripe',
    perJob: '/contato', feature1: 'Email direto da empresa', feature2: 'Descrição completa da vaga', feature3: 'Suporte prioritário na candidatura',
    mostPopular: 'Mais Popular',
  },
  es: {
    title: 'Desbloquear Contactos', subtitle: 'Acceda a información exclusiva de contacto',
    singleJob: '1 Contacto', pack5: 'Pack 5 Contactos', pack10: 'Pack 10 Contactos', lifetime: 'Ilimitado Vitalicio',
    cta: 'Desbloquear', close: 'Cerrar', secure: 'Pago seguro con Stripe',
    perJob: '/contacto', feature1: 'Email directo', feature2: 'Descripción completa', feature3: 'Soporte prioritario',
    mostPopular: 'Más Popular',
  },
  fr: {
    title: 'Débloquer les Contacts', subtitle: 'Accédez aux coordonnées exclusives',
    singleJob: '1 Contact', pack5: 'Pack 5 Contacts', pack10: 'Pack 10 Contacts', lifetime: 'Illimité à Vie',
    cta: 'Débloquer', close: 'Fermer', secure: 'Paiement sécurisé Stripe',
    perJob: '/contact', feature1: 'Email direct', feature2: 'Description complète', feature3: 'Support prioritaire',
    mostPopular: 'Populaire',
  },
  de: {
    title: 'Kontakt freischalten', subtitle: 'Exklusiven Zugang zu Arbeitgeberkontakten',
    singleJob: '1 Kontakt', pack5: '5er Pack', pack10: '10er Pack', lifetime: 'Lebenslang Unbegrenzt',
    cta: 'Freischalten', close: 'Schließen', secure: 'Sichere Zahlung mit Stripe',
    perJob: '/Kontakt', feature1: 'Direkte E-Mail', feature2: 'Vollständige Beschreibung', feature3: 'Prioritätsunterstützung',
    mostPopular: 'Beliebt',
  },
  it: {
    title: 'Sblocca Contatti', subtitle: 'Accedi alle informazioni di contatto esclusive',
    singleJob: '1 Contatto', pack5: 'Pacchetto 5 Contatti', pack10: 'Pacchetto 10 Contatti', lifetime: 'Illimitato a Vita',
    cta: 'Sblocca Ora', close: 'Chiudi', secure: 'Pagamento sicuro con Stripe',
    perJob: '/contatto', feature1: 'Email diretta', feature2: 'Descrizione completa', feature3: 'Supporto prioritario',
    mostPopular: 'Più Popolare',
  },
  nl: {
    title: 'Contactgegevens Ontgrendelen', subtitle: 'Krijg exclusieve toegang tot werkgeverscontacten',
    singleJob: '1 Contact', pack5: '5 Contacten Pakket', pack10: '10 Contacten Pakket', lifetime: 'Levenslang Onbeperkt',
    cta: 'Ontgrendelen', close: 'Sluiten', secure: 'Veilige betaling via Stripe',
    perJob: '/contact', feature1: 'Direct bedrijfs-e-mail', feature2: 'Volledige vacaturebeschrijving', feature3: 'Prioriteitsondersteuning',
    mostPopular: 'Populair',
  },
  pl: {
    title: 'Odblokuj Kontakty', subtitle: 'Zyskaj ekskluzywny dostęp do danych kontaktowych',
    singleJob: '1 Kontakt', pack5: 'Pakiet 5 Kontaktów', pack10: 'Pakiet 10 Kontaktów', lifetime: 'Dożywotni Nielimitowany',
    cta: 'Odblokuj', close: 'Zamknij', secure: 'Bezpieczna płatność przez Stripe',
    perJob: '/kontakt', feature1: 'Bezpośredni e-mail', feature2: 'Pełny opis stanowiska', feature3: 'Priorytetowe wsparcie',
    mostPopular: 'Najpopularniejszy',
  },
  ru: {
    title: 'Разблокировать Контакты', subtitle: 'Получите эксклюзивный доступ к контактам работодателей',
    singleJob: '1 Контакт', pack5: 'Пакет 5 Контактов', pack10: 'Пакет 10 Контактов', lifetime: 'Пожизненный Доступ',
    cta: 'Разблокировать', close: 'Закрыть', secure: 'Безопасная оплата через Stripe',
    perJob: '/контакт', feature1: 'Прямой email компании', feature2: 'Полное описание вакансии', feature3: 'Приоритетная поддержка',
    mostPopular: 'Популярный',
  },
  zh: {
    title: '解锁联系方式', subtitle: '获取雇主联系信息的独家权限',
    singleJob: '1个联系方式', pack5: '5个联系方式套餐', pack10: '10个联系方式套餐', lifetime: '终身无限访问',
    cta: '立即解锁', close: '关闭', secure: '通过Stripe安全付款',
    perJob: '/联系方式', feature1: '公司直接邮箱', feature2: '完整职位描述', feature3: '优先申请支持',
    mostPopular: '最受欢迎',
  },
  ja: {
    title: '連絡先をアンロック', subtitle: '雇用者の連絡先情報への排他的アクセス',
    singleJob: '1件の連絡先', pack5: '5件パック', pack10: '10件パック', lifetime: '永久無制限',
    cta: 'アンロック', close: '閉じる', secure: 'Stripe安全決済',
    perJob: '/連絡先', feature1: '企業直接メール', feature2: '求人完全説明', feature3: '優先応募サポート',
    mostPopular: '人気',
  },
  ko: {
    title: '연락처 잠금 해제', subtitle: '고용주 연락처 정보에 대한 독점 액세스',
    singleJob: '1개 연락처', pack5: '5개 연락처 팩', pack10: '10개 연락처 팩', lifetime: '평생 무제한',
    cta: '잠금 해제', close: '닫기', secure: 'Stripe 안전 결제',
    perJob: '/연락처', feature1: '회사 직접 이메일', feature2: '전체 채용 설명', feature3: '우선 지원 지원',
    mostPopular: '인기',
  },
  hi: {
    title: 'संपर्क विवरण अनलॉक करें', subtitle: 'नियोक्ता संपर्क जानकारी तक विशेष पहुंच',
    singleJob: '1 संपर्क', pack5: '5 संपर्क पैक', pack10: '10 संपर्क पैक', lifetime: 'आजीवन असीमित',
    cta: 'अनलॉक करें', close: 'बंद करें', secure: 'Stripe के माध्यम से सुरक्षित भुगतान',
    perJob: '/संपर्क', feature1: 'सीधी कंपनी ईमेल', feature2: 'पूरी नौकरी विवरण', feature3: 'प्राथमिकता आवेदन समर्थन',
    mostPopular: 'सबसे लोकप्रिय',
  },
  bn: {
    title: 'যোগাযোগের বিবরণ আনলক করুন', subtitle: 'নিয়োগকর্তার যোগাযোগের তথ্যে এক্সক্লুসিভ অ্যাক্সেস',
    singleJob: '1 যোগাযোগ', pack5: '5 যোগাযোগ প্যাক', pack10: '10 যোগাযোগ প্যাক', lifetime: 'আজীবন আনলিমিটেড',
    cta: 'আনলক করুন', close: 'বন্ধ করুন', secure: 'Stripe এর মাধ্যমে সুরক্ষিত পেমেন্ট',
    perJob: '/যোগাযোগ', feature1: 'সরাসরি কোম্পানি ইমেইল', feature2: 'সম্পূর্ণ চাকরির বিবরণ', feature3: 'অগ্রাধিকার আবেদন সহায়তা',
    mostPopular: 'সবচেয়ে জনপ্রিয়',
  },
  ar: {
    title: 'فتح بيانات الاتصال', subtitle: 'احصل على وصول حصري لمعلومات الاتصال بأصحاب العمل',
    singleJob: '1 جهة اتصال', pack5: 'باقة 5 جهات', pack10: 'باقة 10 جهات', lifetime: 'وصول مدى الحياة',
    cta: 'فتح الآن', close: 'إغلاق', secure: 'دفع آمن عبر Stripe',
    perJob: '/اتصال', feature1: 'بريد الشركة المباشر', feature2: 'وصف الوظيفة الكامل', feature3: 'دعم تقديم الأولوية',
    mostPopular: 'الأكثر شعبية',
  },
  tr: {
    title: 'İletişim Bilgilerini Aç', subtitle: 'İşveren iletişim bilgilerine özel erişim',
    singleJob: '1 İletişim', pack5: '5 İletişim Paketi', pack10: '10 İletişim Paketi', lifetime: 'Ömür Boyu Sınırsız',
    cta: 'Aç', close: 'Kapat', secure: 'Stripe ile güvenli ödeme',
    perJob: '/iletişim', feature1: 'Doğrudan şirket e-postası', feature2: 'Tam iş açıklaması', feature3: 'Öncelikli başvuru desteği',
    mostPopular: 'Popüler',
  },
  vi: {
    title: 'Mở Khóa Liên Hệ', subtitle: 'Truy cập độc quyền thông tin liên hệ nhà tuyển dụng',
    singleJob: '1 Liên Hệ', pack5: 'Gói 5 Liên Hệ', pack10: 'Gói 10 Liên Hệ', lifetime: 'Vô Hạn Trọn Đời',
    cta: 'Mở Khóa', close: 'Đóng', secure: 'Thanh toán an toàn qua Stripe',
    perJob: '/liên hệ', feature1: 'Email trực tiếp', feature2: 'Mô tả công việc đầy đủ', feature3: 'Hỗ trợ ứng tuyển ưu tiên',
    mostPopular: 'Phổ Biến Nhất',
  },
  th: {
    title: 'ปลดล็อกข้อมูลติดต่อ', subtitle: 'เข้าถึงข้อมูลติดต่อผู้ว่าจ้างแบบเฉพาะ',
    singleJob: '1 ข้อมูลติดต่อ', pack5: 'แพ็ค 5 รายการ', pack10: 'แพ็ค 10 รายการ', lifetime: 'ตลอดชีพไม่จำกัด',
    cta: 'ปลดล็อก', close: 'ปิด', secure: 'ชำระเงินปลอดภัยผ่าน Stripe',
    perJob: '/ติดต่อ', feature1: 'อีเมลบริษัทโดยตรง', feature2: 'รายละเอียดงานเต็ม', feature3: 'การสนับสนุนการสมัครแบบเร่งด่วน',
    mostPopular: 'ยอดนิยม',
  },
  ur: {
    title: 'رابطہ تفصیلات کھولیں', subtitle: 'آجروں کے رابطہ کی معلومات تک خصوصی رسائی',
    singleJob: '1 رابطہ', pack5: '5 رابطہ پیک', pack10: '10 رابطہ پیک', lifetime: 'عمر بھر غیر محدود',
    cta: 'کھولیں', close: 'بند کریں', secure: 'Stripe کے ذریعے محفوظ ادائیگی',
    perJob: '/رابطہ', feature1: 'براہ راست کمپنی ای میل', feature2: 'مکمل ملازمت تفصیل', feature3: 'ترجیحی درخواست مدد',
    mostPopular: 'سب سے مقبول',
  },
  tl: {
    title: 'I-unlock ang Contact Details', subtitle: 'Kumuha ng eksklusibong access sa contact ng employer',
    singleJob: '1 Contact', pack5: '5 Contacts Pack', pack10: '10 Contacts Pack', lifetime: 'Lifetime Unlimited',
    cta: 'I-unlock', close: 'Isara', secure: 'Ligtang bayad sa pamamagitan ng Stripe',
    perJob: '/contact', feature1: 'Direktang email ng kumpanya', feature2: 'Buong deskripsyon ng trabaho', feature3: 'Priority application support',
    mostPopular: 'Pinakasikat',
  },
  sw: {
    title: 'Fungua Maelezo ya Mawasiliano', subtitle: 'Pata ufikiaji wa kipekee wa maelezo ya mawasiliano ya waajiri',
    singleJob: '1 Mawasiliano', pack5: 'Pakiti ya 5', pack10: 'Pakiti ya 10', lifetime: 'Uhai Unao Wote',
    cta: 'Fungua', close: 'Funga', secure: 'Malipo salama kupitia Stripe',
    perJob: '/mawasiliano', feature1: 'Barua pepe ya moja kwa moja', feature2: 'Maelezo kamili ya kazi', feature3: 'Msaada wa kipaumbele',
    mostPopular: 'Maarufu Zaidi',
  },
  "pt-pt": {
    title: 'Desbloqueie Contactos', subtitle: 'Acesse informações exclusivas de contacto das empresas',
    singleJob: '1 Contacto', pack5: 'Pacote 5 Contactos', pack10: 'Pacote 10 Contactos', lifetime: 'Vitalício Ilimitado',
    cta: 'Desbloquear Agora', close: 'Fechar', secure: 'Pagamento seguro via Stripe',
    perJob: '/contacto', feature1: 'Email direto da empresa', feature2: 'Descrição completa da vaga', feature3: 'Suporte prioritário na candidatura',
    mostPopular: 'Mais Popular',
  },
};

const FALLBACK = LABELS['en'];

export default function PaywallModal({ isOpen, onClose, jobId, jobTitle, lang, company }: {
  isOpen: boolean; onClose: () => void; jobId: number; jobTitle: string; lang: Lang; company: string;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string>('pack10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const L = LABELS[lang] || FALLBACK;

  async function handleCheckout() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, jobId, lang }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; }
      else { setError(data.error || 'Payment error'); setLoading(false); }
    } catch { setError('Connection error'); setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto z-10"
        onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors text-lg">×</button>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center text-2xl">🔒</div>
            <h2 className="text-xl font-bold text-gray-900">{L.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{company} — {jobTitle}</p>
          </div>
          <div className="space-y-2 mb-4">
            {Object.entries(PRICES).map(([key, p]) => {
              const isSelected = selectedPlan === key;
              return (
                <button key={key} onClick={() => setSelectedPlan(key)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-sky-500 bg-sky-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-sky-500' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{L[p.label]}</span>
                    {p.popular && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">{L.mostPopular}</span>}
                  </div>
                  <span className="font-bold text-gray-900">
                    {CURRENCY_SYMBOL}{p.amount.toFixed(2).replace('.', ',')}{key !== 'lifetime' ? L.perJob : ''}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span>{L.feature1}</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span>{L.feature2}</li>
              <li className="flex items-center gap-2"><span className="text-green-500">✓</span>{L.feature3}</li>
            </ul>
          </div>
          {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}
          <button onClick={handleCheckout} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-200">
            {loading ? 'Processing...' : L.cta}
          </button>
          <p className="text-center text-[11px] text-gray-400 mt-3">{L.secure}</p>
        </div>
      </div>
    </div>
  );
}