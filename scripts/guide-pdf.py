import sys, os
sys.path.insert(0, '/home/z/my-project/skills/pdf/scripts')
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm, cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, PageBreak, KeepTogether, HRFlowable)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Register fonts
FONT_DIR = '/usr/share/fonts'
pdfmetrics.registerFont(TTFont('Inter', f'{FONT_DIR}/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Inter-Bold', f'{FONT_DIR}/truetype/dejavu/DejaVuSans-Bold.ttf'))
registerFontFamily('Inter', normal='Inter', bold='Inter-Bold')

# Colors
PRIMARY = HexColor('#0f172a')
ACCENT = HexColor('#0ea5e9')
ACCENT2 = HexColor('#0284c7')
TEXT_DARK = HexColor('#1e1d1b')
TEXT_MUTED = HexColor('#88867e')
BG_LIGHT = HexColor('#f3f3f2')
BORDER = HexColor('#c7c1ad')
SUCCESS = HexColor('#377b4e')
WARNING = HexColor('#9c7d3e')
ERROR = HexColor('#aa4c44')
INFO = HexColor('#4b6e91')

PAGE_W, PAGE_H = A4
MARGIN = 2.2 * cm
CONTENT_W = PAGE_W - 2 * MARGIN

# Styles
styles = getSampleStyleSheet()

title_style = ParagraphStyle('Title', fontName='Inter-Bold', fontSize=28,
    textColor=PRIMARY, leading=34, spaceAfter=6*mm, alignment=TA_LEFT)

subtitle_style = ParagraphStyle('Subtitle', fontName='Inter', fontSize=13,
    textColor=ACCENT, leading=18, spaceAfter=10*mm)

h1_style = ParagraphStyle('H1', fontName='Inter-Bold', fontSize=20,
    textColor=PRIMARY, leading=26, spaceBefore=10*mm, spaceAfter=5*mm)

h2_style = ParagraphStyle('H2', fontName='Inter-Bold', fontSize=15,
    textColor=ACCENT2, leading=20, spaceBefore=7*mm, spaceAfter=3*mm)

h3_style = ParagraphStyle('H3', fontName='Inter-Bold', fontSize=12,
    textColor=TEXT_DARK, leading=16, spaceBefore=5*mm, spaceAfter=2*mm)

body_style = ParagraphStyle('Body', fontName='Inter', fontSize=10,
    textColor=TEXT_DARK, leading=16, spaceAfter=3*mm, alignment=TA_JUSTIFY)

bullet_style = ParagraphStyle('Bullet', fontName='Inter', fontSize=10,
    textColor=TEXT_DARK, leading=16, spaceAfter=2*mm,
    leftIndent=12*mm, bulletIndent=5*mm)

note_style = ParagraphStyle('Note', fontName='Inter', fontSize=9,
    textColor=INFO, leading=14, spaceAfter=3*mm,
    leftIndent=8*mm, borderColor=INFO, borderWidth=1,
    borderPadding=6, backColor=HexColor('#f0f7ff'))

warn_style = ParagraphStyle('Warn', fontName='Inter', fontSize=9,
    textColor=WARNING, leading=14, spaceAfter=3*mm,
    leftIndent=8*mm, borderColor=WARNING, borderWidth=1,
    borderPadding=6, backColor=HexColor('#fffbeb'))

error_style = ParagraphStyle('Error', fontName='Inter', fontSize=9,
    textColor=ERROR, leading=14, spaceAfter=3*mm,
    leftIndent=8*mm, borderColor=ERROR, borderWidth=1,
    borderPadding=6, backColor=HexColor('#fef2f2'))

success_style = ParagraphStyle('Success', fontName='Inter', fontSize=9,
    textColor=SUCCESS, leading=14, spaceAfter=3*mm,
    leftIndent=8*mm, borderColor=SUCCESS, borderWidth=1,
    borderPadding=6, backColor=HexColor('#f0fdf4'))

code_style = ParagraphStyle('Code', fontName='Inter', fontSize=8.5,
    textColor=HexColor('#334155'), leading=13, spaceAfter=3*mm,
    leftIndent=8*mm, backColor=HexColor('#f8fafc'),
    borderColor=BORDER, borderWidth=0.5, borderPadding=8)

footer_style = ParagraphStyle('Footer', fontName='Inter', fontSize=8,
    textColor=TEXT_MUTED, leading=10, alignment=TA_CENTER)

