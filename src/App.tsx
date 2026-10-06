import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ClipboardEvent,
  type CSSProperties,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  Clock3,
  Database,
  FileCheck2,
  FileDown,
  Gauge,
  Menu,
  MousePointer2,
  Ship,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

type IconType = typeof Database;

type ReportData = {
  clientName: string;
  specialty: string;
  totalFreight: string;
  operations: string;
  proposals: string;
  timeBeforeMinutes: number;
  timeAfterMinutes: number;
  selectedModals: string[];
  insightText: string;
  potentialSavings: string;
  acquiredSavings: string;
  averageProposal: string;
  clientLogoUrl: string;
  spotmatchImageUrl: string;
  dashboardImageUrl: string;
  pageFourImageUrl: string;
  monthlyChartImageUrl: string;
  imagePositions: Partial<Record<ImageUrlKey, ImagePosition>>;
  imageZoom: Partial<Record<ImageUrlKey, number>>;
  hiddenPages: number[];
  hiddenItems: Partial<Record<VisibilityItemKey, boolean>>;
  copy: Record<string, string>;
  textColor: string;
  accentColor: string;
};

type ImageUrlKey =
  | "clientLogoUrl"
  | "spotmatchImageUrl"
  | "dashboardImageUrl"
  | "pageFourImageUrl"
  | "monthlyChartImageUrl";
type ImagePosition = { x: number; y: number };
type VisibilityItemKey =
  | "p1Brand"
  | "p1Heading"
  | "p1Metrics"
  | "p1Impact"
  | "p1Insight"
  | "p1Modals"
  | "p1Footer"
  | "p2Brand"
  | "p2Heading"
  | "p2Lead"
  | "p2Checklist"
  | "p2BottomCards"
  | "p2Dashboard"
  | "p2Footer"
  | "p3Brand"
  | "p3Heading"
  | "p3Quotes"
  | "p3References"
  | "p3Opportunity"
  | "p3Closing"
  | "p3Footer"
  | "p4Brand"
  | "p4Heading"
  | "p4Spotmatch"
  | "p4SupportImage";

type ReportStringKey = {
  [Key in keyof ReportData]: ReportData[Key] extends string ? Key : never;
}[keyof ReportData];
type ReportTextField = [ReportStringKey, string, string];

const imageUrlFields = new Set<ImageUrlKey>([
  "clientLogoUrl",
  "spotmatchImageUrl",
  "dashboardImageUrl",
  "pageFourImageUrl",
  "monthlyChartImageUrl",
]);

const visibilityOptions: Array<{
  page: number;
  items: Array<{ key: VisibilityItemKey; label: string }>;
}> = [
  {
    page: 0,
    items: [
      { key: "p1Brand", label: "Logo e assinatura" },
      { key: "p1Heading", label: "Título e descrição" },
      { key: "p1Metrics", label: "Indicadores" },
      { key: "p1Impact", label: "Faixa de impacto e benefícios" },
      { key: "p1Insight", label: "Mensagem de destaque" },
      { key: "p1Modals", label: "Modais utilizados" },
      { key: "p1Footer", label: "Rodapé" },
    ],
  },
  {
    page: 1,
    items: [
      { key: "p2Brand", label: "Logo e assinatura" },
      { key: "p2Heading", label: "Título" },
      { key: "p2Lead", label: "Texto de introdução" },
      { key: "p2Checklist", label: "Lista de itens" },
      { key: "p2BottomCards", label: "Cards de compliance e economia" },
      { key: "p2Dashboard", label: "Painel de economia" },
      { key: "p2Footer", label: "Rodapé" },
    ],
  },
  {
    page: 2,
    items: [
      { key: "p3Brand", label: "Logo e assinatura" },
      { key: "p3Heading", label: "Título e subtítulo" },
      { key: "p3Quotes", label: "Perguntas e respostas" },
      { key: "p3References", label: "Referências de mercado" },
      { key: "p3Opportunity", label: "Oportunidade mensal" },
      { key: "p3Closing", label: "Faixa de encerramento" },
      { key: "p3Footer", label: "Rodapé" },
    ],
  },
  {
    page: 3,
    items: [
      { key: "p4Brand", label: "Logo e assinatura" },
      { key: "p4Heading", label: "Título e subtítulo" },
      { key: "p4Spotmatch", label: "Conteúdo SpotMatch" },
      { key: "p4SupportImage", label: "Imagem de apoio" },
    ],
  },
];

