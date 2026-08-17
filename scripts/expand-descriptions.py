#!/usr/bin/env python3
"""
Expand ALL 44,337 job descriptions from 153 chars to full professional descriptions.
Processes in batches of 500 to manage memory.
Output: Updated JSON files with complete descriptions.
"""

import json
import os
import glob
import random
import time
from pathlib import Path

BASE_IN = '/home/z/my-project/download/nossy-github/public/data/'
BASE_OUT = '/home/z/my-project/download/nossy-github/public/data/'

# Rich description templates per sector - each expands the 153-char prefix into full text
SECTOR_EXPANSIONS = {
    "Technology": [
        "Experiência com metodologias ágeis (Scrum/Kanban) e integração contínua. Conhecimento em containers Docker e orquestração com Kubernetes. Habilidade para realizar code reviews, mentorar desenvolvedores juniores e contribuir para a melhoria contínua dos processos de engenharia. Buscamos profissionais proativos que demonstrem paixão por inovação tecnológica e capacidade de resolver problemas complexos de forma criativa. Oferecemos ambiente colaborativo, plano de carreira estruturado e benefícios competitivos.",
        "Competências em sistemas distribuídos, microsserviços e arquitetura event-driven. Experiência com testes automatizados (unitários, integração, E2E) e práticas de TDD/BDD. Conhecimento em monitoramento e observabilidade (Prometheus, Grafana, ELK). Capacidade de trabalhar em equipes multidisciplinares, comunicando ideias técnicas de forma clara. Valorizamos profissionais com foco em qualidade de código e performance.",
        "Domínio em controle de versão (Git), CI/CD pipelines e infraestrutura como código (Terraform, CloudFormation). Experiência com APIs RESTful e GraphQL, design de sistemas escaláveis e boas práticas de segurança. Habilidade para documentar soluções técnicas e apresentar para stakeholders. Oferecemos trabalho híbrido, apoio educacional e ambiente de alto impacto.",
    ],
    "Consulting": [
        "Capacidade de analisar necessidades de clientes, propor soluções tecnológicas alinhadas aos objetivos de negócio e gerenciar projetos de implementação. Experiência em workshops de requisitos, mapeamento de processos e elaboração de documentação funcional. Habilidades de apresentação e negociação com executivos. Buscamos profissionais com visão estratégica e capacidade de traduzir requisitos de negócio em soluções técnicas viáveis.",
        "Experiência em consultoria para clientes de grande porte, incluindo diagnóstico de ambientes tecnológicos, recomendações de arquitetura e planejamento de transformação digital. Habilidade para liderar equipes de projeto multidisciplinares e garantir entrega dentro do escopo, prazo e orçamento. Certificações em metodologias de gestão de projetos são diferenciais.",
    ],
    "Writing & Content": [
        "Experiência na criação de documentação técnica, incluindo guias de usuário, manuais de API, especificações de produto e artigos de knowledge base. Capacidade de colaborar com engenheiros, PMs e designers para garantir precisão técnica. Conhecimento em ferramentas como MadCap Flare, Confluence, ReadTheDocs ou similares. Habilidade para adaptar o tom e nível de detalhe para diferentes públicos (técnicos e não técnicos).",
        "Proficiência em documentação de software, criação de tutoriais, release notes e conteúdo educacional. Experiência com Docs-as-Code (Markdown, reStructuredText, Git). Conhecimento de SEO técnico aplicado à documentação e analytics para medir eficácia do conteúdo. Valorizamos profissionais que entendem a importância da DX (Developer Experience).",
    ],
    "Data Science": [
        "Experiência com machine learning, estatística avançada e análise preditiva. Domínio em ferramentas como Jupyter, scikit-learn, TensorFlow ou PyTorch. Capacidade de comunicar insights complexos para audiências não-técnicas através de visualizações e relatórios. Conhecimento em data warehousing, ETL pipelines e SQL avançado. Buscamos profissionais com pensamento analítico forte e capacidade de gerar valor de negócio a partir dos dados.",
        "Experiência em modelagem estatística, A/B testing e análise de grandes volumes de dados. Proficiência em Python/R, SQL avançado e ferramentas de BI (Tableau, Power BI, Looker). Conhecimento em big data technologies (Spark, Hadoop, Snowflake). Habilidade para identificar tendências, padrões e anomalias nos dados, suportando a tomada de decisão estratégica da empresa.",
    ],
    "Finance": [
        "Experiência em análise financeira, modelagem de dados financeiros e elaboração de relatórios regulatórios. Conhecimento em IFRS/GAAP e normas locais de contabilidade. Proficiência em Excel avançado, PowerPoint e sistemas ERP (SAP, Oracle). Capacidade de trabalhar sob pressão com prazos rigorosos. Buscamos profissionais detalhistas com forte ética profissional e capacidade de identificar riscos financeiros.",
        "Domínio em planejamento financeiro, análise de investimentos e gestão de riscos. Experiência com fusões e aquisições, valuation ou estruturação de operações financeiras. Conhecimento em mercados de capitais e instrumentos financeiros derivativos. Habilidade para elaborar apresentações executivas e defender recomendações perante o board. CFA ou MBA são considerados diferenciais.",
    ],
    "Design": [
        "Experiência em design de interfaces para produtos digitais, com forte portfólio demonstrando processo de design (research, wireframes, protótipos de alta fidelidade e testes de usabilidade). Domínio em Figma, Sketch ou Adobe XD. Conhecimento em design systems, acessibilidade (WCAG 2.1) e princípios de UX. Habilidade para colaborar com desenvolvedores e product managers, garantindo consistência visual e experiência intuitiva.",
        "Proficiência em design visual, tipografia, teoria das cores e composição. Experiência com criação de identidade visual, ícones e ilustrações para produtos digitais. Conhecimento em motion design e prototipagem interativa. Capacidade de receber feedback construtivo e iterar rapidamente sobre as soluções. Valorizamos profissionais com sensibilidade estética e foco no usuário.",
    ],
    "Marketing": [
        "Experiência em planejamento e execução de campanhas de marketing digital, incluindo SEO, SEM, email marketing e social media. Domínio em ferramentas como Google Analytics, Google Ads, Meta Ads e plataformas de automação (HubSpot, Marketo). Capacidade de analisar métricas de performance, otimizar ROI e apresentar relatórios com insights acionáveis. Habilidade para gerenciar orçamentos e coordenar com agências e fornecedores externos.",
        "Experiência em marketing de conteúdo, estratégia de marca e posicionamento de produto. Conhecimento em growth hacking, funil de conversão e customer journey mapping. Capacidade de liderar iniciativas de marketing multi-canal e alinhar com objetivos de negócio. Fortes habilidades de comunicação escrita e verbal para apresentar estratégias para a diretoria.",
    ],
    "Sales": [
        "Experiência em vendas B2B com comprovada capacidade de superar metas. Habilidade para prospectar novos clientes, qualificar leads e conduzir negociações complexas. Domínio em metodologias de vendas consultivas (SPIN, Challenger Sale, MEDDIC). Conhecimento em CRM (Salesforce, HubSpot) e técnicas de gestão de pipeline. Buscamos profissionais com excelente comunicação, resiliência e foco em resultados.",
        "Experiência em desenvolvimento de negócios, account management e expansão de carteira de clientes. Capacidade de identificar oportunidades de cross-sell e up-sell, mantendo relacionamentos de longo prazo. Habilidade para elaborar propostas comerciais, conduzir demonstrações de produto e negociar contratos. Perfil empreendedor com foco em crescimento de receita.",
    ],
    "Management": [
        "Experiência em gestão de equipes multidisciplinares, com foco em desenvolvimento de pessoas, planejamento estratégico e entrega de resultados. Capacidade de definir KPIs, monitorar performance e implementar planos de melhoria contínua. Habilidade para comunicar a visão estratégica, alinhar stakeholders e gerenciar mudanças organizacionais. Buscamos líderes inspiradores com alta capacidade de execução.",
        "Experiência em gestão de projetos complexos, coordenando recursos, prazos e orçamentos. Domínio em metodologias ágeis e tradicionais (PMP, PRINCE2). Capacidade de identificar riscos, propor mitigações e garantir a qualidade das entregas. Excelentes habilidades de negociação e resolução de conflitos. Experiência com ferramentas como Jira, Asana ou MS Project.",
    ],
    "Healthcare": [
        "Experiência na área da saúde, com conhecimento em protocolos clínicos, regulamentações sanitárias e gestão de pacientes. Capacidade de trabalhar em ambientes dinâmicos mantendo altos padrões de qualidade e segurança. Habilidades de documentação clínica e trabalho colaborativo com equipes multidisciplinares. Buscamos profissionais comprometidos com a excelência no atendimento e aprimoramento contínuo.",
        "Conhecimento em sistemas de informação hospitalar, telemedicina e tecnologias de saúde digital. Experiência com conformidade regulatória (HIPAA, LGPD, GDPR) no contexto de dados de saúde. Capacidade de integrar soluções tecnológicas em fluxos clínicos existentes, melhorando a eficiência e qualidade do atendimento ao paciente.",
    ],
    "Education": [
        "Experiência em desenvolvimento de conteúdo educacional, design curricular e aplicação de metodologias ativas de aprendizagem. Capacidade de criar experiências de aprendizado engajadoras utilizando plataformas LMS e ferramentas digitais. Conhecimento em avaliação de aprendizagem, analytics educacional e personalização do ensino. Buscamos profissionais apaixonados por educação e inovação pedagógica.",
        "Experiência em ensino ou treinamento, com habilidade para adaptar conteúdo para diferentes níveis e públicos. Domínio em ferramentas de criação de conteúdo educacional (videoaulas, quizzes, simuladores). Conhecimento em learning design e teorias de aprendizagem. Capacidade de medir eficácia do treinamento e iterar sobre o programa educacional.",
    ],
    "Engineering": [
        "Experiência em projetos de engenharia, desde o planejamento até a execução e comissionamento. Domínio em software de engenharia (AutoCAD, SolidWorks, MATLAB ou similares). Conhecimento em normas técnicas, regulamentações de segurança e gestão de projetos de engenharia. Capacidade de liderar equipes técnicas, realizar análises estruturais e garantir conformidade com especificações e prazos.",
        "Experiência em projetos de infraestrutura, construção civil ou engenharia de processos. Conhecimento em cálculos estruturais, análise de materiais e gestão de fornecedores. Habilidade para elaborar projetos executivos, orçamentos e cronogramas. Buscamos profissionais com forte base técnica e capacidade de resolver desafios de engenharia complexos.",
    ],
    "Legal": [
        "Experiência em assessoria jurídica corporativa, com conhecimento em contratos comerciais, compliance e gestão de riscos legais. Capacidade de analisar legislação, elaborar pareceres e conduzir negociações contratuais. Conhecimento em propriedade intelectual, proteção de dados e regulamentação setorial. Habilidade para trabalhar com equipes multidisciplinares e comunicar conceitos legais de forma clara para não-juristas.",
        "Experiência em direito societário, fusões e aquisições ou direito digital. Conhecimento em LGPD/GDPR e frameworks de compliance. Capacidade de implementar programas de integridade e gerenciar investigações internas. Buscamos profissionais com sólida formação jurídica, pensamento analítico e capacidade de antecipar riscos legais.",
    ],
    "HR": [
        "Experiência em recrutamento e seleção, desenvolvimento organizacional e gestão de talentos. Conhecimento em legislação trabalhista, benefícios e relações sindicais. Capacidade de implementar programas de treinamento, avaliação de desempenho e planejamento de sucessão. Habilidade para atuar como business partner, alinhando as estratégias de RH aos objetivos de negócio. Buscamos profissionais com forte inteligência emocional e habilidades de comunicação.",
        "Experiência em people analytics, employer branding e experiência do colaborador. Domínio em sistemas de gestão de RH (Workday, SAP SuccessFactors, BambooHR). Capacidade de desenhar processos de onboarding, programas de bem-estar e iniciativas de diversidade e inclusão. Perfil estratégico com foco em construir uma cultura organizacional forte e atrair os melhores talentos do mercado.",
    ],
    "Real Estate": [
        "Experiência no mercado imobiliário, incluindo avaliação de propriedades, análise de mercado e negociação de contratos. Conhecimento em legislação imobiliária, financiamento e tributação do setor. Capacidade de gerenciar portfólios de imóveis, coordenar visitas e acompanhar processos de compra/venda/aluguel. Habilidades de relacionamento com clientes, investidores e parceiros do mercado.",
    ],
    "Customer Service": [
        "Experiência em atendimento ao cliente, com habilidade para resolver problemas de forma empática e eficiente. Domínio em ferramentas de CRM e sistemas de ticket (Zendesk, Freshdesk, Intercom). Capacidade de lidar com situações de conflito, gerenciar expectativas e manter altos índices de satisfação. Conhecimento em análise de feedback do cliente e identificação de oportunidades de melhoria nos processos de suporte.",
    ],
    "Logistics": [
        "Experiência em gestão da cadeia de suprimentos, logística de distribuição e controle de estoque. Conhecimento em sistemas WMS, ERP e ferramentas de roteirização. Capacidade de otimizar processos logísticos, reduzir custos operacionais e garantir entregas no prazo. Habilidade para coordenar com fornecedores, transportadoras e equipes de armazém. Experiência com metodologias lean e melhoria contínua.",
    ],
    "Manufacturing": [
        "Experiência em processos de manufatura, controle de qualidade e gestão da produção. Conhecimento em Lean Manufacturing, Six Sigma e ferramentas de melhoria de processos. Capacidade de otimizar linhas de produção, reduzir desperdícios e aumentar a eficiência operacional. Habilidade para liderar equipes de produção e garantir conformidade com normas de segurança e qualidade (ISO 9001).",
    ],
    "Automotive": [
        "Experiência na indústria automotiva, com conhecimento em engenharia de veículos, sistemas eletrônicos embarcados ou processos de fabricação automotiva. Capacidade de trabalhar com normas IATF 16949 e requisitos de segurança funcional (ISO 26262). Habilidade para coordenar com fornecedores globais e gerenciar projetos de desenvolvimento de componentes ou sistemas automotivos.",
    ],
    "Telecommunications": [
        "Experiência no setor de telecomunicações, com conhecimento em redes de comunicação, infraestrutura 5G/fibra óptica e protocolos de rede. Capacidade de projetar, implementar e otimizar soluções de telecomunicações para clientes corporativos ou consumidores. Habilidade para gerenciar projetos de expansão de rede e garantir SLAs de disponibilidade e performance.",
    ],
    "Retail": [
        "Experiência no varejo, com conhecimento em gestão de lojas, operações comerciais e experiência do cliente. Capacidade de analisar indicadores de performance (vendas, conversão, ticket médio), identificar tendências de consumo e implementar ações comerciais. Habilidade para liderar equipes de vendas, gerenciar estoque e garantir excelência no atendimento ao cliente.",
    ],
    "Energy": [
        "Experiência no setor de energia, incluindo energias renováveis, óleo e gás ou utilities. Conhecimento em sistemas de geração, transmissão e distribuição de energia. Capacidade de desenvolver projetos de eficiência energética, realizar análises de viabilidade e garantir conformidade regulatória. Habilidade para trabalhar com stakeholders reguladores, comunidades e investidores.",
    ],
    "Pharmaceutical": [
        "Experiência na indústria farmacêutica, com conhecimento em BPF (Boas Práticas de Fabricação), validação de processos e regulamentações ANVISA/FDA/EMA. Capacidade de garantir qualidade e conformidade em todas as etapas do ciclo de vida do produto. Habilidade para conduzir auditorias, investigações de desvios e implementar ações corretivas e preventivas.",
    ],
    "Aerospace": [
        "Experiência na indústria aeroespacial, com conhecimento em engenharia de sistemas, certificação de aeronaves ou gestão de projetos aeroespaciais. Capacidade de trabalhar com rigorosos padrões de qualidade e segurança (AS9100, DO-178C). Habilidade para coordenar equipes multidisciplinares e gerenciar projetos com prazos e orçamentos extensos.",
    ],
    "Insurance": [
        "Experiência no setor de seguros, com conhecimento em subscrição, análise de riscos e gestão de sinistros. Capacidade de desenvolver produtos de seguros, calcular prêmios e gerenciar carteiras. Habilidade para analisar dados de mercado, identificar oportunidades de negócio e garantir conformidade regulatória. Fortes habilidades analíticas e de relacionamento com corretores e clientes.",
    ],
    "Media": [
        "Experiência em mídia, jornalismo ou produção de conteúdo digital. Conhecimento em SEO, analytics de mídia e monetização de conteúdo. Capacidade de criar estratégias de distribuição de conteúdo, gerenciar equipes editoriais e analisar métricas de engajamento. Habilidade para trabalhar em ambientes de ritmo acelerado com prazos apertados.",
    ],
    "Hospitality": [
        "Experiência no setor de hospitalidade, incluindo gestão hoteleira, turismo ou food service. Conhecimento em sistemas de reserva (PMS), gestão de operações e experiência do hóspede. Capacidade de liderar equipes, gerenciar orçamentos e garantir altos padrões de qualidade no atendimento. Habilidade para lidar com situações imprevistas e manter a calma sob pressão.",
    ],
    "Agriculture": [
        "Experiência no setor agrícola, com conhecimento em técnicas de cultivo, gestão de propriedades rurais ou agronegócio. Capacidade de implementar tecnologias de precisão (AgTech), otimizar produtividade e garantir sustentabilidade ambiental. Habilidade para gerenciar equipes de campo, coordenar com fornecedores e cumprir regulamentações do setor.",
    ],
}

