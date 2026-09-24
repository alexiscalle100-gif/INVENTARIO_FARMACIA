import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Si NO está autenticado (Login) -->
    <div *ngIf="!authService.isAuthenticated()">
      <router-outlet></router-outlet>
    </div>

    <!-- Si ESTÁ autenticado (App Shell con Sidebar Responsivo) -->
    <div *ngIf="authService.isAuthenticated()" class="min-h-screen flex bg-slate-100/70 relative">
      
      <!-- Backdrop para móvil cuando el menú está abierto -->
      <div 
        *ngIf="sidebarOpen()" 
        (click)="sidebarOpen.set(false)"
        class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
      ></div>

      <!-- Sidebar (Desktop fijo + Móvil deslizable) -->
      <aside 
        class="fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-50 transform transition-transform duration-300 ease-in-out"
        [ngClass]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      >
        
        <!-- App Logo / Brand -->
        <div class="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20 text-lg">
              +
            </div>
            <div>
              <h1 class="font-extrabold text-white text-base leading-none">FarmaControl</h1>
              <span class="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">Inventario & POS</span>
            </div>
          </div>

          <!-- Botón cerrar en móvil -->
          <button (click)="sidebarOpen.set(false)" class="lg:hidden text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar text-xs font-semibold">
          
          <a (click)="sidebarOpen.set(false)" routerLink="/dashboard" routerLinkActive="bg-teal-600 text-white shadow-lg shadow-teal-600/30" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            Dashboard & Gráficos
          </a>

          <a (click)="sidebarOpen.set(false)" routerLink="/pos" routerLinkActive="bg-teal-600 text-white shadow-lg shadow-teal-600/30" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Punto de Venta (POS)
          </a>

          <a (click)="sidebarOpen.set(false)" routerLink="/inventario" routerLinkActive="bg-teal-600 text-white shadow-lg shadow-teal-600/30" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            Medicamentos & Lotes
          </a>

          <a (click)="sidebarOpen.set(false)" routerLink="/compras" routerLinkActive="bg-teal-600 text-white shadow-lg shadow-teal-600/30" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
            Compras a Proveedores
          </a>

          <a (click)="sidebarOpen.set(false)" routerLink="/cajas" routerLinkActive="bg-teal-600 text-white shadow-lg shadow-teal-600/30" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Arqueo de Caja
          </a>

          <a (click)="sidebarOpen.set(false)" routerLink="/recetas" routerLinkActive="bg-teal-600 text-white shadow-lg shadow-teal-600/30" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Recetas Retenidas
          </a>

          <a (click)="sidebarOpen.set(false)" routerLink="/kardex" routerLinkActive="bg-teal-600 text-white shadow-lg shadow-teal-600/30" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Kardex Físico
          </a>

        </nav>

        <!-- User Profile & Logout -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/40">
          <div class="flex items-center justify-between">
            <div class="truncate">
              <p class="text-xs font-bold text-white truncate">{{ authService.currentUser()?.nombre_completo }}</p>
              <p class="text-[10px] text-teal-400 font-semibold uppercase">{{ authService.currentUser()?.cargo_rol }}</p>
            </div>
            <button (click)="authService.logout()" title="Cerrar Sesión" class="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            </button>
          </div>
        </div>

      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <!-- Top Navigation Header -->
        <header class="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          
          <!-- Botón hamburguesa móvil -->
          <div class="flex items-center gap-3">
            <button 
              (click)="sidebarOpen.set(!sidebarOpen())" 
              class="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="text-xs font-semibold text-slate-700 hidden sm:inline">Sistema Conectado en Línea</span>
              <span class="text-xs font-semibold text-slate-700 sm:hidden">FarmaControl</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 hidden sm:inline">
              PostgreSQL 17 + TypeScript
            </span>
            <span class="text-[11px] font-mono text-slate-400">v1.2 Pro</span>
          </div>
        </header>

        <!-- Dynamic Routed Content -->
        <div class="p-4 sm:p-6 flex-1">
          <router-outlet></router-outlet>
        </div>
      </main>

    </div>
  `
})
export class AppComponent {
  sidebarOpen = signal<boolean>(false);

  constructor(public authService: AuthService) {}
}
