import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Kardex de Movimientos de Inventario</h2>
          <p class="text-slate-500 text-sm">Registro histórico y auditoría de entradas, salidas, mermas y ajustes</p>
        </div>

        <button 
          (click)="exportarKardexExcel()"
          [disabled]="kardexList.length === 0"
          class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-40"
        >
          <span>📊 Exportar Kardex a Excel</span>
        </button>
      </div>

      <!-- Tabla Kardex -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase">
              <tr>
                <th class="p-4">Fecha / Hora</th>
                <th class="p-4">Medicamento</th>
                <th class="p-4">Lote</th>
                <th class="p-4">Tipo Movimiento</th>
                <th class="p-4">Cantidad</th>
                <th class="p-4">Saldo Resultante</th>
                <th class="p-4">Motivo / Detalle</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr *ngFor="let k of kardexList" class="hover:bg-slate-50/80">
                <td class="p-4 font-mono text-slate-500">{{ k.fecha_hora | date:'short' }}</td>
                <td class="p-4 font-bold text-slate-900">{{ k.nombre_comercial }}</td>
                <td class="p-4 font-mono font-bold">{{ k.numero_lote }}</td>
                <td class="p-4">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': k.tipo_movimiento === 'compra',
                          'bg-blue-100 text-blue-800': k.tipo_movimiento === 'venta',
                          'bg-rose-100 text-rose-800': k.tipo_movimiento === 'merma',
                          'bg-amber-100 text-amber-800': k.tipo_movimiento === 'ajuste'
                        }">
                    {{ k.tipo_movimiento }}
                  </span>
                </td>
                <td class="p-4 font-black text-sm" [ngClass]="k.cantidad >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                  {{ k.cantidad > 0 ? '+' : '' }}{{ k.cantidad }} u.
                </td>
                <td class="p-4 font-black text-slate-900 text-sm">{{ k.saldo_resultante }} u.</td>
                <td class="p-4 text-slate-600">{{ k.motivo_detalle }}</td>
              </tr>
              <tr *ngIf="kardexList.length === 0">
                <td colspan="7" class="text-center py-8 text-slate-400">No hay movimientos registrados en Kardex</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class KardexComponent implements OnInit {
  kardexList: any[] = [];

  constructor(
    private api: ApiService,
    private exportService: ExportService
  ) {}

  ngOnInit() {
    this.api.getKardex().subscribe(res => this.kardexList = res.data);
  }

  exportarKardexExcel() {
    const dataExport = this.kardexList.map(k => ({
      'Fecha / Hora': new Date(k.fecha_hora).toLocaleString(),
      'Medicamento': k.nombre_comercial,
      'Número de Lote': k.numero_lote,
      'Tipo de Movimiento': k.tipo_movimiento.toUpperCase(),
      'Cantidad (Unidades)': k.cantidad,
      'Saldo Resultante (Unidades)': k.saldo_resultante,
      'Motivo / Comprobante': k.motivo_detalle,
    }));

    this.exportService.exportToExcel(dataExport, 'Kardex_Movimientos_Farmacia', 'Auditoría Kardex');
  }
}