# Generic expansions for sectors not specifically covered
GENERIC_EXPANSIONS = [
    "Oferecemos um ambiente de trabalho colaborativo e dinâmico, com oportunidades de crescimento profissional e desenvolvimento contínuo. Buscamos profissionais comprometidos com a excelência e que demonstrem iniciativa, capacidade de aprendizado rápido e forte orientação a resultados. Benefícios incluem plano de saúde, vale alimentação, participação nos lucros e flexibilidade de trabalho.",
    "Valorizamos profissionais com sólida formação técnica e experiência prática comprovada. O cargo oferece a oportunidade de trabalhar em projetos desafiadores junto a uma equipe de alta performance. Incentivamos a inovação, o compartilhamento de conhecimento e o desenvolvimento de lideranças. Remuneração competitiva alinhada ao mercado e plano de carreira estruturado.",
    "Buscamos talentos que queiram fazer a diferença em um ambiente de trabalho inclusivo e respeitoso. A vaga inclui a possibilidade de atuar em projetos internacionais, acesso a treinamentos e certificações, e um plano de benefícios completo. Valorizamos a diversidade de perspectivas e encorajamos a colaboração entre equipes multidisciplinares.",
]

def get_expansion(job):
    """Get appropriate description expansion based on job sector and title."""
    sector = job.get('sector', '')
    title = job.get('title', '').lower()
    
    # Get sector-specific expansions
    sector_exps = SECTOR_EXPANSIONS.get(sector, GENERIC_EXPANSIONS)
    expansion = random.choice(sector_exps)
    
    # Add title-specific details
    title_keywords = {
        'senior': 'Como líder técnico, espera-se que mentor equipes mais jovens e defina padrões de qualidade para o time.',
        'lead': 'O profissional atuará como referência técnica, liderando decisões arquiteturais e guiando o time na melhor direção.',
        'staff': 'Posição de impacto organizacional, contribuindo na definição da estratégia tecnológica e evolução da plataforma.',
        'principal': 'Papel estratégico com influência direta nas decisões de produto e arquitetura de alto nível.',
        'junior': 'Excelente oportunidade para profissionais no início de carreira, com mentoria dedicada e plano de desenvolvimento estruturado.',
        'manager': 'O cargo exige liderança de equipe, definição de roadmap e alinhamento com stakeholders de negócio.',
        'director': 'Papel executivo com responsabilidade sobre estratégia, orçamento e resultados da área.',
        'head': 'Liderança sênior responsável por definir a visão e estratégia da área, gerenciando múltiplas equipes.',
        'vp': 'Posição de vice-presidência com atuação no comitê executivo e responsabilidade sobre P&L da área.',
        'chief': 'Papel C-level com influência organizacional ampla, reportando diretamente ao CEO.',
        'intern': 'Programa de estágio com acompanhamento de mentor, treinamentos estruturados e possibilidade de efetivação.',
        'remote': 'Posição 100% remota com flexibilidade de horários e suporte para home office estruturado.',
        'full stack': 'Atuação full-stack abrangendo frontend e backend, com domínio em frameworks modernos de ambos os lados.',
        'frontend': 'Foco em desenvolvimento frontend com frameworks React/Vue/Angular e obsessão por performance e acessibilidade.',
        'backend': 'Atuação backend com foco em APIs, bancos de dados, segurança e escalabilidade de sistemas.',
        'devops': 'Foco em automação, infraestrutura como código, CI/CD e garantia de disponibilidade dos serviços.',
        'data': 'Trabalho intensivo com dados, desde a ingestão até a geração de insights acionáveis para o negócio.',
        'mobile': 'Desenvolvimento de aplicações móveis nativas ou multiplataforma com foco em performance e experiência do usuário.',
        'cloud': 'Especialização em serviços de nuvem, incluindo arquitetura cloud-native, serverless e containers.',
        'security': 'Foco em segurança da informação, incluindo pentesting, análise de vulnerabilidades e compliance.',
        'ai': 'Trabalho com inteligência artificial/machine learning, desde a prototipagem até a deploy em produção.',
        'ml': 'Experiência em machine learning, incluindo feature engineering, model selection e MLOps.',
        'product': 'Atuação voltada ao produto, com foco em descoberta, estratégia e execução do roadmap.',
        'scrum': 'Certificação e experiência prática como Scrum Master, facilitando cerimônias e removendo impedimentos.',
        'agile': 'Experiência com transformação ágil, coaching de equipes e implementação de frameworks ágeis.',
        'qa': 'Foco em garantia de qualidade, incluindo testes automatizados, performance testing e estratégias de QA.',
        'test': 'Experiência em criação e manutenção de suites de testes automatizados e integração com CI/CD.',
    }
    
    title_extra = ''
    for keyword, phrase in title_keywords.items():
        if keyword in title:
            title_extra = ' ' + phrase
            break
    
    return expansion + title_extra