small_style = ParagraphStyle('Small', fontName='Inter', fontSize=9,
    textColor=TEXT_MUTED, leading=13, spaceAfter=2*mm)

def bullet(text):
    return Paragraph(f"<b>&#8226;</b> {text}", bullet_style)

def numbered(n, text):
    return Paragraph(f"<b>{n}.</b> {text}", bullet_style)

def note(text):
    return Paragraph(f"<b>NOTA:</b> {text}", note_style)

def warn(text):
    return Paragraph(f"<b>ATENCAO:</b> {text}", warn_style)

def err(text):
    return Paragraph(f"<b>CRITICO:</b> {text}", error_style)

def success(text):
    return Paragraph(f"<b>OK:</b> {text}", success_style)

def code(text):
    return Paragraph(text.replace('<','&lt;').replace('>','&gt;'), code_style)

def hr():
    return HRFlowable(width='100%', thickness=0.5, color=BORDER,
        spaceAfter=5*mm, spaceBefore=3*mm)

# Build document
output_path = '/home/z/my-project/download/Guia-Publicacao-Seguranca-WW.pdf'
doc = SimpleDocTemplate(output_path, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=MARGIN, bottomMargin=MARGIN)

story = []

# ============ COVER ============
story.append(Spacer(1, 60*mm))
story.append(Paragraph("W-W World of Work", ParagraphStyle('CoverTitle',
    fontName='Inter-Bold', fontSize=36, textColor=PRIMARY, leading=42,
    alignment=TA_CENTER, spaceAfter=8*mm)))
story.append(Paragraph("Guia Completo de Publicacao e Seguranca",
    ParagraphStyle('CoverSub', fontName='Inter', fontSize=16, textColor=ACCENT,
    leading=22, alignment=TA_CENTER, spaceAfter=5*mm)))
story.append(Paragraph("Como publicar na internet, fazer atualizacoes e proteger contra invasores",
    ParagraphStyle('CoverDesc', fontName='Inter', fontSize=11, textColor=TEXT_MUTED,
    leading=16, alignment=TA_CENTER, spaceAfter=20*mm)))
story.append(HRFlowable(width='40%', thickness=1, color=ACCENT,
    spaceAfter=10*mm, spaceBefore=0, hAlign='CENTER'))
story.append(Paragraph("Documento Tecnico | Versao 1.0 | Julho 2025",
    ParagraphStyle('CoverMeta', fontName='Inter', fontSize=9, textColor=TEXT_MUTED,
    leading=13, alignment=TA_CENTER)))
story.append(Spacer(1, 15*mm))
story.append(Paragraph("Confidencial - Uso interno",
    ParagraphStyle('CoverConf', fontName='Inter', fontSize=8, textColor=ERROR,
    leading=11, alignment=TA_CENTER)))
story.append(PageBreak())

# ============ SUMARIO ============
story.append(Paragraph("Sumario", h1_style))
story.append(hr())
story.append(numbered(1, "Como Publicar o Site na Internet"))
story.append(numbered(2, "Opcoes de Hospedagem (Vercel, AWS, VPS)"))
story.append(numbered(3, "Passo a Passo: Publicacao na Vercel (Recomendada)"))
story.append(numbered(4, "Como Fazer Atualizacoes Futuras"))
story.append(numbered(5, "Seguranca: Protegendo contra Invasores"))
story.append(numbered(6, "Firewall e Portas de Entrada"))
story.append(numbered(7, "Autenticacao e Acesso Seguro"))
story.append(numbered(8, "Monitoramento e Resposta a Incidentes"))
story.append(numbered(9, "Checklist de Seguranca Final"))
story.append(PageBreak())

# ============ SECAO 1 ============
story.append(Paragraph("1. Como Publicar o Site na Internet", h1_style))
story.append(hr())
story.append(Paragraph("Para que o site W-W World of Work fique acessivel globalmente na internet, voce precisa de tres componentes fundamentais: um dominio proprio (como ww.jobs), uma plataforma de hospedagem que execute o Next.js, e uma configuracao de DNS que direcione o dominio para o servidor. O processo completo envolve desde a compra do dominio ate a configuracao de certificados SSL para conexao segura (HTTPS), passando pela implantacao do codigo-fonte no servidor de producao e pela validacao de que todas as 20 paginas de paises estao gerando corretamente o sitemap.xml e os metadados SEO para o Google.", body_style))

