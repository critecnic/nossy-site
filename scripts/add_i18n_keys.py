#!/usr/bin/env python3
"""Add missing i18n keys to all language sections in i18n.ts"""

import re, sys

NEW_KEYS = {}
langs = ['en','pt-br','pt-pt','es','fr','de','it','nl','pl','ru','zh','ja','ko','hi','bn','ar','tr','vi','th','ur','tl','sw']

translations = {
'reload': ['Reload','Recarregar','Recarregar','Recargar','Recharger','Neu Laden','Ricarica','Herladen','Przeladuj','Perezagruzka','重新加载','再読み込み','새로 고침','पुनः लोड करें','পুনরায় লোড করুন','إعادة تحميل','Yeniden Yükle','Tải lại','โหลดใหม่','دوبارہ لوڈ کریں','I-reload','Pakia tena'],
'tryAdjustFilters': ['Try adjusting your filters','Tente ajustar seus filtros','Tente ajustar os seus filtros','Intente ajustar sus filtros','Essayez de modifier vos filtres','Versuchen Sie Ihre Filter anzupassen','Prova a modificare i filtri','Probeer uw filters aan te passen','Sprobuj zmienic filtry','Poprobujte izmenit filtry','请尝试调整筛选条件','フィルターを調整してください','필터를 조정해 보세요','अपने फ़िल्टर समायोजित करें','আপনার ফিল্টার সামঞ্জস্য করুন','حاول تعديل عوامل التصفية','Filtrelerinizi ayarlamayı deneyin','Thử điều chỉnh bộ lọc','ลองปรับตัวกรอง','اپنے فلٹر ایڈجسٹ کریں','Subukan baguhin ang mga filter','Jaribu kubadilisha vichujio'],
'language': ['Language','Idioma','Idioma','Idioma','Langue','Sprache','Lingua','Taal','Jezyk','Yazyk','语言','言語','언어','भाषा','ভাষা','اللغة','Dil','Ngon ngu','ภาษา','زبان','Wika','Lugha'],
'clearFilters': ['Clear Filters','Limpar Filtros','Limpar Filtros','Limpiar Filtros','Effacer les Filtres','Filter Löschen','Cancella Filtri','Filters Wissen','Wyczysc Filtry','Ochistit Filtry','清除筛选器','フィルターをクリア','필터 지우기','फ़िल्टर हटाएं','ফিল্টার মুছুন','مسح عوامل التصفية','Filtreleri Temizle','Xoa bo loc','ล้างตัวกรอง','فلٹر مٹائیں','I-clear ang mga Filter','Futa vichujio'],
'contactAvailable': ['Contact Available','Contato Disponivel','Contacto Disponivel','Contacto Disponible','Contact Disponible','Kontakt Verfuegbar','Contatto Disponibile','Contact Beschikbaar','Kontakt Dostepny','Kontakt Dostupen','联系信息可用','連絡先あり','연락처 사용 가능','संपर्क उपलब्ध','যোগাযোগ পাওয়া যায়','جهات الاتصال متاحة','İletişim Mevcut','Lien he co san','ข้อมูลติดต่อพร้อมใช้','رابطہ دستیاب','Makipag-ugnayan Available','Mawasiliano Yanapatikana'],
'unlockHere': ['Unlock Here','Desbloqueie Aqui','Desbloqueie Aqui','Desbloquear Aqui','Debloquer Ici','Hier Freischalten','Sblocca Qui','Hier Ontgrendelen','Odblokuj Tutaj','Razblokirovat Zdes','在此解锁','ここで解除','여기서 잠금 해제','यहां अनलॉक करें','এখানে আনলক করুন','افتح هنا','Burada Ac','Mo khoa tai day','ปลดล็อกที่นี่','یہاں کھولیں','I-unlock dito','Fungua hapa'],
'viewJob': ['View Job','Ver Vaga','Ver Vaga','Ver Empleo','Voir Offre','Job Anzeigen','Vedi Offerta','Vacature Bekijken','Zobacz Oferte','Smotret Vakansiyu','查看职位','求人を見る','채용 보기','नौकरी देखें','চাকরি দেখুন','عرض الوظيفة','İlani Gor','Xem Viec Lam','ดูงาน','نوکری دیکھیں','Tingnan ang Trabaho','Tazama Kazi'],
'companyWebsite': ['Company Website','Site da Empresa','Site da Empresa','Sitio de la Empresa','Site Entreprise','Unternehmenswebsite','Sito Aziendale','Bedrijfssite','Strona Firmy','Sayt Kompanii','公司网站','企業サイト','회사 웹사이트','कंपनी वेबसाइट','কোম্পানি ওয়েবসাইট','موقع الشركة','Şirket Web Sitesi','Trang web Cong ty','เว็บไซต์บริษัท','کمپنی ویب سائٹ','Website ng Kumpanya','Tovuti ya Kampuni'],
'backToCountry': ['Back to Country','Voltar ao Pais','Voltar ao Pais','Volver al Pais','Retour au Pays','Zurueck zum Land','Torna al Paese','Terug naar Land','Powrot do Kraju','Nazad k Strane','返回国家','国に戻る','국가로 돌아가기','देश पर वापस','দেশে ফিরুন','العودة للدولة','Ulkeye Don','Quay lai Quoc gia','กลับประเทศ','ملک واپس','Bumalik sa Bansa','Rudi Nchi'],
'unlockContactInfo': ['Unlock to see company name, link and contact','Desbloqueie para ver nome da empresa, link e contato','Desbloqueie para ver nome da empresa, link e contacto','Desbloquee para ver nombre, enlace y contacto','Debloquez pour voir le nom et le contact','Freischalten um Name und Kontakt zu sehen','Sblocca per vedere nome e contatto','Ontgrendel om naam en contact te zien','Odblokuj aby zobaczyc nazwe firme i kontakt','Razblokirujte chtoby uvidet nazvanie i kontakt','解锁查看公司名称、链接和联系信息','企業名・リンク・連絡先をアンロック','회사명, 링크, 연락처를 잠금 해제하세요','कंपनी नाम, लिंक और संपर्क देखने के लिए अनलॉक करें','কোম্পানির নাম, লিংক এবং যোগাযোগ দেখতে আনলক করুন','افتح لرؤية اسم الشركة والرابط جهة الاتصال','Şirket adını, bağlantıyı ve iletişimi görmek için açın','Mo khoa de xem ten cong ty, lien ket va lien he','ปลดล็อกเพื่อดูชื่อบริษัท ลิงก์และข้อมูลติดต่อ','کمپنی کا نام، لنک اور رابطہ دیکھنے کے لیے کھولیں','I-unlock para makita ang pangalan, link at contact','Fungua ili kuona jina la kampuni, kiungo na mawasiliano'],
'descriptionFull': ['Full Description','Descricao Completa','Descricao Completa','Descripcion Completa','Description Complete','Vollstandige Beschreibung','Descrizione Completa','Volledige Beschrijving','Pelny Opis','Polnoe Opisanie','完整描述','完全な説明','전체 설명','पूर्ण विवरण','সম্পূর্ণ বিবরণ','الوصف الكامل','Tam Aciklama','Mo ta day du','คำอธิบายเต็ม','مکمل تفصیل','Buong Deskripsyon','Maelezo Kamili'],
'applyOnCompanySite': ['Apply on Company Site','Candidatar no Site da Empresa','Candidatar no Site da Empresa','Aplicar en el Sitio de la Empresa','Postuler sur le Site','Auf Unternehmensseite Bewerben','Candidati sul Sito Aziendale','Solliciteer op Bedrijfssite','Aplikuj na Stronie Firmy','Otkliknutsya na Sayte Kompanii','在公司官网申请','企業サイトで応募','회사 웹사이트에서 지원','कंपनी की वेबसाइट पर आवेदन करें','কোম্পানির ওয়েবসাইটে আবেদন করুন','قدم على موقع الشركة','Şirket Sitesinde Basvur','Ung tuyen tren trang web Cong ty','สมัครผ่านเว็บไซต์บริษัท','کمپنی کی ویب سائٹ پر اپلائی کریں','Mag-apply sa Website ng Kumpanya','Omba kwenye Tovuti ya Kampuni'],
'lockedInfo': ['Company name and contact are locked','Nome da empresa e contato estao bloqueados','Nome da empresa e contacto estao bloqueados','Nombre y contacto estan bloqueados','Nom et contact sont bloques','Name und Kontakt sind gesperrt','Nome e contatto sono bloccati','Naam en contact zijn vergrendeld','Nazwa firmy i kontakt sa zablokowane','Nazvanie i kontakt zablokirovany','公司名称和联系信息已锁定','企業名と連絡先はロックされています','회사명과 연락처가 잠겨 있습니다','कंपनी का नाम और संपर्क लॉक है','কোম্পানির নাম এবং যোগাযোগ লক করা আছে','اسم الشركة وجهات الاتصال مقفلة','Şirket adı ve iletişim kilitli','Ten cong ty va lien he bi khoa','ชื่อบริษัทและข้อมูลติดต่อถูกล็อก','کمپنی کا نام اور رابطہ لاک ہے','Pangalan at contact ng kumpanya ay naka-lock','Jina la kampuni na mawasiliano yamesimbwa'],
'sendCode': ['Send Code','Enviar Codigo','Enviar Codigo','Enviar Codigo','Envoyer le Code','Code Senden','Invia Codice','Code Versturen','Wyslij Kod','Otpravit Kod','发送验证码','コードを送信','코드 전송','कोड भेजें','কোড পাঠান','إرسال الرمز','Kod Gonder','Gui Ma','ส่งรหัส','کوڈ بھیجیں','Ipadala ang Code','Tuma Code'],
'verifyEmail': ['Verify Email','Verificar Email','Verificar Email','Verificar Email','Verifier Email','E-Mail Verifizieren','Verifica Email','E-mail Verifiëren','Zweryfikuj Email','Proverit Email','验证邮箱','メール認証','이메일 확인','ईमेल सत्यापित करें','ইमেইল যাচাই করুন','تحقق من البريد','E-posta Dogrula','Xac Nhan Email','ยืนยันอีเมล','ای میل تصدیق','I-verify ang Email','Thibitisha Barua Pepe'],
'enterCode': ['Enter 6-digit code','Digite o codigo de 6 digitos','Digite o codigo de 6 digitos','Ingrese el codigo de 6 digitos','Entrez le code a 6 chiffres','Geben Sie den 6-stelligen Code ein','Inserisci il codice a 6 cifre','Voer 6-cijferige code in','Wpisz 6-cyfrowy kod','Vvedite 6-znachnyy kod','输入6位验证码','6桁のコードを入力','6자리 코드 입력','6 अंकों का कोड दर्ज करें','৬ অঙ্কের কোড লিখুন','أدخل الرمز المكون من 6 أرقام','6 haneli kodu girin','Nhap ma 6 chu so','ป้อนรหัส 6 หลัก','6 ہندسوں کا کوڈ درج کریں','Ilagay ang 6-digit na code','Ingiza nambari ya tarakimu 6'],
'codeSent': ['Code sent to your email','Codigo enviado para seu email','Codigo enviado para o seu email','Codigo enviado a su email','Code envoye par email','Code an Ihre E-Mail gesendet','Codice inviato alla tua email','Code naar uw e-mail verstuurd','Kod wyslany na email','Kod otpravlen na email','验证码已发送至您的邮箱','コードがメールに送信されました','이메일로 코드가 전송되었습니다','कोड आपके ईमेल पर भेज दिया गया','আপনার ইমেইলে কোড পাঠানো হয়েছে','تم إرسال الرمز إلى بريدك','Kod e-postanıza gonderildi','Ma da gui vao email cua ban','รหัสถูกส่งถึงอีเมลของคุณ','کوڈ آپ کے ای میل پر بھیج دیا گیا','Ang code ay naipadala sa iyong email','Code imetumwa kwenye barua pepe yako'],
'invalidCode': ['Invalid code. Please try again.','Codigo invalido. Tente novamente.','Codigo invalido. Tente novamente.','Codigo invalido. Intente de nuevo.','Code invalide. Reessayez.','Ungueltiger Code. Bitte erneut versuchen.','Codice non valido. Riprova.','Ongeldige code. Probeer opnieuw.','Nieprawidlowy kod. Sprobuj ponownie.','Nevernyy kod. Poprobuyte snova.','验证码无效，请重试。','コードが無効です。もう一度お試しください。','잘못된 코드입니다. 다시 시도하세요.','अमान्य कोड। कृपया पुनः प्रयास करें।','অবৈধ কোড। আবার চেষ্টা করুন।','رمز غير صالح. حاول مرة أخرى.','Gecersiz kod. Tekrar deneyin.','Ma khong hop le. Thu lai.','รหัสไม่ถูกต้อง กรุณาลองอีกครั้ง','غلط کوڈ۔ دوبارہ کوشش کریں۔','Hindi wastong code. Subukan muli.','Hai sahihi. Jaribu tena.'],
'codeExpired': ['Code expired. Request a new one.','Codigo expirado. Solicite um novo.','Codigo expirado. Solicite um novo.','Codigo expirado. Solicite uno nuevo.','Code expire. Demandez un nouveau.','Code abgelaufen. Fordern Sie einen neuen an.','Codice scaduto. Richiedine uno nuovo.','Code verlopen. Vraag een nieuwe aan.','Kod wygasl. Zadzost nowy.','Kod istek. Zaprosite novyy.','验证码已过期，请重新获取。','コードの有効期限が切れました。新しいものをリクエストしてください。','코드가 만료되었습니다. 새로 요청하세요.','कोड समाप्त हो गया। नया अनुरोध करें।','কোডের মেয়াদ উত্তীর্ণ হয়েছে। নতুনটি অনুরোধ করুন।','انتهت صلاحية الرمز. اطلب رمزا جديدا.','Kodun süresi doldu. Yeni bir tane isteyin.','Ma het han. Yeu cau moi.','รหัสหมดอายุ กรุณาร้องขอใหม่','کوڈ میعاد ختم ہو گیا۔ نیا درخواست کریں।','Nag-expire ang code. Humiling ng bago.','Code imekuwa muda. Omba mpya.'],
'payToUnlock': ['Pay to unlock contact ($7 USD)','Pague para desbloquear contato ($7 USD)','Pague para desbloquear contacto ($7 USD)','Pague para desbloquear contacto ($7 USD)','Payez pour debloquer le contact ($7 USD)','Freischalten ($7 USD)','Sblocca contatto ($7 USD)','Ontgrendel contact ($7 USD)','Odblokuj kontakt ($7 USD)','Oplatite razblokirovku ($7 USD)','支付解锁联系信息（$7 USD）','連絡先のアンロック（$7 USD）','연락처 잠금 해제（$7 USD）','संपर्क अनलॉक करें ($7 USD)','যোগাযোগ আনলক করুন ($7 USD)','ادفع لفتح جهات الاتصال ($7 USD)','İletişimi açmak için ödeyin ($7 USD)','Tra loi phi de mo khoa ($7 USD)','ชำระเงินเพื่อปลดล็อกข้อมูลติดต่อ ($7 USD)','رابطہ کھولنے کے لیے ادا کریں ($7 USD)','Magbayad para i-unlock ang contact ($7 USD)','Lipa kufungua mawasiliano ($7 USD)'],
'processing': ['Processing...','Processando...','A processar...','Procesando...','Traitement en cours...','Verarbeitung...','Elaborazione...','Verwerking...','Przetwarzanie...','Obrabotka...','处理中...','処理中...','처리 중...','प्रसंस्करण...','প্রক্রিয়াকরণ...','جاري المعالجة...','İşleniyor...','Dang xu ly...','กำลังประมวลผล...','پروسیسنگ...','Pinoproseso...','Inachoprocess...'],
'securePayment': ['Secure payment via Paddle','Pagamento seguro via Paddle','Pagamento seguro via Paddle','Pago seguro via Paddle','Paiement securise via Paddle','Sichere Zahlung via Paddle','Pagamento sicuro via Paddle','Veilige betaling via Paddle','Bezpieczna platnosc Paddle','Bezopasnaya oplata Paddle','通过 Paddle 安全支付','Paddle 安全支払','Paddle 안전 결제','Paddle के माध्यम से सुरक्षित भुगतान','Paddle এর মাধ্যমে নিরাপদ পেমেন্ট','دفع آمن عبر Paddle','Güvenli ödeme Paddle ile','Thanh toán bảo mật qua Paddle','ชำระเงินปลอดภัยผ่าน Paddle','Paddle کے ذریعے محفوظ ادائیگی','Ligtang bayad sa pamamagitan ng Paddle','Malipo salama kupitia Paddle'],
'jobDetails': ['Job Details','Detalhes da Vaga','Detalhes da Vaga','Detalles del Empleo','Details de l\'Offre','Jobdetails','Dettagli Offerta','Vacaturedetails','Szczegoly Oferty','Detali Vakansii','职位详情','求人詳細','채용 상세','नौकरी विवरण','চাকরির বিবরণ','تفاصيل الوظيفة','İlan Detayları','Chi tiet Viec Lam','รายละเอียดงาน','نوکری کی تفصیلات','Detalye ng Trabaho','Maelezo ya Kazi'],
'postedOn': ['Posted on','Publicada em','Publicada em','Publicado el','Publie le','Veroffentlicht am','Pubblicata il','Geplaatst op','Opublikowano','Opublikovano','发布于','投稿日','게시일','प्रकाशित','প্রকাশিত','نشر في','Yayın tarihi','Dang ngay','โพสต์เมื่อ','شائع شدہ','Nai-post noong','Iliyochapishwa'],
'workType': ['Work Type','Tipo de Trabalho','Tipo de Trabalho','Tipo de Trabajo','Type de Travail','Arbeitstyp','Tipo di Lavoro','Werktype','Typ Pracy','Tip Raboty','工作类型','勤務形態','근무 형태','कार्य प्रकार','কাজের ধরন','نوع العمل','Çalisma Türü','Loai hinh viec','ประเภทงาน','کام کی قسمت','Uri ng Trabaho','Aina ya Kazi'],
'sector': ['Sector','Setor','Setor','Sector','Secteur','Sektor','Settore','Sector','Sektor','Sektor','领域','領域','분야','क्षेत्र','খাত','القطاع','Sektor','Nganh','ภูมิภาค','شعبہ','Sektor','Sekta'],
'noContactEmail': ['No contact email available','Nenhum email de contato disponivel','Nenhum email de contacto disponivel','Sin email de contacto disponible','Pas d\'email de contact','Keine Kontakt-E-Mail verfuegbar','Nessun email di contatto','Geen contact-e-mail beschikbaar','Brak emaila kontaktowego','Net kontaktnogo emaila','无可用联系邮箱','連絡先メールなし','연락처 이메일 없음','संपर्क ईमेल उपलब्ध नहीं','যোগাযোগ ইমেইল নেই','لا يوجد بريد إلكتروني للاتصال','İletişim e-postası yok','Khong co email lien he','ไม่มีอีเมลติดต่อ','رابطہ ای میل دستیاب نہیں','Walang contact na email available','Hakuna barua pepe ya mawasiliano'],
}

