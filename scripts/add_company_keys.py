#!/usr/bin/env python3
"""Add missing company/post page i18n keys to all language blocks."""
import re

I18N_FILE = "/home/z/my-project/src/lib/i18n.ts"

# Keys to add per language {lang: {key: value}}
NEW_KEYS = {
    "en": {
        "backToJobs": "Back to Jobs",
        "companyRegister": "Register Company",
        "companyRegisterSub": "Create your company account to start posting jobs",
        "companySection": "Company Information",
        "createAccount": "Create Account",
        "companyName": "Company Name",
        "companyContactEmail": "Contact Email",
        "companyPassword": "Password",
        "jobSection": "Job Details",
        "jobTitle": "Job Title",
        "jobLocation": "Job Location",
        "selectCountry2": "Select Country",
        "jobDescription": "Job Description",
        "jobSector": "Job Sector",
        "allFunctions": "All Functions",
        "jobType": "Job Type",
        "salaryMinLabel": "Min Salary",
        "salaryMaxLabel": "Max Salary",
        "currency": "Currency",
        "publishJob": "Publish Job",
        "jobPublished": "Job Published!",
        "jobPublishedSub": "Your job has been published and is now visible to candidates.",
        "postAnother": "Post Another Job",
    },
    "pt-br": {
        "backToJobs": "Voltar as Vagas",
        "companyRegister": "Cadastrar Empresa",
        "companyRegisterSub": "Crie sua conta empresarial para publicar vagas",
        "companySection": "Informacoes da Empresa",
        "createAccount": "Criar Conta",
        "companyName": "Nome da Empresa",
        "companyContactEmail": "Email de Contato",
        "companyPassword": "Senha",
        "jobSection": "Dados da Vaga",
        "jobTitle": "Titulo da Vaga",
        "jobLocation": "Local da Vaga",
        "selectCountry2": "Selecione o Pais",
        "jobDescription": "Descricao da Vaga",
        "jobSector": "Setor",
        "allFunctions": "Todas as Funcoes",
        "jobType": "Tipo de Vaga",
        "salaryMinLabel": "Salario Minimo",
        "salaryMaxLabel": "Salario Maximo",
        "currency": "Moeda",
        "publishJob": "Publicar Vaga",
        "jobPublished": "Vaga Publicada!",
        "jobPublishedSub": "Sua vaga foi publicada e esta visivel para candidatos.",
        "postAnother": "Publicar Outra Vaga",
    },
    "es": {
        "backToJobs": "Volver al Empleo",
        "companyRegister": "Registrar Empresa",
        "companyRegisterSub": "Crea tu cuenta empresarial para publicar empleos",
        "companySection": "Informacion de la Empresa",
        "createAccount": "Crear Cuenta",
        "companyName": "Nombre de la Empresa",
        "companyContactEmail": "Email de Contacto",
        "companyPassword": "Contrasena",
        "jobSection": "Datos del Empleo",
        "jobTitle": "Titulo del Empleo",
        "jobLocation": "Ubicacion",
        "selectCountry2": "Seleccionar Pais",
        "jobDescription": "Descripcion del Empleo",
        "jobSector": "Sector",
        "allFunctions": "Todas las Funciones",
        "jobType": "Tipo de Empleo",
        "salaryMinLabel": "Salario Minimo",
        "salaryMaxLabel": "Salario Maximo",
        "currency": "Moneda",
        "publishJob": "Publicar Empleo",
        "jobPublished": "Empleo Publicado!",
        "jobPublishedSub": "Tu empleo ha sido publicado y es visible para candidatos.",
        "postAnother": "Publicar Otro Empleo",
    },
    "fr": {
        "backToJobs": "Retour aux Emplois",
        "companyRegister": "Inscrire Entreprise",
        "companyRegisterSub": "Creez votre compte entreprise pour publier des offres",
        "companySection": "Informations Entreprise",
        "createAccount": "Creer un Compte",
        "companyName": "Nom de l'Entreprise",
        "companyContactEmail": "Email de Contact",
        "companyPassword": "Mot de Passe",
        "jobSection": "Details de l'Emploi",
        "jobTitle": "Titre de l'Emploi",
        "jobLocation": "Lieu",
        "selectCountry2": "Selectionner le Pays",
        "jobDescription": "Description de l'Emploi",
        "jobSector": "Secteur",
        "allFunctions": "Toutes les Fonctions",
        "jobType": "Type d'Emploi",
        "salaryMinLabel": "Salaire Minimum",
        "salaryMaxLabel": "Salaire Maximum",
        "currency": "Devise",
        "publishJob": "Publier l'Emploi",
        "jobPublished": "Emploi Publie!",
        "jobPublishedSub": "Votre offre a ete publiee et est visible par les candidats.",
        "postAnother": "Publier un Autre Emploi",
    },
    "de": {
        "backToJobs": "Zuruck zu den Jobs",
        "companyRegister": "Unternehmen Registrieren",
        "companyRegisterSub": "Erstellen Sie ein Unternehmenskonto um Stellen zu veroffentlichen",
        "companySection": "Unternehmensinformationen",
        "createAccount": "Konto Erstellen",
        "companyName": "Unternehmensname",
        "companyContactEmail": "Kontakt-E-Mail",
        "companyPassword": "Passwort",
        "jobSection": "Stellendetails",
        "jobTitle": "Stellentitel",
        "jobLocation": "Standort",
        "selectCountry2": "Land Auswahlen",
        "jobDescription": "Stellenbeschreibung",
        "jobSector": "Branche",
        "allFunctions": "Alle Funktionen",
        "jobType": "Stellenart",
        "salaryMinLabel": "Mindestgehalt",
        "salaryMaxLabel": "Hochstgehalt",
        "currency": "Wahrung",
        "publishJob": "Stelle Veroffentlichen",
        "jobPublished": "Stelle Veroffentlicht!",
        "jobPublishedSub": "Ihre Stelle wurde veroffentlicht und ist fur Bewerber sichtbar.",
        "postAnother": "Weitere Stelle Veroffentlichen",
    },
    "it": {
        "backToJobs": "Torna agli Annunci",
        "companyRegister": "Registra Azienda",
        "companyRegisterSub": "Crea il tuo account aziendale per pubblicare annunci",
        "companySection": "Informazioni Azienda",
        "createAccount": "Crea Account",
        "companyName": "Nome Azienda",
        "companyContactEmail": "Email di Contatto",
        "companyPassword": "Password",
        "jobSection": "Dettagli Annuncio",
        "jobTitle": "Titolo dell'Annuncio",
        "jobLocation": "Localita",
        "selectCountry2": "Seleziona Paese",
        "jobDescription": "Descrizione dell'Annuncio",
        "jobSector": "Settore",
        "allFunctions": "Tutte le Funzioni",
        "jobType": "Tipo di Lavoro",
        "salaryMinLabel": "Stipendio Minimo",
        "salaryMaxLabel": "Stipendio Massimo",
        "currency": "Valuta",
        "publishJob": "Pubblica Annuncio",
        "jobPublished": "Annuncio Pubblicato!",
        "jobPublishedSub": "Il tuo annuncio e stato pubblicato ed e visibile ai candidati.",
        "postAnother": "Pubblica Altro Annuncio",
    },
    "nl": {
        "backToJobs": "Terug naar Vacatures",
        "companyRegister": "Bedrijf Registreren",
        "companyRegisterSub": "Maak uw bedrijfsaccount aan om vacatures te plaatsen",
        "companySection": "Bedrijfsinformatie",
        "createAccount": "Account Aanmaken",
        "companyName": "Bedrijfsnaam",
        "companyContactEmail": "Contact E-mail",
        "companyPassword": "Wachtwoord",
        "jobSection": "Vacaturedetails",
        "jobTitle": "Functietitel",
        "jobLocation": "Locatie",
        "selectCountry2": "Selecteer Land",
        "jobDescription": "Vacaturebeschrijving",
        "jobSector": "Sector",
        "allFunctions": "Alle Functies",
        "jobType": "Type Baan",
        "salaryMinLabel": "Minimaal Salaris",
        "salaryMaxLabel": "Maximaal Salaris",
        "currency": "Valuta",
        "publishJob": "Vacature Plaatsen",
        "jobPublished": "Vacature Geplaatst!",
        "jobPublishedSub": "Uw vacature is geplaatst en zichtbaar voor kandidaten.",
        "postAnother": "Nog een Vacature Plaatsen",
    },
    "pl": {
        "backToJobs": "Powrot do Ofert",
        "companyRegister": "Zarejestruj Firme",
        "companyRegisterSub": "Utworz konto firmowe aby publikowac oferty pracy",
        "companySection": "Informacje o Firmie",
        "createAccount": "Utworz Konto",
        "companyName": "Nazwa Firmy",
        "companyContactEmail": "Email Kontaktowy",
        "companyPassword": "Haslo",
        "jobSection": "Szczegoly Oferty",
        "jobTitle": "Tytul Oferty",
        "jobLocation": "Lokalizacja",
        "selectCountry2": "Wybierz Kraj",
        "jobDescription": "Opis Stanowiska",
        "jobSector": "Branza",
        "allFunctions": "Wszystkie Funkcje",
        "jobType": "Typ Pracy",
        "salaryMinLabel": "Minimalne Wynagrodzenie",
        "salaryMaxLabel": "Maksymalne Wynagrodzenie",
        "currency": "Waluta",
        "publishJob": "Opublikuj Oferte",
        "jobPublished": "Oferta Opublikowana!",
        "jobPublishedSub": "Twoja oferta zostala opublikowana i jest widoczna dla kandydatow.",
        "postAnother": "Opublikuj Kolejna Oferte",
    },
    "ru": {
        "backToJobs": "Nazad k Vakansiyam",
        "companyRegister": "Registratsiya Kompanii",
        "companyRegisterSub": "Sozdayte kompaniyu dlya publikatsii vakansiy",
        "companySection": "Informatsiya o Kompanii",
        "createAccount": "Sozdat Akkaut",
        "companyName": "Nazvanie Kompanii",
        "companyContactEmail": "Kontaktniy Email",
        "companyPassword": "Parol",
        "jobSection": "Detali Vakansii",
        "jobTitle": "Nazvanie Vakansii",
        "jobLocation": "Lokatsiya",
        "selectCountry2": "Vyberite Stranu",
        "jobDescription": "Opisanie Vakansii",
        "jobSector": "Otrasl",
        "allFunctions": "Vse Funktsii",
        "jobType": "Tip Raboty",
        "salaryMinLabel": "Min ZP",
        "salaryMaxLabel": "Maks ZP",
        "currency": "Valyuta",
        "publishJob": "Opublikovat Vakansiyu",
        "jobPublished": "Vakansiya Opublikovana!",
        "jobPublishedSub": "Vakansiya opublikovana i vidima dlya kandidatov.",
        "postAnother": "Opublikovat Eshcho",
    },
    "pt-pt": {
        "backToJobs": "Voltar as Vagas",
        "companyRegister": "Registar Empresa",
        "companyRegisterSub": "Crie a sua conta empresarial para publicar vagas",
        "companySection": "Informacoes da Empresa",
        "createAccount": "Criar Conta",
        "companyName": "Nome da Empresa",
        "companyContactEmail": "Email de Contacto",
        "companyPassword": "Palavra-passe",
        "jobSection": "Dados da Vaga",
        "jobTitle": "Titulo da Vaga",
        "jobLocation": "Local da Vaga",
        "selectCountry2": "Selecione o Pais",
        "jobDescription": "Descricao da Vaga",
        "jobSector": "Setor",
        "allFunctions": "Todas as Funcoes",
        "jobType": "Tipo de Vaga",
        "salaryMinLabel": "Salario Minimo",
        "salaryMaxLabel": "Salario Maximo",
        "currency": "Moeda",
        "publishJob": "Publicar Vaga",
        "jobPublished": "Vaga Publicada!",
        "jobPublishedSub": "A sua vaga foi publicada e esta visivel para candidatos.",
        "postAnother": "Publicar Outra Vaga",
    },
}

