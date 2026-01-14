// Heavy libs are imported on-demand inside functions to keep initial bundle light

// Importar o tipo correto das solicitações
import { Solicitacao } from "@/types/solicitacao";

// Função utilitária para carregar imagem base64 da public
const logoCache = new Map<string, Promise<string>>();
export async function getLogoBase64(path = '/r3logo.png') {
  if (!logoCache.has(path)) {
    const promise = (async () => {
      const response = await fetch(path);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    })();
    logoCache.set(path, promise);
  }
  return logoCache.get(path)!;
}

export async function gerarRelatorioPDF({
  solicitacoes,
  status,
  filtroDescricao = '',
  titulo = 'R3 Suprimentos',
  subtitulo = 'Relatório de Solicitações',
  logoBase64,
  startDate,
  endDate,
}: {
  solicitacoes: Solicitacao[];
  status: string;
  filtroDescricao?: string;
  titulo?: string;
  subtitulo?: string;
  logoBase64?: string; // base64 opcional
  startDate?: string | null;
  endDate?: string | null;
}) {
  const [{ default: jsPDF }, autoTableMod] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  type AutoTableOptions = Record<string, unknown> & {
    didDrawPage?: (data: { pageNumber: number }) => void;
  };
  const autoTable = (autoTableMod as unknown as { default: (doc: unknown, options: AutoTableOptions) => void }).default;
  const doc = new jsPDF('l', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  // Margens mais enxutas para ganhar área útil
  const marginLR = 20;
  // Logo
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', marginLR, 20, 60, 60);
  }
  // Cabeçalho
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, marginLR + 70, 40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const dataAtual = new Date().toLocaleString();
  doc.text(`${subtitulo} - ${dataAtual}`, marginLR + 70, 60);
  doc.setFontSize(12);
  
  // Construir string do período
  let periodoString = '';
  if (startDate && endDate) {
    const startFormatted = new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR');
    const endFormatted = new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR');
    periodoString = ` | Período: ${startFormatted} até ${endFormatted}`;
  } else if (startDate) {
    const startFormatted = new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR');
    periodoString = ` | A partir de: ${startFormatted}`;
  } else if (endDate) {
    const endFormatted = new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR');
    periodoString = ` | Até: ${endFormatted}`;
  }
  
  doc.text(`Filtro aplicado: ${status}${filtroDescricao ? ' - ' + filtroDescricao : ''}${periodoString}`, marginLR + 70, 75);
  doc.text(`Total de itens: ${solicitacoes.length}`, marginLR + 70, 90);
  // Tabela
  const tableData = solicitacoes.map(s => [
    s.id,
    s.nome,
    s.filial,
    s.numero_nf,
    s.carga,
    s.cod_cobranca,
    s.cod_cliente,
    s.rca,
    s.motivo_devolucao,
    s.vale || '',
    s.nome_cobranca,
    s.tipo_devolucao,
    s.status,
    new Date(s.created_at).toLocaleDateString()
  ]);
  autoTable(doc, {
    startY: 110,
    head: [[
      'ID', 'Nome', 'Filial', 'Nº NF', 'Carga', 'Cód. Cobrança', 'Código Cliente', 'RCA', 'Motivo', 'Vale', 'Nome Cobrança', 'Tipo', 'Status', 'Data'
    ]],
    body: tableData,
    // Configurações para evitar "texto vertical" por quebra por caractere
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      overflow: 'linebreak',
      valign: 'middle'
    },
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      halign: 'left'
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { left: marginLR, right: marginLR },
    theme: 'grid',
    tableWidth: 'auto',
    // Larguras fixas por coluna para garantir espaço mínimo adequado
    columnStyles: {
      0: { cellWidth: 30 },   // ID
      1: { cellWidth: 100 },  // Nome
      2: { cellWidth: 40 },   // Filial
      3: { cellWidth: 55 },   // Nº NF
      4: { cellWidth: 45 },   // Carga
      5: { cellWidth: 60 },   // Cód. Cobrança
      6: { cellWidth: 65 },   // Código Cliente
      7: { cellWidth: 35 },   // RCA
      8: { cellWidth: 110 },  // Motivo
      9: { cellWidth: 35 },   // Vale
      10: { cellWidth: 75 },  // Nome Cobrança
      11: { cellWidth: 50 },  // Tipo
      12: { cellWidth: 50 },  // Status
      13: { cellWidth: 50 },  // Data
    },
    didDrawPage: (data: { pageNumber: number }) => {
      // Rodapé
      const str = `Página ${data.pageNumber} - Gerado em ${dataAtual}`;
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(str, pageWidth - marginLR, pageHeight - 10, { align: 'right' });
    }
  });
  doc.save(`relatorio-solicitacoes-${dataAtual.replace(/\D/g, '')}.pdf`);
}

export function gerarRelatorioXLSX({
  solicitacoes,
}: {
  solicitacoes: Solicitacao[];
}) {
  // Import lazily to avoid loading XLSX unless needed
  (async () => {
    const XLSX = await import('xlsx');
  const wsData = [
    [
      'ID', 'Nome', 'Filial', 'Nº NF', 'Carga', 'Cód. Cobrança', 'Código Cliente', 'RCA', 'Motivo', 'Vale', 'Nome Cobrança', 'Tipo', 'Status', 'Data'
    ],
    ...solicitacoes.map(s => [
      s.id,
      s.nome,
      s.filial,
      s.numero_nf,
      s.carga,
      s.cod_cobranca,
      s.cod_cliente,
      s.rca,
      s.motivo_devolucao,
      s.vale || '',
      s.nome_cobranca,
      s.tipo_devolucao,
      s.status,
      new Date(s.created_at).toLocaleDateString()
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // Estilizar cabeçalho
  if (ws['!ref']) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '2C3E50' } },
          alignment: { horizontal: 'center' }
        };
      }
    }
    // Filtros e congelar primeira linha
    ws['!autofilter'] = { ref: ws['!ref'] };
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  }
  // Largura automática
  ws['!cols'] = wsData[0].map((_, i) => {
    const maxLen = wsData.reduce((acc, row) => Math.max(acc, (row[i] ? row[i].toString().length : 0)), 10);
    return { wch: maxLen + 2 };
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  const dataAtual = new Date().toLocaleString().replace(/\D/g, '');
  XLSX.writeFile(wb, `Relatorio_Solicitacoes_${dataAtual}.xlsx`);
  })();
} 