story.append(Paragraph("Existem diversas opcoes de hospedagem disponiveis no mercado, cada uma com vantagens e desvantagens especificas. A escolha depende do seu orcamento, conhecimento tecnico e expectativa de trafego. Abaixo detalhamos as tres principais opcoes, com foco na recomendacao ideal para o seu caso.", body_style))

story.append(Paragraph("1.1 Opcoes de Hospedagem", h2_style))

# Table: Hosting comparison
table_data = [
    [Paragraph('<b>Plataforma</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13)),
     Paragraph('<b>Custo Mensal</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13)),
     Paragraph('<b>Dificuldade</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13)),
     Paragraph('<b>Recomendacao</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13))],
    [Paragraph('Vercel', body_style), Paragraph('Gratis a $20', body_style),
     Paragraph('Facil', success_style), Paragraph('Melhor para iniciar', body_style)],
    [Paragraph('AWS / CloudFront', body_style), Paragraph('$15 a $100+', body_style),
     Paragraph('Media', warn_style), Paragraph('Para escala global', body_style)],
    [Paragraph('VPS (DigitalOcean)', body_style), Paragraph('$5 a $50', body_style),
     Paragraph('Avancada', error_style), Paragraph('Controle total', body_style)],
]

t = Table(table_data, colWidths=[CONTENT_W*0.22, CONTENT_W*0.22, CONTENT_W*0.20, CONTENT_W*0.36])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), ACCENT),
    ('TEXTCOLOR', (0,0), (-1,0), HexColor('#ffffff')),
    ('GRID', (0,0), (-1,-1), 0.5, BORDER),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor('#ffffff'), HexColor('#f8fafc')]),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
]))
story.append(t)
story.append(Spacer(1, 5*mm))

# ============ SECAO 2 ============
story.append(Paragraph("2. Vercel: A Melhor Opcao para Iniciar", h1_style))
story.append(hr())
story.append(Paragraph("A Vercel e a plataforma criadora do Next.js e oferece a melhor integracao possivel com o seu projeto. Alem do plano gratuito ser suficiente para o inicio, ela fornece CDN global (o site carrega rapido em qualquer pais), certificado SSL automatico, deploy continuo (cada alteracao no codigo e publicada automaticamente), e suporte nativo a SSG (Static Site Generation) que ja configuramos no seu projeto com as 20 paginas de paises pre-geradas.", body_style))

story.append(Paragraph("Com a Vercel, nao e necessario configurar servidores, instalar dependencias ou gerenciar infraestrutura. Voce faz o upload do codigo e a plataforma cuida de tudo: build, deploy, CDN, SSL e monitoramento basico. Isso e essencial para que voce possa se concentrar no negocio (cadastrar empresas, atrair candidatos) em vez de gastar tempo com operacao de servidor.", body_style))

story.append(Paragraph("2.1 Passo a Passo: Publicacao na Vercel", h2_style))

story.append(numbered(1, "<b>Crie uma conta</b> em vercel.com usando seu GitHub, GitLab ou email."))
story.append(numbered(2, "<b>Faca upload do projeto:</b> Va em 'New Project' e importe o repositorio do GitHub. Se ainda nao tem repositorio, suba a pasta do projeto para o GitHub primeiro usando: <b>git init, git add ., git commit -m 'v1', git remote add origin URL, git push -u origin main</b>."))
story.append(numbered(3, "<b>Configure o dominio:</b> Em Settings > Domains, adicione 'ww.jobs' (ou outro dominio que comprou). A Vercel guia a configuracao DNS passo a passo."))
story.append(numbered(4, "<b>SSL automatico:</b> A Vercel gera o certificado HTTPS automaticamente ao conectar o dominio. Nenhuma configuracao extra necessaria."))
story.append(numbered(5, "<b>Deploy automatico:</b> Cada push para a branch 'main' do GitHub aciona um novo deploy automatico na Vercel."))

story.append(note("O plano gratuito da Vercel inclui 100GB de banda mensal, SSL automatico, CDN global e previews automaticas para cada alteracao de codigo. Isso e mais do que suficiente para o lancamento."))

