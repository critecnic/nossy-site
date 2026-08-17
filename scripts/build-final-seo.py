#!/usr/bin/env python3
"""
Phase 1: Update all 44,337 job descriptions from truncated to full versions.
Phase 2-5: Will be handled in separate scripts.
"""

import json, os, glob, shutil

BASE = "/home/z/my-project"
STAGING = os.path.join(BASE, "nossy-deploy-final")
DATA_DIR = os.path.join(BASE, "public", "data")

# Full descriptions as a list of tuples: (truncated_prefix, full_description)
# We match by the first 80 chars of the truncated description

DESCRIPTIONS = []

DESCRIPTIONS.append((
    "Requer sólidos conhecimentos em estruturas de dados, algoritmos e programação",
    "Requer sólidos conhecimentos em estruturas de dados, algoritmos e programação em linguagens como Python, Java, JavaScript/TypeScript, Go ou C#. Exige experiência com desenvolvimento de aplicações web e/ou móveis, utilizando frameworks modernos como React, Angular, Vue.js, Node.js, Spring Boot ou Django. Domínio de controle de versão com Git, práticas de CI/CD e metodologias ágeis (Scrum/Kanban). Experiência com bancos de dados relacionais (PostgreSQL, MySQL) e NoSQL (MongoDB, Redis). Conhecimento em APIs RESTful e GraphQL, arquitetura de microsserviços e princípios de design de software (SOLID, DRY). Desejável experiência com testes automatizados (Jest, PyTest, JUnit), cloud computing (AWS, Azure, GCP) e containerização (Docker, Kubernetes). O profissional será responsável por projetar, desenvolver e manter soluções de software escaláveis, participando de code reviews, mentoria de desenvolvedores juniores e colaboração com equipes multidisciplinares incluindo produto, design e QA."
))

DESCRIPTIONS.append((
    "Exige combinação de habilidades visuais, proficiência em pesquisa com usuários",
    "Exige combinação de habilidades visuais, proficiência em pesquisa com usuários e prototipagem técnica com ferramentas como Figma, Sketch e Adobe XD. Criação de wireframes, protótipos interativos de alta fidelidade e sistemas de design completos (Design Systems) com tokens de estilo, componentes reutilizáveis e documentação visual. Domínio de princípios de UX: heurísticas de usabilidade, arquitetura da informação, fluxos de usuário, testes de usabilidade (moderados e não moderados) e pesquisa quantitativa/qualitativa. Habilidade para traduzir requisitos de negócio complexos em interfaces intuitivas e acessíveis, seguindo padrões WCAG 2.1. Experiência com ferramentas de prototipagem rápida (Framer, Principle), colaboração próxima com engenheiros de frontend para garantir fidelidade visual, e apresentação de conceitos a stakeholders. O profissional atuará no ciclo completo de design: descoberta, idealização, prototipagem, teste e entrega, impactando diretamente a experiência de milhares de usuários."
))

DESCRIPTIONS.append((
    "Exige conhecimento do setor financeiro, incluindo regulamentações (PCI-DSS",
    "Exige conhecimento do setor financeiro, incluindo regulamentações (PCI-DSS, LGPD, Open Banking), sistemas de pagamento, processamento de transações e gestão de riscos financeiros. Desenvolvimento de soluções fintech como plataformas de pagamento digital, carteiras virtuais, sistemas de lending, crowdfunding ou insurtech. Domínio de integrações com APIs bancárias, gateways de pagamento (Stripe, Adyen, PayPal) e protocolos de segurança financeira. Experiência com análise de dados financeiros, modelagem de risco de crédito, detecção de fraude com machine learning e conformidade regulatória em múltiplas jurisdições. Conhecimento em blockchain e criptomoedas é diferencial. O profissional será responsável por projetar e implementar soluções tecnológicas para o setor financeiro, garantindo segurança, escalabilidade e conformidade regulatória, colaborando com equipes de risco, compliance e produto."
))

