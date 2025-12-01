import { Component } from '@angular/core';
import { TicketService } from '../../core/services/ticket.service';
import * as dayjs from 'dayjs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html'
})
export class RelatoriosPage {
  dateStr = dayjs().format('YYMMDD');

  report: any = null;

  constructor(private ticketService: TicketService) {}

  gerar() {
    this.report = this.ticketService.getDailyReport(this.dateStr);
  }

  exportCsv() {
    if (!this.report) return;
    const lines = [];
    lines.push('id,type,issuedAt,calledAt,attendedAt,guiche,status');
    this.report.detailed.forEach((d: any) => {
      lines.push([d.id,d.type,d.issuedAt,d.calledAt,d.attendedAt,d.guiche,d.status].map(s => `"${(s||'').toString().replace(/"/g,'""')}"`).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `relatorio_${this.dateStr}.csv`);
  }
}
