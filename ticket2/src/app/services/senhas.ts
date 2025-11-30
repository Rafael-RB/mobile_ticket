import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SenhasService {
  public inputNovaSenha: string = '';

  public senhasGeral: number = 0;
  public senhasPrior: number = 0;
  public senhasExame: number = 0;
  public senhasTotal: number = 0;

  somaGeral() { this.senhasGeral++; this.senhasTotal++; }
  somaPrior() { this.senhasPrior++; this.senhasTotal++; }
  somaExame() { this.senhasExame++; this.senhasTotal++; }

  public senhasArray = {
    SG: [] as string[],
    SP: [] as string[],
    SE: [] as string[]
  };

  novaSenha(tipoSenha: 'SG' | 'SP' | 'SE') {

    // soma counters corretos
    if (tipoSenha === 'SG') this.somaGeral();
    if (tipoSenha === 'SP') this.somaPrior();
    if (tipoSenha === 'SE') this.somaExame();

    // gera número incremental
    const numero = (this.senhasArray[tipoSenha].length + 1)
      .toString()
      .padStart(2, '0');

    // monta a senha
    this.inputNovaSenha =
      new Date().getFullYear().toString().substring(2, 4) +
      new Date().getMonth().toString().padStart(2, '0') +
      new Date().getDay().toString().padStart(2, '0') +
      '-' +
      tipoSenha +
      numero;
    // salva corretamente no array do tipo
    this.senhasArray[tipoSenha].push(this.inputNovaSenha);
  }
}