DESCRIPTIONS.append((
    "Exige domínio profundo de tecnologias específicas como desenvolvimento em blockchain",
    "Exige domínio profundo de tecnologias específicas como desenvolvimento em blockchain (Solidity, Ethereum, smart contracts), plataformas low-code (OutSystems, Mendix, Power Apps) e desenvolvimento de chatbots e assistentes virtuais. Conhecimento em integração de sistemas via APIs REST, GraphQL e webhooks, automação de processos com RPA (UiPath, Automation Anywhere) e ferramentas de prototipagem rápida. Experiência com bancos de dados especializados (graph databases como Neo4j, time-series como InfluxDB), processamento de eventos em tempo real (Apache Kafka, RabbitMQ) e busca textual (Elasticsearch, Solr). O profissional deve ser capaz de avaliar e selecionar tecnologias adequadas para cada caso de uso, implementar provas de conceito e transicionar soluções especializadas para produção. Habilidades de documentação técnica e transferência de conhecimento para equipes de operação são essenciais."
))

DESCRIPTIONS.append((
    "Exige excelente habilidade de escrita técnica e capacidade de traduzir conceitos",
    "Exige excelente habilidade de escrita técnica e capacidade de traduzir conceitos complexos de tecnologia em documentação clara e acessível. Requer experiência na criação de documentação de API (OpenAPI/Swagger), guias de usuário, tutoriais, whitepapers técnicos e conteúdo para blogs de tecnologia. Domínio de ferramentas como Markdown, Docusaurus, GitBook, Confluence e sistemas de gestão de conteúdo (CMS). Habilidade para conduzir entrevistas com engenheiros e especialistas técnicos, estruturar informações de forma hierárquica e criar fluxos de onboarding para desenvolvedores. Experiência com localização e internacionalização de conteúdo técnico é diferencial. O profissional será responsável por toda a estratégia de conteúdo técnico da empresa, garantindo que desenvolvedores, parceiros e clientes tenham acesso a documentação precisa, atualizada e de fácil compreensão."
))

DESCRIPTIONS.append((
    "Exige experiência comprovada em gestão de equipes de engenhamento, com habilidades",
    "Exige experiência comprovada em gestão de equipes de engenhamento, com habilidades abrangendo três dimensões: técnica, interpessoal e de negócios. Requer domínio de metodologias ágeis (Scrum, Kanban, SAFe), capacidade de conduzir cerimônias (sprint planning, daily, retro, review) e experiência com ferramentas de gestão como Jira, Linear ou Asana. O líder técnico será responsável por definir a arquitetura técnica de projetos, conduzir code reviews e garantir padrões de qualidade; gerenciar o ciclo de vida completo de desenvolvimento, do planejamento à entrega em produção; mentorar e desenvolver membros da equipe, conduzir avaliações de desempenho e planejar crescimento profissional; comunicar status, riscos e dependências para stakeholders de negócio; e balancear entrega de features com dívida técnica e melhorias de infraestrutura. Experiência prévia liderando equipes de 5 a 15 engenheiros é esperada."
))

DESCRIPTIONS.append((
    "Exige experiência prática com provedores de nuvem como AWS, Azure ou GCP",
    "Exige experiência prática com provedores de nuvem como AWS, Azure ou GCP, incluindo configuração de redes virtuais (VPC), IAM e design de alta disponibilidade. Domínio em containerização com Docker e orquestração com Kubernetes, incluindo Helm charts, service mesh (Istio) e GitOps com ArgoCD ou Flux. Experiência com pipelines CI/CD usando GitHub Actions, GitLab CI, Jenkins ou CircleCI, e ferramentas de IaC como Terraform, Pulumi ou CloudFormation. Conhecimento em monitoramento e observabilidade (Prometheus, Grafana, Datadog, ELK Stack), gestão de secrets (Vault, AWS Secrets Manager) e práticas de segurança em nuvem. O profissional será responsável por projetar e manter infraestrutura como código, automatizar deployments, garantir uptime e performance de aplicações em produção, e implementar práticas de FinOps para otimização de custos cloud."
))