# For remaining languages, use English as fallback
FALLBACK_LANGS = ["zh", "ja", "ko", "hi", "bn", "ar", "tr", "vi", "th", "ur", "tl", "sw"]

with open(I18N_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# For each language, find its block and add keys before the closing },
for lang_code, keys in NEW_KEYS.items():
    # Find the pattern:  "lang_code": {
    # We need to insert before the closing }, of this block
    # Strategy: find the lang block, then find its closing brace
    
    # Find start of this language block
    lang_marker = f'  "{lang_code}": {{'
    start_idx = content.find(lang_marker)
    if start_idx == -1:
        print(f"WARNING: Could not find block for {lang_code}")
        continue
    
    # Find the closing }, for this block (need to count braces)
    brace_start = content.index('{', start_idx)
    depth = 0
    pos = brace_start
    for i in range(pos, len(content)):
        if content[i] == '{':
            depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0:
                # Found the closing brace - insert keys before it
                insert_pos = i  # position of }
                # Build the key entries
                entries = "\n"
                for k, v in keys.items():
                    # Escape any double quotes in value
                    v_escaped = v.replace('\\', '\\\\').replace('"', '\\"')
                    entries += f'    "{k}": "{v_escaped}",\n'
                
                content = content[:insert_pos] + entries + content[insert_pos:]
                print(f"Added {len(keys)} keys to {lang_code}")
                break

# For fallback languages, add English keys
for lang_code in FALLBACK_LANGS:
    lang_marker = f'  "{lang_code}": {{'
    start_idx = content.find(lang_marker)
    if start_idx == -1:
        print(f"WARNING: Could not find block for {lang_code}")
        continue
    
    brace_start = content.index('{', start_idx)
    depth = 0
    for i in range(brace_start, len(content)):
        if content[i] == '{':
            depth += 1
        elif content[i] == '}':
            depth -= 1
            if depth == 0:
                insert_pos = i
                entries = "\n"
                for k, v in NEW_KEYS["en"].items():
                    v_escaped = v.replace('\\', '\\\\').replace('"', '\\"')
                    entries += f'    "{k}": "{v_escaped}",\n'
                content = content[:insert_pos] + entries + content[insert_pos:]
                print(f"Added {len(NEW_KEYS['en'])} keys to {lang_code} (English fallback)")
                break

with open(I18N_FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("\nDone! Added company/post i18n keys to all languages.")
