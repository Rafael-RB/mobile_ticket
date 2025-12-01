import { Component } from '@angular/core';
import { TicketService } from '../../core/services/ticket.service';
import { Ticket } from '../../core/models/ticket.model';

@Component({
  selector: 'app-atendente',
  templateUrl: './atendente.page.html',
  styleUrls: ['./atendente.page.scss']
})
export class AtendentePage {
  currentCall: Ticket | null = null;
  guiche = 'Guichê 1';

  constructor(private ticketService: TicketService) {}

  chamarProximo() {
    this.currentCall = this.ticketService.callNext(this.guiche);
  }

  finalizar() {
    if (!this.currentCall) return;
    this.ticketService.finalizeAttendance(this.currentCall.id);
    this.currentCall = null;
  }
}