DESCRIPTIONS.append((
    "Exige forte domínio em SQL e Python, além de conhecimento profundo em design",
    "Exige forte domínio em SQL e Python, além de conhecimento profundo em design e arquitetura de bancos de dados relacionais e NoSQL. Proficiência em plataformas de dados como Snowflake, BigQuery, Databricks ou Redshift, e ferramentas de ETL/ELT como Apache Airflow, dbt, Fivetran ou Stitch. Experiência com modelagem dimensional (star schema, snowflake schema), data warehousing, data lakes e data lakehouses. Conhecimento em pipelines de dados em tempo real (Apache Kafka, Spark Streaming), qualidade de dados (Great Expectations, Monte Carlo) e governança de dados. Habilidade para traduzir requisitos de negócio em modelos de dados escaláveis, otimizar queries para performance e implementar SLAs de dados. O profissional será responsável por construir e manter a infraestrutura de dados que alimenta análises de negócio, dashboards e modelos de machine learning."
))

DESCRIPTIONS.append((
    "Exige graduação em Ciência da Computação ou área afim, com conhecimentos sólidos",
    "Exige graduação em Ciência da Computação ou área afim, com conhecimentos sólidos em redes de computadores, protocolos de segurança (TCP/IP, DNS, HTTP/HTTPS, TLS) e design de sistemas de defesa cibernética. Domínio em ferramentas de segurança como SIEM (Splunk, QRadar), WAF, IDS/IPS, scanners de vulnerabilidades (Nessus, Burp Suite) e plataformas de EDR. Experiência com pentesting, análise de malware, forense digital e resposta a incidentes de segurança. Conhecimento em frameworks de compliance como ISO 27001, SOC 2, GDPR e NIST Cybersecurity Framework. Habilidades em scripting (Python, Bash, PowerShell) para automação de tarefas de segurança. O profissional será responsável por proteger os ativos digitais da organização, conduzir avaliações de risco, implementar controles de segurança, monitorar ameaças e responder a incidentes, colaborando com equipes de DevOps e desenvolvimento."
))

DESCRIPTIONS.append((
    "Exige sólida formação técnica em áreas como redes, programação, cibersegurança",
    "Exige sólida formação técnica em áreas como redes, programação, cibersegurança, computação em nuvem e análise de dados, combinada com excelentes habilidades de comunicação e resolução de problemas. Experiência com suporte N1/N2/N3, gerenciamento de ativos de TI (ServiceNow, Jira Service Management) e ferramentas de monitoramento (Zabbix, Nagios, Datadog). Domínio em sistemas operacionais (Windows Server, Linux), Active Directory, Office 365 e plataformas de colaboração (Google Workspace, Slack, Microsoft Teams). Conhecimento em automação de processos de TI usando PowerShell ou Python, e experiência com documentação de processos e criação de base de conhecimento. O profissional será responsável por fornecer suporte técnico de excelência, gerenciar incidentes e requisições, manter a infraestrutura de TI operacional e contribuir para a melhoria contínua dos processos de TI."
))

DESCRIPTIONS.append((
    "Requer combinação de habilidades comerciais com conhecimento tecnológico, incluindo",
    "Requer combinação de habilidades comerciais com conhecimento tecnológico, incluindo familiaridade com soluções em nuvem, SaaS e produtos de tecnologia. Experiência comprovada em ciclo completo de vendas B2B/B2C, desde prospecção e qualificação de leads até negociação e fechamento de contratos. Domínio em CRM (Salesforce, HubSpot, Pipedrive), técnicas de vendas consultivas (SPIN Selling, Challenger Sale) e ferramentas de automação de marketing (Marketo, Mailchimp, HubSpot Marketing). Habilidade para conduzir demonstrações de produto, criar propostas comerciais personalizadas e gerenciar negociações complexas com múltiplos tomadores de decisão. Experiência com definição de ICP (Ideal Customer Profile), análise de funil de vendas e métricas como CAC, LTV e taxa de conversão. O profissional atuará na interface entre tecnologia e negócios, conectando soluções tecnológicas às necessidades dos clientes."
))

