#!/usr/bin/env python3
"""Add missing i18n keys to all language sections in i18n.ts"""

import re

FILE = "/home/z/my-project/src/lib/i18n.ts"

NEW_KEYS = {
    "en": {
        "invalidEmail": "Invalid email",
        "errorSendingCode": "Error sending code",
        "connectionError": "Connection error",
        "paymentError": "Payment error",
        "emailLabel": "Email",
    },
    "pt-br": {
        "invalidEmail": "Email invalido",
        "errorSendingCode": "Erro ao enviar codigo",
        "connectionError": "Erro de conexao",
        "paymentError": "Erro no pagamento",
        "emailLabel": "Email",
    },
    "pt-pt": {
        "invalidEmail": "Email invalido",
        "errorSendingCode": "Erro ao enviar codigo",
        "connectionError": "Erro de conexao",
        "paymentError": "Erro no pagamento",
        "emailLabel": "Email",
    },
    "es": {
        "invalidEmail": "Email invalido",
        "errorSendingCode": "Error al enviar codigo",
        "connectionError": "Error de conexion",
        "paymentError": "Error de pago",
        "emailLabel": "Email",
    },
    "fr": {
        "invalidEmail": "Email invalide",
        "errorSendingCode": "Erreur d'envoi du code",
        "connectionError": "Erreur de connexion",
        "paymentError": "Erreur de paiement",
        "emailLabel": "Email",
    },
    "de": {
        "invalidEmail": "Ungultige E-Mail",
        "errorSendingCode": "Fehler beim Senden des Codes",
        "connectionError": "Verbindungsfehler",
        "paymentError": "Zahlungsfehler",
        "emailLabel": "E-Mail",
    },
    "it": {
        "invalidEmail": "Email non valido",
        "errorSendingCode": "Errore nell'invio del codice",
        "connectionError": "Errore di connessione",
        "paymentError": "Errore di pagamento",
        "emailLabel": "Email",
    },
    "nl": {
        "invalidEmail": "Ongeldig e-mailadres",
        "errorSendingCode": "Fout bij verzenden code",
        "connectionError": "Verbindingsfout",
        "paymentError": "Betalingsfout",
        "emailLabel": "E-mail",
    },
    "pl": {
        "invalidEmail": "Nieprawidlowy email",
        "errorSendingCode": "Blad wysylania kodu",
        "connectionError": "Blad polaczenia",
        "paymentError": "Blad platnosci",
        "emailLabel": "Email",
    },
    "ru": {
        "invalidEmail": "Neverny email",
        "errorSendingCode": "Oshibka otpravki koda",
        "connectionError": "Oshibka soedineniya",
        "paymentError": "Oshibka oplati",
        "emailLabel": "Email",
    },
    "zh": {
        "invalidEmail": "无效邮箱",
        "errorSendingCode": "发送验证码失败",
        "connectionError": "连接错误",
        "paymentError": "支付错误",
        "emailLabel": "邮箱",
    },
    "ja": {
        "invalidEmail": "无效なメールアドレス",
        "errorSendingCode": "コード送信エラー",
        "connectionError": "接続エラー",
        "paymentError": "支払いエラー",
        "emailLabel": "メール",
    },
    "ko": {
        "invalidEmail": "잘못된 이메일",
        "errorSendingCode": "코드 전송 오류",
        "connectionError": "연결 오류",
        "paymentError": "결제 오류",
        "emailLabel": "이메일",
    },
    "hi": {
        "invalidEmail": "अमान्य ईमेल",
        "errorSendingCode": "कोड भेजने में त्रुटि",
        "connectionError": "कनेक्शन त्रुटि",
        "paymentError": "भुगतान त्रुटि",
        "emailLabel": "ईमेल",
    },
    "bn": {
        "invalidEmail": "অবৈধ ইমেইল",
        "errorSendingCode": "কোড পাঠাতে ত্রুটি",
        "connectionError": "সংযোগ ত্রুটি",
        "paymentError": "পেমেন্ট ত্রুটি",
        "emailLabel": "ইমেইল",
    },
    "ar": {
        "invalidEmail": "بريد إلكتروني غير صالح",
        "errorSendingCode": "خطأ في إرسال الرمز",
        "connectionError": "خطأ في الاتصال",
        "paymentError": "خطأ في الدفع",
        "emailLabel": "البريد الإلكتروني",
    },
    "tr": {
        "invalidEmail": "Gecersiz e-posta",
        "errorSendingCode": "Kod gonderme hatasi",
        "connectionError": "Baglanti hatasi",
        "paymentError": "Odeme hatasi",
        "emailLabel": "E-posta",
    },
    "vi": {
        "invalidEmail": "Email khong hop le",
        "errorSendingCode": "Loi gui ma",
        "connectionError": "Loi ket noi",
        "paymentError": "Loi thanh toan",
        "emailLabel": "Email",
    },
    "th": {
        "invalidEmail": "อีเมลไม่ถูกต้อง",
        "errorSendingCode": "ส่งรหัสผิดพลาด",
        "connectionError": "ข้อผิดพลาดการเชื่อมต่อ",
        "paymentError": "ข้อผิดพลาดการชำระเงิน",
        "emailLabel": "อีเมล",
    },
    "ur": {
        "invalidEmail": "غلط ای میل",
        "errorSendingCode": "کوڈ بھیجنے میں مسئلہ",
        "connectionError": "کنکشن مسئلہ",
        "paymentError": "ادائیگی مسئلہ",
        "emailLabel": "ای میل",
    },
    "tl": {
        "invalidEmail": "Hindi wastong email",
        "errorSendingCode": "Error sa pagpapadala ng code",
        "connectionError": "Connection error",
        "paymentError": "Payment error",
        "emailLabel": "Email",
    },
    "sw": {
        "invalidEmail": "Barua pepe batili",
        "errorSendingCode": "Hitilafu kutuma nambari",
        "connectionError": "Hitilafu ya muunganisho",
        "paymentError": "Hitilafu ya malipo",
        "emailLabel": "Barua pepe",
    },
}

MISSING_KEYS = ["invalidEmail", "errorSendingCode", "connectionError", "paymentError", "emailLabel"]

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# For each language, check if the keys exist and add them before the closing `},`
for lang_code, translations in NEW_KEYS.items():
    for key, value in translations.items():
        # Check if this key already exists in this language section
        # We need to find the language section and check
        pattern = rf'"{lang_code}":.*?"{key}":'
        if re.search(pattern, content, re.DOTALL):
            print(f"  SKIP: {lang_code}.{key} already exists")
            continue
        
        # Find the closing `},` of this language section and insert before it
        # Look for the language section start
        section_start = content.find(f'"{lang_code}":')
        if section_start == -1:
            print(f"  WARN: Section {lang_code} not found")
            continue
        
        # Find the last `},` before the next section starts (or end of object)
        # Look for the next language section or end of i18n object
        next_section = content.find('\n  "', section_start + 1)
        if next_section == -1:
            next_section = content.find('\n};', section_start)
        
        # Find the closing `},` just before next_section
        insert_pos = content.rfind('},', section_start, next_section)
        if insert_pos == -1:
            print(f"  WARN: Could not find closing for {lang_code}")
            continue
        
        # Insert the new key
        new_line = f'    "{key}": "{value}",\n'
        content = content[:insert_pos] + new_line + content[insert_pos:]
        print(f"  ADD: {lang_code}.{key} = {value}")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("\nDone!")
