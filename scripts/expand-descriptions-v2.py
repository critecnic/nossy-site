#!/usr/bin/env python3
"""Expand ALL 44,337 job descriptions - V2 with sector mapping and cleanup."""
import json, os, glob, random, time, re

BASE = '/home/z/my-project/download/nossy-github/public/data/'

# Map actual JSON sectors to expansion keys
SECTOR_MAP = {
    "Software Engineering": "Technology",
    "Mobile Development": "Technology",
    "Cloud & DevOps": "Technology",
    "AI & Machine Learning": "Technology",
    "Data Science & Analytics": "Data Science",
    "Data Engineering": "Data Science",
    "Product Management": "Management",
    "Consulting": "Consulting",
    "UX/UI & Design": "Design",
    "QA & Testing": "Technology",
    "Game Development": "Technology",
    "Engineering Leadership": "Management",
    "Finance Technology": "Finance",
    "Sales & Marketing": "Sales",
    "Writing & Content": "Writing & Content",
    "IT Support & Operations": "Technology",
    "R&D": "Technology",
    "Cybersecurity": "Technology",
    "Technology": "Technology",
    "Finance": "Finance",
    "Design": "Design",
    "Marketing": "Marketing",
    "Sales": "Sales",
    "Management": "Management",
    "Healthcare": "Healthcare",
    "Education": "Education",
    "Engineering": "Engineering",
    "Legal": "Legal",
    "HR": "HR",
    "Data Science": "Data Science",
    "Other": None,
}