DESCRIPTIONS.append((
    "Requer conhecimento em motores de jogo como Unity, Unreal Engine ou Godot",
    "Requer conhecimento em motores de jogo como Unity, Unreal Engine ou Godot, além de dominar linguagens como C#, C++ ou GDScript. Exige habilidades em modelagem 3D, animação, física de jogos e otimização de performance para diferentes plataformas (PC, console, mobile, VR/AR). Domínio em shaders (HLSL, GLSL), técnicas de rendering (PBR, ray tracing) e integração de áudio e sistemas de partículas. Experiência com multiplayer networking, sistemas de matchmaking, anti-cheat e monetização (in-app purchases, ads). Conhecimento em game design, narrativa interativa e experiência do jogador (UX). O profissional será responsável por desenvolver mecânicas de jogo, implementar sistemas de gameplay, otimizar performance e memória, e colaborar com artistas, designers de jogo e produtores para entregar experiências de jogo envolventes e de alta qualidade."
))

DESCRIPTIONS.append((
    "Requer conhecimento sólido em infraestrutura de TI, incluindo redes, servidores",
    "Requer conhecimento sólido em infraestrutura de TI, incluindo redes, servidores, sistemas operacionais (Windows, Linux), cloud computing (AWS, Azure, GCP) e virtualização (VMware, Hyper-V). Experiência com protocolos de rede (TCP/IP, DNS, DHCP, VPN), firewalls, load balancers e serviços de diretório (Active Directory, LDAP). Domínio em monitoramento de infraestrutura (Zabbix, Prometheus, Grafana), automação com Ansible, Chef ou Puppet e gestão de configuração. Conhecimento em práticas de segurança, backup e disaster recovery, com experiência em documentação de procedimentos operacionais e criação de runbooks. O profissional será responsável por manter a disponibilidade e performance da infraestrutura de TI, executar mudanças planejadas, investigar e resolver incidentes e implementar melhorias de automação e eficiência operacional."
))

DESCRIPTIONS.append((
    "Requer domínio em programação em C/C++ para sistemas embarcados, conhecimento de",
    "Requer domínio em programação em C/C++ para sistemas embarcados, conhecimento de microcontroladores (ARM, ESP32, STM32) e protocolos de comunicação (I2C, SPI, UART, CAN). Experiência com RTOS (FreeRTOS, Zephyr), desenvolvimento de drivers de hardware e otimização de código para recursos limitados (memória, processamento, energia). Domínio em ferramentas de prototipagem (osciloscópios, analisadores lógicos), depuração de firmware e testes de hardware/software integration. Conhecimento em protocolos de conectividade IoT (MQTT, CoAP, LoRaWAN, BLE, Wi-Fi) e plataformas cloud para IoT (AWS IoT Core, Azure IoT Hub, Google Cloud IoT). O profissional será responsável por projetar e desenvolver software para dispositivos embarcados e sistemas IoT, desde a camada de firmware até a integração com serviços cloud, garantindo confiabilidade, segurança e eficiência energética."
))

DESCRIPTIONS.append((
    "Requer experiência em desenvolvimento com Swift/SwiftUI para iOS ou Kotlin/Jetpack",
    "Requer experiência em desenvolvimento com Swift/SwiftUI para iOS ou Kotlin/Jetpack Compose para Android, além de domínio de frameworks multiplataforma como React Native ou Flutter. Conhecimento profundo em padrões de arquitetura mobile (MVVM, Clean Architecture, BLoC), gerenciamento de estado (Redux, MobX, Riverpod, Provider) e navegação (React Navigation, Jetpack Navigation). Experiência com integração de APIs REST e GraphQL, armazenamento local (SQLite, SharedPreferences, CoreData, Room) e serviços nativos (push notifications, câmera, GPS, biometria). Domínio em testes automatizados (XCTest, Espresso, Detox), CI/CD para mobile (Fastlane, Bitrise, Codemagic) e publicação nas App Stores (App Store Connect, Google Play Console). O profissional será responsável por desenvolver aplicativos mobile de alta performance, colaborando com designers, backend e produto."
))