const defaultCopy: Record<string, string> = {
  brandTagline: "MAIS VALOR PARA O SEU NEGÓCIO.",
  s1Eyebrow: "RELATÓRIO DE RESULTADOS · {empresaMaiuscula}",
  s1Title: "Resultados gerados pela",
  s1TitleAccent: "Cheap2Ship",
  metricFreight: "Valor total de fretes movimentados",
  metricOperations: "Operações de frete registradas no período",
  metricProposals: "Média de propostas recebidas por cotação",
  metricTime: "Tempo médio operacional por processo",
  reductionLabel: "de redução no tempo operacional",
  increaseLabel: "de aumento no tempo operacional",
  benefitAgility: "Mais agilidade",
  benefitControl: "Mais controle",
  benefitCompetition: "Mais competitividade",
  modalLabel: "Modais utilizados:",
  noModals: "Nenhum modal selecionado",
  footerOne: "TRANSPORTE MAIS INTELIGENTE PARA RESULTADOS REAIS.",
  s2Eyebrow: "VISIBILIDADE E GOVERNANÇA · {empresaMaiuscula}",
  s2Title: "De uma cotação para uma",
  s2TitleAccent: "negociação mais competitiva",
  s2Lead:
    "A {empresa} já possui boa participação dos fornecedores, recebendo em média {propostas} por cotação.",
  s2Intro:
    "A Cheap2Ship organiza essa concorrência e permite visualizar, em um único ambiente:",
  checklist1: "Todos os fornecedores convidados;",
  checklist2: "Todas as propostas recebidas;",
  checklist3: "Valores e condições apresentados;",
  checklist4: "Histórico das negociações;",
  checklist5: "Fornecedor vencedor;",
  checklist6: "Evidências do processo de decisão.",
  complianceTitle: "Compliance",
  complianceText:
    "Cada negociação passa a ter uma trilha completa, estruturada e auditável, reduzindo a dependência de informações dispersas em e-mails, telefone ou WhatsApp.",
  savingsTitle: "Economia e Competitividade",
  savingsText:
    "A plataforma já identificou {economiaPotencial} em economia potencial, com {economiaAdquirida} em economia já adquirida e custo médio de {custoMedio} por operação.",
  dashboardTitle: "PAINEL DE ECONOMIA",
  dashboardPlaceholder: "Indicadores fictícios por rota",
  footerTwo: "COMPETITIVIDADE QUE GERA ECONOMIA.",
  s3Eyebrow: "PRÓXIMA FRONTEIRA · BENCHMARK DE MERCADO",
  s3Title: "O próximo nível: inteligência para",
  s3TitleAccent: "reduzir ainda mais o custo",
  s3Subtitle: "Cheap2Ship + Indexador de Fretes",
  quoteOne: "Hoje, {empresa} consegue responder:",
  quoteOneQuestion: "“Qual fornecedor apresentou o menor preço?”",
  quoteTwo: "Com o Indexador de Fretes, passamos a responder também:",
  quoteTwoQuestion: "“Esse é realmente um bom preço para essa rota?”",
  referenceIntro:
    "A plataforma permite comparar a cotação com referências de mercado, como:",
  reference1: "Mínimo praticado na rota",
  reference1Note: "ex.: ANTT",
  reference2: "Preço médio praticado",
  reference2Note: "",
  reference3: "Preço máximo praticado",
  reference3Note: "",
  reference4: "Histórico de cotações da própria operação",
  reference4Note: "",
  moreInfo: "Mais informação para negociar melhor.",
  opportunityEyebrow: "OPORTUNIDADE IDENTIFICADA NA OPERAÇÃO",
  monthlyTitle: "Economia por mês",
  potentialSavingsLabel: "de economia potencial identificada",
  acquiredSavingsLabel: "já capturados",
  monthlyPotentialLegend: "Economia potencial",
  monthlyAcquiredLegend: "Economia adquirida",
  month1: "Abr/2026",
  month2: "Mai/2026",
  month3: "Jun/2026",
  month4: "Jul/2026",
  month5: "Ago/2026",
  month6: "Set/2026",
  nextStep:
    "A próxima etapa é converter a economia potencial em economia adquirida com negociação estruturada e benchmark de mercado.",
  ltlNote:
    "Teste de rodoviário fracionado (LTL) validado: oportunidade de expandir a plataforma para novos modais.",
  closingCopy:
    "A combinação entre concorrência + benchmark + histórico + negociação estruturada permite identificar oportunidades que não seriam percebidas olhando apenas para as propostas recebidas.",
  closingOutcome:
    "O resultado esperado: mais competitividade → melhores negociações → redução contínua do custo de frete.",
  footerThree: "DADOS QUE GERAM DECISÕES. RESULTADOS QUE IMPULSIONAM.",
  s4Eyebrow: "INTELIGÊNCIA APLICADA À DECISÃO · {empresaMaiuscula}",
  s4Title: "Da melhor proposta ao",
  s4TitleAccent: "melhor negócio",
  s4Subtitle: "Recursos para apoiar decisões mais seguras antes do fechamento.",
  spotmatchLabel: "SPOTMATCH · COTAÇÃO {empresaMaiuscula}",
  spotmatchTitle: "Melhor proposta com aderência ao cenário escolhido",
  spotmatchCopy:
    "O SpotMatch evidencia a opção vencedora, compara a aderência entre fornecedores e deixa claro por que a proposta foi priorizada.",
  spotmatchPlaceholder: "Imagem de cotação não configurada",
  supportImageLabel: "IMAGEM DE APOIO",
  supportImagePlaceholder: "Nenhuma imagem configurada",
};

const defaultReport: ReportData = {
  clientName: "Sua empresa",
  specialty: "Resultados logísticos e oportunidades de otimização de fretes",
  totalFreight: "R$ 1,2 mi",
  operations: "66 operações",
  proposals: "5,2 propostas",
  timeBeforeMinutes: 120,
  timeAfterMinutes: 20,
  selectedModals: [
    "Aéreo (AER)",
    "Marítimo FCL",
    "Marítimo LCL",
    "Rodo (Fracionado)",
  ],
  insightText:
    "A Cheap2Ship transformou um processo operacional de aproximadamente 2 horas em uma negociação estruturada que pode ser conduzida em cerca de 20 minutos, mantendo a concorrência entre fornecedores e aumentando a capacidade de análise e negociação.",
  potentialSavings: "R$ 82 mil",
  acquiredSavings: "R$ 18 mil",
  averageProposal: "R$ 18,2 mil",
  clientLogoUrl: "",
  spotmatchImageUrl: "",
  dashboardImageUrl: "",
  pageFourImageUrl: "",
  monthlyChartImageUrl: "",
  imagePositions: {},
  imageZoom: {},
  hiddenPages: [],
  hiddenItems: {},
  copy: defaultCopy,
  textColor: "#1a1a1a",
  accentColor: "#f03c1f",
};

const monthlyData = [
  { month: "Abr/2026", potential: 30000, acquired: 5000 },
  { month: "Mai/2026", potential: 5000, acquired: 0 },
  { month: "Jun/2026", potential: 5000, acquired: 2000 },
  { month: "Jul/2026", potential: 13500, acquired: 0 },
  { month: "Ago/2026", potential: 6500, acquired: 0 },
  { month: "Set/2026", potential: 22000, acquired: 11000 },
];