story.append(Paragraph("2.2 Comprando um Dominio", h2_style))
story.append(Paragraph("O dominio e o endereco do seu site na internet. Para uma plataforma de empregos global, recomenda-se registrar um dominio .jobs, .careers ou .com curto e memoravel. Registradores confiaveis incluem Namecheap (a partir de $5/ano), Cloudflare Registrar (custo de atacado sem margem), e GoDaddy. Apos a compra, configure os DNS apontando para a Vercel: crie um registro CNAME com nome '@' apontando para 'cname.vercel-dns.com' e um registro A com nome '@' apontando para '76.76.21.21'.", body_style))

# ============ SECAO 3 ============
story.append(Paragraph("3. Como Fazer Atualizacoes Futuras", h1_style))
story.append(hr())
story.append(Paragraph("O processo de atualizacao do site segue um fluxo simples e seguro. Todas as alteracoes sao feitas no codigo-fonte local, testadas, e depois enviadas para a Vercel via Git. Isso garante que voce sempre tem um backup do codigo, pode reverter alteracoes se algo der errado, e mantem um historico completo de todas as versoes ja publicadas.", body_style))

story.append(Paragraph("3.1 Fluxo de Atualizacao", h2_style))
story.append(numbered(1, "<b>Edite o codigo localmente</b> no seu computador usando VS Code ou outro editor."))
story.append(numbered(2, "<b>Teste localmente</b> executando 'npm run dev' e verificando as alteracoes no navegador em localhost:3000."))
story.append(numbered(3, '<b>Commit e push:</b> Use git add ., git commit e git push para enviar ao GitHub.'))
story.append(numbered(4, "<b>Deploy automatico:</b> A Vercel detecta o push e faz o deploy automaticamente em 1-2 minutos. Voce pode acompanhar o progresso no painel da Vercel."))

story.append(Paragraph("3.2 Tipos de Atualizacao Comuns", h2_style))
story.append(bullet("<b>Adicionar novos paises:</b> Edite src/lib/countries.ts para adicionar o pais, crie os 8 empregos em src/app/api/jobs/route.ts, e adicione as traducoes em src/lib/i18n.ts."))
story.append(bullet("<b>Atualizar vagas:</b> Modifique o array de jobs no arquivo route.ts. O sitemap.xml e os metadados SEO sao atualizados automaticamente."))
story.append(bullet("<b>Mudar visual:</b> Edite os componentes em src/app/page.tsx e src/app/[country]/page.tsx. O Tailwind CSS facilita qualquer alteracao visual."))
story.append(bullet("<b>Adicionar idiomas:</b> Expanda o array LANGUAGES e as traducoes em src/lib/i18n.ts."))

story.append(warn("NUNCA edite o codigo diretamente na Vercel. Sempre faca alteracoes localmente, teste, e depois faca git push. Isso garante seguranca e rastreabilidade."))

# ============ SECAO 4 ============
story.append(Paragraph("4. Seguranca: Protegendo contra Invasores", h1_style))
story.append(hr())
story.append(Paragraph("A seguranca do site W-W e dividida em camadas de protecao, cada uma responsavel por bloquear um tipo especifico de ataque. Nenhuma medida isolada e suficiente: a seguranca efetiva vem da combinacao de multiplas camadas. Pense como um edificio: portas trancadas, cameras, alarmes, seguranca 24h e seguro. Se uma camada falhar, as outras continuam protegendo.", body_style))

story.append(Paragraph("4.1 Camada 1: Protecao de Infraestrutura (Vercel)", h2_style))
story.append(Paragraph("A Vercel ja fornece protecao de infraestrutura de nivel empresarial sem configuracao adicional. Isso inclui protecao contra ataques DDoS (quando milhoes de requisicoes sao enviadas para derrubar o site), WAF (Web Application Firewall) que bloqueia requests maliciosos, HTTPS forcado (todas as conexoes sao criptografadas), e isolamento entre projetos. Essas protecoes sao ativadas automaticamente e nao exigem nenhuma acao sua, mas e importante entender o que elas fazem para configurar as camadas seguintes corretamente.", body_style))

story.append(bullet("<b>DDoS Protection:</b> A Vercel absorve picos de trafego malicioso antes que atinjam seu site. Ataques de negacao de servico sao bloqueados na borda da rede."))
story.append(bullet("<b>WAF (Web Application Firewall):</b> Analisa cada request e bloqueia padroes conhecidos de ataque: injecao de SQL, XSS (cross-site scripting), e payloads maliciosos."))
story.append(bullet("<b>HTTPS Automatico:</b> Toda comunicacao e criptografada com TLS 1.3. Dados de usuarios (email, senhas, pagamentos) nunca trafegam em texto puro."))
story.append(bullet("<b>Isolamento:</b> Cada deploy roda em um ambiente isolado (serverless). Mesmo que um invasor consiga explorar uma vulnerabilidade, nao tera acesso ao sistema operacional do servidor."))

