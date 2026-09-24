import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SesionCaja } from '../../models';

@Component({
  selector: 'app-cajas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- Header -->
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Control de Caja y Arqueo de Turno</h2>
        <p class="text-slate-500 text-sm">Apertura, conciliación de efectivo y arqueo matemático al cierre</p>
      </div>

      <!-- Estado de Sesión -->
      <div *ngIf="sesion" class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        
        <div class="flex items-center justify-between border-b pb-4">
          <div>
            <span class="text-xs font-bold text-teal-600 uppercase tracking-wider">Sesión Actual en Curso</span>
            <h3 class="text-xl font-black text-slate-900">Caja Turno #{{ sesion.id_sesion_caja }}</h3>
            <p class="text-xs text-slate-400">Abierta el {{ sesion.fecha_apertura | date:'medium' }}</p>
          </div>
          <span class="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs uppercase">
            Estado: {{ sesion.estado }}
          </span>
        </div>

        <!-- Balance Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs font-semibold text-slate-500 uppercase">Fondo Inicial Apertura</span>
            <p class="text-xl font-black text-slate-800 mt-1">Bs. {{ sesion.monto_inicial_fondo }}</p>
          </div>

          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <span class="text-xs font-semibold text-emerald-700 uppercase">Ventas en Efectivo</span>
            <p class="text-xl font-black text-emerald-700 mt-1">Bs. {{ sesion.total_ventas_efectivo || '0.00' }}</p>
          </div>

          <div class="p-4 bg-teal-50 rounded-xl border border-teal-200">
            <span class="text-xs font-semibold text-teal-700 uppercase">Total Teórico en Caja</span>
            <p class="text-xl font-black text-teal-800 mt-1">
              Bs. {{ (Number(sesion.monto_inicial_fondo) + Number(sesion.total_ventas_efectivo || 0)).toFixed(2) }}
            </p>
          </div>
        </div>

        <!-- Cierre de Caja y Arqueo Form -->
        <div class="pt-4 border-t space-y-4">
          <h4 class="font-bold text-slate-900 text-base">Arqueo y Cierre de Turno</h4>
          <p class="text-xs text-slate-500">Ingrese el monto real contado físicamente en gaveta para calcular la diferencia de arqueo:</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Efectivo Real en Gaveta (Bs.) *</label>
              <input 
                type="number" 
                step="0.01" 
                [(ngModel)]="montoCierreReal" 
                placeholder="0.00"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button 
              (click)="cerrarTurnoCaja()" 
              [disabled]="montoCierreReal === null || cerrando"
              class="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
            >
              <span *ngIf="!cerrando">Finalizar Turno y Cerrar Caja</span>
              <span *ngIf="cerrando">Procesando Cierre...</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Formulario para Abrir Caja (si no hay sesión) -->
      <div *ngIf="!sesion" class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center space-y-6">
        <div class="inline-flex p-4 bg-teal-50 text-teal-600 rounded-full">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>

        <div>
          <h3 class="text-xl font-bold text-slate-900">No hay sesión de caja abierta</h3>
          <p class="text-sm text-slate-500 max-w-md mx-auto mt-1">Para habilitar el Punto de Venta (POS) y recibir pagos, inicie su turno ingresando el fondo de caja inicial.</p>
        </div>

        <div class="max-w-xs mx-auto space-y-3">
          <input 
            type="number" 
            step="0.01" 
            [(ngModel)]="fondoInicial" 
            placeholder="Fondo inicial Bs. (ej: 200)"
            class="w-full px-4 py-2.5 text-center bg-slate-50 border border-slate-200 rounded-xl font-bold text-base focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />

          <button 
            (click)="abrirTurnoCaja()" 
            class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Abrir Turno de Caja
          </button>
        </div>
      </div>

    </div>
  `
})
export class CajasComponent implements OnInit {
  sesion: SesionCaja | null = null;
  fondoInicial = 200.00;
  montoCierreReal: number | null = null;
  cerrando = false;
  Number = Number;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarSesion();
  }

  cargarSesion() {
    this.api.getSesionCajaActiva().subscribe(res => {
      this.sesion = res.data;
    });
  }

  abrirTurnoCaja() {
    this.api.abrirCaja(this.fondoInicial).subscribe({
      next: (res) => {
        alert('Caja abierta exitosamente');
        this.sesion = res.data;
      },
      error: (err) => alert(err.error?.message || 'Error abriendo caja')
    });
  }

  cerrarTurnoCaja() {
    if (this.montoCierreReal === null || !this.sesion) return;
    this.cerrando = true;

    this.api.cerrarCaja(this.sesion.id_sesion_caja, this.montoCierreReal).subscribe({
      next: (res) => {
        this.cerrando = false;
        const dif = res.data.diferencia_arqueo;
        const msgDif = dif === 0 
          ? '¡Arqueo exacto sin diferencias!' 
          : (dif > 0 ? `Sobrante en caja de Bs. ${dif}` : `Faltante en caja de Bs. ${Math.abs(dif)}`);
        
        alert(`Caja cerrada con éxito.\n${msgDif}`);
        this.sesion = null;
        this.montoCierreReal = null;
      },
      error: (err) => {
        this.cerrando = false;
        alert(err.error?.message || 'Error al cerrar caja');
      }
    });
  }
}