DESCRIPTIONS.append((
    "Requer formação acadêmica avançada, frequentemente mestrado ou doutorado, em áreas",
    "Requer formação acadêmica avançada, frequentemente mestrado ou doutorado, em áreas como ciência da computação, engenharia, matemática ou áreas correlatas. Experiência em pesquisa aplicada, desenvolvimento de tecnologias emergentes e publicação em conferências e revistas científicas reconhecidas. Domínio em métodos de pesquisa experimental e analítica, análise estatística, revisão crítica de literatura e elaboração de projetos de pesquisa. Conhecimento em áreas de fronteira tecnológica como computação quântica, materiais avançados, biotecnologia, energias renováveis ou inteligência artificial. Habilidade para liderar projetos de P&D, gerenciar orçamentos de pesquisa, colaborar com universidades e centros de pesquisa e traduzir descobertas acadêmicas em aplicações comerciais viáveis. O profissional será responsável por conduzir pesquisas inovadoras, proteger propriedade intelectual e impulsionar o pipeline de inovação da empresa."
))

DESCRIPTIONS.append((
    "Requer formação sólida em Ciência da Computação, Matemática ou Estatística, com domínio",
    "Requer formação sólida em Ciência da Computação, Matemática ou Estatística, com domínio de fundamentos de aprendizado de máquina, aprendizado profundo (deep learning) e processamento de linguagem natural (NLP). Proficiência em frameworks de ML como TensorFlow, PyTorch ou scikit-learn e experiência com pipelines de dados para treinamento e deploy de modelos (MLflow, Kubeflow, SageMaker). Conhecimento em técnicas de feature engineering, validação cruzada, otimização de hiperparâmetros e métricas de avaliação de modelos. Experiência com LLMs (Large Language Models), RAG (Retrieval-Augmented Generation), fine-tuning de modelos foundation e MLOps. Desejável experiência com visão computacional, sistemas de recomendação ou detecção de anomalias. O profissional será responsável por desenvolver e deployar modelos de IA/ML em produção, colaborando com engenheiros de dados e de software."
))

DESCRIPTIONS.append((
    "Requer graduação em Matemática, Estatística, Ciência da Computação ou área correlata, com",
    "Requer graduação em Matemática, Estatística, Ciência da Computação ou área correlata, com domínio de programação (Python, R, SQL) e ferramentas de visualização de dados (Tableau, Power BI, Looker, Metabase). Experiência com técnicas estatísticas (regressão, testes de hipótese, séries temporais, A/B testing), análise exploratória de dados e storytelling com dados. Domínio em ferramentas de BI para criação de dashboards interativos e relatórios automatizados. Conhecimento em big data (Spark, Hadoop) e data warehouses (Snowflake, BigQuery) é diferencial. Habilidade para comunicar insights complexos de forma clara para stakeholders de negócio, identificar tendências e padrões nos dados e apoiar a tomada de decisão baseada em evidências. O profissional será responsável por analisar grandes volumes de dados, gerar relatórios e dashboards que suportem decisões estratégicas."
))

DESCRIPTIONS.append((
    "Requer habilidades interpessoais e de comunicação para funções de RH, suporte e",
    "Requer habilidades interpessoais e de comunicação para funções de RH, suporte e administração em ambientes de tecnologia. Experiência com recrutamento e seleção técnico (sourcing, screening, entrevistas comportamentais e técnicas), gestão de desempenho e desenvolvimento de carreira para profissionais de tecnologia. Domínio em ferramentas de RH (Workday, BambooHR, Rippling) e ATS (Greenhouse, Lever, iCIMS). Conhecimento em cultura organizacional, employer branding, programas de integração (onboarding) e offboarding e compliance trabalhista em múltiplas jurisdições. Habilidade para gerenciar relações com fornecedores de tecnologia, negociar contratos e coordenar projetos de transformação organizacional. O profissional será responsável por atração, retenção e desenvolvimento de talentos, gestão de benefícios e remuneração e suporte administrativo para equipes técnicas de alto desempenho."
))