story.append(success("A Vercel e auditada conforme SOC 2 Type II, ISO 27001 e GDPR. O nivel de seguranca de infraestrutura e o mesmo usado por empresas como Uber, Netflix e Washington Post."))

story.append(Paragraph("4.2 Camada 2: Headers de Seguranca HTTP", h2_style))
story.append(Paragraph("Headers HTTP sao instrucoes que o servidor envia ao navegador em cada resposta. Eles configuram barreiras de seguranca no proprio navegador do usuario, impedindo que o site seja usado como vetor de ataque contra seus visitantes. No seu projeto, alguns ja estao configurados no next.config.ts, mas precisam ser expandidos para protecao completa.", body_style))

# Security headers table
sec_headers = [
    [Paragraph('<b>Header</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13)),
     Paragraph('<b>Funcao</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13)),
     Paragraph('<b>Status</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13))],
    [Paragraph('X-Frame-Options', body_style), Paragraph('Impede que o site seja carregado em iframes de outros sites (evita clickjacking)', body_style), Paragraph('Configurado', success_style)],
    [Paragraph('Content-Security-Policy', body_style), Paragraph('Controla quais recursos o navegador pode carregar (scripts, imagens, fontes)', body_style), Paragraph('Precisa ajuste', warn_style)],
    [Paragraph('X-Content-Type-Options', body_style), Paragraph('Impede o navegador de interpretar arquivos como tipo diferente do declarado', body_style), Paragraph('Precisa adicionar', warn_style)],
    [Paragraph('Strict-Transport-Security', body_style), Paragraph('Forca HTTPS por 1 ano - impede ataques de degradacao de conexao', body_style), Paragraph('Precisa adicionar', warn_style)],
    [Paragraph('Referrer-Policy', body_style), Paragraph('Controla quanto da URL anterior e enviada ao navegar para outro site', body_style), Paragraph('Precisa adicionar', warn_style)],
    [Paragraph('Permissions-Policy', body_style), Paragraph('Controla quais APIs do navegador o site pode usar (camera, mic, geolocation)', body_style), Paragraph('Precisa adicionar', warn_style)],
]

t2 = Table(sec_headers, colWidths=[CONTENT_W*0.28, CONTENT_W*0.52, CONTENT_W*0.20])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), ACCENT),
    ('GRID', (0,0), (-1,-1), 0.5, BORDER),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor('#ffffff'), HexColor('#f8fafc')]),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
]))
story.append(t2)

story.append(Paragraph("4.3 Camada 3: Content Security Policy (CSP)", h2_style))
story.append(Paragraph("A Content Security Policy (CSP) e a camada de seguranca mais poderosa no nivel do navegador. Ela define uma lista branca de fontes confiaveis para cada tipo de recurso: scripts, estilos, imagens, fontes e conexoes de rede. Se um invasor conseguir injetar um script malicioso no seu site (via XSS), a CSP impedira que o navegador o execute porque o script nao estara na lista branca. A CSP deve ser configurada no next.config.ts e e essencial para a seguranca do seu site.", body_style))

story.append(Paragraph("A configuracao recomendada para o W-W inclui permitir scripts apenas do proprio dominio e da Vercel, estilos apenas inline e do proprio dominio, fontes apenas do Google Fonts e fonts do sistema, imagens de qualquer origem (necessario para as bandeiras dos paises e logos de empresas), e conexoes apenas para a propria API e servicos de analytics. Nunca use 'unsafe-inline' para scripts em producao, pois isso anula completamente a protecao contra XSS.", body_style))

story.append(Paragraph("4.4 Camada 4: Autenticacao e Acesso Admin", h2_style))
story.append(Paragraph("Quando voce precisar de um painel administrativo para gerenciar vagas, usuarios ou configuracoes, a autenticacao deve seguir principios de seguranca rigorosos. Nunca implemente autenticacao propria (com senhas em texto puro ou criptografia caseira). Use sempre provedores de identidade estabelecidos e bibliotecas auditadas.", body_style))

