import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Periodo = { start: string; end: string };

@Injectable({ providedIn: 'root' })
export class PdfReportService {
  private head = { fillColor: [49, 63, 46] as [number, number, number], textColor: 255, fontStyle: 'bold' as const };

  private brl(n: number): string {
    return (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private finalY(doc: jsPDF): number {
    const ay = (doc as any).lastAutoTable;
    return ay ? ay.finalY : 40;
  }

  private secaoTitulo(doc: jsPDF, y: number, texto: string): number {
    const ph = doc.internal.pageSize.getHeight();
    if (y + 18 > ph - 15) { doc.addPage(); y = 20; }
    doc.setFontSize(12); doc.setTextColor(40); doc.setFont('helvetica', 'bold');
    doc.text(texto, 14, y);
    doc.setFont('helvetica', 'normal');
    return y + 4;
  }

  private cabecalho(doc: jsPDF, titulo: string, periodo: Periodo): number {
    doc.setFontSize(16); doc.setTextColor(40); doc.setFont('helvetica', 'bold');
    doc.text('Los Corrales ERP', 14, 18);
    doc.setFontSize(12); doc.text(titulo, 14, 26);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120);
    const p = `Período: ${periodo.start || '—'} a ${periodo.end || '—'}`;
    const g = `Gerado em: ${new Date().toLocaleString('pt-BR')}`;
    doc.text(`${p}    |    ${g}`, 14, 32);
    doc.setDrawColor(200); doc.line(14, 35, 196, 35);
    return 42;
  }

  private financeiro(doc: jsPDF, y: number, f: any): number {
    y = this.secaoTitulo(doc, y, 'Financeiro (Caixa)');
    autoTable(doc, {
      startY: y, theme: 'grid', headStyles: this.head, styles: { fontSize: 9 },
      head: [['Indicador', 'Qtd', 'Valor']],
      body: [
        ['Entradas', String(f.entradas.count), this.brl(f.entradas.total)],
        ['Saídas', String(f.saidas.count), this.brl(f.saidas.total)],
        ['Trocas (heurística)', String(f.trocas.count), this.brl(f.trocas.total)],
        ['Saldo', '', this.brl(f.saldo)]
      ]
    });
    return this.finalY(doc) + 10;
  }

  private estoque(doc: jsPDF, y: number, inv: any, detalhado: boolean): number {
    y = this.secaoTitulo(doc, y, 'Estoque');
    autoTable(doc, {
      startY: y, theme: 'grid', headStyles: this.head, styles: { fontSize: 9 },
      head: [['Indicador', 'Quantidade']],
      body: [
        ['Parada (em estoque)', `${inv.totalEmEstoque} un.`],
        ['Movimentada (período)', `${inv.totalMovimentado} un.`]
      ]
    });
    y = this.finalY(doc) + 8;

    if (detalhado) {
      y = this.secaoTitulo(doc, y, 'Mais movimentados');
      autoTable(doc, {
        startY: y, theme: 'striped', headStyles: this.head, styles: { fontSize: 9 },
        head: [['Produto', 'Qtd vendida']],
        body: (inv.topMovimentados || []).map((p: any) => [p.produto, String(p.quantidade)])
      });
      y = this.finalY(doc) + 8;

      y = this.secaoTitulo(doc, y, 'Itens parados (estoque sem giro no período)');
      autoTable(doc, {
        startY: y, theme: 'striped', headStyles: this.head, styles: { fontSize: 9 },
        head: [['Produto', 'Cor', 'Tamanho', 'Estoque']],
        body: (inv.semGiro || []).map((i: any) => [i.produto, i.cor, i.tamanho, String(i.estoque)])
      });
      y = this.finalY(doc) + 10;
    }
    return y;
  }

  private usuarios(doc: jsPDF, y: number, u: any, detalhado: boolean): number {
    y = this.secaoTitulo(doc, y, 'Usuários');
    autoTable(doc, {
      startY: y, theme: 'grid', headStyles: this.head, styles: { fontSize: 9 },
      head: [['Indicador', 'Valor']],
      body: [
        ['Total de ações', String(u.totalAcoes)],
        ['Usuário mais ativo', u.maisAtivos?.[0]?.usuario || '—']
      ]
    });
    y = this.finalY(doc) + 8;

    if (detalhado) {
      y = this.secaoTitulo(doc, y, 'Usuários mais ativos');
      autoTable(doc, {
        startY: y, theme: 'striped', headStyles: this.head, styles: { fontSize: 9 },
        head: [['Usuário', 'Ações']],
        body: (u.maisAtivos || []).map((x: any) => [x.usuario, String(x.acoes)])
      });
      y = this.finalY(doc) + 8;

      y = this.secaoTitulo(doc, y, 'Funções mais realizadas');
      autoTable(doc, {
        startY: y, theme: 'striped', headStyles: this.head, styles: { fontSize: 9 },
        head: [['Função / Ação', 'Vezes']],
        body: (u.funcoesMaisRealizadas || []).map((x: any) => [x.acao, String(x.total)])
      });
      y = this.finalY(doc) + 10;
    }
    return y;
  }

  /**
   * opcao: 'geral' | 'detalhado' | 'financeiro' | 'estoque' | 'usuarios'
   */
  gerar(opcao: string, periodo: Periodo, dados: { financial: any; inventory: any; users: any }) {
    const doc = new jsPDF();
    const titulos: Record<string, string> = {
      geral: 'Relatório Geral (Resumo)',
      detalhado: 'Relatório Detalhado',
      financeiro: 'Relatório Financeiro (Caixa)',
      estoque: 'Relatório de Estoque',
      usuarios: 'Relatório de Usuários'
    };

    let y = this.cabecalho(doc, titulos[opcao] || 'Relatório', periodo);
    const detalhado = opcao !== 'geral';

    if (['geral', 'detalhado', 'financeiro'].includes(opcao)) y = this.financeiro(doc, y, dados.financial);
    if (['geral', 'detalhado', 'estoque'].includes(opcao))   y = this.estoque(doc, y, dados.inventory, detalhado);
    if (['geral', 'detalhado', 'usuarios'].includes(opcao))  y = this.usuarios(doc, y, dados.users, detalhado);

    doc.save(`relatorio-${opcao}-${periodo.start || 'inicio'}_a_${periodo.end || 'hoje'}.pdf`);
  }
}