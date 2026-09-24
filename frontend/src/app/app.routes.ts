import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PosComponent } from './pages/pos/pos.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { CajasComponent } from './pages/cajas/cajas.component';
import { RecetasComponent } from './pages/recetas/recetas.component';
import { KardexComponent } from './pages/kardex/kardex.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'pos', component: PosComponent, canActivate: [authGuard] },
  { path: 'inventario', component: InventarioComponent, canActivate: [authGuard] },
  { path: 'compras', component: ComprasComponent, canActivate: [authGuard] },
  { path: 'cajas', component: CajasComponent, canActivate: [authGuard] },
  { path: 'recetas', component: RecetasComponent, canActivate: [authGuard] },
  { path: 'kardex', component: KardexComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