story.append(bullet("<b>Autenticacao com NextAuth.js / Auth.js:</b> Biblioteca oficial do Next.js que suporta login com Google, GitHub, email/senha, e mais de 50 provedores. Gerencia sessoes, tokens JWT e cookies seguros automaticamente."))
story.append(bullet("<b>Clerk:</b> Solucao completa de autenticacao com UI pre-construida, verificacao de email em dois passos, autenticacao em duas etapas (2FA), e protecao contra brute force."))
story.append(bullet("<b>Senhas:</b> Se usar email/senha, armazene sempre com bcrypt ou argon2 (nunca MD5 ou SHA1). Exija senhas de no minimo 12 caracteres com maiusculas, minusculas, numeros e simbolos."))
story.append(bullet("<b>Sessoes:</b> Use cookies httpOnly, secure e sameSite=strict. Nunca armazene tokens de sessao no localStorage (vulneravel a XSS)."))

story.append(err("NUNCA armazene senhas em texto puro ou use hash simples (MD5, SHA1). Use sempre bcrypt (custo minimo 12) ou Argon2id. Uma unica senha comprometida pode destruir a reputacao de toda a plataforma."))

story.append(Paragraph("4.5 Camada 5: Protecao da API e Dados", h2_style))
story.append(Paragraph("A API do seu site (/api/jobs) e o ponto de entrada para todos os dados. Ela precisa ser protegida contra abuso e ataques. As medidas essenciais incluem rate limiting (limitar o numero de requisicoes por IP por minuto), validacao de entrada (nunca confiar em dados enviados pelo usuario), CORS restritivo (permitir requests apenas do proprio dominio), e sanitizacao de queries para evitar injecao de SQL se no futuro conectar um banco de dados real.", body_style))

story.append(bullet("<b>Rate Limiting:</b> Limite a 100 requests por IP por minuto. Use a biblioteca 'rate-limiter-flexible' no Next.js. Isso impede ataques de forca bruta e abuso da API."))
story.append(bullet("<b>CORS:</b> Configure o header Access-Control-Allow-Origin para aceitar apenas 'https://ww.jobs' e nenhum outro dominio. Isso impede que sites maliciosos facam requests para sua API."))
story.append(bullet("<b>Validacao:</b> Use Zod ou Yup para validar todos os dados recebidos em APIs. Nunca passe dados do usuario diretamente para queries de banco de dados."))
story.append(bullet("<b>HTTPS Only:</b> Configure cookies com flag 'secure' para que so sejam enviados sobre HTTPS. A Vercel ja forca HTTPS, mas certifique-se de que nao ha rotas HTTP abertas."))

story.append(Paragraph("4.6 Camada 6: Seguranca do Banco de Dados", h2_style))
story.append(Paragraph("Quando o site evoluir de dados mock para um banco de dados real (para armazenar usuarios, vagas, pagamentos), a seguranca do banco se torna critica. As melhores praticas incluem usar Prisma ORM (ja integrado ao Next.js) que automaticamente protege contra injecao de SQL, manter credenciais do banco em variaveis de ambiente (.env) nunca no codigo, usar conexoes SSL para o banco de dados, implementar backups automaticos diarios, e aplicar o principio do menor privilegio: o usuario do banco de dados deve ter acesso apenas as tabelas necessarias, nunca acesso de administrador.", body_style))

story.append(bullet("<b>Prisma ORM:</b> Gera queries parametrizadas automaticamente. Injecao de SQL e impossivel mesmo que o desenvolvedor tente."))
story.append(bullet("<b>Variaveis de ambiente:</b> DATABASE_URL, SECRET_KEY e outras credenciais ficam no arquivo .env que NUNCA e enviado ao GitHub (adicionar ao .gitignore). Na Vercel, configure como Environment Variables no painel."))
story.append(bullet("<b>Backups:</b> Configure backups diarios automaticos. Para PostgreSQL (recomendado), use o pg_dump automatizado ou o backup nativo do provedor (Vercel Postgres, Supabase, Neon)."))
story.append(bullet("<b>Encriptacao em repouso:</b> Dados sensiveis (emails, pagamentos) devem ser criptografados no banco usando AES-256, nao apenas em transito (HTTPS)."))

