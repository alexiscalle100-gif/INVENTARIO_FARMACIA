import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Producto, Categoria, Ubicacion, Lote, SesionCaja, Proveedor, VentaResumen } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers() {
    return { headers: this.authService.getAuthHeaders() };
  }

  // Dashboard
  getDashboardMetrics(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/metrics`, this.headers);
  }

  getGraficosStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/graficos`, this.headers);
  }

  // Productos & Catálogos
  getProductos(busqueda?: string, categoria_id?: number): Observable<{ success: boolean; data: Producto[] }> {
    let url = `${this.baseUrl}/productos?`;
    if (busqueda) url += `busqueda=${encodeURIComponent(busqueda)}&`;
    if (categoria_id) url += `categoria_id=${categoria_id}&`;
    return this.http.get<{ success: boolean; data: Producto[] }>(url, this.headers);
  }

  getProductoById(id: number): Observable<{ success: boolean; data: Producto }> {
    return this.http.get<{ success: boolean; data: Producto }>(`${this.baseUrl}/productos/${id}`, this.headers);
  }

  getEquivalentes(id: number): Observable<{ success: boolean; original: any; data: Producto[] }> {
    return this.http.get<{ success: boolean; original: any; data: Producto[] }>(`${this.baseUrl}/productos/${id}/equivalentes`, this.headers);
  }

  createProducto(producto: Partial<Producto>): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/productos`, producto, this.headers);
  }

  getCategorias(): Observable<{ success: boolean; data: Categoria[] }> {
    return this.http.get<{ success: boolean; data: Categoria[] }>(`${this.baseUrl}/productos/categorias`, this.headers);
  }

  getUbicaciones(): Observable<{ success: boolean; data: Ubicacion[] }> {
    return this.http.get<{ success: boolean; data: Ubicacion[] }>(`${this.baseUrl}/productos/ubicaciones`, this.headers);
  }

  // Lotes & Semáforo FEFO
  getLotes(id_producto?: number): Observable<{ success: boolean; data: Lote[] }> {
    const url = id_producto ? `${this.baseUrl}/lotes?id_producto=${id_producto}` : `${this.baseUrl}/lotes`;
    return this.http.get<{ success: boolean; data: Lote[] }>(url, this.headers);
  }

  getAlertasVencimiento(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/lotes/alertas`, this.headers);
  }

  getKardex(id_lote?: number): Observable<{ success: boolean; data: any[] }> {
    const url = id_lote ? `${this.baseUrl}/lotes/kardex?id_lote=${id_lote}` : `${this.baseUrl}/lotes/kardex`;
    return this.http.get<{ success: boolean; data: any[] }>(url, this.headers);
  }

  registrarMerma(payload: { id_lote: number; cantidad: number; motivo: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/lotes/merma`, payload, this.headers);
  }

  // Ventas (POS)
  registrarVenta(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ventas`, payload, this.headers);
  }

  getVentas(): Observable<{ success: boolean; data: VentaResumen[] }> {
    return this.http.get<{ success: boolean; data: VentaResumen[] }>(`${this.baseUrl}/ventas`, this.headers);
  }

  // Cajas & Arqueo
  getSesionCajaActiva(): Observable<{ success: boolean; data: SesionCaja | null }> {
    return this.http.get<{ success: boolean; data: SesionCaja | null }>(`${this.baseUrl}/cajas/activa`, this.headers);
  }

  abrirCaja(monto_inicial_fondo: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cajas/abrir`, { monto_inicial_fondo }, this.headers);
  }

  cerrarCaja(id_sesion_caja: number, monto_cierre_real: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cajas/cerrar`, { id_sesion_caja, monto_cierre_real }, this.headers);
  }

  // Compras & Proveedores
  getProveedores(): Observable<{ success: boolean; data: Proveedor[] }> {
    return this.http.get<{ success: boolean; data: Proveedor[] }>(`${this.baseUrl}/compras/proveedores`, this.headers);
  }

  registrarCompra(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/compras`, payload, this.headers);
  }

  // Recetas
  getRecetas(busqueda?: string): Observable<{ success: boolean; data: any[] }> {
    const url = busqueda ? `${this.baseUrl}/recetas?busqueda=${encodeURIComponent(busqueda)}` : `${this.baseUrl}/recetas`;
    return this.http.get<{ success: boolean; data: any[] }>(url, this.headers);
  }

  // Reservas de medicamentos por consultorio
  getReservas(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}/reservas`, this.headers);
  }

  createConsultorio(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reservas/consultorios`, payload, this.headers);
  }

  createMedico(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reservas/medicos`, payload, this.headers);
  }
}