const modalOptions = [
  "Aéreo (AER)",
  "Marítimo FCL",
  "Marítimo LCL",
  "Rodo (Fracionado)",
  "Rodo (Dedicado)",
];
const reportStorageKey = "cheap2ship-report-template-v3";
const copySections: Array<{ title: string; fields: Array<[string, string]> }> =
  [
    {
      title: "Página 1",
      fields: [
        ["s1Eyebrow", "Identificação da página"],
        ["s1Title", "Título"],
        ["s1TitleAccent", "Destaque do título"],
        ["metricFreight", "Rótulo: fretes"],
        ["metricOperations", "Rótulo: operações"],
        ["metricProposals", "Rótulo: propostas"],
        ["metricTime", "Rótulo: tempo"],
        ["reductionLabel", "Legenda: redução"],
        ["increaseLabel", "Legenda: aumento"],
        ["benefitAgility", "Benefício: agilidade"],
        ["benefitControl", "Benefício: controle"],
        ["benefitCompetition", "Benefício: competitividade"],
        ["modalLabel", "Rótulo dos modais"],
        ["noModals", "Estado sem modais"],
        ["footerOne", "Rodapé"],
      ],
    },
    {
      title: "Página 2",
      fields: [
        ["s2Eyebrow", "Identificação da página"],
        ["s2Title", "Título"],
        ["s2TitleAccent", "Destaque do título"],
        ["s2Lead", "Texto principal"],
        ["s2Intro", "Introdução da lista"],
        ["checklist1", "Item 1"],
        ["checklist2", "Item 2"],
        ["checklist3", "Item 3"],
        ["checklist4", "Item 4"],
        ["checklist5", "Item 5"],
        ["checklist6", "Item 6"],
        ["complianceTitle", "Título: compliance"],
        ["complianceText", "Texto: compliance"],
        ["savingsTitle", "Título: economia"],
        ["savingsText", "Texto: economia"],
        ["dashboardTitle", "Título do painel"],
        ["dashboardPlaceholder", "Estado sem painel"],
        ["footerTwo", "Rodapé"],
      ],
    },
    {
      title: "Página 3",
      fields: [
        ["s3Eyebrow", "Identificação da página"],
        ["s3Title", "Título"],
        ["s3TitleAccent", "Destaque do título"],
        ["s3Subtitle", "Subtítulo"],
        ["quoteOne", "Introdução da citação 1"],
        ["quoteOneQuestion", "Citação 1"],
        ["quoteTwo", "Introdução da citação 2"],
        ["quoteTwoQuestion", "Citação 2"],
        ["referenceIntro", "Introdução das referências"],
        ["reference1", "Referência 1"],
        ["reference1Note", "Detalhe da referência 1"],
        ["reference2", "Referência 2"],
        ["reference2Note", "Detalhe da referência 2"],
        ["reference3", "Referência 3"],
        ["reference3Note", "Detalhe da referência 3"],
        ["reference4", "Referência 4"],
        ["reference4Note", "Detalhe da referência 4"],
        ["moreInfo", "Destaque informativo"],
        ["opportunityEyebrow", "Identificação da oportunidade"],
        ["monthlyTitle", "Título da economia mensal"],
        ["potentialSavingsLabel", "Legenda: economia potencial"],
        ["acquiredSavingsLabel", "Legenda: economia adquirida"],
        ["monthlyPotentialLegend", "Legenda do gráfico: potencial"],
        ["monthlyAcquiredLegend", "Legenda do gráfico: adquirido"],
        ["month1", "Mês 1"],
        ["month2", "Mês 2"],
        ["month3", "Mês 3"],
        ["month4", "Mês 4"],
        ["month5", "Mês 5"],
        ["month6", "Mês 6"],
        ["nextStep", "Próxima etapa"],
        ["ltlNote", "Nota de modal"],
        ["closingCopy", "Texto de encerramento"],
        ["closingOutcome", "Resultado esperado"],
        ["footerThree", "Rodapé"],
      ],
    },
    {
      title: "Página 4",
      fields: [
        ["s4Eyebrow", "Identificação da página"],
        ["s4Title", "Título"],
        ["s4TitleAccent", "Destaque do título"],
        ["s4Subtitle", "Subtítulo"],
        ["spotmatchLabel", "Identificação do SpotMatch"],
        ["spotmatchTitle", "Título do SpotMatch"],
        ["spotmatchCopy", "Texto do SpotMatch"],
        ["spotmatchPlaceholder", "Estado sem imagem SpotMatch"],
        ["supportImageLabel", "Rótulo da imagem de apoio"],
        ["supportImagePlaceholder", "Estado sem imagem de apoio"],
      ],
    },
  ];
const multilineCopyFields = new Set([
  "s2Lead",
  "s2Intro",
  "complianceText",
  "savingsText",
  "referenceIntro",
  "nextStep",
  "ltlNote",
  "closingCopy",
  "closingOutcome",
  "spotmatchCopy",
]);

