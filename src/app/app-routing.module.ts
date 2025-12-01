import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'totem', pathMatch: 'full' },
  { path: 'totem', loadChildren: () => import('./pages/totem/totem.module').then(m => m.TotemModule) },
  { path: 'atendente', loadChildren: () => import('./pages/atendente/atendente.module').then(m => m.AtendenteModule) },
  { path: 'painel', loadChildren: () => import('./pages/painel/painel.module').then(m => m.PainelModule) },
  { path: 'relatorios', loadChildren: () => import('./pages/relatorios/relatorios.module').then(m => m.RelatoriosModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
