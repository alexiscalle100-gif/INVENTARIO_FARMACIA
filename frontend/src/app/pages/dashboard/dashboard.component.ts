import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      
      <!-- Top Welcome Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <div>
          <span class="px-3 py-1 bg-teal-500/20 text-teal-200 border border-teal-400/30 rounded-full text-xs font-semibold uppercase tracking-wider">
            Turno Operativo Activo
          </span>
          <h2 class="text-2xl font-bold mt-2">Bienvenido, {{ authService.currentUser()?.nombre_completo }}</h2>
          <p class="text-teal-100/80 text-sm mt-0.5">Rol: <span class="font-semibold uppercase">{{ authService.currentUser()?.cargo_rol }}</span> | Control de Lotes y Despacho FEFO</p>
        </div>
        <div class="mt-4 sm:mt-0 flex gap-3">
          <a routerLink="/pos" class="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-900 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Nueva Venta (POS)
          </a>
          <a routerLink="/inventario" class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all text-sm">
            Consultar Stock
          </a>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Ventas Hoy -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase">Ventas de Hoy</span>
            <span class="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </span>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-black text-slate-900">Bs. {{ metrics?.ventas_hoy?.total_hoy || '0.00' }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ metrics?.ventas_hoy?.cantidad_ventas_hoy || 0 }} transacciones registradas</p>
          </div>
        </div>

        <!-- Total Medicamentos -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-500 uppercase">Catálogo Activo</span>
            <span class="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </span>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-black text-slate-900">{{ metrics?.stock?.total_medicamentos || 0 }}</p>
            <p class="text-xs text-slate-500 mt-1">Fórmulas y presentaciones</p>
          </div>
        </div>

        <!-- Alerta Stock Bajo -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-700 uppercase">Stock Crítico / Bajo</span>
            <span class="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </span>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-black text-amber-600">{{ metrics?.stock?.medicamentos_stock_bajo || 0 }}</p>
            <p class="text-xs text-slate-500 mt-1">Por debajo del stock mínimo</p>
          </div>
        </div>

        <!-- Alerta Vencimiento (<60 días) -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-rose-700 uppercase">Lotes Próximos a Vencer</span>
            <span class="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </span>
          </div>
          <div class="mt-3">
            <p class="text-2xl font-black text-rose-600">{{ metrics?.total_lotes_alerta || 0 }}</p>
            <p class="text-xs text-slate-500 mt-1">En los próximos 60 días (FEFO)</p>
          </div>
        </div>

      </div>

      <!-- SECCIÓN DE GRÁFICOS ANALÍTICOS INTERACTIVOS -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Gráfico 1: Ventas últimos 7 días -->
        <div class="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-slate-900 text-lg">Evolución de Ventas (Últimos 7 Días)</h3>
                <p class="text-xs text-slate-500">Ingresos diarios registrados en el sistema</p>
              </div>
              <span class="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-xs font-bold">
                Semanal
              </span>
            </div>

            <!-- Gráfico de barras SVG / CSS -->
            <div class="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
              <div *ngFor="let dia of graficos?.ventas_7_dias" class="flex-1 flex flex-col items-center gap-2 group">
                
                <!-- Tooltip hover -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded shadow whitespace-nowrap mb-1">
                  Bs. {{ dia.total_dia }} ({{ dia.cantidad_ventas }} v.)
                </div>

                <!-- Barra -->
                <div class="w-full bg-slate-100 hover:bg-teal-500 transition-all rounded-t-xl relative flex items-end justify-center"
                     [style.height.%]="calcularAlturaBarra(dia.total_dia)">
                  <div class="w-full bg-teal-600 hover:bg-teal-500 rounded-t-xl transition-all"
                       [style.height.%]="100"></div>
                </div>

                <!-- Label día -->
                <span class="text-[11px] font-bold text-slate-600 mt-1">{{ dia.dia_mes }}</span>
                <span class="text-[9px] text-slate-400 uppercase font-semibold -mt-1">{{ dia.dia_semana }}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Pasa el cursor sobre cada barra para ver los detalles.</span>
            <span class="font-semibold text-slate-600">Total 7 días: Bs. {{ calcularTotalSemana() }}</span>
          </div>
        </div>

        <!-- Gráfico 2: Ventas por Categoría Farmacéutica -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 text-lg mb-1">Ventas por Categoría</h3>
            <p class="text-xs text-slate-500 mb-4">Líneas farmacéuticas con mayor movimiento</p>

            <div class="space-y-3.5">
              <div *ngFor="let cat of graficos?.ventas_por_categoria" class="space-y-1">
                <div class="flex justify-between text-xs font-bold">
                  <span class="text-slate-800 truncate max-w-[180px]">{{ cat.categoria }}</span>
                  <span class="text-teal-700">Bs. {{ cat.total_ventas }}</span>
                </div>
                <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                       [style.width.%]="calcularPorcentajeCategoria(cat.total_ventas)"></div>
                </div>
              </div>

              <div *ngIf="!graficos?.ventas_por_categoria?.length" class="text-center py-8 text-slate-400 text-xs">
                No hay ventas registradas aún para calcular categorías
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 text-xs text-slate-500 text-center font-medium">
            Proporción en base a subtotales facturados
          </div>
        </div>

      </div>

      <!-- Main Columns: Alertas de Vencimiento y Top Vendidos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Semáforo de Lotes Críticos -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-lg">Alertas de Vencimiento (Semáforo FEFO)</h3>
              <p class="text-xs text-slate-500">Lotes priorizados para despacho inmediato</p>
            </div>
            <a routerLink="/inventario" class="text-xs font-semibold text-teal-600 hover:text-teal-700">Ver todo &rarr;</a>
          </div>

          <div *ngIf="metrics?.lotes_criticos?.length === 0" class="p-8 text-center text-slate-400 text-sm">
            No hay lotes con alerta crítica de vencimiento
          </div>

          <div class="space-y-3">
            <div *ngFor="let lote of metrics?.lotes_criticos" class="p-3.5 rounded-xl border flex items-center justify-between transition-all"
                 [ngClass]="{
                   'bg-rose-50/70 border-rose-200': lote.semaforo_vencimiento === 'CRITICO_30_DIAS' || lote.semaforo_vencimiento === 'VENCIDO',
                   'bg-amber-50/70 border-amber-200': lote.semaforo_vencimiento === 'PROXIMO_60_DIAS'
                 }">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm">{{ lote.nombre_comercial }}</span>
                  <span class="text-xs font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600">
                    Lote: {{ lote.numero_lote }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">Vence: <strong class="text-slate-700">{{ lote.fecha_vencimiento | date:'dd/MM/yyyy' }}</strong> (Quedan {{ lote.dias_para_vencer }} días)</p>
              </div>

              <div class="text-right">
                <span class="text-xs font-black px-2.5 py-1 rounded-lg uppercase"
                      [ngClass]="{
                        'bg-rose-600 text-white': lote.semaforo_vencimiento === 'CRITICO_30_DIAS',
                        'bg-amber-500 text-white': lote.semaforo_vencimiento === 'PROXIMO_60_DIAS'
                      }">
                  {{ lote.stock_actual_unidades }} unid.
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Últimas Ventas Registradas -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-slate-900 text-lg">Últimas Ventas Registradas</h3>
              <p class="text-xs text-slate-500">Transacciones y métodos de pago</p>
            </div>
            <a routerLink="/pos" class="text-xs font-semibold text-teal-600 hover:text-teal-700">Ir al POS &rarr;</a>
          </div>

          <div *ngIf="metrics?.ultimas_ventas?.length === 0" class="p-8 text-center text-slate-400 text-sm">
            No se han registrado ventas recientemente
          </div>

          <div class="divide-y divide-slate-100">
            <div *ngFor="let v of metrics?.ultimas_ventas" class="py-3 flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 text-sm font-mono">{{ v.numero_comprobante }}</span>
                  <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {{ v.metodo_pago }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5">{{ v.fecha_venta | date:'short' }} • Atendido por {{ v.empleado_nombre }}</p>
              </div>
              <div class="text-right">
                <span class="text-base font-extrabold text-emerald-600">Bs. {{ v.total_venta }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Reservas de consultorios y médicos -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-bold text-slate-900 text-lg">Reservas de Medicamentos por Consultorio</h3>
            <p class="text-xs text-slate-500">Solicitudes pendientes y confirmadas enviadas desde los consultorios médicos</p>
          </div>
        </div>

        <div *ngIf="reservas.length === 0" class="p-8 text-center text-slate-400 text-sm">
          No hay reservas registradas aún.
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div *ngFor="let reserva of reservas" class="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
            <div class="flex items-center justify-between gap-3 mb-3">
              <div>
                <p class="text-sm font-bold text-slate-900">Reserva #{{ reserva.id_reserva }}</p>
                <p class="text-xs text-slate-500">{{ reserva.consultorio_nombre }}</p>
              </div>
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                    [ngClass]="{
                      'bg-amber-100 text-amber-700': reserva.estado === 'pendiente',
                      'bg-blue-100 text-blue-700': reserva.estado === 'confirmada',
                      'bg-emerald-100 text-emerald-700': reserva.estado === 'preparada',
                      'bg-violet-100 text-violet-700': reserva.estado === 'entregada',
                      'bg-rose-100 text-rose-700': reserva.estado === 'cancelada'
                    }">
                {{ reserva.estado }}
              </span>
            </div>

            <div class="space-y-1 text-sm text-slate-600">
              <p><span class="font-semibold text-slate-700">Médico:</span> {{ reserva.medico_nombre }}</p>
              <p><span class="font-semibold text-slate-700">Paciente:</span> {{ reserva.paciente_nombre }}</p>
              <p><span class="font-semibold text-slate-700">Retiro:</span> {{ reserva.fecha_hora_retiro ? (reserva.fecha_hora_retiro | date:'dd/MM/yyyy HH:mm') : 'Sin fecha' }}</p>
              <p *ngIf="reserva.observaciones"><span class="font-semibold text-slate-700">Obs.:</span> {{ reserva.observaciones }}</p>
            </div>

            <div *ngIf="puedeGestionarReservas() && reserva.estado !== 'entregada' && reserva.estado !== 'cancelada'" class="mt-4 pt-3 border-t border-slate-200">
              <button
                type="button"
                (click)="cambiarEstadoReserva(reserva.id_reserva, 'entregada')"
                class="w-full bg-emerald-600 text-white rounded-xl px-3 py-2 text-sm font-semibold hover:bg-emerald-700">
                Marcar como entregada
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Administración: crear médico y asignar médico al consultorio (solo admin) -->
      <div *ngIf="isAdmin" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 class="font-bold text-slate-900 text-lg mb-4">Agregar Médico</h3>
          <form (ngSubmit)="crearMedico()" class="space-y-3">
            <input [(ngModel)]="nuevoMedico.nombre_completo" name="nombre_completo" type="text" placeholder="Nombre completo" class="w-full rounded-xl border border-slate-200 px-3 py-2" required>
            <input [(ngModel)]="nuevoMedico.matricula_profesional" name="matricula_profesional" type="text" placeholder="Matrícula profesional" class="w-full rounded-xl border border-slate-200 px-3 py-2" required>
            <input [(ngModel)]="nuevoMedico.especialidad" name="especialidad" type="text" placeholder="Especialidad" class="w-full rounded-xl border border-slate-200 px-3 py-2">
            <button type="submit" class="w-full bg-teal-600 text-white font-bold rounded-xl px-4 py-2.5 hover:bg-teal-700">Guardar médico</button>
          </form>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 class="font-bold text-slate-900 text-lg mb-4">Asignar médico a consultorio</h3>
          <form (ngSubmit)="asignarMedicoConsultorio()" class="space-y-3">
            <select [(ngModel)]="asignacion.id_consultorio" name="id_consultorio" class="w-full rounded-xl border border-slate-200 px-3 py-2" required>
              <option [ngValue]="null" disabled>Seleccione consultorio</option>
              <option *ngFor="let consultorio of consultorios" [ngValue]="consultorio.id_consultorio">{{ consultorio.nombre }}</option>
            </select>
            <select [(ngModel)]="asignacion.id_medico" name="id_medico" class="w-full rounded-xl border border-slate-200 px-3 py-2" required>
              <option [ngValue]="null" disabled>Seleccione médico</option>
              <option *ngFor="let medico of medicos" [ngValue]="medico.id_medico">{{ medico.nombre_completo }} - {{ medico.matricula_profesional }}</option>
            </select>
            <button type="submit" class="w-full bg-slate-900 text-white font-bold rounded-xl px-4 py-2.5 hover:bg-slate-800">Asignar médico</button>
          </form>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  metrics: any = null;
  graficos: any = null;
  reservas: any[] = [];
  consultorios: any[] = [];
  medicos: any[] = [];
  nuevoMedico = {
    nombre_completo: '',
    matricula_profesional: '',
    especialidad: '',
  };
  asignacion = {
    id_consultorio: null as number | null,
    id_medico: null as number | null,
  };

  constructor(private api: ApiService, public authService: AuthService) {}

  get isAdmin(): boolean {
    return this.authService.currentUser()?.cargo_rol === 'admin';
  }

  puedeGestionarReservas(): boolean {
    const rol = this.authService.currentUser()?.cargo_rol;
    return rol === 'admin' || rol === 'farmaceutico';
  }

  ngOnInit() {
    this.cargarDashboard();
    this.cargarGraficos();
    this.cargarReservas();
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.api.getConsultorios().subscribe({
      next: (res) => {
        if (res.success) {
          this.consultorios = res.data || [];
        }
      },
      error: (err) => console.error('Error cargando consultorios:', err)
    });

    this.api.getMedicos().subscribe({
      next: (res) => {
        if (res.success) {
          this.medicos = res.data || [];
        }
      },
      error: (err) => console.error('Error cargando médicos:', err)
    });
  }

  cargarReservas() {
    this.api.getReservas().subscribe({
      next: (res) => {
        if (res.success) {
          this.reservas = res.data || [];
        }
      },
      error: (err) => console.error('Error cargando reservas:', err)
    });
  }

  crearMedico() {
    if (!this.isAdmin) return;
    if (!this.nuevoMedico.nombre_completo || !this.nuevoMedico.matricula_profesional) {
      return;
    }

    this.api.createMedico(this.nuevoMedico).subscribe({
      next: () => {
        this.nuevoMedico = { nombre_completo: '', matricula_profesional: '', especialidad: '' };
        this.cargarCatalogos();
      },
      error: (err) => console.error('Error creando médico:', err)
    });
  }

  asignarMedicoConsultorio() {
    if (!this.isAdmin) return;
    if (!this.asignacion.id_consultorio || !this.asignacion.id_medico) {
      return;
    }

    this.api.assignMedicoToConsultorio(Number(this.asignacion.id_consultorio), Number(this.asignacion.id_medico)).subscribe({
      next: () => {
        this.asignacion = { id_consultorio: null, id_medico: null };
      },
      error: (err) => console.error('Error asignando médico al consultorio:', err)
    });
  }

  cambiarEstadoReserva(id_reserva: number, estado: string) {
    if (!this.puedeGestionarReservas()) return;

    this.api.updateReservaEstado(id_reserva, estado, 'Cambio de estado desde dashboard principal').subscribe({
      next: () => {
        this.cargarReservas();
      },
      error: (err) => console.error('Error actualizando estado de reserva:', err)
    });
  }

  cargarDashboard() {
    this.api.getDashboardMetrics().subscribe({
      next: (res) => {
        if (res.success) {
          this.metrics = res.data;
        }
      },
      error: (err) => console.error('Error cargando métricas:', err)
    });
  }

  cargarGraficos() {
    this.api.getGraficosStats().subscribe({
      next: (res) => {
        if (res.success) {
          this.graficos = res.data;
        }
      },
      error: (err) => console.error('Error cargando gráficos:', err)
    });
  }

  calcularAlturaBarra(totalDia: number): number {
    if (!this.graficos?.ventas_7_dias) return 10;
    const max = Math.max(...this.graficos.ventas_7_dias.map((d: any) => Number(d.total_dia)), 100);
    return Math.max(15, Math.min(100, (Number(totalDia) / max) * 100));
  }

  calcularTotalSemana(): string {
    if (!this.graficos?.ventas_7_dias) return '0.00';
    const sum = this.graficos.ventas_7_dias.reduce((acc: number, d: any) => acc + Number(d.total_dia), 0);
    return sum.toFixed(2);
  }

  calcularPorcentajeCategoria(totalVenta: number): number {
    if (!this.graficos?.ventas_por_categoria || this.graficos.ventas_por_categoria.length === 0) return 0;
    const max = Math.max(...this.graficos.ventas_por_categoria.map((c: any) => Number(c.total_ventas)), 1);
    return Math.max(8, (Number(totalVenta) / max) * 100);
  }
}