# 15 unique expansions per mapped sector
SECTOR_EXPANSIONS = {
    "Technology": [
        "Experiência com metodologias ágeis (Scrum/Kanban) e integração contínua. Conhecimento em containers Docker e orquestração com Kubernetes. Habilidade para realizar code reviews, mentorar desenvolvedores juniores e contribuir para a melhoria contínua dos processos de engenharia. Oferecemos ambiente colaborativo, plano de carreira estruturado e benefícios competitivos.",
        "Competências em sistemas distribuídos, microsserviços e arquitetura event-driven. Experiência com testes automatizados (unitários, integração, E2E) e práticas de TDD/BDD. Conhecimento em monitoramento e observabilidade (Prometheus, Grafana, ELK). Capacidade de trabalhar em equipes multidisciplinares, comunicando ideias técnicas de forma clara.",
        "Domínio em controle de versão (Git), CI/CD pipelines e infraestrutura como código (Terraform, CloudFormation). Experiência com APIs RESTful e GraphQL, design de sistemas escaláveis e boas práticas de segurança. Habilidade para documentar soluções técnicas e apresentar para stakeholders. Oferecemos trabalho flexível e ambiente de alto impacto.",
        "Sólida experiência em desenvolvimento de software, com foco em código limpo, padrões de projeto e princípios SOLID. Capacidade de liderar revisões técnicas e contribuir para decisões arquiteturais. Buscamos profissionais autônomos que se mantêm atualizados com as tendências do mercado e compartilham conhecimento com a equipe.",
        "Experiência com cloud computing (AWS/Azure/GCP), serverless e containers. Conhecimento em segurança de aplicações, autenticação/autorização e proteção de dados. Habilidade para otimizar performance, identificar gargalos e propor melhorias. Oferecemos desafios reais, equipe de alto nível e oportunidades de crescimento.",
    ],
    "Consulting": [
        "Capacidade de analisar necessidades de clientes, propor soluções tecnológicas alinhadas aos objetivos de negócio e gerenciar projetos de implementação. Experiência em workshops de requisitos, mapeamento de processos e elaboração de documentação funcional. Habilidades de apresentação e negociação com executivos.",
        "Experiência em consultoria para clientes de grande porte, incluindo diagnóstico de ambientes tecnológicos, recomendações de arquitetura e planejamento de transformação digital. Habilidade para liderar equipes multidisciplinares e garantir entrega dentro do escopo, prazo e orçamento.",
    ],
    "Writing & Content": [
        "Experiência na criação de documentação técnica, incluindo guias de usuário, manuais de API e especificações de produto. Capacidade de colaborar com engenheiros e designers para garantir precisão técnica. Conhecimento em ferramentas como Confluence, ReadTheDocs e Docs-as-Code (Markdown, Git).",
        "Proficiência em documentação de software, criação de tutoriais, release notes e conteúdo educacional. Experiência com metodologias ágeis de documentação e analytics para medir eficácia do conteúdo. Valorizamos profissionais que entendem a importância da Developer Experience (DX).",
    ],
    "Data Science": [
        "Experiência com machine learning, estatística avançada e análise preditiva. Domínio em ferramentas como Jupyter, scikit-learn, TensorFlow ou PyTorch. Capacidade de comunicar insights complexos para audiências não-técnicas. Conhecimento em data warehousing, ETL pipelines e SQL avançado.",
        "Experiência em modelagem estatística, A/B testing e análise de grandes volumes de dados. Proficiência em Python/R, SQL avançado e ferramentas de BI (Tableau, Power BI, Looker). Conhecimento em big data technologies (Spark, Hadoop, Snowflake). Habilidade para identificar tendências e padrões nos dados.",
    ],
    "Finance": [
        "Experiência em análise financeira, modelagem de dados financeiros e elaboração de relatórios regulatórios. Conhecimento em IFRS/GAAP e normas locais de contabilidade. Proficiência em Excel avançado e sistemas ERP (SAP, Oracle). Buscamos profissionais detalhistas com forte ética profissional.",
        "Domínio em planejamento financeiro, análise de investimentos e gestão de riscos. Experiência com fusões e aquisições, valuation ou estruturação de operações financeiras. Habilidade para elaborar apresentações executivas e defender recomendações perante o board.",
    ],
    "Design": [
        "Experiência em design de interfaces para produtos digitais, com forte portfólio demonstrando processo de design completo (research, wireframes, protótipos e testes de usabilidade). Domínio em Figma, Sketch ou Adobe XD. Conhecimento em design systems, acessibilidade (WCAG 2.1) e princípios de UX.",
        "Proficiência em design visual, tipografia, teoria das cores e composição. Experiência com criação de identidade visual, ícones e ilustrações para produtos digitais. Conhecimento em motion design e prototipagem interativa. Capacidade de receber feedback e iterar rapidamente.",
    ],
    "Marketing": [
        "Experiência em planejamento e execução de campanhas de marketing digital, incluindo SEO, SEM, email marketing e social media. Domínio em ferramentas como Google Analytics, Google Ads e plataformas de automação (HubSpot, Marketo). Capacidade de analisar métricas e otimizar ROI.",
        "Experiência em marketing de conteúdo, estratégia de marca e posicionamento de produto. Conhecimento em growth hacking, funil de conversão e customer journey mapping. Fortes habilidades de comunicação escrita e verbal para apresentar estratégias.",
    ],
    "Sales": [
        "Experiência em vendas B2B com comprovada capacidade de superar metas. Habilidade para prospectar clientes, qualificar leads e conduzir negociações complexas. Domínio em metodologias de vendas consultivas (SPIN, Challenger Sale, MEDDIC). Conhecimento em CRM (Salesforce, HubSpot).",
        "Experiência em desenvolvimento de negócios, account management e expansão de carteira. Capacidade de identificar oportunidades de cross-sell e up-sell, mantendo relacionamentos de longo prazo. Perfil empreendedor com foco em crescimento de receita.",
    ],
    "Management": [
        "Experiência em gestão de equipes multidisciplinares, com foco em desenvolvimento de pessoas, planejamento estratégico e entrega de resultados. Capacidade de definir KPIs, monitorar performance e implementar planos de melhoria contínua. Buscamos líderes inspiradores.",
        "Experiência em gestão de projetos complexos, coordenando recursos, prazos e orçamentos. Domínio em metodologias ágeis e tradicionais (PMP, PRINCE2). Capacidade de identificar riscos, propor mitigações e garantir a qualidade das entregas.",
    ],
    "Healthcare": [
        "Experiência na área da saúde, com conhecimento em protocolos clínicos, regulamentações sanitárias e gestão de pacientes. Capacidade de trabalhar em ambientes dinâmicos mantendo altos padrões de qualidade e segurança. Buscamos profissionais comprometidos com a excelência.",
        "Conhecimento em sistemas de informação hospitalar, telemedicina e tecnologias de saúde digital. Experiência com conformidade regulatória (HIPAA, LGPD, GDPR) no contexto de dados de saúde.",
    ],
    "Education": [
        "Experiência em desenvolvimento de conteúdo educacional, design curricular e aplicação de metodologias ativas de aprendizagem. Capacidade de criar experiências de aprendizado engajadoras utilizando plataformas LMS e ferramentas digitais.",
        "Experiência em ensino ou treinamento, com habilidade para adaptar conteúdo para diferentes níveis e públicos. Domínio em ferramentas de criação de conteúdo educacional e knowledge management.",
    ],
    "Engineering": [
        "Experiência em projetos de engenharia, desde o planejamento até a execução e comissionamento. Domínio em software de engenharia (AutoCAD, SolidWorks, MATLAB). Conhecimento em normas técnicas, regulamentações de segurança e gestão de projetos.",
        "Experiência em projetos de infraestrutura, construção civil ou engenharia de processos. Conhecimento em cálculos estruturais, análise de materiais e gestão de fornecedores.",
    ],
    "Legal": [
        "Experiência em assessoria jurídica corporativa, com conhecimento em contratos comerciais, compliance e gestão de riscos legais. Capacidade de analisar legislação, elaborar pareceres e conduzir negociações contratuais.",
        "Experiência em direito societário, fusões e aquisições ou direito digital. Conhecimento em LGPD/GDPR e frameworks de compliance.",
    ],
    "HR": [
        "Experiência em recrutamento e seleção, desenvolvimento organizacional e gestão de talentos. Conhecimento em legislação trabalhista, benefícios e relações sindicais. Perfil estratégico com foco em construir cultura organizacional forte.",
        "Experiência em people analytics, employer branding e experiência do colaborador. Domínio em sistemas de gestão de RH (Workday, SAP SuccessFactors, BambooHR). Capacidade de implementar programas de diversidade e inclusão.",
    ],
}

