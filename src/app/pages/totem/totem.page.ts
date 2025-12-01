import { Component } from '@angular/core';
import { TicketService } from '../../core/services/ticket.service';
import { TicketType } from '../../core/models/ticket.model';

@Component({
  selector: 'app-totem',
  templateUrl: './totem.page.html'
})
export class TotemPage {
  lastIssued: any = null;

  constructor(private ticketService: TicketService) {}

  emitir(type: TicketType) {
    this.lastIssued = this.ticketService.emitir(type);
  }
}

