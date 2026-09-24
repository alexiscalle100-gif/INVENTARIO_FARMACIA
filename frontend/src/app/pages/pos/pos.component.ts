import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AudioService } from '../../core/services/audio.service';
import { ExportService, TicketData } from '../../core/services/export.service';
import { AuthService } from '../../core/services/auth.service';
import { Producto, ItemCarrito, SesionCaja } from '../../models';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
      
      <!-- Left Column: Catálogo y Búsqueda de Medicamentos -->
      <div class="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        <!-- Search & Filter Bar con indicador de Escáner -->
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center">
          <div class="relative flex-1 w-full">
            <input 
              type="text" 
              [(ngModel)]="busqueda" 
              (input)="buscarProductos()" 
              placeholder="Buscar medicamento o escanear código de barras..."
              class="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm font-medium"
            />
            <svg class="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="absolute right-3 top-2 px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-md text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
              📷 Escáner Activo
            </span>
          </div>

          <select [(ngModel)]="categoriaSeleccionada" (change)="buscarProductos()" class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto">
            <option [ngValue]="null">Todas las Categorías</option>
            <option *ngFor="let cat of categorias" [ngValue]="cat.id_categoria">{{ cat.nombre }}</option>
          </select>
        </div>

        <!-- Products Grid -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div *ngIf="loadingProductos" class="flex justify-center items-center h-48">
            <span class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></span>
          </div>

          <div *ngIf="!loadingProductos && productos.length === 0" class="text-center py-16 text-slate-400">
            <p class="text-sm">No se encontraron medicamentos disponibles</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <div *ngFor="let p of productos" 
                 class="p-4 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all bg-white flex flex-col justify-between group relative">
              
              <div (click)="seleccionarMedicamento(p)" class="cursor-pointer">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition-colors leading-tight">
                    {{ p.nombre_comercial }}
                  </h4>
                  <span *ngIf="p.requiere_receta" class="text-[10px] font-black px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded uppercase">
                    Receta
                  </span>
                </div>
                
                <p class="text-xs text-slate-500 mt-1 font-medium">{{ p.nombre_generico }} • {{ p.concentracion }}</p>
                <p class="text-[11px] text-slate-400 mt-0.5">{{ p.forma_farmaceutica }}</p>
              </div>

              <!-- Precios & Stock -->
              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="font-extrabold text-slate-900 text-sm">Bs. {{ p.precio_venta_caja }}</span>
                  <span *ngIf="p.es_fraccionable" class="text-[11px] text-teal-600 font-semibold block">
                    Fracc: Bs. {{ p.precio_venta_fraccion }}
                  </span>
                </div>

                <div class="text-right flex flex-col items-end gap-1">
                  <span class="text-xs font-bold px-2 py-0.5 rounded-md"
                        [ngClass]="{
                          'bg-emerald-100 text-emerald-800': (p.stock_total || 0) > p.stock_minimo_alerta,
                          'bg-amber-100 text-amber-800': (p.stock_total || 0) <= p.stock_minimo_alerta && (p.stock_total || 0) > 0,
                          'bg-rose-100 text-rose-800': (p.stock_total || 0) === 0
                        }">
                    {{ p.stock_total || 0 }} u.
                  </span>

                  <!-- Botón Genéricos Bioequivalentes -->
                  <button 
                    type="button"
                    (click)="consultarBioequivalentes(p, $event)"
                    title="Buscar alternativas genéricas con el mismo principio activo"
                    class="text-[10px] font-bold text-teal-600 hover:text-teal-800 underline flex items-center gap-0.5"
                  >
                    <span>💊 Genéricos</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Carrito de Venta / Facturación -->
      <div class="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        <!-- Header Caja & Turno -->
        <div class="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-teal-400">Punto de Venta Activo</span>
            <h3 class="font-bold text-sm text-slate-100">Caja #{{ sesionCaja?.id_sesion_caja || '---' }}</h3>
          </div>
          <span *ngIf="sesionCaja" class="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold">
            Abierta
          </span>
          <span *ngIf="!sesionCaja" class="px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-xs font-semibold">
            Caja Cerrada
          </span>
        </div>

        <!-- Alert si caja está cerrada -->
        <div *ngIf="!sesionCaja" class="p-4 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs">
          ⚠️ Debes abrir un turno en <strong>Arqueo de Caja</strong> para procesar cobros.
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <div *ngIf="carrito.length === 0" class="h-full flex flex-col items-center justify-center text-slate-300 py-12">
            <svg class="w-12 h-12 mb-2 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <p class="text-xs font-medium">El carrito está vacío</p>
          </div>

          <div *ngFor="let item of carrito; let i = index" class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div class="flex justify-between items-start">
              <div>
                <h5 class="text-xs font-bold text-slate-900 leading-tight">{{ item.producto.nombre_comercial }}</h5>
                <span class="text-[10px] text-slate-500 font-mono">Lote: {{ item.lote.numero_lote }} (Vence: {{ item.lote.fecha_vencimiento | date:'MM/yy' }})</span>
              </div>
              <button (click)="quitarDelCarrito(i)" class="text-rose-500 hover:text-rose-700 p-1 font-bold text-xs">
                ✕
              </button>
            </div>

            <div class="flex items-center justify-between text-xs pt-1">
              <div class="flex items-center gap-1">
                <select [(ngModel)]="item.tipo_unidad" (change)="recalcularItem(item)" class="text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg">
                  <option value="caja">Caja</option>
                  <option *ngIf="item.producto.es_fraccionable" value="fraccion">Unidad/Fracc</option>
                </select>

                <input 
                  type="number" 
                  min="1" 
                  [(ngModel)]="item.cantidad" 
                  (change)="recalcularItem(item)"
                  class="w-14 px-2 py-1 text-center bg-white border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div class="text-right">
                <span class="text-xs font-bold text-slate-900">Bs. {{ item.subtotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals & Payment Section -->
        <div class="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Comprobante</label>
              <select [(ngModel)]="tipoComprobante" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                <option value="ticket">Ticket Recibo</option>
                <option value="factura">Factura Oficial</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pago</label>
              <select [(ngModel)]="metodoPago" class="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                <option value="efectivo">Efectivo</option>
                <option value="qr">Pago QR</option>
                <option value="tarjeta">Tarjeta Débito/Crédito</option>
              </select>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-200/80 flex items-center justify-between">
            <span class="text-sm font-bold text-slate-700">Total a Cobrar:</span>
            <span class="text-2xl font-black text-teal-700">Bs. {{ totalCobrar.toFixed(2) }}</span>
          </div>

          <button 
            (click)="procesarVenta()"
            [disabled]="carrito.length === 0 || !sesionCaja || procesandoVenta"
            class="w-full py-3 bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span *ngIf="!procesandoVenta">Completar Cobro & Facturar</span>
            <span *ngIf="procesandoVenta" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          </button>
        </div>

      </div>

    </div>

    <!-- MODAL DE RECETA MÉDICA -->
    <div *ngIf="mostrarModalReceta" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
            <span class="p-1.5 bg-purple-100 text-purple-700 rounded-lg">📋</span>
            Registro de Receta Médica
          </h3>
          <button (click)="mostrarModalReceta = false" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <p class="text-xs text-slate-500">
          Esta venta contiene medicamentos controlados. Complete los datos médicos requeridos:
        </p>

        <div class="space-y-3 text-xs">
          <div>
            <label class="font-bold text-slate-700 block mb-1">Nombre del Médico Prescriptor *</label>
            <input type="text" [(ngModel)]="recetaData.nombre_medico" class="w-full px-3 py-2 border rounded-lg" placeholder="Dr(a). Nombre y Apellidos">
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Matrícula Profesional / Registro Médico *</label>
            <input type="text" [(ngModel)]="recetaData.matricula_profesional" class="w-full px-3 py-2 border rounded-lg" placeholder="ej: MP-4892-LP">
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Diagnóstico / Observación</label>
            <input type="text" [(ngModel)]="recetaData.diagnostico" class="w-full px-3 py-2 border rounded-lg" placeholder="ej: Infección respiratoria aguda">
          </div>

          <div>
            <label class="font-bold text-slate-700 block mb-1">Fecha de Emisión de la Receta *</label>
            <input type="date" [(ngModel)]="recetaData.fecha_emision" class="w-full px-3 py-2 border rounded-lg">
          </div>
        </div>

        <div class="flex gap-2 pt-2">
          <button (click)="mostrarModalReceta = false" class="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs">Cancelar</button>
          <button (click)="confirmarVentaConReceta()" class="flex-1 py-2 bg-teal-600 text-white rounded-lg font-bold text-xs shadow">Confirmar y Emitir</button>
        </div>
      </div>
    </div>

    <!-- MODAL DE MEDICAMENTOS GENÉRICOS BIOEQUIVALENTES -->
    <div *ngIf="mostrarModalEquivalentes" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b pb-3">
          <div>
            <h3 class="font-bold text-slate-900 text-base flex items-center gap-2">
              <span class="p-1.5 bg-teal-100 text-teal-700 rounded-lg">💊</span>
              Alternativas Genéricas y Bioequivalentes
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">
              Principio Activo: <strong class="text-slate-800">{{ medSeleccionadoEquiv?.nombre_generico }} ({{ medSeleccionadoEquiv?.concentracion }})</strong>
            </p>
          </div>
          <button (click)="mostrarModalEquivalentes = false" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <div class="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
          <div *ngIf="equivalentesDisponibles.length === 0" class="p-8 text-center text-slate-400 text-xs">
            No se encontraron medicamentos bioequivalentes registrados con este principio activo.
          </div>

          <div *ngFor="let eq of equivalentesDisponibles" class="p-3 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 flex items-center justify-between transition-colors">
            <div>
              <h5 class="font-bold text-slate-900 text-sm">{{ eq.nombre_comercial }}</h5>
              <p class="text-xs text-slate-500">{{ eq.forma_farmaceutica }} ({{ eq.categoria_nombre }})</p>
              <div class="flex gap-2 mt-1">
                <span class="text-xs font-extrabold text-teal-700">Caja: Bs. {{ eq.precio_venta_caja }}</span>
                <span *ngIf="eq.es_fraccionable" class="text-xs font-semibold text-slate-600">Fracc: Bs. {{ eq.precio_venta_fraccion }}</span>
              </div>
            </div>

            <div class="text-right space-y-1.5">
              <span class="text-xs font-black px-2 py-0.5 rounded block"
                    [ngClass]="(eq.stock_total || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
                Stock: {{ eq.stock_total || 0 }} u.
              </span>
              <button 
                (click)="seleccionarMedicamento(eq); mostrarModalEquivalentes = false;"
                [disabled]="(eq.stock_total || 0) <= 0"
                class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm disabled:opacity-40"
              >
                + Agregar
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t">
          <button (click)="mostrarModalEquivalentes = false" class="px-4 py-2 bg-slate-100 font-bold text-slate-700 rounded-xl text-xs">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- MODAL DE COBRO EXITOSO CON IMPRESIÓN DE TICKET PDF -->
    <div *ngIf="ultimaVentaExitosa" class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
          ✓
        </div>

        <div>
          <span class="text-xs font-bold text-teal-600 uppercase tracking-wider">Transacción Completada</span>
          <h3 class="text-xl font-black text-slate-900 mt-1">¡Venta Exitosa!</h3>
          <p class="text-xs font-mono text-slate-500 mt-0.5">Comprobante #{{ ultimaVentaExitosa.numero_comprobante }}</p>
          <p class="text-2xl font-black text-emerald-700 mt-2">Bs. {{ ultimaVentaExitosa.total_venta.toFixed(2) }}</p>
        </div>

        <div class="flex flex-col gap-2 pt-2">
          <button 
            (click)="imprimirTicketPDF()"
            class="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs transition-all"
          >
            <span>🖨️ Imprimir Ticket Térmico (PDF)</span>
          </button>

          <button 
            (click)="cerrarModalExito()"
            class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all"
          >
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  `
})
export class PosComponent implements OnInit, OnDestroy {
  productos: Producto[] = [];
  categorias: any[] = [];
  sesionCaja: SesionCaja | null = null;
  
  busqueda = '';
  categoriaSeleccionada: number | null = null;
  loadingProductos = false;
  procesandoVenta = false;

  carrito: ItemCarrito[] = [];
  tipoComprobante: 'ticket' | 'factura' = 'ticket';
  metodoPago: 'efectivo' | 'qr' | 'tarjeta' = 'efectivo';
  
  mostrarModalReceta = false;
  recetaData = {
    nombre_medico: '',
    matricula_profesional: '',
    diagnostico: '',
    receta_retenida: true,
    fecha_emision: new Date().toISOString().split('T')[0]
  };

  mostrarModalEquivalentes = false;
  medSeleccionadoEquiv: Producto | null = null;
  equivalentesDisponibles: Producto[] = [];

  ultimaVentaExitosa: any = null;
  ultimoTicketData: TicketData | null = null;

  // Buffer de lectura para lector de código de barras
  private barcodeBuffer = '';
  private barcodeTimeout: any = null;

  constructor(
    private api: ApiService,
    private audio: AudioService,
    private exportService: ExportService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.cargarSesionCaja();
    this.cargarCategorias();
    this.buscarProductos();
  }

  ngOnDestroy() {
    if (this.barcodeTimeout) clearTimeout(this.barcodeTimeout);
  }

  // Listener global de teclado para pistola lectora de código de barras
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Si el foco está en un input normal, no interceptamos
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.key === 'Enter') {
      if (this.barcodeBuffer.length >= 3) {
        this.procesarCodigoEscaneado(this.barcodeBuffer.trim());
      }
      this.barcodeBuffer = '';
    } else if (event.key.length === 1) {
      this.barcodeBuffer += event.key;
      clearTimeout(this.barcodeTimeout);
      this.barcodeTimeout = setTimeout(() => {
        this.barcodeBuffer = '';
      }, 250);
    }
  }

  procesarCodigoEscaneado(codigo: string) {
    this.api.getProductos(codigo).subscribe(res => {
      if (res.data && res.data.length > 0) {
        const prod = res.data[0];
        this.seleccionarMedicamento(prod);
      } else {
        this.audio.playWarning();
      }
    });
  }

  cargarSesionCaja() {
    this.api.getSesionCajaActiva().subscribe(res => {
      this.sesionCaja = res.data;
    });
  }

  cargarCategorias() {
    this.api.getCategorias().subscribe(res => {
      this.categorias = res.data;
    });
  }

  buscarProductos() {
    this.loadingProductos = true;
    this.api.getProductos(this.busqueda, this.categoriaSeleccionada || undefined).subscribe({
      next: (res) => {
        this.productos = res.data;
        this.loadingProductos = false;
      },
      error: () => this.loadingProductos = false
    });
  }

  seleccionarMedicamento(p: Producto) {
    if (!p.stock_total || p.stock_total <= 0) {
      this.audio.playWarning();
      this.consultarBioequivalentes(p);
      return;
    }

    this.api.getProductoById(p.id_producto).subscribe(res => {
      const prodDetalle = res.data;
      if (!prodDetalle.lotes || prodDetalle.lotes.length === 0) {
        this.audio.playWarning();
        alert('No hay lotes activos disponibles para este medicamento');
        return;
      }

      // Lote con vencimiento más próximo (FEFO)
      const loteFEFO = prodDetalle.lotes[0];

      const itemExistente = this.carrito.find(c => c.lote.id_lote === loteFEFO.id_lote && c.tipo_unidad === 'caja');
      if (itemExistente) {
        itemExistente.cantidad++;
        this.recalcularItem(itemExistente);
      } else {
        const nuevoItem: ItemCarrito = {
          producto: prodDetalle,
          lote: loteFEFO,
          tipo_unidad: 'caja',
          cantidad: 1,
          precio_unitario: Number(prodDetalle.precio_venta_caja),
          descuento_linea: 0,
          subtotal: Number(prodDetalle.precio_venta_caja),
        };
        this.carrito.push(nuevoItem);
      }

      this.audio.playBeep();
    });
  }

  consultarBioequivalentes(p: Producto, event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.medSeleccionadoEquiv = p;
    this.api.getEquivalentes(p.id_producto).subscribe(res => {
      this.equivalentesDisponibles = res.data;
      this.mostrarModalEquivalentes = true;
    });
  }

  recalcularItem(item: ItemCarrito) {
    if (item.tipo_unidad === 'fraccion') {
      item.precio_unitario = Number(item.producto.precio_venta_fraccion || item.producto.precio_venta_caja);
    } else {
      item.precio_unitario = Number(item.producto.precio_venta_caja);
    }
    item.subtotal = (item.precio_unitario * item.cantidad) - (item.descuento_linea || 0);
  }

  quitarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }

  get totalCobrar(): number {
    return this.carrito.reduce((acc, item) => acc + item.subtotal, 0);
  }

  procesarVenta() {
    if (!this.sesionCaja) {
      alert('Debe tener una sesión de caja abierta');
      return;
    }

    const requiereReceta = this.carrito.some(item => item.producto.requiere_receta);
    if (requiereReceta) {
      this.audio.playWarning();
      this.mostrarModalReceta = true;
      return;
    }

    this.enviarVentaBackend();
  }

  confirmarVentaConReceta() {
    if (!this.recetaData.nombre_medico || !this.recetaData.matricula_profesional) {
      alert('Por favor complete los campos obligatorios del médico');
      return;
    }
    this.mostrarModalReceta = false;
    this.enviarVentaBackend(this.recetaData);
  }

  enviarVentaBackend(receta?: any) {
    this.procesandoVenta = true;

    const copiaCarrito = [...this.carrito];
    const totalActual = this.totalCobrar;

    const payload = {
      id_sesion_caja: this.sesionCaja!.id_sesion_caja,
      id_cliente: 3, // Cliente Mostrador
      tipo_comprobante: this.tipoComprobante,
      metodo_pago: this.metodoPago,
      descuento: 0,
      detalles: copiaCarrito.map(item => ({
        id_lote: item.lote.id_lote,
        tipo_unidad: item.tipo_unidad,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        descuento_linea: item.descuento_linea,
      })),
      receta: receta || undefined,
    };

    this.api.registrarVenta(payload).subscribe({
      next: (res) => {
        this.procesandoVenta = false;
        this.audio.playCashChime();

        // Preparar estructura para impresión de ticket PDF
        this.ultimoTicketData = {
          numero_comprobante: res.data.numero_comprobante,
          tipo_comprobante: this.tipoComprobante,
          fecha_venta: new Date().toISOString(),
          metodo_pago: this.metodoPago,
          empleado_nombre: this.auth.currentUser()?.nombre_completo || 'Farmacéutico',
          cliente_nombre: 'Cliente Mostrador',
          subtotal: totalActual,
          descuento: 0,
          total_venta: Number(res.data.total_venta),
          detalles: copiaCarrito.map(item => ({
            nombre_medicamento: item.producto.nombre_comercial,
            numero_lote: item.lote.numero_lote,
            tipo_unidad: item.tipo_unidad,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.subtotal,
          })),
          receta: receta || undefined,
        };

        this.ultimaVentaExitosa = {
          ...res.data,
          total_venta: Number(res.data.total_venta)
        };

        this.carrito = [];
        this.buscarProductos();
        this.cargarSesionCaja();
      },
      error: (err) => {
        this.procesandoVenta = false;
        this.audio.playWarning();
        alert('Error al registrar venta: ' + (err.error?.message || err.message));
      }
    });
  }

  imprimirTicketPDF() {
    if (this.ultimoTicketData) {
      this.exportService.generarTicketPDF(this.ultimoTicketData);
    }
  }

  cerrarModalExito() {
    this.ultimaVentaExitosa = null;
    this.ultimoTicketData = null;
  }
}