function readSavedReport(): ReportData {
  try {
    const saved = localStorage.getItem(reportStorageKey);
    if (!saved) return defaultReport;
    const stored = JSON.parse(saved) as Partial<ReportData>;
    return {
      ...defaultReport,
      ...stored,
      copy: { ...defaultCopy, ...stored.copy },
      imagePositions: stored.imagePositions ?? defaultReport.imagePositions,
      imageZoom: stored.imageZoom ?? defaultReport.imageZoom,
      hiddenPages: stored.hiddenPages ?? defaultReport.hiddenPages,
      hiddenItems: stored.hiddenItems ?? defaultReport.hiddenItems,
      accentColor: stored.accentColor ?? defaultReport.accentColor,
    };
  } catch {
    return defaultReport;
  }
}

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder} min` : `${hours}h`;
  }
  return `${minutes} min`;
}

function slideStyle(data: ReportData): CSSProperties {
  return {
    "--report-text-color": data.textColor,
    "--report-accent-color": data.accentColor,
  } as CSSProperties;
}

function copyText(data: ReportData, key: string) {
  return (data.copy[key] ?? "")
    .replace(/\{empresaMaiuscula\}/g, data.clientName.toUpperCase())
    .replace(/\{empresa\}/g, data.clientName)
    .replace(/\{propostas\}/g, data.proposals)
    .replace(/\{economiaPotencial\}/g, data.potentialSavings)
    .replace(/\{economiaAdquirida\}/g, data.acquiredSavings)
    .replace(/\{custoMedio\}/g, data.averageProposal);
}

function isItemHidden(data: ReportData, key: VisibilityItemKey) {
  return Boolean(data.hiddenItems[key]);
}

function imagePositionStyle(data: ReportData, key: ImageUrlKey): CSSProperties {
  const position = data.imagePositions[key] ?? { x: 50, y: 50 };
  const zoom = data.imageZoom[key] ?? 100;
  return {
    objectPosition: `${position.x}% ${position.y}%`,
    transform: `scale(${zoom / 100})`,
    transformOrigin: `${position.x}% ${position.y}%`,
  };
}

function Brand({
  compact = false,
  data = defaultReport,
}: {
  compact?: boolean;
  data?: ReportData;
}) {
  return (
    <div className="brandbar">
      <div className="client-brand">
        {data.clientLogoUrl ? (
          <div className="image-viewport client-logo-viewport">
            <img
              src={data.clientLogoUrl}
              alt={data.clientName}
              className="client-logo"
              style={imagePositionStyle(data, "clientLogoUrl")}
            />
          </div>
        ) : (
          <span className="client-name">{data.clientName}</span>
        )}
        {!compact && (
          <div className="client-signature">
            <i /> <small>{copyText(data, "brandTagline")}</small>
          </div>
        )}
      </div>
      <div className="cheap-brand">
        <img
          src={`${import.meta.env.BASE_URL}images/cheap2ship_logo_color.svg`}
          alt="Cheap2Ship"
          className="cheap2ship-logo"
        />
      </div>
    </div>
  );
}

function Footer({ phrase }: { phrase: string }) {
  return (
    <footer>
      <strong>{phrase}</strong>
    </footer>
  );
}

function MetricCard({
  icon: Icon,
  value,
  label,
}: {
  icon: IconType;
  value: string;
  label: string;
}) {
  return (
    <div className="metric-card">
      <Icon size={25} strokeWidth={2.2} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SlideOne({ data }: { data: ReportData }) {
  if (data.hiddenPages.includes(0)) return null;
  const reduction =
    data.timeBeforeMinutes > 0
      ? ((data.timeBeforeMinutes - data.timeAfterMinutes) /
          data.timeBeforeMinutes) *
        100
      : 0;
  return (
    <section className="slide slide-one" style={slideStyle(data)}>
      {!isItemHidden(data, "p1Brand") && <Brand data={data} />}
      {!isItemHidden(data, "p1Heading") && (
        <div className="slide-heading">
          <p className="eyebrow">{copyText(data, "s1Eyebrow")}</p>
          <h1>
            {copyText(data, "s1Title")}{" "}
            <em>{copyText(data, "s1TitleAccent")}</em>
          </h1>
          <p>{data.specialty}</p>
        </div>
      )}
      {!isItemHidden(data, "p1Metrics") && (
        <div className="metrics-grid">
          <MetricCard
            icon={Database}
            value={data.totalFreight}
            label={copyText(data, "metricFreight")}
          />
          <MetricCard
            icon={Ship}
            value={data.operations}
            label={copyText(data, "metricOperations")}
          />
          <MetricCard
            icon={Users}
            value={data.proposals}
            label={copyText(data, "metricProposals")}
          />
          <MetricCard
            icon={Clock3}
            value={`${formatMinutes(data.timeBeforeMinutes)} → ${formatMinutes(data.timeAfterMinutes)}`}
            label={copyText(data, "metricTime")}
          />
        </div>
      )}
      {!isItemHidden(data, "p1Impact") && (
        <div className="impact-banner">
          <div className="impact-main">
            <Gauge size={36} />
            <strong>
              {data.timeBeforeMinutes > 0
                ? `${Math.abs(Math.round(reduction))}%`
                : "—"}
            </strong>
            <span>
              {copyText(
                data,
                reduction < 0 ? "increaseLabel" : "reductionLabel",
              )}
            </span>
          </div>
          <div className="impact-items">
            <span>
              <Sparkles size={18} />
              {copyText(data, "benefitAgility")}
            </span>
            <span>
              <FileCheck2 size={18} />
              {copyText(data, "benefitControl")}
            </span>
            <span>
              <TrendingUp size={18} />
              {copyText(data, "benefitCompetition")}
            </span>
          </div>
        </div>
      )}
      {!isItemHidden(data, "p1Insight") && (
        <div className="insight-box">
          <Target size={30} />
          <p>{data.insightText}</p>
        </div>
      )}
      {!isItemHidden(data, "p1Modals") && (
        <div className="modals">
          <b>{copyText(data, "modalLabel")}</b>
          {data.selectedModals.length ? (
            data.selectedModals.map((modal) => <span key={modal}>{modal}</span>)
          ) : (
            <span>{copyText(data, "noModals")}</span>
          )}
        </div>
      )}
      {!isItemHidden(data, "p1Footer") && (
        <Footer phrase={copyText(data, "footerOne")} />
      )}
    </section>
  );
}

function SlideTwo({ data }: { data: ReportData }) {
  if (data.hiddenPages.includes(1)) return null;
  return (
    <section className="slide slide-two" style={slideStyle(data)}>
      {!isItemHidden(data, "p2Brand") && <Brand data={data} />}
      {!isItemHidden(data, "p2Heading") && (
        <div className="slide-heading compact-heading">
          <p className="eyebrow">{copyText(data, "s2Eyebrow")}</p>
          <h1>
            {copyText(data, "s2Title")}{" "}
            <em>{copyText(data, "s2TitleAccent")}</em>
          </h1>
        </div>
      )}
      <div className="two-columns">
        <div className="left-column">
          {!isItemHidden(data, "p2Lead") && (
            <>
              <p className="lead">{copyText(data, "s2Lead")}</p>
              <p className="intro">{copyText(data, "s2Intro")}</p>
            </>
          )}
          {!isItemHidden(data, "p2Checklist") && (
            <ul className="check-list">
              {Array.from({ length: 6 }, (_, index) =>
                copyText(data, `checklist${index + 1}`),
              ).map((item, index) => (
                <li key={index}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
          )}
          {!isItemHidden(data, "p2BottomCards") && (
            <div className="bottom-cards">
              <div className="small-card">
                <FileCheck2 />
                <div>
                  <b>{copyText(data, "complianceTitle")}</b>
                  <p>{copyText(data, "complianceText")}</p>
                </div>
              </div>
              <div className="small-card">
                <BarChart3 />
                <div>
                  <b>{copyText(data, "savingsTitle")}</b>
                  <p>{copyText(data, "savingsText")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        {!isItemHidden(data, "p2Dashboard") && (
          <div className="dashboard-card">
            <div className="dashboard-head">
              <span>{copyText(data, "dashboardTitle")}</span>
              <b>{data.clientName.toUpperCase()}</b>
            </div>
            {data.dashboardImageUrl ? (
              <div className="image-viewport dashboard-image-viewport">
                <img
                  src={data.dashboardImageUrl}
                  alt="Painel de economia da Cheap2Ship"
                  style={imagePositionStyle(data, "dashboardImageUrl")}
                />
              </div>
            ) : (
              <div className="dashboard-placeholder">
                {copyText(data, "dashboardPlaceholder")}
              </div>
            )}
          </div>
        )}
      </div>
      {!isItemHidden(data, "p2Footer") && (
        <Footer phrase={copyText(data, "footerTwo")} />
      )}
    </section>
  );
}

function MonthlyChart({ data }: { data: ReportData }) {
  const max = Math.max(...monthlyData.map((item) => item.potential));
  const ticks = [max, Math.round((max * 2) / 3), Math.round(max / 3), 0];
  return (
    <div className="monthly-chart">
      <div className="chart-legend">
        <span>
          <i className="red-dot" />
          {copyText(data, "monthlyPotentialLegend")}
        </span>
        <span>
          <i className="green-dot" />
          {copyText(data, "monthlyAcquiredLegend")}
        </span>
      </div>
      <div className="chart-grid">
        <div className="y-axis">
          {ticks.map((tick) => (
            <span key={tick}>{tick.toLocaleString("pt-BR")}</span>
          ))}
        </div>
        <div className="bars-area">
          {monthlyData.map((item, index) => (
            <div className="month-group" key={item.month}>
              <div className="bar-pair">
                <i
                  className="bar potential"
                  style={{
                    height: `${Math.max((item.potential / max) * 100, item.potential ? 3 : 0)}%`,
                  }}
                  title={`${copyText(data, "monthlyPotentialLegend")}: R$ ${item.potential.toLocaleString("pt-BR")}`}
                />
                <i
                  className="bar acquired"
                  style={{
                    height: `${Math.max((item.acquired / max) * 100, item.acquired ? 3 : 0)}%`,
                  }}
                />
              </div>
              <span>{copyText(data, `month${index + 1}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideThree({ data }: { data: ReportData }) {
  if (data.hiddenPages.includes(2)) return null;
  return (
    <section className="slide slide-three" style={slideStyle(data)}>
      {!isItemHidden(data, "p3Brand") && <Brand data={data} />}
      {!isItemHidden(data, "p3Heading") && (
        <div className="slide-heading compact-heading">
          <p className="eyebrow">{copyText(data, "s3Eyebrow")}</p>
          <h1>
            {copyText(data, "s3Title")}{" "}
            <em>{copyText(data, "s3TitleAccent")}</em>
          </h1>
          <p>{copyText(data, "s3Subtitle")}</p>
        </div>
      )}
      <div className="three-columns">
        {!isItemHidden(data, "p3Quotes") && (
          <div className="quote-column">
            <div className="quote-card gray">
              <span>“</span>
              <p>
                {copyText(data, "quoteOne")}{" "}
                <b>{copyText(data, "quoteOneQuestion")}</b>
              </p>
            </div>
            <ArrowDown className="down-arrow" />
            <div className="quote-card green">
              <span>“</span>
              <p>
                {copyText(data, "quoteTwo")}{" "}
                <b>{copyText(data, "quoteTwoQuestion")}</b>
              </p>
            </div>
          </div>
        )}
        {!isItemHidden(data, "p3References") && (
          <div className="reference-column">
            <p className="column-title">{copyText(data, "referenceIntro")}</p>
            <div className="reference-list">
              {[
                [
                  copyText(data, "reference1"),
                  copyText(data, "reference1Note"),
                  Gauge,
                ],
                [
                  copyText(data, "reference2"),
                  copyText(data, "reference2Note"),
                  BarChart3,
                ],
                [
                  copyText(data, "reference3"),
                  copyText(data, "reference3Note"),
                  TrendingUp,
                ],
                [
                  copyText(data, "reference4"),
                  copyText(data, "reference4Note"),
                  Database,
                ],
              ].map(([text, sub, Icon]) => (
                <div className="reference-item" key={text as string}>
                  <Icon />
                  <p>
                    {text as string}
                    <small>{sub as string}</small>
                  </p>
                </div>
              ))}
            </div>
            <div className="more-info">
              <Target />
              <b>{copyText(data, "moreInfo")}</b>
            </div>
          </div>
        )}
        {!isItemHidden(data, "p3Opportunity") && (
          <div className="opportunity-card">
            <div className="opportunity-title">
              <div>
                <p>{copyText(data, "opportunityEyebrow")}</p>
                <b>{copyText(data, "monthlyTitle")}</b>
              </div>
              <TrendingUp />
            </div>
            <div className="number-highlight">
              <strong>{data.potentialSavings}</strong>
              <span>{copyText(data, "potentialSavingsLabel")}</span>
              <strong>{data.acquiredSavings}</strong>
              <span>{copyText(data, "acquiredSavingsLabel")}</span>
            </div>
            {data.monthlyChartImageUrl ? (
              <div className="image-viewport monthly-image-viewport">
                <img
                  src={data.monthlyChartImageUrl}
                  alt={copyText(data, "monthlyTitle")}
                  className="monthly-chart-image"
                  style={imagePositionStyle(data, "monthlyChartImageUrl")}
                />
              </div>
            ) : (
              <MonthlyChart data={data} />
            )}
            <div className="opportunity-message">
              {copyText(data, "nextStep")}
            </div>
            <small className="ltl-tag">{copyText(data, "ltlNote")}</small>
          </div>
        )}
      </div>
      {!isItemHidden(data, "p3Closing") && (
        <div className="closing-banner">
          <BarChart3 />
          <div>
            <p>{copyText(data, "closingCopy")}</p>
            <b>{copyText(data, "closingOutcome")}</b>
          </div>
        </div>
      )}
      {!isItemHidden(data, "p3Footer") && (
        <Footer phrase={copyText(data, "footerThree")} />
      )}
    </section>
  );
}