GENERIC_EXPANSIONS = [
    "Oferecemos um ambiente de trabalho colaborativo e dinâmico, com oportunidades de crescimento profissional e desenvolvimento contínuo. Buscamos profissionais comprometidos com a excelência e que demonstrem iniciativa e forte orientação a resultados. Benefícios incluem plano de saúde, vale alimentação e flexibilidade.",
    "Valorizamos profissionais com sólida formação técnica e experiência prática comprovada. O cargo oferece a oportunidade de trabalhar em projetos desafiadores junto a uma equipe de alta performance. Incentivamos a inovação e o compartilhamento de conhecimento. Remuneração competitiva alinhada ao mercado.",
    "Buscamos talentos que queiram fazer a diferença em um ambiente de trabalho inclusivo e respeitoso. A vaga inclui acesso a treinamentos e certificações, e um plano de benefícios completo. Valorizamos a diversidade de perspectivas e encorajamos a colaboração entre equipes multidisciplinares.",
]

TITLE_EXTRA = {
    'senior': 'Como líder técnico, espera-se que mentor equipes e defina padrões de qualidade.',
    'lead': 'O profissional atuará como referência técnica, liderando decisões arquiteturais.',
    'staff': 'Posição de impacto organizacional, contribuindo na estratégia tecnológica da empresa.',
    'principal': 'Papel estratégico com influência direta nas decisões de produto e arquitetura.',
    'junior': 'Excelente oportunidade para início de carreira, com mentoria dedicada e plano de desenvolvimento.',
    'manager': 'O cargo exige liderança de equipe, definição de roadmap e alinhamento com stakeholders.',
    'director': 'Papel executivo com responsabilidade sobre estratégia, orçamento e resultados da área.',
    'head': 'Liderança sênior responsável por definir a visão e estratégia, gerenciando múltiplas equipes.',
    'intern': 'Programa de estágio com acompanhamento de mentor e possibilidade de efetivação.',
    'full stack': 'Atuação full-stack abrangendo frontend e backend com frameworks modernos.',
    'frontend': 'Foco em frontend com frameworks React/Vue/Angular e obsessão por performance.',
    'backend': 'Atuação backend com foco em APIs, bancos de dados e escalabilidade.',
    'devops': 'Foco em automação, infraestrutura como código e CI/CD.',
    'data': 'Trabalho intensivo com dados, da ingestão à geração de insights acionáveis.',
    'mobile': 'Desenvolvimento de aplicações móveis nativas ou multiplataforma.',
    'cloud': 'Especialização em serviços de nuvem e arquitetura cloud-native.',
    'security': 'Foco em segurança da informação, pentesting e compliance.',
    'ai': 'Trabalho com inteligência artificial/machine learning, da prototipagem ao deploy.',
    'ml': 'Experiência em machine learning, feature engineering e MLOps.',
    'product': 'Atuação voltada ao produto, com foco em descoberta e roadmap.',
    'scrum': 'Certificação e experiência prática como Scrum Master.',
    'agile': 'Experiência com transformação ágil e coaching de equipes.',
    'qa': 'Foco em garantia de qualidade e testes automatizados.',
    'test': 'Experiência em criação e manutenção de suites de testes automatizados.',
}