# ============ SECAO 5 ============
story.append(Paragraph("5. Firewall e Portas de Entrada", h1_style))
story.append(hr())
story.append(Paragraph("O conceito de 'portas de entrada' na web moderna e diferente de um servidor tradicional. Em vez de portas de rede (porta 80, 443, 3306), os pontos de entrada de um site Next.js sao as rotas da API, os formularios, os endpoints de autenticacao e as integracoes com servicos externos. Cada um desses e uma potencial porta de entrada para um invasor, e cada um precisa de protecao especifica.", body_style))

# Ports/entry points table
entry_table = [
    [Paragraph('<b>Ponto de Entrada</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13)),
     Paragraph('<b>Risco</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13)),
     Paragraph('<b>Protecao</b>', ParagraphStyle('th', fontName='Inter-Bold', fontSize=9, textColor=HexColor('#ffffff'), leading=13))],
    [Paragraph('/api/jobs', body_style), Paragraph('Scraping, DDoS, injeao', body_style), Paragraph('Rate limiting + CORS + cache', body_style)],
    [Paragraph('/api/auth/*', body_style), Paragraph('Brute force, sequestro de conta', body_style), Paragraph('Rate limiting + 2FA + lockout', body_style)],
    [Paragraph('/api/payment/*', body_style), Paragraph('Fraude, interceptacao de dados', body_style), Paragraph('HTTPS + validacao + webhook signature', body_style)],
    [Paragraph('Formularios (newsletter, contato)', body_style), Paragraph('XSS, spam, injeao de header', body_style), Paragraph('Sanitizacao + captcha + rate limit', body_style)],
    [Paragraph('Upload de arquivos', body_style), Paragraph('Malware, RCE (remote code execution)', body_style), Paragraph('Validacao de tipo/tamanho + virus scan', body_style)],
    [Paragraph('Integracoes externas (Stripe, email)', body_style), Paragraph('Interceptacao de webhook, dados falsos', body_style), Paragraph('Webhook signature verification + HMAC', body_style)],
]

t3 = Table(entry_table, colWidths=[CONTENT_W*0.25, CONTENT_W*0.35, CONTENT_W*0.40])
t3.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), ACCENT),
    ('GRID', (0,0), (-1,-1), 0.5, BORDER),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [HexColor('#ffffff'), HexColor('#f8fafc')]),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
]))
story.append(t3)

story.append(Paragraph("Alem desses pontos de entrada, e fundamental fechar portas que nao sao usadas. No next.config.ts, remova qualquer importacao ou dependencia que nao seja estritamente necessaria. Cada dependencia a mais e um potencial vetor de ataque. Revise periodicamente as dependencias com 'npm audit' para identificar vulnerabilidades conhecidas, e atualize pacotes com 'npm update' sempre que patches de seguranca forem disponibilizados.", body_style))

# ============ SECAO 6 ============
story.append(Paragraph("6. Monitoramento e Resposta a Incidentes", h1_style))
story.append(hr())
story.append(Paragraph("Mesmo com todas as camadas de seguranca implementadas, e essencial ter monitoramento ativo para detectar e responder a incidentes rapidamente. O monitoramento permite identificar padroes suspeitosos (como um IP fazendo milhares de requests ou um usuario tentando acessar areas restritas) e tomar acao antes que um ataque cause danos significativos.", body_style))

story.append(Paragraph("6.1 Ferramentas de Monitoramento Recomendadas", h2_style))
story.append(bullet("<b>Vercel Analytics:</b> Gratuito e integrado. Mostra metricas de trafego, paginas mais visitadas, performance (Web Vitals) e dispositivos dos usuarios."))
story.append(bullet("<b>Sentry:</b> Detecta erros em tempo real. Quando um usuario encontra um erro, o Sentry captura automaticamente o stack trace, o navegador, a URL e os dados do usuario, e notifica voce instantaneamente. Gratuito para ate 5.000 eventos/mes."))
story.append(bullet("<b>Google Search Console:</b> Mostra como o Google ve o seu site, erros de rastreamento, posicoes nos resultados de busca e problemas de SEO. Essencial para monitorar o desempenho nos paises-alvo com alto desemprego."))
story.append(bullet("<b>Uptime Robot:</b> Monitora se o site esta no ar 24/7. Se o site ficar indisponivel, envia alerta por email, SMS ou Slack. Gratuito para ate 50 monitores."))
story.append(bullet("<b>Cloudflare (opcional):</b> Se mudar para um plano pago, o Cloudflare adiciona uma camada extra de WAF, bot protection e analytics de seguranca."))

