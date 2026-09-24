import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Control de Recetas Médicas Retenidas</h2>
        <p class="text-slate-500 text-sm">Archivo y auditoría regulatoria de recetas para psicotrópicos y antibióticos</p>
      </div>

      <!-- Buscador -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="relative">
          <input 
            type="text" 
            [(ngModel)]="busqueda" 
            (input)="cargarRecetas()" 
            placeholder="Buscar por médico, matrícula profesional, paciente o documento..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
      </div>

      <!-- Tabla de Recetas -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase">
              <tr>
                <th class="p-4">Médico Prescriptor</th>
                <th class="p-4">Matrícula</th>
                <th class="p-4">Paciente</th>
                <th class="p-4">Comprobante Venta</th>
                <th class="p-4">Diagnóstico</th>
                <th class="p-4">Fecha Emisión</th>
                <th class="p-4">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr *ngFor="let r of recetas" class="hover:bg-slate-50/80">
                <td class="p-4 font-bold text-slate-900">{{ r.nombre_medico }}</td>
                <td class="p-4 font-mono font-bold text-teal-700">{{ r.matricula_profesional }}</td>
                <td class="p-4">
                  <span class="font-bold text-slate-800 block">{{ r.cliente_nombre }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">Doc: {{ r.cliente_documento }}</span>
                </td>
                <td class="p-4 font-mono font-bold text-slate-700">{{ r.numero_comprobante }}</td>
                <td class="p-4 text-slate-600 max-w-xs truncate">{{ r.diagnostico || 'Sin diagnóstico' }}</td>
                <td class="p-4 text-slate-500">{{ r.fecha_emision | date:'dd/MM/yyyy' }}</td>
                <td class="p-4">
                  <span class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px] uppercase">
                    Retenida
                  </span>
                </td>
              </tr>
              <tr *ngIf="recetas.length === 0">
                <td colspan="7" class="text-center py-8 text-slate-400">No se encontraron recetas médicas archivadas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class RecetasComponent implements OnInit {
  recetas: any[] = [];
  busqueda = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarRecetas();
  }

  cargarRecetas() {
    this.api.getRecetas(this.busqueda).subscribe(res => this.recetas = res.data);
  }
}
