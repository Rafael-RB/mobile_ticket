import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { RelatoriosPage } from './relatorios.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: RelatoriosPage }])
  ],
  declarations: [RelatoriosPage]
})
export class RelatoriosModule {}
