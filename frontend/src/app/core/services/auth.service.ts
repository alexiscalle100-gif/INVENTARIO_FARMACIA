import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  currentUser = signal<Usuario | null>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('usuario');
    if (savedToken && savedUser) {
      this.token.set(savedToken);
      this.currentUser.set(JSON.parse(savedUser));
    }
  }

  login(usuario: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { usuario, password }).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          this.token.set(res.token);
          this.currentUser.set(res.usuario);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  getAuthHeaders(): { [header: string]: string } {
    const t = this.token();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }
}
