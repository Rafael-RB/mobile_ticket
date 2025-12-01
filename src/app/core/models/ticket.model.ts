export type TicketType = 'SP' | 'SG' | 'SE';

export interface Ticket {
  id: string;
  type: TicketType;
  sequence: number;
  issuedAt: string;
  calledAt?: string;
  attendedAt?: string;
  guiche?: string;
  status: 'EM_ESPERA' | 'CHAMADA' | 'ATENDIDO' | 'CANCELADO' | 'NAO_ATENDIDO';
  estimatedTM?: number; // <-- ADICIONADO
}
