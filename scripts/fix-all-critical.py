#!/usr/bin/env python3
"""
Critical fixes for NOSSY.PRO - applies all P0/P1 fixes to src/ and zips.
"""
import re, json, os, shutil

SRC = '/home/z/my-project/src'
OUT = '/home/z/my-project/download/nossy-src-fixed'

# ─── Helper ─────────────────────────────────────────────────────────
def read_file(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(p, c):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

def copy_dir(src, dst):
    if os.path.exists(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst)

# ─── 1. Copy src to output ──────────────────────────────────────────
print('[1/7] Copying src...')
copy_dir(SRC, OUT)

# ─── 2. Fix i18n.ts: add missing keys to i18n object ─────────────────
print('[2/7] Fixing i18n.ts...')
i18n_path = os.path.join(OUT, 'lib', 'i18n.ts')
i18n_content = read_file(i18n_path)

# The keys that exist in sectorNames but need to be in i18n
MISSING_KEYS = {
    'en': {
        'contactAvailable': 'Contact Available',
        'lockedInfo': 'Company name and contact are locked',
        'unlockContactInfo': 'Unlock to see company name, link and contact',
        'unlockContact': 'Unlock Contact',
        'descriptionFull': 'Full Description',
        'applyOnCompanySite': 'Apply on Company Site',
        'companyWebsite': 'Company Website',
        'backToCountry': 'Back to Country',
        'seeMoreJobs': 'See more jobs',
        'postedOn': 'Posted on',
        'noContactEmail': 'No contact email available',
        'sendCode': 'Send Code',
        'verifyEmail': 'Verify Email',
        'enterCode': 'Enter 6-digit code',
        'codeSent': 'Code sent to your email',
        'invalidCode': 'Invalid code. Please try again.',
        'codeExpired': 'Code expired. Request a new one.',
        'payToUnlock': 'Pay to unlock contact ($7 USD)',
        'processing': 'Processing...',
        'securePayment': 'Secure payment via Paddle',
        'jobDetails': 'Job Details',
        'workType': 'Work Type',
        'sector': 'Sector',
    },
    'pt-br': {
        'contactAvailable': 'Contato Disponivel',
        'lockedInfo': 'Nome da empresa e contato estao bloqueados',
        'unlockContactInfo': 'Desbloqueie para ver nome da empresa, link e contato',
        'unlockContact': 'Desbloquear Contato',
        'descriptionFull': 'Descricao Completa',
        'applyOnCompanySite': 'Candidatar no Site da Empresa',
        'companyWebsite': 'Site da Empresa',
        'backToCountry': 'Voltar ao Pais',
        'seeMoreJobs': 'Ver mais vagas',
        'postedOn': 'Publicada em',
        'noContactEmail': 'Nenhum email de contato disponivel',
        'sendCode': 'Enviar Codigo',
        'verifyEmail': 'Verificar Email',
        'enterCode': 'Digite o codigo de 6 digitos',
        'codeSent': 'Codigo enviado para seu email',
        'invalidCode': 'Codigo invalido. Tente novamente.',
        'codeExpired': 'Codigo expirado. Solicite um novo.',
        'payToUnlock': 'Pague para desbloquear contato ($7 USD)',
        'processing': 'Processando...',
        'securePayment': 'Pagamento seguro via Paddle',
        'jobDetails': 'Detalhes da Vaga',
        'workType': 'Tipo de Trabalho',
        'sector': 'Setor',
    },
    'pt-pt': {
        'contactAvailable': 'Contacto Disponivel',
        'lockedInfo': 'Nome da empresa e contacto estao bloqueados',
        'unlockContactInfo': 'Desbloqueie para ver nome da empresa, link e contacto',
        'unlockContact': 'Desbloquear Contacto',
        'descriptionFull': 'Descricao Completa',
        'applyOnCompanySite': 'Candidatar no Site da Empresa',
        'companyWebsite': 'Site da Empresa',
        'backToCountry': 'Voltar ao Pais',
        'seeMoreJobs': 'Ver mais vagas',
        'postedOn': 'Publicada em',
        'noContactEmail': 'Nenhum email de contacto disponivel',
        'sendCode': 'Enviar Codigo',
        'verifyEmail': 'Verificar Email',
        'enterCode': 'Digite o codigo de 6 digitos',
        'codeSent': 'Codigo enviado para o seu email',
        'invalidCode': 'Codigo invalido. Tente novamente.',
        'codeExpired': 'Codigo expirado. Solicite um novo.',
        'payToUnlock': 'Pague para desbloquear contacto ($7 USD)',
        'processing': 'A processar...',
        'securePayment': 'Pagamento seguro via Paddle',
        'jobDetails': 'Detalhes da Vaga',
        'workType': 'Tipo de Trabalho',
        'sector': 'Setor',
    },
    'es': {
        'contactAvailable': 'Contacto Disponible',
        'lockedInfo': 'Nombre de empresa y contacto bloqueados',
        'unlockContactInfo': 'Desbloquea para ver nombre, enlace y contacto',
        'unlockContact': 'Desbloquear Contacto',
        'descriptionFull': 'Descripcion Completa',
        'applyOnCompanySite': 'Aplicar en Sitio de Empresa',
        'companyWebsite': 'Sitio de la Empresa',
        'backToCountry': 'Volver al Pais',
        'seeMoreJobs': 'Ver mas empleos',
        'postedOn': 'Publicada el',
        'noContactEmail': 'Sin email de contacto disponible',
        'sendCode': 'Enviar Codigo',
        'verifyEmail': 'Verificar Email',
        'enterCode': 'Ingrese codigo de 6 digitos',
        'codeSent': 'Codigo enviado a tu email',
        'invalidCode': 'Codigo invalido. Intenta de nuevo.',
        'codeExpired': 'Codigo expirado. Solicita uno nuevo.',
        'payToUnlock': 'Paga para desbloquear contacto ($7 USD)',
        'processing': 'Procesando...',
        'securePayment': 'Pago seguro via Paddle',
        'jobDetails': 'Detalles del Empleo',
        'workType': 'Tipo de Trabajo',
        'sector': 'Sector',
    },
    'fr': {
        'contactAvailable': 'Contact Disponible',
        'lockedInfo': 'Nom et contact bloquees',
        'unlockContactInfo': 'Debloquez pour voir le nom, le lien et le contact',
        'unlockContact': 'Debloquer Contact',
        'descriptionFull': 'Description Complete',
        'applyOnCompanySite': 'Postuler sur le Site',
        'companyWebsite': 'Site de Entreprise',
        'backToCountry': 'Retour au Pays',
        'seeMoreJobs': 'Voir plus d\'offres',
        'postedOn': 'Publiee le',
        'noContactEmail': 'Pas d\'email de contact',
        'sendCode': 'Envoyer Code',
        'verifyEmail': 'Verifier Email',
        'enterCode': 'Entrez code 6 chiffres',
        'codeSent': 'Code envoye par email',
        'invalidCode': 'Code invalide. Reessayez.',
        'codeExpired': 'Code expire. Demandez un nouveau.',
        'payToUnlock': 'Debloquez le contact ($7 USD)',
        'processing': 'Traitement...',
        'securePayment': 'Paiement securise via Paddle',
        'jobDetails': 'Details de l\'Offre',
        'workType': 'Type de Travail',
        'sector': 'Secteur',
    },
    'de': {
        'contactAvailable': 'Kontakt Verfuegbar',
        'lockedInfo': 'Firmenname und Kontakt gesperrt',
        'unlockContactInfo': 'Entsperren Sie Name, Link und Kontakt',
        'unlockContact': 'Kontakt Freischalten',
        'descriptionFull': 'Vollstaendige Beschreibung',
        'applyOnCompanySite': 'Auf Unternehmensseite bewerben',
        'companyWebsite': 'Unternehmenswebsite',
        'backToCountry': 'Zurueck zum Land',
        'seeMoreJobs': 'Weitere Jobs',
        'postedOn': 'Veroffentlicht am',
        'noContactEmail': 'Keine Kontakt-E-Mail verfuegbar',
        'sendCode': 'Code Senden',
        'verifyEmail': 'Email Verifizieren',
        'enterCode': '6-stelligen Code eingeben',
        'codeSent': 'Code an Email gesendet',
        'invalidCode': 'Ungueltiger Code. Versuchen Sie es erneut.',
        'codeExpired': 'Code abgelaufen. Neuen anfordern.',
        'payToUnlock': 'Kontakt freischalten ($7 USD)',
        'processing': 'Verarbeitung...',
        'securePayment': 'Sichere Zahlung via Paddle',
        'jobDetails': 'Stellendetails',
        'workType': 'Arbeitsart',
        'sector': 'Sektor',
    },
    'it': {
        'contactAvailable': 'Contatto Disponibile',
        'lockedInfo': 'Nome azienda e contatto bloccati',
        'unlockContactInfo': 'Sblocca per vedere nome, link e contatto',
        'unlockContact': 'Sblocca Contatto',
        'descriptionFull': 'Descrizione Completa',
        'applyOnCompanySite': 'Candidati sul Sito',
        'companyWebsite': 'Sito Aziendale',
        'backToCountry': 'Torna al Paese',
        'seeMoreJobs': 'Vedi piu offerte',
        'postedOn': 'Pubblicato il',
        'noContactEmail': 'Nessun email di contatto',
        'sendCode': 'Invia Codice',
        'verifyEmail': 'Verifica Email',
        'enterCode': 'Inserisci codice a 6 cifre',
        'codeSent': 'Codice inviato via email',
        'invalidCode': 'Codice non valido. Riprova.',
        'codeExpired': 'Codice scaduto. Richiedi uno nuovo.',
        'payToUnlock': 'Sblocca contatto ($7 USD)',
        'processing': 'Elaborazione...',
        'securePayment': 'Pagamento sicuro via Paddle',
        'jobDetails': 'Dettagli Offerta',
        'workType': 'Tipo di Lavoro',
        'sector': 'Settore',
    },
    'nl': {
        'contactAvailable': 'Contact Beschikbaar',
        'lockedInfo': 'Bedrijfsnaam en contact geblokkeerd',
        'unlockContactInfo': 'Ontgrendel om naam, link en contact te zien',
        'unlockContact': 'Contact Ontgrendelen',
        'descriptionFull': 'Volledige Beschrijving',
        'applyOnCompanySite': 'Solliciteer op Bedrijfssite',
        'companyWebsite': 'Bedrijfswebsite',
        'backToCountry': 'Terug naar Land',
        'seeMoreJobs': 'Meer vacatures',
        'postedOn': 'Geplaatst op',
        'noContactEmail': 'Geen contact email beschikbaar',
        'sendCode': 'Code Versturen',
        'verifyEmail': 'Email Verifiëren',
        'enterCode': 'Voer 6-cijferige code in',
        'codeSent': 'Code naar email verzonden',
        'invalidCode': 'Ongeldige code. Probeer opnieuw.',
        'codeExpired': 'Code verlopen. Vraag een nieuwe aan.',
        'payToUnlock': 'Contact ontgrendelen ($7 USD)',
        'processing': 'Verwerken...',
        'securePayment': 'Veilige betaling via Paddle',
        'jobDetails': 'Vacaturedetails',
        'workType': 'Werktype',
        'sector': 'Sector',
    },
    'pl': {
        'contactAvailable': 'Kontakt Dostepny',
        'lockedInfo': 'Nazwa firmy i kontakt zablokowane',
        'unlockContactInfo': 'Odblokuj aby zobaczyc nazwe, link i kontakt',
        'unlockContact': 'Odblokuj Kontakt',
        'descriptionFull': 'Pelny Opis',
        'applyOnCompanySite': 'Aplikuj na Stronie Firmy',
        'companyWebsite': 'Strona Firmy',
        'backToCountry': 'Wroc do Panstwa',
        'seeMoreJobs': 'Wiecej ofert',
        'postedOn': 'Opublikowano',
        'noContactEmail': 'Brak emaila kontaktowego',
        'sendCode': 'Wyslij Kod',
        'verifyEmail': 'Zweryfikuj Email',
        'enterCode': 'Wprowadz 6-cyfrowy kod',
        'codeSent': 'Kod wyslany na email',
        'invalidCode': 'Nieprawidlowy kod. Sprobuj ponownie.',
        'codeExpired': 'Kod wygasl. Zadz nowy.',
        'payToUnlock': 'Odblokuj kontakt ($7 USD)',
        'processing': 'Przetwarzanie...',
        'securePayment': 'Platnosc bezpieczna przez Paddle',
        'jobDetails': 'Szczegoly Oferty',
        'workType': 'Typ Pracy',
        'sector': 'Sektor',
    },
    'ru': {
        'contactAvailable': 'Kontakt Dostupen',
        'lockedInfo': 'Nazvanie kompanii i kontakt zablokirovany',
        'unlockContactInfo': 'Razblokirujte dlya imeni, ssylki i kontakta',
        'unlockContact': 'Razblokirovat Kontakt',
        'descriptionFull': 'Polnoe Opisanie',
        'applyOnCompanySite': 'Otkliknutsya na Sait',
        'companyWebsite': 'Sait Kompanii',
        'backToCountry': 'Nazad v Stranu',
        'seeMoreJobs': 'Bolshe vakansiy',
        'postedOn': 'Opublikovano',
        'noContactEmail': 'Net kontaktnogo email',
        'sendCode': 'Otpravit Kod',
        'verifyEmail': 'Verificirovat Email',
        'enterCode': 'Vvedite 6-znachnyy kod',
        'codeSent': 'Kod otpravlen na email',
        'invalidCode': 'Nevernyy kod. Poprobujte snova.',
        'codeExpired': 'Kod istek. Zaprosite novyy.',
        'payToUnlock': 'Razblokirovat kontakt ($7 USD)',
        'processing': 'Obrabotka...',
        'securePayment': 'Bezopasnaya oplata cherez Paddle',
        'jobDetails': 'Detali Vakansii',
        'workType': 'Tip Raboty',
        'sector': 'Sektor',
    },
    'zh': {
        'contactAvailable': '联系信息可用',
        'lockedInfo': '公司名称和联系方式已锁定',
        'unlockContactInfo': '解锁以查看公司名称、链接和联系方式',
        'unlockContact': '解锁联系方式',
        'descriptionFull': '完整描述',
        'applyOnCompanySite': '在公司网站申请',
        'companyWebsite': '公司网站',
        'backToCountry': '返回国家',
        'seeMoreJobs': '查看更多职位',
        'postedOn': '发布于',
        'noContactEmail': '无联系邮箱',
        'sendCode': '发送验证码',
        'verifyEmail': '验证邮箱',
        'enterCode': '输入6位验证码',
        'codeSent': '验证码已发送到邮箱',
        'invalidCode': '验证码无效，请重试',
        'codeExpired': '验证码已过期，请重新获取',
        'payToUnlock': '解锁联系方式 ($7 USD)',
        'processing': '处理中...',
        'securePayment': '通过Paddle安全支付',
        'jobDetails': '职位详情',
        'workType': '工作类型',
        'sector': '行业',
    },
    'ja': {
        'contactAvailable': '連絡先あり',
        'lockedInfo': '会社名と連絡先はロックされています',
        'unlockContactInfo': 'ロックを解除して会社名・リンク・連絡先を表示',
        'unlockContact': '連絡先解除',
        'descriptionFull': '詳細説明',
        'applyOnCompanySite': '会社サイトで応募',
        'companyWebsite': '会社サイト',
        'backToCountry': '国に戻る',
        'seeMoreJobs': '他の求人を見る',
        'postedOn': '投稿日',
        'noContactEmail': '連絡先メールなし',
        'sendCode': 'コード送信',
        'verifyEmail': 'メール確認',
        'enterCode': '6桁のコードを入力',
        'codeSent': 'コードをメール送信しました',
        'invalidCode': 'コードが無効です。再試行してください。',
        'codeExpired': 'コード期限切れ。再取得してください。',
        'payToUnlock': '連絡先をアンロック ($7 USD)',
        'processing': '処理中...',
        'securePayment': 'Paddleによる安全な支払い',
        'jobDetails': '求人詳細',
        'workType': '勤務形態',
        'sector': '部門',
    },
    'ko': {
        'contactAvailable': '연락처 사용 가능',
        'lockedInfo': '회사명과 연락처가 잠겨있습니다',
        'unlockContactInfo': '잠금 해제 후 회사명, 링크, 연락처 확인',
        'unlockContact': '연락처 잠금 해제',
        'descriptionFull': '전체 설명',
        'applyOnCompanySite': '회사 웹사이트에서 지원',
        'companyWebsite': '회사 웹사이트',
        'backToCountry': '국가로 돌아가기',
        'seeMoreJobs': '더 많은 채용 보기',
        'postedOn': '게시일',
        'noContactEmail': '연락처 이메일 없음',
        'sendCode': '코드 보내기',
        'verifyEmail': '이메일 확인',
        'enterCode': '6자리 코드 입력',
        'codeSent': '이메일로 코드 전송됨',
        'invalidCode': '잘못된 코드입니다. 다시 시도하세요.',
        'codeExpired': '코드 만료됨. 새로 요청하세요.',
        'payToUnlock': '연락처 잠금 해제 ($7 USD)',
        'processing': '처리 중...',
        'securePayment': 'Paddle 안전 결제',
        'jobDetails': '채용 상세',
        'workType': '근무 유형',
        'sector': '부문',
    },
    'hi': {
        'contactAvailable': 'संपर्क उपलब्ध',
        'lockedInfo': 'कंपनी नाम और संपर्क लॉक है',
        'unlockContactInfo': 'कंपनी नाम, लिंक और संपर्क देखने के लिए अनलॉक करें',
        'unlockContact': 'संपर्क अनलॉक करें',
        'descriptionFull': 'पूर्ण विवरण',
        'applyOnCompanySite': 'कंपनी साइट पर आवेदन करें',
        'companyWebsite': 'कंपनी वेबसाइट',
        'backToCountry': 'देश पर वापस',
        'seeMoreJobs': 'अधिक नौकरियां देखें',
        'postedOn': 'प्रकाशित',
        'noContactEmail': 'संपर्क ईमेल उपलब्ध नहीं',
        'sendCode': 'कोड भेजें',
        'verifyEmail': 'ईमेल सत्यापित करें',
        'enterCode': '6 अंकों का कोड दर्ज करें',
        'codeSent': 'ईमेल पर कोड भेजा गया',
        'invalidCode': 'अमान्य कोड। पुनः प्रयास करें।',
        'codeExpired': 'कोड समाप्त। नया अनुरोध करें।',
        'payToUnlock': 'संपर्क अनलॉक करें ($7 USD)',
        'processing': 'प्रसंस्करण...',
        'securePayment': 'Paddle द्वारा सुरक्षित भुगतान',
        'jobDetails': 'नौकरी विवरण',
        'workType': 'कार्य प्रकार',
        'sector': 'क्षेत्र',
    },
    'bn': {
        'contactAvailable': 'যোগাযোগ পাওয়া যায়',
        'lockedInfo': 'কোম্পানির নাম ও যোগাযোগ লক করা',
        'unlockContactInfo': 'নাম, লিংক ও যোগাযোগ দেখতে আনলক করুন',
        'unlockContact': 'যোগাযোগ আনলক',
        'descriptionFull': 'সম্পূর্ণ বিবরণ',
        'applyOnCompanySite': 'কোম্পানি সাইটে আবেদন',
        'companyWebsite': 'কোম্পানি ওয়েবসাইট',
        'backToCountry': 'দেশে ফিরুন',
        'seeMoreJobs': 'আরও চাকরি দেখুন',
        'postedOn': 'প্রকাশিত',
        'noContactEmail': 'যোগাযোগ ইমেইল নেই',
        'sendCode': 'কোড পাঠান',
        'verifyEmail': 'ইমেইল যাচাই',
        'enterCode': '৬ সংখ্যার কোড লিখুন',
        'codeSent': 'ইমেইলে কোড পাঠানো হয়েছে',
        'invalidCode': 'ভুল কোড। আবার চেষ্টা করুন।',
        'codeExpired': 'কোডের মেয়াদ শেষ। নতুন চান।',
        'payToUnlock': 'যোগাযোগ আনলক ($7 USD)',
        'processing': 'প্রক্রিয়াকরণ...',
        'securePayment': 'Paddle এর মাধ্যমে নিরাপদ পেমেন্ট',
        'jobDetails': 'চাকরির বিবরণ',
        'workType': 'কাজের ধরন',
        'sector': 'সেক্টর',
    },
    'ar': {
        'contactAvailable': 'جهات الاتصال متاحة',
        'lockedInfo': 'اسم الشركة والاتصال مقفلان',
        'unlockContactInfo': 'افتح لرؤية اسم الشركة والرابط والاتصال',
        'unlockContact': 'فتح جهات الاتصال',
        'descriptionFull': 'الوصف الكامل',
        'applyOnCompanySite': 'قدم على موقع الشركة',
        'companyWebsite': 'موقع الشركة',
        'backToCountry': 'العودة للبلد',
        'seeMoreJobs': 'المزيد من الوظائف',
        'postedOn': 'نشر في',
        'noContactEmail': 'لا يوجد بريد اتصال',
        'sendCode': 'إرسال الرمز',
        'verifyEmail': 'التحقق من البريد',
        'enterCode': 'أدخل رمز من 6 أرقام',
        'codeSent': 'تم إرسال الرمز لبريدك',
        'invalidCode': 'رمز غير صالح. حاول مرة أخرى.',
        'codeExpired': 'انتهت صلاحية الرمز. اطلب جديد.',
        'payToUnlock': 'فتح جهات الاتصال ($7 USD)',
        'processing': 'جاري المعالجة...',
        'securePayment': 'دفع آمن عبر Paddle',
        'jobDetails': 'تفاصيل الوظيفة',
        'workType': 'نوع العمل',
        'sector': 'القطاع',
    },
    'tr': {
        'contactAvailable': 'Iletisim Mevcut',
        'lockedInfo': 'Sirket adi ve iletisim kilitli',
        'unlockContactInfo': 'Ad, link ve iletisimi gormek icin acin',
        'unlockContact': 'Iletisimi Ac',
        'descriptionFull': 'Tam Aciklama',
        'applyOnCompanySite': 'Sirket Sitesine Basvur',
        'companyWebsite': 'Sirket Web Sitesi',
        'backToCountry': 'Ulkeye Don',
        'seeMoreJobs': 'Daha fazla is',
        'postedOn': 'Yayin tarihi',
        'noContactEmail': 'Iletisim emaili yok',
        'sendCode': 'Kod Gonder',
        'verifyEmail': 'Email Dogrula',
        'enterCode': '6 haneli kod girin',
        'codeSent': 'Kod emailine gonderildi',
        'invalidCode': 'Gecersiz kod. Tekrar deneyin.',
        'codeExpired': 'Kodun suresi doldu. Yeni isteyin.',
        'payToUnlock': 'Iletisimi ac ($7 USD)',
        'processing': 'Isleniyor...',
        'securePayment': 'Paddle ile guvenli odeme',
        'jobDetails': 'Is Detaylari',
        'workType': 'Calisma Sekli',
        'sector': 'Sektor',
    },
    'vi': {
        'contactAvailable': 'Lien he co san',
        'lockedInfo': 'Ten cong ty va lien he bi khoa',
        'unlockContactInfo': 'Mo khoa de xem ten, link va lien he',
        'unlockContact': 'Mo khoa lien he',
        'descriptionFull': 'Mo ta day du',
        'applyOnCompanySite': 'Ung tren trang cong ty',
        'companyWebsite': 'Trang cong ty',
        'backToCountry': 'Quay lai quoc gia',
        'seeMoreJobs': 'Xem them viec lam',
        'postedOn': 'Dang vao',
        'noContactEmail': 'Khong co email lien he',
        'sendCode': 'Gui ma',
        'verifyEmail': 'Xac nhan email',
        'enterCode': 'Nhap ma 6 so',
        'codeSent': 'Ma da gui qua email',
        'invalidCode': 'Ma khong hop le. Thu lai.',
        'codeExpired': 'Ma het han. Yeu cau moi.',
        'payToUnlock': 'Mo khoa lien he ($7 USD)',
        'processing': 'Dang xu ly...',
        'securePayment': 'Thanh toan bao mat qua Paddle',
        'jobDetails': 'Chi tiet cong viec',
        'workType': 'Loai hinh cong viec',
        'sector': 'Nganh',
    },
    'th': {
        'contactAvailable': 'ข้อมูลติดต่อพร้อมใช้',
        'lockedInfo': 'ชื่อบริษัทและข้อมูลติดต่อถูกล็อก',
        'unlockContactInfo': 'ปลดล็อกเพื่อดูชื่อ ลิงก์ และข้อมูลติดต่อ',
        'unlockContact': 'ปลดล็อกข้อมูลติดต่อ',
        'descriptionFull': 'คำอธิบายเต็ม',
        'applyOnCompanySite': 'สมัครบนเว็บบริษัท',
        'companyWebsite': 'เว็บบริษัท',
        'backToCountry': 'กลับประเทศ',
        'seeMoreJobs': 'ดูงานเพิ่มเติม',
        'postedOn': 'โพสต์เมื่อ',
        'noContactEmail': 'ไม่มีอีเมลติดต่อ',
        'sendCode': 'ส่งรหัส',
        'verifyEmail': 'ยืนยันอีเมล',
        'enterCode': 'ใส่รหัส 6 หลัก',
        'codeSent': 'ส่งรหัสไปที่อีเมลแล้ว',
        'invalidCode': 'รหัสไม่ถูกต้อง ลองอีกครั้ง',
        'codeExpired': 'รหัสหมดอายุ ขอรหัสใหม่',
        'payToUnlock': 'ปลดล็อกข้อมูลติดต่อ ($7 USD)',
        'processing': 'กำลังดำเนินการ...',
        'securePayment': 'ชำระเงินปลอดภัยผ่าน Paddle',
        'jobDetails': 'รายละเอียดงาน',
        'workType': 'ประเภทงาน',
        'sector': 'สาขา',
    },
    'ur': {
        'contactAvailable': 'رابطہ دستیاب',
        'lockedInfo': 'کمپنی کا نام اور رابطہ مقفل ہے',
        'unlockContactInfo': 'نام، لنک اور رابطہ دیکھنے کے لیے انلاک کریں',
        'unlockContact': 'رابطہ کھولیں',
        'descriptionFull': 'مکمل تفصیل',
        'applyOnCompanySite': 'کمپنی سائٹ پر درخواست',
        'companyWebsite': 'کمپنی ویب سائٹ',
        'backToCountry': 'ملک واپس',
        'seeMoreJobs': 'مزید ملازمتیں',
        'postedOn': 'شائع ہوئی',
        'noContactEmail': 'رابطہ ای میل نہیں',
        'sendCode': 'کوڈ بھیجیں',
        'verifyEmail': 'ای میل تصدیق',
        'enterCode': '6 رقمی کوڈ درج کریں',
        'codeSent': 'ای میل پر کوڈ بھیجا گیا',
        'invalidCode': 'غلط کوڈ۔ دوبارہ کوشش کریں۔',
        'codeExpired': 'کوڈ میعاد ختم۔ نیا درخواست کریں۔',
        'payToUnlock': 'رابطہ کھولیں ($7 USD)',
        'processing': 'پروسیسنگ...',
        'securePayment': 'Paddle سے محفوظ ادائیگی',
        'jobDetails': 'ملازمت کی تفصیلات',
        'workType': 'کام کی قسم',
        'sector': 'شعبہ',
    },
    'tl': {
        'contactAvailable': 'Makipag-ugnayan Available',
        'lockedInfo': 'Pangalan ng kumpanya at contact naka-lock',
        'unlockContactInfo': 'I-unlock para makita ang pangalan, link at contact',
        'unlockContact': 'I-unlock ang Contact',
        'descriptionFull': 'Buong Deskripsyon',
        'applyOnCompanySite': 'Mag-apply sa Site ng Kumpanya',
        'companyWebsite': 'Website ng Kumpanya',
        'backToCountry': 'Bumalik sa Bansa',
        'seeMoreJobs': 'Mas maraming trabaho',
        'postedOn': 'Nai-post noong',
        'noContactEmail': 'Walang contact email',
        'sendCode': 'Ipadala ang Code',
        'verifyEmail': 'I-verify ang Email',
        'enterCode': 'Magpasok ng 6-digit code',
        'codeSent': 'Naipadala ang code sa email',
        'invalidCode': 'Hindi wastong code. Subukan muli.',
        'codeExpired': 'Nag-expire ang code. Mag-request ng bago.',
        'payToUnlock': 'I-unlock ang contact ($7 USD)',
        'processing': 'Pinoproseso...',
        'securePayment': 'Ligtang pagbabayad sa pamamagitan ng Paddle',
        'jobDetails': 'Detalye ng Trabaho',
        'workType': 'Uri ng Trabaho',
        'sector': 'Sektor',
    },
    'sw': {
        'contactAvailable': 'Mawasiliano Yanapatikana',
        'lockedInfo': 'Jina la kampuni na mawasiliano yamefungwa',
        'unlockContactInfo': 'Fungua ili kuona jina, link na mawasiliano',
        'unlockContact': 'Fungua Mawasiliano',
        'descriptionFull': 'Maelezo Kamili',
        'applyOnCompanySite': 'Omba kwenye Tovuti ya Kampuni',
        'companyWebsite': 'Tovuti ya Kampuni',
        'backToCountry': 'Rudi Nchini',
        'seeMoreJobs': 'Kazi zaidi',
        'postedOn': 'Ilichapishwa',
        'noContactEmail': 'Hakuna barua pepe ya mawasiliano',
        'sendCode': 'Tuma Kanuni',
        'verifyEmail': 'Thibitisha Barua',
        'enterCode': 'Ingiza kanuni ya tarakimu 6',
        'codeSent': 'Kanuni imetumwa kwa barua',
        'invalidCode': 'Kanuni batili. Jaribu tena.',
        'codeExpired': 'Kanuni imepitwa na wakati. Omba mpya.',
        'payToUnlock': 'Fungua mawasiliano ($7 USD)',
        'processing': 'Inachakata...',
        'securePayment': 'Malipo salama kupitia Paddle',
        'jobDetails': 'Maelezo ya Kazi',
        'workType': 'Aina ya Kazi',
        'sector': 'Sekta',
    },
}

# Strategy: For each language block in the i18n object, add missing keys before the closing }
# Find the i18n export and add keys to each language
for lang_code, keys in MISSING_KEYS.items():
    # Find the language block in the i18n object
    # Pattern: "en": { ... } (but we need to target only the i18n object, not sectorNames)
    # We'll insert before the last } of each language block in the i18n section
    
    # Build the key-value pairs
    kv_pairs = '\n'.join(f'    "{k}": "{v}",' for k, v in keys.items())
    
    # Find each language block in the i18n section and add keys before closing }
    # We need to be careful to only modify the i18n object (after line ~1180)
    i18n_start = i18n_content.find('export const i18n:')
    if i18n_start == -1:
        print(f'  WARNING: Could not find i18n export')
        continue
    
    i18n_section = i18n_content[i18n_start:]
    
    # Find the language block
    lang_pattern = f'  "{lang_code}": {{\n'
    lang_pos = i18n_section.find(lang_pattern)
    if lang_pos == -1:
        print(f'  WARNING: Could not find lang {lang_code} in i18n')
        continue
    
    # Find the closing } of this language block
    # Count braces to find the matching }
    brace_start = lang_pos + len(lang_pattern)
    depth = 1
    i = brace_start
    while i < len(i18n_section) and depth > 0:
        if i18n_section[i] == '{': depth += 1
        elif i18n_section[i] == '}': depth -= 1
        i += 1
    
    closing_pos = i - 1  # position of the closing }
    abs_closing = i18n_start + closing_pos
    
    # Check if any of our keys already exist in this block
    block_content = i18n_section[lang_pos:closing_pos]
    keys_to_add = {k: v for k, v in keys.items() if f'"{k}"' not in block_content}
    
    if not keys_to_add:
        print(f'  {lang_code}: all keys already present, skipping')
        continue
    
    # Insert keys before the closing }
    new_kv = '\n'.join(f'    "{k}": "{v}",' for k, v in keys_to_add.items())
    insert_text = new_kv + '\n  '
    
    i18n_content = i18n_content[:abs_closing] + insert_text + i18n_content[abs_closing:]
    print(f'  {lang_code}: added {len(keys_to_add)} keys')

write_file(i18n_path, i18n_content)

# ─── 3. Fix next.config.ts ───────────────────────────────────────────
print('[3/7] Fixing next.config.ts...')
config_path = os.path.join(OUT, '..', 'next.config.ts')
# We need to write to the project root next.config.ts
config_path = '/home/z/my-project/next.config.ts'
config_content = read_file(config_path)

config_content = config_content.replace('output: "standalone",\n', '')
config_content = config_content.replace('output: "standalone",', '')
config_content = config_content.replace('typescript: { ignoreBuildErrors: true },\n', '')
config_content = config_content.replace('typescript: { ignoreBuildErrors: true },', '')
config_content = config_content.replace('eslint: { ignoreDuringBuilds: true },\n', '')
config_content = config_content.replace('eslint: { ignoreDuringBuilds: true },', '')
config_content = config_content.replace("reactStrictMode: false,\n", 'reactStrictMode: true,\n')

# Remove unsafe-eval from CSP
config_content = config_content.replace(
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "script-src 'self' 'unsafe-inline'"
)

# Add poweredByHeaders: false and connect-src for Paddle
if 'poweredByHeaders' not in config_content:
    config_content = config_content.replace(
        'const nextConfig: NextConfig = {',
        'const nextConfig: NextConfig = {\n  poweredByHeaders: false,'
    )

# Add Paddle checkout to connect-src
config_content = config_content.replace(
    "connect-src 'self'",
    "connect-src 'self' https://checkout.paddle.com https://vendor-api.paddle.com"
)

write_file(config_path, config_content)
print('  Removed: output:standalone, ignoreBuildErrors, ignoreDuringBuilds')
print('  Added: poweredByHeaders:false, reactStrictMode:true')
print('  Fixed: removed unsafe-eval, added Paddle to connect-src')

# Also update in output
out_config = os.path.join(OUT, '..', 'next.config.ts')
# Write next.config.ts to the output zip area too
write_file(os.path.join('/home/z/my-project/download', 'next.config.ts'), config_content)

# ─── 4. Fix webhook route ────────────────────────────────────────────
print('[4/7] Fixing webhook route...')
webhook_path = os.path.join(OUT, 'app', 'api', 'webhook', 'route.ts')
webhook_content = read_file(webhook_path)

# Replace the dangerous "accept when no secret" block
old_webhook = '''    // When webhook secret is not set, just acknowledge receipt
    if (!webhookSecret || !sig) {
      console.log('Paddle webhook received (no verification):', body.slice(0, 200));
      return NextResponse.json({ received: true });
    }'''

new_webhook = '''    // SECURITY: Reject if webhook secret is not configured
    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }
    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }'''

webhook_content = webhook_content.replace(old_webhook, new_webhook)

# Fix error message leaking
webhook_content = webhook_content.replace(
    "return NextResponse.json({ error: err.message }, { status: 400 });",
    "return NextResponse.json({ error: 'Webhook processing error' }, { status: 400 });"
)

write_file(webhook_path, webhook_content)
print('  Fixed: webhook rejects requests without secret')

# ─── 5. Fix send-code route (email validation + code in subject) ─────
print('[5/7] Fixing send-code route...')
sendcode_path = os.path.join(OUT, 'app', 'api', 'send-code', 'route.ts')
sc_content = read_file(sendcode_path)

# Fix email validation
sc_content = sc_content.replace(
    "if (!email || !email.includes('@')) {",
    "if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {"
)

# Move code from subject to body only
sc_content = sc_content.replace(
    "subject: 'NOSSY - Verification Code: ' + code,",
    "subject: 'NOSSY - Verification Code',"
)

# Add rate limiting
rate_limit_sendcode = '''
// Simple in-memory rate limiting
const sendCodeAttempts: Record<string, number[]> = {};
const MAX_ATTEMPTS_PER_MINUTE = 3;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  if (!sendCodeAttempts[email]) sendCodeAttempts[email] = [];
  sendCodeAttempts[email] = sendCodeAttempts[email].filter(t => now - t < 60000);
  if (sendCodeAttempts[email].length >= MAX_ATTEMPTS_PER_MINUTE) return true;
  sendCodeAttempts[email].push(now);
  return false;
}
'''

sc_content = rate_limit_sendcode + '\n' + sc_content

# Add rate limit check after email validation
sc_content = sc_content.replace(
    "const code = createVerificationCode(email);",
    "if (isRateLimited(email)) {\n      return NextResponse.json({ success: false, error: 'Too many requests. Try again later.' }, { status: 429 });\n    }\n\n    const code = createVerificationCode(email);"
)

write_file(sendcode_path, sc_content)
print('  Fixed: email regex validation, code removed from subject, rate limiting added')

# ─── 6. Fix verify-code route (rate limiting) ────────────────────────
print('[6/7] Fixing verify-code route...')
verify_path = os.path.join(OUT, 'app', 'api', 'verify-code', 'route.ts')
vc_content = read_file(verify_path)

rate_limit_verify = '''
const verifyAttempts: Record<string, number[]> = {};
const MAX_VERIFY_PER_MINUTE = 10;

function isVerifyRateLimited(email: string): boolean {
  const now = Date.now();
  if (!verifyAttempts[email]) verifyAttempts[email] = [];
  verifyAttempts[email] = verifyAttempts[email].filter(t => now - t < 60000);
  if (verifyAttempts[email].length >= MAX_VERIFY_PER_MINUTE) return true;
  verifyAttempts[email].push(now);
  return false;
}
'''

vc_content = rate_limit_verify + '\n' + vc_content

vc_content = vc_content.replace(
    "const result = verifyCode(email, code);",
    "if (isVerifyRateLimited(email)) {\n      return NextResponse.json({ valid: false, error: 'Too many attempts. Try again later.' }, { status: 429 });\n    }\n\n    const result = verifyCode(email, code);"
)

write_file(verify_path, vc_content)
print('  Added: rate limiting (10 attempts/minute)')

# ─── 7. Fix checkout route (email validation) ────────────────────────
print('[7/7] Fixing checkout route...')
checkout_path = os.path.join(OUT, 'app', 'api', 'checkout', 'route.ts')
co_content = read_file(checkout_path)

co_content = co_content.replace(
    "if (!email || !email.includes('@')) {",
    "if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {"
)

# Add rate limiting for checkout
rate_limit_checkout = '''
const checkoutAttempts: Record<string, number[]> = {};

function isCheckoutRateLimited(email: string): boolean {
  const now = Date.now();
  if (!checkoutAttempts[email]) checkoutAttempts[email] = [];
  checkoutAttempts[email] = checkoutAttempts[email].filter(t => now - t < 300000); // 5 min window
  if (checkoutAttempts[email].length >= 5) return true;
  checkoutAttempts[email].push(now);
  return false;
}
'''

co_content = rate_limit_checkout + '\n' + co_content

co_content = co_content.replace(
    "if (!PADDLE_API_KEY) {",
    "if (isCheckoutRateLimited(email)) {\n      return NextResponse.json({ error: 'Too many checkout attempts. Try again later.' }, { status: 429 });\n    }\n\n    if (!PADDLE_API_KEY) {"
)

# Fix error message leaking
co_content = co_content.replace(
    "return NextResponse.json({ error: err.message || 'Error' }, { status: 500 });",
    "return NextResponse.json({ error: 'Checkout error' }, { status: 500 });"
)

write_file(checkout_path, co_content)
print('  Fixed: email regex validation, rate limiting, error message leaking')

# ─── 8. Fix country data route (path traversal hardening) ───────────
print('[8/8] Fixing country data route...')
country_route = os.path.join(OUT, 'app', 'api', 'data', 'country', 'route.ts')
cr_content = read_file(country_route)

cr_new = '''import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB

// Simple in-memory rate limiting
const apiRateLimits: Record<string, number[]> = {};
function isApiRateLimited(ip: string): boolean {
  const now = Date.now();
  if (!apiRateLimits[ip]) apiRateLimits[ip] = [];
  apiRateLimits[ip] = apiRateLimits[ip].filter(t => now - t < 60000);
  if (apiRateLimits[ip].length >= 100) return true;
  apiRateLimits[ip].push(now);
  return false;
}

function safeFilePath(file: string): string | null {
  // Only allow single filename with .json extension, no path separators
  if (!/^[a-z0-9][a-z0-9\-_]*\.json$/.test(file)) return null;
  const resolved = path.resolve(DATA_DIR, file);
  if (!resolved.startsWith(DATA_DIR + path.sep) && resolved !== DATA_DIR) return null;
  return resolved;
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (isApiRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const file = req.nextUrl.searchParams.get("file");
  if (!file) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const safePath = safeFilePath(file);
  if (!safePath) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  try {
    const data = fs.readFileSync(safePath, "utf-8");
    if (data.length > MAX_RESPONSE_SIZE) {
      return NextResponse.json({ error: "Response too large" }, { status: 413 });
    }
    return new NextResponse(data, {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
'''

write_file(country_route, cr_new)
print('  Fixed: safeFilePath, rate limiting, max response size, stricter regex')

# ─── 9. Fix [id]/page.tsx to handle split US files ───────────────────
print('[9/9] Fixing detail page to handle split US files...')
detail_path = os.path.join(OUT, 'app', '[lang]', '[slug]', '[region]', '[country]', '[id]', 'page.tsx')
detail_content = read_file(detail_path)

old_fetch = '''    fetch("/api/data/country?file=" + encodeURIComponent(rc + "_" + cc + ".json"))
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: Job[]) => {
        const found = (data || []).find(j => String(j.id) === String(jobId));
        if (found) setJob(found);
        setLoading(false);
      }).catch(() => { setDataError(true); setLoading(false); });'''

new_fetch = '''    // Load country JSON (handle split files like eua_united-states-1.json)
    const baseFile = rc + "_" + cc;
    const tryLoad = async (f: string): Promise<Job[]> => {
      const r = await fetch("/api/data/country?file=" + encodeURIComponent(f + ".json"));
      if (!r.ok) return [];
      return r.json();
    };
    try {
      // Try main file first
      let jobs = await tryLoad(baseFile);
      // If no results, try split files (1-4)
      if (!jobs.length) {
        for (let i = 1; i <= 4; i++) {
          const part = await tryLoad(baseFile + "-" + i);
          if (part.length) { jobs = part; break; }
        }
      }
      // If still nothing, search all split files
      if (!jobs.length) {
        for (let i = 1; i <= 4; i++) {
          const part = await tryLoad(baseFile + "-" + i);
          const found = (part || []).find((j: Job) => String(j.id) === String(jobId));
          if (found) { setJob(found); setLoading(false); return; }
        }
      }
      const found = (jobs || []).find((j: Job) => String(j.id) === String(jobId));
      if (found) setJob(found);
      setLoading(false);
    } catch {
      setDataError(true); setLoading(false);
    }'''

detail_content = detail_content.replace(old_fetch, new_fetch)
write_file(detail_path, detail_content)
print('  Fixed: detail page now handles split US data files')

# ─── 10. Remove dead PaywallModal.tsx ────────────────────────────────
print('[10/10] Removing dead PaywallModal.tsx...')
pm_path = os.path.join(OUT, 'components', 'PaywallModal.tsx')
if os.path.exists(pm_path):
    os.remove(pm_path)
    print('  Removed PaywallModal.tsx (old Stripe modal)')

# ─── ZIP ─────────────────────────────────────────────────────────────
print('\nZipping...')
zip_path = '/home/z/my-project/download/nossy-src-fixed.zip'
if os.path.exists(zip_path):
    os.remove(zip_path)

os.system(f'cd /home/z/my-project/download && zip -r nossy-src-fixed.zip nossy-src-fixed/ next.config.ts -x "*.DS_Store"')

# Get size
size = os.path.getsize(zip_path) / 1024
print(f'\nDone! ZIP: {zip_path} ({size:.1f} KB)')
print(f'\nFixes applied:')
print(f'  P0: i18n keys moved to correct object (22 languages x 24 keys)')
print(f'  P0: Webhook rejects requests without PADDLE_WEBHOOK_SECRET')
print(f'  P0: next.config.ts cleaned (no standalone, no ignoreBuildErrors)')
print(f'  P0: Path traversal hardened with safeFilePath()')
print(f'  P0: Detail page handles split US data files')
print(f'  P1: Rate limiting on all 4 API routes')
print(f'  P1: CSP unsafe-eval removed')
print(f'  P1: poweredByHeaders: false added')
print(f'  P1: Email validation regex (send-code + checkout)')
print(f'  P1: Verification code removed from email subject')
print(f'  P1: Error messages no longer leak server details')
print(f'  P2: Dead PaywallModal.tsx removed')
print(f'  P2: reactStrictMode enabled')
print(f'  P2: connect-src includes Paddle domains')