for i, key in enumerate(translations):
    for j, lang in enumerate(langs):
        if lang not in NEW_KEYS:
            NEW_KEYS[lang] = {}
        NEW_KEYS[lang][key] = translations[key][j]

# Read the file
with open('/home/z/my-project/src/lib/i18n.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# For each language, find the closing brace of its i18n section and add keys before it
for lang_code in langs:
    keys = NEW_KEYS.get(lang_code, {})
    if not keys:
        continue
    
    # Find the pattern: `  "lang_code": {` ... last key entry ... `  },`
    # We need to insert before the closing `}` of the lang object
    # Strategy: find `"lang_code": {` then find the matching closing `}`
    
    # Find the start of this language's object
    search_start = f'  "{lang_code}": {{'
    idx = content.find(search_start)
    if idx == -1:
        print(f'WARNING: Language {lang_code} not found', file=sys.stderr)
        continue
    
    # Find the closing brace of this object
    brace_start = content.index('{', idx)
    depth = 0
    end_idx = brace_start
    for k in range(brace_start, len(content)):
        if content[k] == '{':
            depth += 1
        elif content[k] == '}':
            depth -= 1
            if depth == 0:
                end_idx = k
                break
    
    # Now find the last `"key": "value",` line before end_idx
    # Insert our new keys before the closing }
    # Find the position after the last entry (last comma)
    section = content[brace_start:end_idx]
    
    # Build the new entries
    new_entries = '\n'
    for key, value in keys.items():
        # Escape single quotes in value
        escaped = value.replace("'", "\\'")
        new_entries += f'    "{key}": "{escaped}",\n'
    
    # Insert before the closing }
    content = content[:end_idx] + new_entries + content[end_idx:]

# Write back
with open('/home/z/my-project/src/lib/i18n.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done! Added keys to all 22 languages.')