DESCRIPTIONS.append((
    "Requer sólidos conhecimentos em testes manuais e automatizados, com domínio de ferramentas",
    "Requer sólidos conhecimentos em testes manuais e automatizados, com domínio de ferramentas como Selenium, Cypress, Playwright e frameworks de teste (JUnit, TestNG, pytest, Jest). Experiência com planejamento de testes, criação de casos de teste, execução de testes funcionais, de regressão, de performance e de segurança. Domínio em API testing (Postman, REST Assured), testes de carga (JMeter, k6, Locust) e testes de acessibilidade (axe, Lighthouse). Conhecimento em integração contínua (CI/CD) para automação de testes, gerenciamento de defeitos (Bugzilla, Jira) e métricas de qualidade (coverage, defect density, MTTR). Experiência com BDD (Behavior-Driven Development) e TDD (Test-Driven Development). O profissional será responsável por garantir a qualidade de software, definir estratégias de teste, automação de testes e reports de qualidade."
))

DESCRIPTIONS.append((
    "Demanda forte capacidade de pensamento estratégico, priorização de backlogs e construção",
    "Demanda forte capacidade de pensamento estratégico, priorização de backlogs e construção de roadmaps alinhados aos objetivos de negócio. Exige experiência com frameworks de product management (RICE, MoSCoW, OKRs), métodos de descoberta de produto (design sprints, user story mapping, jobs-to-be-done) e ferramentas (Jira Product Discovery, Productboard, Amplitude). Habilidade para conduzir pesquisa com usuários, analisar métricas de produto (funnel, retention, engagement, NPS) e tomar decisões baseadas em dados. Domínio em escrita de PRDs (Product Requirements Documents), definição de critérios de aceite e user stories bem estruturadas. Experiência com pricing strategy, go-to-market e lançamento de features. O profissional será responsável pelo ciclo de vida completo do produto, da descoberta à entrega, colaborando com engenharia, design, marketing e stakeholders de negócio."
))

print(f"Prepared {len(DESCRIPTIONS)} full descriptions")

# Build prefix -> full description mapping
PREFIX_MAP = {}
for prefix, full in DESCRIPTIONS:
    PREFIX_MAP[prefix] = full

# ═══════════════════════════════════════════════════════════════
# UPDATE ALL JSON DATA FILES
# ═══════════════════════════════════════════════════════════════

os.makedirs(STAGING, exist_ok=True)
staging_data = os.path.join(STAGING, "public", "data")
os.makedirs(staging_data, exist_ok=True)

total_updated = 0
unmatched = set()

for f in sorted(glob.glob(os.path.join(DATA_DIR, "*.json"))):
    fname = os.path.basename(f)
    with open(f) as fp:
        data = json.load(fp)
    if isinstance(data, list):
        for job in data:
            old_desc = job.get('description', '')
            if not old_desc:
                continue
            # Match by checking first 70 chars of prefix
            matched = False
            for prefix, full in PREFIX_MAP.items():
                if old_desc.startswith(prefix):
                    job['description'] = full
                    total_updated += 1
                    matched = True
                    break
            if not matched and old_desc not in unmatched:
                unmatched.add(old_desc)
        with open(os.path.join(staging_data, fname), 'w', encoding='utf-8') as fp:
            json.dump(data, fp, ensure_ascii=False)
        print(f"  Updated {fname}: {len(data)} jobs")
    else:
        shutil.copy2(f, os.path.join(staging_data, fname))
        print(f"  Copied {fname}")

if unmatched:
    print(f"\nWARNING: {len(unmatched)} unmatched descriptions:")
    for u in list(unmatched)[:3]:
        print(f"  {u[:80]}...")

print(f"\nTotal jobs with updated descriptions: {total_updated}")

# Copy static assets
for asset in ["logo.png", "favicon.ico", "apple-touch-icon.png", "logo.svg"]:
    src = os.path.join(BASE, "public", asset)
    dst = os.path.join(STAGING, "public", asset)
    if os.path.exists(src):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)

for d in ["og", "brand"]:
    src = os.path.join(BASE, "public", d)
    dst = os.path.join(STAGING, "public", d)
    if os.path.exists(src):
        shutil.copytree(src, dst, dirs_exist_ok=True)

print("\n=== Phase 1 Complete ===")
print(f"Staging dir: {STAGING}")