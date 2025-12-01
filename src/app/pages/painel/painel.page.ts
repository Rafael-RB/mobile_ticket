import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-painel',
  templateUrl: './painel.page.html'
})
export class PainelPage implements OnInit {
  last5: any[] = [];

  constructor(private ticketService: TicketService) {}

  ngOnInit() {
    this.refresh();
    // opcional: atualizar periodicamente (a cada 2s)
    setInterval(() => this.refresh(), 2000);
  }

  refresh() {
    this.last5 = this.ticketService.getLastCalled(5);
  }
}
