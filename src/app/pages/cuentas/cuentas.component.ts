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
import { CuentasService } from '../../services/cuentas.service';
import { Router } from '@angular/router';

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
  editandoId: number | null = null;
  busquedaGlobal: string = '';
  cuentasMostradas: any[] = [];

  plataforma = {
    nombre: '',
    color: '#000000', // valor por defecto
  };

  cuentas: any[] = [];

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
    private cuentasService: CuentasService,
    private http: HttpClient,
    private auth: AuthService,
    private elementRef: ElementRef,
    private router: Router
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
    this.cargarCuentas();

    // Fecha actual para fecha_compra
    const hoy = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    this.nuevaCuenta.fecha_compra = hoy;
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
    this.busquedaGlobal = ''; // Limpiar búsqueda si cambias de plataforma
    this.actualizarCuentasMostradas();

    if (btnRef) {
      setTimeout(() => {
        btnRef.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }, 50);
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

  actualizarCuentasMostradas() {
    const termino = this.busquedaGlobal.trim().toLowerCase();

    if (termino) {
      this.cuentasMostradas = this.cuentas.filter((c) =>
        c.correo.toLowerCase().includes(termino)
      );
      this.seleccionada = 'todas';
    } else {
      if (this.seleccionada === 'todas') {
        this.cuentasMostradas = this.cuentas;
      } else {
        this.cuentasMostradas = this.cuentas.filter(
          (c) => c.plataforma?.nombre === this.seleccionada
        );
      }
    }
    // ✅ Aplicar el orden personalizado
    this.cuentasMostradas = this.cuentasMostradas.sort((a, b) => {
      const aLleno = a.perfiles_usados >= a.numero_perfiles;
      const bLleno = b.perfiles_usados >= b.numero_perfiles;

      if (aLleno && bLleno) return 0;
      if (aLleno) return 1;
      if (bLleno) return -1;

      return b.perfiles_usados - a.perfiles_usados;
    });
  }

  buscarPorCorreo() {
    const termino = this.busquedaGlobal.trim().toLowerCase();

    if (!termino) {
      this.seleccionada = 'todas';
      return;
    }

    const cuenta = this.cuentas.find((c) =>
      c.correo.toLowerCase().includes(termino)
    );

    if (cuenta && cuenta.plataforma?.nombre) {
      this.seleccionada = cuenta.plataforma.nombre;
    } else {
      this.seleccionada = 'todas'; // por si no encuentra nada
    }
  }

  cargarCuentas() {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get(`${environment.apiUrl}/cuentas/negocio`, { headers })
      .subscribe({
        next: (data: any) => {
          this.cuentas = data;
          this.actualizarCuentasMostradas();
        },
        error: () => {
          console.error('❌ Error al cargar cuentas');
        },
      });
  }

  cuentasPlataform() {
    if (this.seleccionada === 'todas') return this.cuentas;
    return this.cuentas.filter(
      (c) => c.plataforma?.nombre === this.seleccionada
    );
  }

  diasRestantes(fechaCorte: string): number {
    const hoy = new Date();
    const corte = new Date(fechaCorte);
    const diff = corte.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  editarCuenta(cuenta: any) {
    // Aquí puedes abrir un modal de edición o redirigir a otra vista
    console.log('Editar cuenta:', cuenta);
  }

  eliminarCuenta(id: number) {
    const confirmar = confirm('¿Estás seguro de eliminar esta cuenta?');
    if (!confirmar) return;

    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .delete(`${environment.apiUrl}/cuentas/${id}`, { headers })
      .subscribe({
        next: () => {
          this.cargarCuentas(); // si tienes método para recargar
        },
        error: (err) => {
          alert(err?.error?.message || 'Error al eliminar cuenta');
        },
      });
  }

  iniciarEdicion(cuentaId: number) {
    this.editandoId = cuentaId;
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.cargarCuentas(); // recargar por si hubo cambios
  }

  guardarCambios(cuenta: any) {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const dataActualizada = {
      clave: cuenta.clave,
      costo_total: cuenta.costo_total,
      fecha_compra: cuenta.fecha_compra,
      tiempo_asignado: cuenta.tiempo_asignado,
      numero_perfiles: cuenta.numero_perfiles,
    };

    this.http
      .patch(`${environment.apiUrl}/cuentas/${cuenta.id}`, dataActualizada, {
        headers,
      })
      .subscribe({
        next: () => {
          this.editandoId = null;
          this.cargarCuentas();
        },
        error: () => {
          alert('Error al guardar cambios');
        },
      });
  }

  get isAdmin(): boolean {
    return this.auth.getRole()?.toLowerCase() === 'admin';
  }

  mostrarModalCuenta = false;

  nuevaCuenta: any = {
    correo: '',
    clave: '',
    proveedor: '',
    costo_total: null,
    numero_perfiles: null,
    fecha_compra: '',
    tiempo_asignado: '',
    plataformaId: null,
  };

  abrirModalCuenta() {
    this.mostrarModalCuenta = true;
    this.nuevaCuenta = {
      correo: '',
      clave: '',
      proveedor: '',
      costo_total: null,
      numero_perfiles: null,
      fecha_compra: '',
      tiempo_asignado: '',
      plataformaId: null,
    };
  }

  cerrarModalCuenta() {
    this.mostrarModalCuenta = false;
  }

  crearCuenta() {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .post(`${environment.apiUrl}/cuentas`, this.nuevaCuenta, { headers })
      .subscribe({
        next: () => {
          this.cerrarModalCuenta();
          this.cargarCuentas();
        },
        error: (err) => {
          alert(err?.error?.message || 'Error al crear cuenta');
        },
      });
  }

  verPerfiles(cuentaId: number, event: Event) {
    const target = event.target as HTMLElement;

    // Si se hizo click en un input, botón o algo editable, no navegar
    if (
      ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'LABEL'].includes(
        target.tagName
      ) ||
      target.closest('button') ||
      target.closest('input')
    ) {
      return;
    }

    this.router.navigate(['/perfiles', cuentaId]);
  }
}
