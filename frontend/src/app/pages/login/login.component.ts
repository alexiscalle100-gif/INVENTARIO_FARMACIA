import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-teal-500/20">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-600 mb-4 ring-8 ring-teal-500/5">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 class="text-2xl font-extrabold text-slate-900">FarmaControl Pro</h1>
          <p class="text-sm text-slate-500 mt-1">Sistema de Gestión e Inventario Farmacéutico</p>
        </div>

        <!-- Alert Error -->
        <div *ngIf="errorMsg" class="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-lg flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Usuario</label>
            <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="usuario" 
                name="usuario" 
                required 
                placeholder="ej: admin, farmacia, cajero1"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Contraseña</label>
            <div class="relative">
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required 
                placeholder="••••••••"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loading"
            class="w-full mt-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-semibold rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span *ngIf="!loading">Ingresar al Sistema</span>
            <span *ngIf="loading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          </button>
        </form>

        <!-- Demo Accounts Hint -->
        <div class="mt-6 pt-6 border-t border-slate-100">
          <p class="text-xs text-center text-slate-400 font-medium mb-3">Cuentas de demostración inicial:</p>
          <div class="grid grid-cols-3 gap-2 text-center text-xs">
            <button type="button" (click)="setCredentials('admin', 'admin123')" class="p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-slate-200 transition-all">
              <span class="font-bold block">Admin</span>
              <span class="text-[10px] text-slate-400">admin123</span>
            </button>
            <button type="button" (click)="setCredentials('farmacia', 'admin123')" class="p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-slate-200 transition-all">
              <span class="font-bold block">Farmacia</span>
              <span class="text-[10px] text-slate-400">admin123</span>
            </button>
            <button type="button" (click)="setCredentials('cajero1', 'admin123')" class="p-2 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 rounded-lg border border-slate-200 transition-all">
              <span class="font-bold block">Cajero</span>
              <span class="text-[10px] text-slate-400">admin123</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  usuario = 'admin';
  password = 'admin123';
  loading = false;
  errorMsg = '';

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  setCredentials(u: string, p: string) {
    this.usuario = u;
    this.password = p;
  }

  onLogin() {
    this.loading = true;
    this.errorMsg = '';
    this.authService.login(this.usuario, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error de conexión con el servidor backend';
      }
    });
  }
}
