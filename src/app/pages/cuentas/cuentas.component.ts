import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../guards/auth.service';
import {
  PlataformasService,
  Plataforma,
} from '../../services/plataformas.service';
import { FormsModule } from '@angular/forms';
import { HostListener, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuentas.component.html',
})
export class CuentasComponent implements OnInit {
  @ViewChild('menuOpciones') menuOpcionesRef!: ElementRef;
  mostrarOpciones = false;
  plataformas: Plataforma[] = [];
  seleccionada: string = 'todas';
  mostrarModal = false;

  plataforma = {
    nombre: '',
    color: '#000000', // valor por defecto
  };

  colores = [
    { nombre: 'Netflix (Rojo)', hex: '#E50914' },
    { nombre: 'Max (Negro)', hex: '#1D1D1F' },
    { nombre: 'Disney+ (Azul)', hex: '#113CCF' },
    { nombre: 'Prime Video (Celeste)', hex: '#00A8E1' },
    { nombre: 'Star+ (Gris Oscuro)', hex: '#2E2E2E' },
    { nombre: 'Paramount+ (Azul Rey)', hex: '#0056A0' },
    { nombre: 'Apple TV (Negro puro)', hex: '#000000' },
    { nombre: 'Hulu (Verde Limón)', hex: '#1CE783' },
    { nombre: 'Crunchyroll (Naranja)', hex: '#F47521' },
    { nombre: 'HBO GO (Violeta)', hex: '#6E00FF' },
    { nombre: 'Pluto TV (Morado)', hex: '#8624DB' },
    { nombre: 'Claro Video (Rojo Claro)', hex: '#EE1C25' },
  ];
  error: string = '';

  constructor(
    private plataformasService: PlataformasService,
    private http: HttpClient,
    private auth: AuthService,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onClickFuera(event: MouseEvent) {
    if (
      this.mostrarOpciones &&
      this.menuOpcionesRef &&
      !this.menuOpcionesRef.nativeElement.contains(event.target)
    ) {
      this.mostrarOpciones = false;
    }
  }
  @HostListener('window:scroll')
  onScroll() {
    this.mostrarOpciones = false;
  }

  ngOnInit(): void {
    this.cargarPlataformas();
  }

  cargarPlataformas() {
    this.plataformasService.getPlataformas().subscribe({
      next: (data) => {
        this.plataformas = data;
      },
      error: () => {
        console.error('❌ Error al cargar plataformas');
      },
    });
  }

  seleccionar(nombre: string, btnRef?: HTMLElement) {
    this.seleccionada = nombre;

    if (btnRef) {
      setTimeout(() => {
        btnRef.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }, 50); // pequeño delay para asegurar render
    }
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.plataforma = { nombre: '', color: '#000000' };
  }

  crearPlataforma() {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const datos = {
      nombre: this.plataforma.nombre.trim().toLowerCase(), // 👈 convierte a minúscula
      color: this.plataforma.color,
    };

    this.http
      .post(`${environment.apiUrl}/plataformas`, datos, { headers })
      .subscribe({
        next: () => {
          this.cerrarModal();
          this.cargarPlataformas(); // recargar la lista
        },
        error: () => {
          alert('Error al crear plataforma');
        },
      });
  }

  eliminarSeleccionada() {
    this.mostrarOpciones = false;
    if (!this.seleccionada || this.seleccionada === 'todas') return;

    const confirmar = confirm(
      `¿Eliminar la plataforma "${this.seleccionada}"?`
    );
    if (!confirmar) return;

    const plataforma = this.plataformas.find(
      (p) => p.nombre === this.seleccionada
    );
    if (!plataforma) return;

    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .delete(`${environment.apiUrl}/plataformas/${plataforma.id}`, { headers })
      .subscribe({
        next: () => {
          this.cargarPlataformas();
          this.seleccionada = 'todas';
        },
        error: (error) => {
          this.error = error?.error?.message || 'Error al eliminar plataforma';
          setTimeout(() => (this.error = ''), 4000);
        },
      });
  }
}