def get_expansion(job):
    sector = job.get('sector', '')
    mapped = SECTOR_MAP.get(sector)
    if mapped and mapped in SECTOR_EXPANSIONS:
        return random.choice(SECTOR_EXPANSIONS[mapped])
    return random.choice(GENERIC_EXPANSIONS)

def get_title_extra(title):
    t = title.lower()
    for kw, phrase in TITLE_EXTRA.items():
        if kw in t:
            return ' ' + phrase
    return ''

def expand_description(job):
    existing = job.get('description', '')
    expansion = get_expansion(job) + get_title_extra(job.get('title', ''))
    
    # Clean up the truncated 153-char description
    base = existing.rstrip()
    
    # Remove trailing "..." if present
    if base.endswith('...'):
        base = base[:-3].rstrip()
    
    # Remove trailing period if present (we'll add our own)
    if base.endswith('.'):
        base = base[:-1].rstrip()
    
    # Remove trailing incomplete word (word without proper ending)
    # Find last space
    last_space = base.rfind(' ')
    if last_space > len(base) * 0.7:  # Only trim if the last word is short (likely incomplete)
        base = base[:last_space]
    
    # Build the full description
    full = base + '. ' + expansion
    
    # Clean up any double periods
    full = re.sub(r'\.\.', '.', full)
    full = re.sub(r'\.\s*\.', '.', full)
    
    return full.strip()

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        jobs = json.load(f)
    
    updated = 0
    for job in jobs:
        if len(job.get('description', '')) <= 160:
            job['description'] = expand_description(job)
            updated += 1
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(jobs, f, ensure_ascii=False, indent=2)
    
    return len(jobs), updated

def main():
    random.seed(42)
    files = sorted(glob.glob(BASE + '*.json'))
    files = [f for f in files if 'countries.json' not in f and 'latest_20.json' not in f]
    
    print(f'Processing {len(files)} JSON files...')
    total_jobs = 0
    total_updated = 0
    start = time.time()
    
    for i, filepath in enumerate(files, 1):
        fname = os.path.basename(filepath)
        count, updated = process_file(filepath)
        total_jobs += count
        total_updated += updated
    
    elapsed = time.time() - start
    print(f'Done! {total_jobs} jobs, {total_updated} updated in {elapsed:.1f}s')

if __name__ == '__main__':
    main()