function SlideFour({ data }: { data: ReportData }) {
  if (data.hiddenPages.includes(3)) return null;
  return (
    <section className="slide slide-four" style={slideStyle(data)}>
      {!isItemHidden(data, "p4Brand") && <Brand data={data} />}
      {!isItemHidden(data, "p4Heading") && (
        <div className="slide-heading compact-heading">
          <p className="eyebrow">{copyText(data, "s4Eyebrow")}</p>
          <h1>
            {copyText(data, "s4Title")}{" "}
            <em>{copyText(data, "s4TitleAccent")}</em>
          </h1>
          <p>{copyText(data, "s4Subtitle")}</p>
        </div>
      )}
      <div className="spotmatch-layout">
        {!isItemHidden(data, "p4Spotmatch") && (
          <div className="spotmatch-card">
            <div className="feature-label">
              <Sparkles size={16} /> {copyText(data, "spotmatchLabel")}
            </div>
            <h2>{copyText(data, "spotmatchTitle")}</h2>
            <p>{copyText(data, "spotmatchCopy")}</p>
            {data.spotmatchImageUrl ? (
              <div className="image-viewport spotmatch-image-viewport">
                <img
                  src={data.spotmatchImageUrl}
                  alt={copyText(data, "spotmatchTitle")}
                  style={imagePositionStyle(data, "spotmatchImageUrl")}
                />
              </div>
            ) : (
              <div className="image-placeholder spotmatch-placeholder">
                {copyText(data, "spotmatchPlaceholder")}
              </div>
            )}
          </div>
        )}
        {!isItemHidden(data, "p4SupportImage") && (
          <div className="supporting-image-card">
            <span>{copyText(data, "supportImageLabel")}</span>
            {data.pageFourImageUrl ? (
              <div className="image-viewport supporting-image-viewport">
                <img
                  src={data.pageFourImageUrl}
                  alt={copyText(data, "supportImageLabel")}
                  style={imagePositionStyle(data, "pageFourImageUrl")}
                />
              </div>
            ) : (
              <div className="image-placeholder">
                {copyText(data, "supportImagePlaceholder")}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ImageUrlField({
  imageKey,
  value,
  position,
  zoom,
  label,
  hint,
  onChange,
  onPositionChange,
  onZoomChange,
}: {
  imageKey: ImageUrlKey;
  value: string;
  position: ImagePosition;
  zoom: number;
  label: string;
  hint: string;
  onChange: (value: string) => void;
  onPositionChange: (position: ImagePosition) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const [pasteError, setPasteError] = useState("");
  const hasPastedImage = value.startsWith("data:image/");

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) =>
      item.type.startsWith("image/"),
    );
    const imageFile = imageItem?.getAsFile();
    if (!imageFile) return;

    event.preventDefault();
    setPasteError("");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
      else setPasteError("Não foi possível carregar a imagem colada.");
    };
    reader.onerror = () =>
      setPasteError("Não foi possível carregar a imagem colada.");
    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="field image-url-field full-width">
      <span>{label}</span>
      <small>
        {hint} · Cole uma imagem com Ctrl+V ou informe uma URL. Imagens coladas
        ficam apenas no armazenamento local deste navegador.
      </small>
      <div className="image-url-control">
        <input
          type="text"
          value={
            hasPastedImage
              ? "Imagem colada · salva somente neste navegador"
              : value
          }
          readOnly={hasPastedImage}
          onChange={(event) => onChange(event.target.value)}
          onPaste={handlePaste}
          placeholder="https://... ou Ctrl+V"
          aria-label={label}
        />
        {hasPastedImage && (
          <button
            type="button"
            className="clear-pasted-image"
            onClick={() => onChange("")}
          >
            Remover
          </button>
        )}
      </div>
      {pasteError && <small role="alert">{pasteError}</small>}
      {value && (
        <details className="image-adjustment">
          <summary>Ajustar posição da imagem</summary>
          <div
            className={`image-adjust-preview image-adjust-preview-${imageKey}`}
          >
            <img
              src={value}
              alt={`Prévia: ${label}`}
              style={{
                objectPosition: `${position.x}% ${position.y}%`,
                transform: `scale(${zoom / 100})`,
                transformOrigin: `${position.x}% ${position.y}%`,
              }}
            />
          </div>
          <label className="image-position-slider">
            <span>Horizontal: {position.x}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={position.x}
              onChange={(event) =>
                onPositionChange({
                  ...position,
                  x: Number(event.target.value),
                })
              }
            />
          </label>
          <label className="image-position-slider">
            <span>Vertical: {position.y}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={position.y}
              onChange={(event) =>
                onPositionChange({
                  ...position,
                  y: Number(event.target.value),
                })
              }
            />
          </label>
          <label className="image-position-slider">
            <span>Zoom: {zoom}%</span>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={zoom}
              onChange={(event) => onZoomChange(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            className="reset-image-position"
            onClick={() => {
              onPositionChange({ x: 50, y: 50 });
              onZoomChange(100);
            }}
          >
            Repor enquadramento
          </button>
        </details>
      )}
    </div>
  );
}

function PageVisibilityControls({
  pageIndex,
  data,
  onChange,
}: {
  pageIndex: number;
  data: ReportData;
  onChange: (next: ReportData) => void;
}) {
  const pageVisibility = visibilityOptions.find(
    (option) => option.page === pageIndex,
  );
  if (!pageVisibility) return null;

  return (
    <fieldset className="visibility-controls">
      <legend>Visibilidade da página</legend>
      <label>
        <input
          type="checkbox"
          checked={data.hiddenPages.includes(pageIndex)}
          onChange={(event) =>
            onChange({
              ...data,
              hiddenPages: event.target.checked
                ? [...data.hiddenPages, pageIndex]
                : data.hiddenPages.filter((page) => page !== pageIndex),
            })
          }
        />
        Ocultar a página inteira
      </label>
      <div className="visibility-item-list">
        {pageVisibility.items.map(({ key, label }) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={Boolean(data.hiddenItems[key])}
              onChange={(event) =>
                onChange({
                  ...data,
                  hiddenItems: {
                    ...data.hiddenItems,
                    [key]: event.target.checked,
                  },
                })
              }
            />
            Ocultar {label.toLowerCase()}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ReportEditor({
  data,
  onChange,
  onClose,
}: {
  data: ReportData;
  onChange: (next: ReportData) => void;
  onClose: () => void;
}) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Geral: true,
    "Página 1": true,
  });
  const update = (key: keyof ReportData, value: ReportData[keyof ReportData]) =>
    onChange({ ...data, [key]: value } as ReportData);
  const updateCopy = (key: string, value: string) =>
    onChange({ ...data, copy: { ...data.copy, [key]: value } });
  const setSectionOpen = (section: string, open: boolean) =>
    setOpenSections((current) => ({ ...current, [section]: open }));
  const generalFields: ReportTextField[] = [
    ["clientName", "Nome da empresa", "Usado em todas as páginas"],
    [
      "clientLogoUrl",
      "Link do logo da empresa",
      "Opcional · URL pública da imagem",
    ],
  ];
  const pageFields: Record<string, ReportTextField[]> = {
    "Página 1": [
      ["specialty", "Descrição da empresa", "Subtítulo da página 1"],
      ["totalFreight", "Valor total de fretes", "Ex.: R$ 1,2 mi"],
      ["operations", "Operações", "Ex.: 66 operações"],
      ["proposals", "Média de propostas", "Ex.: 5,2 propostas"],
    ],
    "Página 2": [
      [
        "potentialSavings",
        "Economia potencial",
        "Ex.: R$ 82 mil · também aparece na página 3",
      ],
      [
        "acquiredSavings",
        "Economia adquirida",
        "Ex.: R$ 18 mil · também aparece na página 3",
      ],
      ["averageProposal", "Custo médio por operação", "Ex.: R$ 18,2 mil"],
      [
        "dashboardImageUrl",
        "Link do painel de economia",
        "Opcional · URL pública da imagem",
      ],
    ],
    "Página 3": [
      [
        "monthlyChartImageUrl",
        "Link do gráfico mensal",
        "Opcional · substitui o gráfico fictício",
      ],
    ],
    "Página 4": [
      [
        "spotmatchImageUrl",
        "Link da imagem SpotMatch",
        "Opcional · URL pública da imagem",
      ],
      [
        "pageFourImageUrl",
        "Link da imagem de apoio",
        "Opcional · URL pública da imagem",
      ],
    ],
  };
  const renderFields = (fields: ReportTextField[]) =>
    fields.map(([key, label, hint]) =>
      imageUrlFields.has(key as ImageUrlKey) ? (
        <ImageUrlField
          key={key}
          imageKey={key as ImageUrlKey}
          value={data[key]}
          position={data.imagePositions[key as ImageUrlKey] ?? { x: 50, y: 50 }}
          zoom={data.imageZoom[key as ImageUrlKey] ?? 100}
          label={label}
          hint={hint}
          onChange={(value) => update(key, value)}
          onPositionChange={(position) =>
            onChange({
              ...data,
              imagePositions: { ...data.imagePositions, [key]: position },
            })
          }
          onZoomChange={(zoom) =>
            onChange({
              ...data,
              imageZoom: { ...data.imageZoom, [key]: zoom },
            })
          }
        />
      ) : (
        <label
          className={`field${key === "specialty" ? " full-width" : ""}`}
          key={key}
        >
          <span>{label}</span>
          <small>{hint}</small>
          {key === "specialty" ? (
            <textarea
              value={data[key]}
              onChange={(event) => update(key, event.target.value)}
              rows={3}
            />
          ) : (
            <input
              value={data[key]}
              onChange={(event) => update(key, event.target.value)}
              placeholder={hint}
            />
          )}
        </label>
      ),
    );
  const renderCopySection = (title: string) => {
    const section = copySections.find((item) => item.title === title);
    if (!section) return null;
    return section.fields.map(([key, label]) => (
      <label
        className={`field copy-field${multilineCopyFields.has(key) ? " full-width" : ""}`}
        key={key}
      >
        <span>{label}</span>
        {multilineCopyFields.has(key) ? (
          <textarea
            value={data.copy[key]}
            onChange={(event) => updateCopy(key, event.target.value)}
            rows={3}
          />
        ) : (
          <input
            value={data.copy[key]}
            onChange={(event) => updateCopy(key, event.target.value)}
          />
        )}
      </label>
    ));
  };

  return (
    <aside className="editor-drawer">
      <div className="editor-head">
        <div>
          <span className="eyebrow">MODELO DE RELATÓRIO</span>
          <h2>Personalizar relatório</h2>
        </div>
        <button
          className="close-editor"
          onClick={onClose}
          aria-label="Fechar editor"
        >
          <X size={18} />
        </button>
      </div>
      <div className="editor-scroll">
        <details
          className="editor-section"
          open={openSections.Geral ?? false}
          onToggle={(event) =>
            setSectionOpen("Geral", event.currentTarget.open)
          }
        >
          <summary>
            Geral <small>Empresa e marca</small>
          </summary>
          <div className="editor-section-content">
            <div className="full-width">
              {renderFields(generalFields.slice(0, 1))}
            </div>
            <div className="brand-fields-pair">
              {renderFields(generalFields.slice(1))}
              <label className="field">
                <span>Assinatura da marca</span>
                <input
                  value={data.copy.brandTagline}
                  onChange={(event) =>
                    updateCopy("brandTagline", event.target.value)
                  }
                />
              </label>
            </div>
            <div className="editor-note">
              <FileCheck2 size={16} />
              <span>
                Marcadores disponíveis: {"{empresa}"}, {"{empresaMaiuscula}"},{" "}
                {"{propostas}"}, {"{economiaPotencial}"},{" "}
                {"{economiaAdquirida}"} e {"{custoMedio}"}.
              </span>
            </div>
          </div>
        </details>
        {copySections.map((section) => (
          <details
            className="editor-section"
            key={section.title}
            open={openSections[section.title] ?? section.title === "Página 1"}
            onToggle={(event) =>
              setSectionOpen(section.title, event.currentTarget.open)
            }
          >
            <summary>
              {section.title}
              <small>
                {section.title === "Página 1"
                  ? "Indicadores, tempos, modais e mensagem"
                  : section.title === "Página 2"
                    ? "Negociação, economia e rotas"
                    : section.title === "Página 3"
                      ? "Benchmark e oportunidade mensal"
                      : "SpotMatch e imagens"}
              </small>
            </summary>
            <div className="editor-section-content">
              <PageVisibilityControls
                pageIndex={copySections.indexOf(section)}
                data={data}
                onChange={onChange}
              />
              {renderFields(pageFields[section.title] ?? [])}
              {section.title === "Página 1" && (
                <>
                  <label className="field">
                    <span>Tempo antes (minutos)</span>
                    <small>Base usada no cálculo percentual</small>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={data.timeBeforeMinutes}
                      onChange={(event) =>
                        update("timeBeforeMinutes", Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Tempo depois (minutos)</span>
                    <small>Usado no cálculo percentual</small>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={data.timeAfterMinutes}
                      onChange={(event) =>
                        update("timeAfterMinutes", Number(event.target.value))
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Mensagem de destaque</span>
                    <small>Texto abaixo do indicador percentual</small>
                    <textarea
                      value={data.insightText}
                      onChange={(event) =>
                        update("insightText", event.target.value)
                      }
                      rows={4}
                    />
                  </label>
                  <fieldset className="modal-options">
                    <legend>Modais utilizados</legend>
                    {modalOptions.map((modal) => (
                      <label key={modal}>
                        <input
                          type="checkbox"
                          checked={data.selectedModals.includes(modal)}
                          onChange={(event) =>
                            update(
                              "selectedModals",
                              event.target.checked
                                ? [...data.selectedModals, modal]
                                : data.selectedModals.filter(
                                    (selected) => selected !== modal,
                                  ),
                            )
                          }
                        />
                        {modal}
                      </label>
                    ))}
                  </fieldset>
                </>
              )}
              {renderCopySection(section.title)}
            </div>
          </details>
        ))}
        <details
          className="editor-section"
          open={openSections.Cores ?? false}
          onToggle={(event) =>
            setSectionOpen("Cores", event.currentTarget.open)
          }
        >
          <summary>
            Cores <small>Aplicadas ao relatório inteiro</small>
          </summary>
          <div className="editor-section-content">
            <label className="field color-field">
              <span>Cor dos textos</span>
              <input
                type="color"
                value={data.textColor}
                onChange={(event) => update("textColor", event.target.value)}
              />
            </label>
            <label className="field color-field">
              <span>Cor de destaque</span>
              <small>Ícones, faixas, percentuais, barras e botões</small>
              <input
                type="color"
                value={data.accentColor}
                onChange={(event) => update("accentColor", event.target.value)}
              />
            </label>
          </div>
        </details>
      </div>
      <div className="editor-foot">
        <span>Os dados iniciais são fictícios e podem ser substituídos.</span>
        <button className="primary-action" onClick={onClose}>
          <Check size={15} />
          Concluir
        </button>
      </div>
    </aside>
  );
}

function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [report, setReport] = useState<ReportData>(readSavedReport);
  const visibleSlides = useMemo(
    () => [0, 1, 2, 3].filter((page) => !report.hiddenPages.includes(page)),
    [report.hiddenPages],
  );
  const effectiveSlide = visibleSlides.includes(activeSlide)
    ? activeSlide
    : (visibleSlides[0] ?? -1);
  const activePosition = visibleSlides.indexOf(effectiveSlide);

  useEffect(() => {
    if (effectiveSlide >= 0 && activeSlide !== effectiveSlide)
      setActiveSlide(effectiveSlide);
  }, [activeSlide, effectiveSlide]);

  useEffect(() => {
    try {
      localStorage.setItem(reportStorageKey, JSON.stringify(report));
    } catch {
      return;
    }
  }, [report]);

  const goTo = useCallback(
    (position: number) => {
      const nextSlide = visibleSlides[position];
      if (nextSlide === undefined) return;
      setActiveSlide(nextSlide);
      if (window.matchMedia("(max-width: 600px)").matches)
        window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [visibleSlides],
  );
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goTo(activePosition + 1);
      if (event.key === "ArrowLeft") goTo(activePosition - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePosition, goTo]);
  const handlePdf = () => {
    if (visibleSlides.length === 0) return;
    setPrintMode(true);
    window.setTimeout(() => window.print(), 80);
  };
  useEffect(() => {
    const afterPrint = () => setPrintMode(false);
    window.addEventListener("afterprint", afterPrint);
    return () => window.removeEventListener("afterprint", afterPrint);
  }, []);

  return (
    <main className="presentation-shell" style={slideStyle(report)}>
      <div className="topbar">
        <div className="topbar-title">
          <span className="live-dot" />
          MODELO DE RESULTADOS{" "}
          <b>
            {String(visibleSlides.length).padStart(2, "0")}{" "}
            {visibleSlides.length === 1 ? "SLIDE" : "SLIDES"}
          </b>
        </div>
        <div className="topbar-actions">
          <button onClick={() => setEditorOpen(true)}>
            <Sparkles size={15} />
            Personalizar relatório
          </button>
          <button
            className="primary-action"
            onClick={handlePdf}
            disabled={visibleSlides.length === 0}
          >
            <FileDown size={15} />
            Exportar PDF
          </button>
          <button
            className="menu-button"
            aria-label="Abrir menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="mobile-menu">
            <button
              onClick={() => {
                setEditorOpen(true);
                setIsMenuOpen(false);
              }}
            >
              Personalizar relatório
            </button>
            <button
              disabled={visibleSlides.length === 0}
              onClick={() => {
                handlePdf();
                setIsMenuOpen(false);
              }}
            >
              <FileDown size={15} />
              Exportar PDF
            </button>
          </div>
        )}
      </div>
      <div className="stage-wrap">
        <div className={`stage${printMode ? " print-mode" : ""}`}>
          {printMode ? (
            <>
              <SlideOne data={report} />
              <SlideTwo data={report} />
              <SlideThree data={report} />
              <SlideFour data={report} />
            </>
          ) : visibleSlides.length === 0 ? (
            <div className="no-visible-pages">
              Todas as páginas estão ocultas. Reative uma página na
              personalização do relatório.
            </div>
          ) : (
            <>
              {effectiveSlide === 0 && <SlideOne data={report} />}
              {effectiveSlide === 1 && <SlideTwo data={report} />}
              {effectiveSlide === 2 && <SlideThree data={report} />}
              {effectiveSlide === 3 && <SlideFour data={report} />}
            </>
          )}
          <button
            className="stage-arrow left"
            onClick={() => goTo(activePosition - 1)}
            disabled={activePosition <= 0}
            aria-label="Slide anterior"
          >
            <ArrowLeft />
          </button>
          <button
            className="stage-arrow right"
            onClick={() => goTo(activePosition + 1)}
            disabled={
              activePosition < 0 || activePosition >= visibleSlides.length - 1
            }
            aria-label="Próximo slide"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
      <div className="navigator">
        <button
          onClick={() => goTo(activePosition - 1)}
          disabled={activePosition <= 0}
        >
          <ArrowLeft size={16} />
          Anterior
        </button>
        <div className="dots">
          {visibleSlides.map((page, position) => (
            <button
              key={page}
              className={effectiveSlide === page ? "active" : ""}
              onClick={() => goTo(position)}
              aria-label={`Ir para página ${page + 1}`}
            >
              <span>{String(page + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => goTo(activePosition + 1)}
          disabled={
            activePosition < 0 || activePosition >= visibleSlides.length - 1
          }
        >
          Próximo
          <ArrowRight size={16} />
        </button>
        <span className="keyboard-hint">
          <MousePointer2 size={13} /> Use as setas do teclado para navegar
        </span>
      </div>
      {editorOpen && (
        <ReportEditor
          data={report}
          onChange={setReport}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </main>
  );
}

export default App;