story.append(Paragraph("6.2 Plano de Resposta a Incidentes", h2_style))
story.append(Paragraph("Todo site deve ter um plano claro do que fazer quando um incidente de seguranca ocorre. O tempo entre a deteccao e a resposta e critico: quanto mais rapido voce agir, menor o dano. O plano basico inclui quatro etapas: deteccao (identificar o incidente via monitoramento), contencao (isolar a area afetada, por exemplo, desativando uma API comprometida), erradicacao (remover a causa raiz, corrigir a vulnerabilidade) e recuperacao (restaurar o servico normal e verificar que a vulnerabilidade foi eliminada).", body_style))

# ============ SECAO 7 ============
story.append(Paragraph("7. Acesso Seguro ao Painel Admin", h1_style))
story.append(hr())
story.append(Paragraph("Para que VOCE possa acessar o site de forma segura para gerenciar conteudo, sem que ninguem consiga invadir, o painel administrativo deve seguir estas regras obrigatorias de seguranca. O acesso deve ser restrito por IP (se possivel), protegido por autenticacao em duas etapas, e todas as acoes administrativas devem ser logadas para auditoria.", body_style))

story.append(bullet("<b>URL secreta:</b> Nao use '/admin' ou '/dashboard' - use um caminho aleatorio como '/manage-x7k9q2' que so voce conhece."))
story.append(bullet("<b>IP Whitelist:</b> Configure para que o painel admin so seja acessivel do seu IP fixo. Na Vercel, use middleware para checar o IP antes de renderizar a rota."))
story.append(bullet("<b>2FA Obrigatorio:</b> Autenticacao em duas etapas com app autenticador (Google Authenticator, Authy). Nunca aceite apenas senha."))
story.append(bullet("<b>Sessao curta:</b> Configure sessoes de no maximo 30 minutos de inatividade. Apos isso, exigir novo login."))
story.append(bullet("<b>Logs de auditoria:</b> Registre quem acessou, quando, e o que fez. Se algo der errado, voce sabe exatamente quem foi responsavel."))

# ============ SECAO 8 - CHECKLIST ============
story.append(Paragraph("8. Checklist de Seguranca Final", h1_style))
story.append(hr())
story.append(Paragraph("Antes de publicar o site, verifique cada item deste checklist. Todos devem estar marcados como implementados ou planejados para o lancamento.", body_style))
story.append(Spacer(1, 3*mm))

checklist = [
    ('HTTPS forcado em todas as paginas', 'Vercel faz automaticamente'),
    ('Headers de seguranca configurados', 'Adicionar no next.config.ts'),
    ('Content Security Policy (CSP) ativa', 'Configurar no next.config.ts'),
    ('Rate limiting na API', 'Instalar rate-limiter-flexible'),
    ('CORS restritivo', 'Configurar no middleware'),
    ('Autenticacao com 2FA', 'Usar Clerk ou Auth.js + 2FA'),
    ('Senhas com bcrypt/argon2', 'Nunca texto puro'),
    ('Variaveis de ambiente (.env)', 'NUNCA no codigo'),
    ('.env no .gitignore', 'Ja configurado'),
    ('Dependencias auditadas (npm audit)', 'Rodar antes de cada deploy'),
    ('Sentry para erros', 'Instalar @sentry/nextjs'),
    ('Google Search Console ativo', 'Enviar sitemap apos publicar'),
    ('Uptime monitoring', 'Configurar Uptime Robot'),
    ('Backup do banco de dados', 'Automatizar backup diario'),
    ('Painel admin com URL secreta', 'Nao usar /admin padrao'),
    ('Logs de auditoria ativos', 'Registrar acoes admin'),
]

for item, detail in checklist:
    story.append(Paragraph(f"<b>[  ]</b> {item} <font color='#88867e' size='8'>- {detail}</font>", bullet_style))

story.append(Spacer(1, 10*mm))
story.append(hr())
story.append(Paragraph("Este documento deve ser revisado mensalmente e atualizado sempre que uma nova camada de seguranca for implementada ou quando surgirem novas ameletacas no ecossistema Next.js/Vercel.", small_style))

# Build
doc.build(story, onFirstPage=lambda c,d: None,
    onLaterPages=lambda c,d: None)

print(f'PDF saved: {output_path}')