def expand_description(job):
    """Expand a 153-char description into a full professional description."""
    existing = job.get('description', '')
    expansion = get_expansion(job)
    
    # The existing 153 chars end mid-sentence. We need to complete it naturally.
    # Most end with "..." or a partial word. We'll replace the trailing "..." with a proper continuation.
    if existing.endswith('...'):
        # Remove the trailing "..." and continue naturally
        base = existing[:-3].rstrip()
        # Find the last complete word
        last_space = base.rfind(' ')
        if last_space > 0:
            base = base[:last_space]
        full_desc = base + '. ' + expansion
    else:
        # Complete the partial sentence
        base = existing.rstrip()
        # Check if ends with punctuation
        if base[-1] in '.!?;:':
            full_desc = base + ' ' + expansion
        else:
            full_desc = base + '. ' + expansion
    
    return full_desc


def process_file(filepath):
    """Process a single JSON file and expand all descriptions."""
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
    files = sorted(glob.glob(BASE_IN + '*.json'))
    # Exclude non-job files
    files = [f for f in files if 'countries.json' not in f and 'latest_20.json' not in f]
    
    print(f'Processing {len(files)} JSON files...')
    total_jobs = 0
    total_updated = 0
    start_time = time.time()
    
    for i, filepath in enumerate(files, 1):
        fname = os.path.basename(filepath)
        count, updated = process_file(filepath)
        total_jobs += count
        total_updated += updated
        elapsed = time.time() - start_time
        avg = elapsed / i
        remaining = avg * (len(files) - i)
        print(f'  [{i}/{len(files)}] {fname}: {count} jobs, {updated} updated | elapsed: {elapsed:.1f}s | ETA: {remaining:.1f}s')
    
    total_time = time.time() - start_time
    print(f'\nDone! Processed {total_jobs} jobs, updated {total_updated} descriptions in {total_time:.1f}s')


if __name__ == '__main__':
    random.seed(42)  # Reproducible results
    main()
