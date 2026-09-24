import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Producto, Proveedor } from '../../models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Recepción de Compras e Ingreso de Lotes</h2>
          <p class="text-slate-500 text-sm">Registro de facturas de proveedores y abastecimiento de inventario</p>
        </div>
      </div>

      <!-- Main Form Container -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        
        <!-- Proveedor y Factura -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Laboratorio / Proveedor *</label>
            <select [(ngModel)]="idProveedor" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
              <option *ngFor="let prov of proveedores" [value]="prov.id_proveedor">
                {{ prov.razon_social }} (NIT: {{ prov.nit_ruc }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">N° Factura del Proveedor *</label>
            <input 
              type="text" 
              [(ngModel)]="numeroFactura" 
              placeholder="ej: FAC-LAB-2026-892" 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold font-mono"
            />
          </div>
        </div>

        <!-- Agregar Item a la Compra -->
        <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 class="text-xs font-bold text-slate-700 uppercase">Detalle del Medicamento a Ingresar</h4>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            <div class="lg:col-span-2">
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Medicamento</label>
              <select [(ngModel)]="itemActual.id_producto" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                <option *ngFor="let prod of productos" [value]="prod.id_producto">
                  {{ prod.nombre_comercial }} - {{ prod.forma_farmaceutica }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">N° Lote Fabricante *</label>
              <input type="text" [(ngModel)]="itemActual.numero_lote" placeholder="LOTE-XXX" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"/>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha Vencimiento *</label>
              <input type="date" [(ngModel)]="itemActual.fecha_vencimiento" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"/>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cantidad Unid. *</label>
              <input type="number" min="1" [(ngModel)]="itemActual.cantidad" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"/>
            </div>

          </div>

          <div class="flex items-center justify-between pt-2">
            <div class="w-48">
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Costo Unitario Compra (Bs.) *</label>
              <input type="number" step="0.01" [(ngModel)]="itemActual.precio_compra_unit" class="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"/>
            </div>

            <button 
              type="button" 
              (click)="agregarItem()" 
              class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow"
            >
              + Agregar a la Factura
            </button>
          </div>
        </div>

        <!-- Tabla Items de Compra -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b text-slate-500 font-bold uppercase">
              <tr>
                <th class="p-3">Medicamento</th>
                <th class="p-3">Lote</th>
                <th class="p-3">Vencimiento</th>
                <th class="p-3">Cantidad</th>
                <th class="p-3">Precio Compra Unit.</th>
                <th class="p-3">Subtotal</th>
                <th class="p-3 text-center">Quitar</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr *ngFor="let item of itemsCompra; let i = index">
                <td class="p-3 font-bold text-slate-900">{{ getNombreProducto(item.id_producto) }}</td>
                <td class="p-3 font-mono font-bold">{{ item.numero_lote }}</td>
                <td class="p-3">{{ item.fecha_vencimiento }}</td>
                <td class="p-3 font-black text-slate-800">{{ item.cantidad }} u.</td>
                <td class="p-3">Bs. {{ item.precio_compra_unit }}</td>
                <td class="p-3 font-extrabold text-teal-700">Bs. {{ (item.cantidad * item.precio_compra_unit).toFixed(2) }}</td>
                <td class="p-3 text-center">
                  <button (click)="quitarItem(i)" class="text-rose-500 font-bold hover:text-rose-700">✕</button>
                </td>
              </tr>
              <tr *ngIf="itemsCompra.length === 0">
                <td colspan="7" class="text-center py-6 text-slate-400">No hay productos añadidos a esta compra</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total y Confirmación -->
        <div class="pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span class="text-xs text-slate-500 uppercase font-bold">Total Factura Proveedor:</span>
            <p class="text-2xl font-black text-slate-900">Bs. {{ totalCompra.toFixed(2) }}</p>
          </div>

          <button 
            (click)="guardarCompra()" 
            [disabled]="itemsCompra.length === 0 || !numeroFactura || guardando"
            class="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <span *ngIf="!guardando">Procesar Ingreso de Mercadería</span>
            <span *ngIf="guardando">Guardando...</span>
          </button>
        </div>

      </div>

    </div>
  `
})
export class ComprasComponent implements OnInit {
  proveedores: Proveedor[] = [];
  productos: Producto[] = [];
  
  idProveedor = 1;
  numeroFactura = '';
  itemsCompra: any[] = [];
  guardando = false;

  itemActual = {
    id_producto: 1,
    numero_lote: '',
    fecha_vencimiento: '',
    cantidad: 50,
    precio_compra_unit: 0.50,
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getProveedores().subscribe(res => this.proveedores = res.data);
    this.api.getProductos().subscribe(res => this.productos = res.data);
  }

  getNombreProducto(id: number): string {
    const p = this.productos.find(x => x.id_producto === Number(id));
    return p ? p.nombre_comercial : `ID ${id}`;
  }

  agregarItem() {
    if (!this.itemActual.numero_lote || !this.itemActual.fecha_vencimiento || this.itemActual.cantidad <= 0) {
      alert('Complete los datos del lote correctamente');
      return;
    }

    this.itemsCompra.push({ ...this.itemActual });
    this.itemActual.numero_lote = '';
  }

  quitarItem(index: number) {
    this.itemsCompra.splice(index, 1);
  }

  get totalCompra(): number {
    return this.itemsCompra.reduce((acc, item) => acc + (item.cantidad * item.precio_compra_unit), 0);
  }

  guardarCompra() {
    if (!this.numeroFactura || this.itemsCompra.length === 0) return;
    this.guardando = true;

    const payload = {
      id_proveedor: Number(this.idProveedor),
      numero_factura_prov: this.numeroFactura,
      detalles: this.itemsCompra,
    };

    this.api.registrarCompra(payload).subscribe({
      next: () => {
        this.guardando = false;
        alert('¡Compra registrada e inventario actualizado exitosamente en lotes y Kardex!');
        this.itemsCompra = [];
        this.numeroFactura = '';
      },
      error: (err) => {
        this.guardando = false;
        alert(err.error?.message || 'Error al procesar la compra');
      }
    });
  }
}
