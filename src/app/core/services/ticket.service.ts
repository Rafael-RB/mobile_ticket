import { Injectable } from '@angular/core';
import { Ticket, TicketType } from '../models/ticket.model';
import { nowIso, formatDateYYMMDD } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  // filas separadas por prioridade
  private filaSP: Ticket[] = [];
  private filaSE: Ticket[] = [];
  private filaSG: Ticket[] = [];

  private lastSequences: Record<string, number> = {}; // chave: YYMMDD+type
  private calledHistory: Ticket[] = []; // últimas chamadas (ordenadas)

  // estatísticas simples
  private allTickets: Map<string, Ticket> = new Map();

  constructor() {}

  // emitir senha
  emitir(type: TicketType): Ticket {
    const today = formatDateYYMMDD(new Date());
    const key = `${today}-${type}`;
    const seq = (this.lastSequences[key] || 0) + 1;
    this.lastSequences[key] = seq;

    const id = `${today}-${type}${String(seq).padStart(2,'0')}`;
    const t: Ticket = {
      id,
      type,
      sequence: seq,
      issuedAt: nowIso(),
      status: 'EM_ESPERA'
    };

    // colocar na fila apropriada
    if (type === 'SP') this.filaSP.push(t);
    if (type === 'SE') this.filaSE.push(t);
    if (type === 'SG') this.filaSG.push(t);

    this.allTickets.set(t.id, t);
    return t;
  }

  // descartar 5% aleatório das senhas (simula quando necessário) — usado quando fechar expediente ou gerar limpeza
  aplicarDescartesPercentual() {
    const all = Array.from(this.allTickets.values()).filter(t => t.status === 'EM_ESPERA');
    const n = Math.floor(all.length * 0.05);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * all.length);
      const tk = all.splice(idx,1)[0];
      if (tk) {
        tk.status = 'NAO_ATENDIDO';
        // remover das filas
        this.removeFromQueues(tk.id);
      }
    }
  }

  // remove de filas
  private removeFromQueues(id: string) {
    this.filaSP = this.filaSP.filter(t => t.id !== id);
    this.filaSE = this.filaSE.filter(t => t.id !== id);
    this.filaSG = this.filaSG.filter(t => t.id !== id);
  }

  // regra de chamar próximo:
  // sequência: [SP] -> [SE|SG] -> [SP] -> ...
  // Implementação: sempre tenta SP primeiro; se não existir, chama SE; se não existir, chama SG.
  // Porém enuncia também: "SE chamado para próximo guichê que estiver disponível, após o atendimento de uma senha SP." 
  // Para simplificar: se SP existe -> serve SP. Se não existe e houver SE -> SE, caso contrário SG.
  // Também, SE não tem prioridade mas é rápido (tem 95% 1min, 5% 5min TM).
  callNext(guicheName: string): Ticket | null {
    // achar próximo
    let next: Ticket | undefined;
    if (this.filaSP.length > 0) {
      next = this.filaSP.shift();
    } else if (this.filaSE.length > 0) {
      next = this.filaSE.shift();
    } else if (this.filaSG.length > 0) {
      next = this.filaSG.shift();
    }

    if (!next) return null;

    // 5% das senhas emitidas não são atendidas -> simulamos evento: chance de descartar e marcar NAO_ATENDIDO.
    const chanceNaoAtendido = Math.random();
    if (chanceNaoAtendido <= 0.05) {
      next.status = 'NAO_ATENDIDO';
      this.allTickets.set(next.id, next);
      // registrar chamada (como descartada) — não entra no histórico de chamados atendidos (mas aparece como chamada)
      next.calledAt = nowIso();
      this.recordCalled(next);
      return next;
    }

    // marcar como chamada
    next.status = 'CHAMADA';
    next.calledAt = nowIso();
    next.guiche = guicheName;
    this.allTickets.set(next.id, next);

    // registrar no histórico das últimas chamadas
    this.recordCalled(next);

    // calcular tempo médio (TM) — retornaremos estimativa (poderia ser usada para simular atendimento)
    // SP: 15 min ±5 min (uniforme) => TM varia igual para cima/baixo até 5 minutos
    // SG: 5 min ±3 min
    // SE: 95% 1 min, 5% 5 min
    // Vamos anexar uma propriedade temporária chamada estimatedTM (em minutos) no objeto para front-end usar.
    (next as any).estimatedTM = this.estimateTM(next.type);

    return next;
  }

  private estimateTM(type: TicketType): number {
    if (type === 'SP') {
      // 15 ± 5 uniformly
      const offset = (Math.random() * 10) - 5; // -5..+5
      return Math.max(1, 15 + offset);
    } else if (type === 'SG') {
      const offset = (Math.random() * 6) - 3; // -3..+3
      return Math.max(1, 5 + offset);
    } else {
      // SE
      const r = Math.random();
      return r <= 0.95 ? 1 : 5;
    }
  }

  // marcar como atendido (ao finalizar o atendimento)
  finalizeAttendance(ticketId: string) {
    const t = this.allTickets.get(ticketId);
    if (!t) return null;
    t.attendedAt = nowIso();
    t.status = 'ATENDIDO';
    this.allTickets.set(t.id, t);
    return t;
  }

  // registrar no histórico de chamadas (mantém últimas 100; e painel mostra últimas 5)
  private recordCalled(t: Ticket) {
    this.calledHistory.unshift({...t}); // clone
    if (this.calledHistory.length > 100) this.calledHistory.pop();
  }

  getLastCalled(n = 5) {
    return this.calledHistory.slice(0, n);
  }

  // relatórios simples:
  getDailyReport(dateStrYYYYMMDD: string) {
    // filtra por YYMMDD prefix no id (id: YYMMDD-...)
    const all = Array.from(this.allTickets.values()).filter(t => t.id.startsWith(dateStrYYYYMMDD));
    const totalEmitidos = all.length;
    const totalAtendidos = all.filter(t => t.status === 'ATENDIDO').length;
    const emittedByType = {
      SP: all.filter(t => t.type === 'SP').length,
      SE: all.filter(t => t.type === 'SE').length,
      SG: all.filter(t => t.type === 'SG').length
    };
    const attendedByType = {
      SP: all.filter(t => t.type === 'SP' && t.status === 'ATENDIDO').length,
      SE: all.filter(t => t.type === 'SE' && t.status === 'ATENDIDO').length,
      SG: all.filter(t => t.type === 'SG' && t.status === 'ATENDIDO').length
    };
    const detailed = all.map(t => ({
      id: t.id, type: t.type, issuedAt: t.issuedAt, calledAt: t.calledAt || '', attendedAt: t.attendedAt || '', guiche: t.guiche || '', status: t.status
    }));
    return {
      totalEmitidos, totalAtendidos, emittedByType, attendedByType, detailed
    };
  }

  // limpar filas (usado ao encerrar expediente)
  encerrarExpediente() {
    // descartar as que restarem em espera como NAO_ATENDIDO
    const restantes = [...this.filaSP, ...this.filaSE, ...this.filaSG];
    restantes.forEach(t => {
      t.status = 'NAO_ATENDIDO';
      this.allTickets.set(t.id, t);
      this.recordCalled(t);
    });
    this.filaSP = []; this.filaSE = []; this.filaSG = [];
  }

  // getters para filas (front-end)
  getQueues() {
    return {
      SP: [...this.filaSP],
      SE: [...this.filaSE],
      SG: [...this.filaSG]
    };
  }
}
