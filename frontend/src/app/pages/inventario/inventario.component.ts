import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ExportService } from '../../core/services/export.service';
import { AudioService } from '../../core/services/audio.service';
import { Producto, Categoria, Ubicacion, Lote } from '../../models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Catálogo e Inventario de Medicamentos</h2>
          <p class="text-slate-500 text-sm">Control de stock, ubicaciones y semáforo de vencimiento FEFO</p>
        </div>

        <div class="flex gap-2">
          <!-- Botón Exportar Excel -->
          <button 
            (click)="exportarInventarioExcel()"
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center gap-2"
          >
            <span>📊 Exportar a Excel</span>
          </button>

          <!-- Botón Nuevo Medicamento -->
          <button 
            (click)="abrirModalNuevoMedicamento()" 
            class="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all text-sm flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Nuevo Medicamento
          </button>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div class="relative flex-1">
          <input 
            type="text" 
            [(ngModel)]="busqueda" 
            (input)="cargarInventario()" 
            placeholder="Buscar por código de barras, nombre comercial, genérico..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <svg class="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <select [(ngModel)]="categoriaId" (change)="cargarInventario()" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm">
          <option [ngValue]="null">Todas las Categorías</option>
          <option *ngFor="let c of categorias" [ngValue]="c.id_categoria">{{ c.nombre }}</option>
        </select>
      </div>

      <!-- Tabla de Medicamentos -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th class="px-4 py-3.5">Medicamento</th>
                <th class="px-4 py-3.5">Categoría</th>
                <th class="px-4 py-3.5">Ubicación</th>
                <th class="px-4 py-3.5">Precios (Caja / Fracc)</th>
                <th class="px-4 py-3.5">Stock Físico</th>
                <th class="px-4 py-3.5">Estado</th>
                <th class="px-4 py-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let p of medicamentos" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-4 py-3">
                  <div class="font-bold text-slate-900 text-sm">{{ p.nombre_comercial }}</div>
                  <div class="text-slate-500 font-medium">{{ p.nombre_generico }} ({{ p.concentracion }})</div>
                  <div class="flex gap-2 mt-1">
                    <span class="font-mono text-[10px] text-slate-400">Cod: {{ p.codigo_barras || 'N/A' }}</span>
                    <span *ngIf="p.requiere_receta" class="text-[10px] px-1.5 py-0.2 bg-purple-50 text-purple-700 font-bold rounded">Receta</span>
                    <span *ngIf="p.es_fraccionable" class="text-[10px] px-1.5 py-0.2 bg-teal-50 text-teal-700 font-bold rounded">Fraccionable</span>
                  </div>
                </td>

                <td class="px-4 py-3 text-slate-600 font-medium">
                  {{ p.categoria_nombre }}
                </td>

                <td class="px-4 py-3">
                  <span *ngIf="p.pasillo" class="text-slate-700 font-medium block">{{ p.pasillo }} - {{ p.estante_anaquel }}</span>
                  <span *ngIf="p.gaveta" class="text-slate-400 text-[10px] block">Gaveta: {{ p.gaveta }}</span>
                  <span *ngIf="p.es_refrigerado" class="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                    ❄️ Refrigerado
                  </span>
                </td>

                <td class="px-4 py-3">
                  <span class="font-bold text-slate-900 block">Bs. {{ p.precio_venta_caja }}</span>
                  <span *ngIf="p.precio_venta_fraccion" class="text-teal-600 text-[11px] block">
                    Fracc: Bs. {{ p.precio_venta_fraccion }}
                  </span>
                </td>

                <td class="px-4 py-3">
                  <span class="font-black text-sm text-slate-800">{{ p.stock_total || 0 }} u.</span>
                  <span class="text-[10px] text-slate-400 block font-semibold">Min: {{ p.stock_minimo_alerta }} u.</span>
                </td>

                <td class="px-4 py-3">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': p.estado_stock === 'OPTIMO',
                          'bg-amber-100 text-amber-800': p.estado_stock === 'STOCK_BAJO',
                          'bg-rose-100 text-rose-800': p.estado_stock === 'AGOTADO'
                        }">
                    {{ p.estado_stock }}
                  </span>
                </td>

                <td class="px-4 py-3 text-center">
                  <button (click)="verDetalleLotes(p)" class="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 font-bold text-slate-700 rounded-lg transition-colors">
                    Ver Lotes
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- MODAL LOTES DEL MEDICAMENTO Y REGISTRO DE MERMA -->
    <div *ngIf="medicamentoSeleccionado" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-bold text-slate-900 text-lg">{{ medicamentoSeleccionado.nombre_comercial }}</h3>
            <p class="text-xs text-slate-500">Lotes de inventario (Despacho FEFO y Gestión de Mermas)</p>
          </div>
          <button (click)="medicamentoSeleccionado = null" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
          <div *ngIf="!medicamentoSeleccionado.lotes || medicamentoSeleccionado.lotes.length === 0" class="text-center py-6 text-slate-400 text-xs">
            No existen lotes registrados para este medicamento
          </div>

          <div *ngFor="let lote of medicamentoSeleccionado.lotes" class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900 font-mono text-sm">Lote: {{ lote.numero_lote }}</span>
                <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-800': lote.estado === 'activo',
                        'bg-rose-100 text-rose-800': lote.estado === 'vencido',
                        'bg-slate-200 text-slate-700': lote.estado === 'agotado'
                      }">
                  {{ lote.estado }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">Vence: <strong class="text-slate-800">{{ lote.fecha_vencimiento | date:'dd/MM/yyyy' }}</strong></p>
              <span class="text-[10px] text-slate-400">Costo compra unitario: Bs. {{ lote.precio_compra_unit }}</span>
            </div>

            <div class="text-right space-y-1.5">
              <span class="text-sm font-black text-slate-900 block">{{ lote.stock_actual_unidades }} unidades</span>
              
              <!-- Botón Dar de Baja por Merma -->
              <button 
                *ngIf="lote.stock_actual_unidades > 0"
                (click)="abrirModalMerma(lote)"
                class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-all"
              >
                🗑️ Dar de Baja (Merma)
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button (click)="medicamentoSeleccionado = null" class="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl text-xs">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL FORMULARIO DE BAJA POR MERMA -->
    <div *ngIf="loteParaMerma" class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
            <span class="p-1.5 bg-rose-100 text-rose-700 rounded-lg">⚠️</span>
            Registro de Baja por Merma
          </h3>
          <button (click)="loteParaMerma = null" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <p class="text-xs text-slate-600">
          Lote: <strong class="font-mono text-slate-900">{{ loteParaMerma.numero_lote }}</strong> | Stock Disponible: <strong>{{ loteParaMerma.stock_actual_unidades }} u.</strong>
        </p>

        <div class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Cantidad a dar de baja (unidades) *</label>
            <input 
              type="number" 
              min="1" 
              [max]="loteParaMerma.stock_actual_unidades" 
              [(ngModel)]="cantidadMerma" 
              class="w-full px-3 py-2 border rounded-lg font-bold text-slate-900"
            />
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Motivo de la merma *</label>
            <select [(ngModel)]="motivoMerma" class="w-full px-3 py-2 border rounded-lg bg-white">
              <option value="Medicamento Vencido">Medicamento Vencido / Expirado</option>
              <option value="Frasco o Blíster Roto/Dañado">Frasco o Blíster Roto / Dañado en almacén</option>
              <option value="Pérdida de Cadena de Frío">Pérdida de Cadena de Frío</option>
              <option value="Devolución o Destrucción Sanitaria">Devolución / Destrucción Sanitaria</option>
            </select>
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <button (click)="loteParaMerma = null" class="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs">Cancelar</button>
          <button (click)="procesarBajaMerma()" class="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow">Confirmar Baja</button>
        </div>
      </div>
    </div>

    <!-- MODAL NUEVO MEDICAMENTO -->
    <div *ngIf="modalNuevoMedicamento" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-900 text-lg">Registrar Nuevo Medicamento</h3>
          <button (click)="modalNuevoMedicamento = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form (ngSubmit)="guardarNuevoMedicamento()" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Nombre Comercial *</label>
              <input type="text" [(ngModel)]="nuevoMed.nombre_comercial" name="nc" required class="w-full p-2 border rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Nombre Genérico *</label>
              <input type="text" [(ngModel)]="nuevoMed.nombre_generico" name="ng" required class="w-full p-2 border rounded-lg">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Código Barras</label>
              <input type="text" [(ngModel)]="nuevoMed.codigo_barras" name="cb" class="w-full p-2 border rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Concentración</label>
              <input type="text" [(ngModel)]="nuevoMed.concentracion" name="conc" placeholder="ej: 500 mg" class="w-full p-2 border rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Forma Farmacéutica</label>
              <input type="text" [(ngModel)]="nuevoMed.forma_farmaceutica" name="ff" placeholder="ej: Tabletas" required class="w-full p-2 border rounded-lg">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Categoría *</label>
              <select [(ngModel)]="nuevoMed.id_categoria" name="cat" required class="w-full p-2 border rounded-lg">
                <option *ngFor="let c of categorias" [value]="c.id_categoria">{{ c.nombre }}</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Ubicación Física</label>
              <select [(ngModel)]="nuevoMed.id_ubicacion" name="ub" class="w-full p-2 border rounded-lg">
                <option [value]="null">Sin asignar</option>
                <option *ngFor="let u of ubicaciones" [value]="u.id_ubicacion">{{ u.pasillo }} - {{ u.estante_anaquel }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="font-bold text-slate-700 block mb-1">Precio Venta Caja *</label>
              <input type="number" step="0.01" [(ngModel)]="nuevoMed.precio_venta_caja" name="pvc" required class="w-full p-2 border rounded-lg font-bold">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Precio Fracción</label>
              <input type="number" step="0.01" [(ngModel)]="nuevoMed.precio_venta_fraccion" name="pvf" class="w-full p-2 border rounded-lg">
            </div>
            <div>
              <label class="font-bold text-slate-700 block mb-1">Stock Mínimo Alerta</label>
              <input type="number" [(ngModel)]="nuevoMed.stock_minimo_alerta" name="sma" class="w-full p-2 border rounded-lg">
            </div>
          </div>

          <div class="flex gap-4 pt-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="nuevoMed.requiere_receta" name="rr" class="rounded text-teal-600">
              <span class="font-bold text-slate-700">Requiere Receta Médica</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" [(ngModel)]="nuevoMed.es_fraccionable" name="ef" class="rounded text-teal-600">
              <span class="font-bold text-slate-700">Venta Fraccionable</span>
            </label>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t">
            <button type="button" (click)="modalNuevoMedicamento = false" class="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl shadow">Guardar Medicamento</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class InventarioComponent implements OnInit {
  medicamentos: Producto[] = [];
  categorias: Categoria[] = [];
  ubicaciones: Ubicacion[] = [];
  
  busqueda = '';
  categoriaId: number | null = null;
  medicamentoSeleccionado: Producto | null = null;
  modalNuevoMedicamento = false;

  loteParaMerma: Lote | null = null;
  cantidadMerma = 1;
  motivoMerma = 'Medicamento Vencido';

  nuevoMed: any = {
    nombre_comercial: '',
    nombre_generico: '',
    codigo_barras: '',
    concentracion: '',
    forma_farmaceutica: 'Tabletas',
    id_categoria: 1,
    id_ubicacion: null,
    requiere_receta: false,
    es_fraccionable: true,
    unidades_por_caja: 30,
    precio_venta_caja: 20.00,
    precio_venta_fraccion: 1.00,
    stock_minimo_alerta: 10,
  };

  constructor(
    private api: ApiService,
    private exportService: ExportService,
    private audio: AudioService
  ) {}

  ngOnInit() {
    this.cargarCategorias();
    this.cargarUbicaciones();
    this.cargarInventario();
  }

  cargarCategorias() {
    this.api.getCategorias().subscribe(res => this.categorias = res.data);
  }

  cargarUbicaciones() {
    this.api.getUbicaciones().subscribe(res => this.ubicaciones = res.data);
  }

  cargarInventario() {
    this.api.getProductos(this.busqueda, this.categoriaId || undefined).subscribe(res => {
      this.medicamentos = res.data;
    });
  }

  verDetalleLotes(p: Producto) {
    this.api.getProductoById(p.id_producto).subscribe(res => {
      this.medicamentoSeleccionado = res.data;
    });
  }

  exportarInventarioExcel() {
    const dataExport = this.medicamentos.map(m => ({
      'Código de Barras': m.codigo_barras || 'N/A',
      'Nombre Comercial': m.nombre_comercial,
      'Nombre Genérico': m.nombre_generico,
      'Concentración': m.concentracion,
      'Forma Farmacéutica': m.forma_farmaceutica,
      'Categoría': m.categoria_nombre,
      'Ubicación': `${m.pasillo || ''} ${m.estante_anaquel || ''}`,
      'Precio Caja (Bs.)': m.precio_venta_caja,
      'Precio Fracción (Bs.)': m.precio_venta_fraccion || 0,
      'Stock Total (Unid)': m.stock_total || 0,
      'Stock Mínimo': m.stock_minimo_alerta,
      'Estado': m.estado_stock,
      'Requiere Receta': m.requiere_receta ? 'SÍ' : 'NO'
    }));

    this.exportService.exportToExcel(dataExport, 'Inventario_Medicamentos_Farmacia');
    this.audio.playBeep();
  }

  abrirModalMerma(lote: Lote) {
    this.loteParaMerma = lote;
    this.cantidadMerma = 1;
    this.motivoMerma = 'Medicamento Vencido';
  }

  procesarBajaMerma() {
    if (!this.loteParaMerma || this.cantidadMerma <= 0) return;

    this.api.registrarMerma({
      id_lote: this.loteParaMerma.id_lote,
      cantidad: this.cantidadMerma,
      motivo: this.motivoMerma
    }).subscribe({
      next: () => {
        alert('¡Baja por merma registrada exitosamente en Kardex e Inventario!');
        this.loteParaMerma = null;
        if (this.medicamentoSeleccionado) {
          this.verDetalleLotes(this.medicamentoSeleccionado);
        }
        this.cargarInventario();
      },
      error: (err) => alert(err.error?.message || 'Error al procesar merma')
    });
  }

  abrirModalNuevoMedicamento() {
    this.modalNuevoMedicamento = true;
  }

  guardarNuevoMedicamento() {
    this.api.createProducto(this.nuevoMed).subscribe({
      next: () => {
        alert('Medicamento registrado exitosamente');
        this.modalNuevoMedicamento = false;
        this.cargarInventario();
      },
      error: (err) => alert('Error al registrar medicamento: ' + (err.error?.message || err.message))
    });
  }
}
