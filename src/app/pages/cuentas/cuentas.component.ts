import { Component, OnDestroy, OnInit } from '@angular/core';
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
import {
  CuentasService,
  Cuenta,
  RenovarPayload,
} from '../../services/cuentas.service';
import { Router } from '@angular/router';
import dayjs from 'dayjs';

@Component({
  selector: 'app-cuentas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuentas.component.html',
})
export class CuentasComponent implements OnInit, OnDestroy {
  @ViewChild('menuOpciones') menuOpcionesRef!: ElementRef;
  mostrarOpciones = false;
  plataformas: Plataforma[] = [];

  mostrarModalRenovar = false;
  cuentaRenovar: any = {};

  mostrarModal = false;
  editandoId: number | null = null;
  seleccionada: string = 'todas';
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
  }

  ngOnDestroy() {
    window.removeEventListener('click', this.cerrarDropdown.bind(this));
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
      } else if (this.seleccionada === 'inhabilitadas') {
        this.cuentasMostradas = this.cuentas.filter((c) => c.inhabilitada);
      } else {
        this.cuentasMostradas = this.cuentas.filter(
          (c) => c.plataforma?.nombre === this.seleccionada
        );
      }
    }

    // ✅ Aplicar el orden personalizado
    this.cuentasMostradas = this.cuentasMostradas.sort((a, b) => {
      // Si una está inhabilitada y la otra no, la inhabilitada va al final
      if (a.inhabilitada && !b.inhabilitada) return 1;
      if (!a.inhabilitada && b.inhabilitada) return -1;

      // Ambos inhabilitados o ambos activos, ordenar por llenos
      const aLleno = a.perfiles_usados >= a.numero_perfiles;
      const bLleno = b.perfiles_usados >= b.numero_perfiles;

      if (aLleno && !bLleno) return 1;
      if (!aLleno && bLleno) return -1;

      // Ambos llenos o ambos no llenos, ordenar por más usados primero
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
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');

    this.nuevaCuenta = {
      correo: '',
      clave: '',
      costo_total: null,
      proveedor: '',
      numero_perfiles: null,
      fecha_compra: `${yyyy}-${mm}-${dd}`,
      tiempo_asignado: '',
      plataformaId: null,
    };

    // ✅ importante: setear preset por defecto
    this.inicializarTiempoAsignado();

    this.mostrarModalCuenta = true;
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

  //para el dropdown de opciones menu desplegable
  dropdownAbierto: number | null = null;
  dropdownPosX = 0;
  dropdownPosY = 0;
  cuentaSeleccionada: any = null;

  toggleDropdown(event: MouseEvent, cuentaId: number) {
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const menuWidth = 180;
    const viewportWidth = window.innerWidth;

    const abreALaIzquierda = rect.left + menuWidth > viewportWidth;
    const nuevaPosX = abreALaIzquierda ? rect.right - menuWidth : rect.left;
    const nuevaPosY = rect.bottom + 8;

    if (this.dropdownAbierto === cuentaId) {
      this.dropdownAbierto = null;
    } else {
      this.dropdownAbierto = cuentaId;
      this.dropdownPosX = nuevaPosX;
      this.dropdownPosY = nuevaPosY;

      this.cuentaSeleccionada = this.cuentasMostradas.find(
        (c) => c.id === cuentaId
      );
    }
  }

  //para cerrar el dropdown al hacer click fuera
  @HostListener('document:click')
  cerrarDropdown() {
    this.dropdownAbierto = null;
  }

  inhabilitarCuenta(id: number) {
    const confirmar = confirm('¿Deseas marcar esta cuenta como inhabilitada?');
    if (!confirmar) return;

    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .patch(
        `${environment.apiUrl}/cuentas/${id}`,
        { inhabilitada: true },
        { headers }
      )
      .subscribe({
        next: () => {
          this.cargarCuentas(); // refrescar la tabla
          this.cerrarDropdown(); // cerrar menú
        },
        error: (err) => {
          alert(err?.error?.message || 'Error al inhabilitar la cuenta');
        },
      });
  }

  habilitarCuenta(id: number) {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .patch(
        `${environment.apiUrl}/cuentas/${id}`,
        { inhabilitada: false },
        { headers }
      )
      .subscribe({
        next: () => this.cargarCuentas(),
        error: (err) => {
          alert(err?.error?.message || 'Error al habilitar la cuenta');
        },
      });
  }

  mostrarModalReemplazo = false;
  tipoReemplazo: 'PROVEEDOR' | 'COMPRA_NUEVA' | 'COMPRA_EXISTENTE' | '' = '';
  cuentaReemplazo: any = {};
  cuentasDisponibles: any[] = [];
  cuentaOriginalSeleccionada: any = null;

  obtenerCuentasDisponibles(plataformaId: number) {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http
      .get<any[]>(
        `${environment.apiUrl}/cuentas/disponibles/reemplazo/${plataformaId}`,
        { headers }
      )
      .subscribe({
        next: (data) => {
          // 🔥 Filtrar para NO incluir la cuenta que se está reemplazando
          this.cuentasDisponibles = data.filter(
            (cuenta) => cuenta.id !== this.cuentaOriginalSeleccionada?.id
          );
        },
        error: (err) => {
          alert(err?.error?.message || 'Error al cargar cuentas disponibles');
        },
      });
  }

  calcularDiasRestantes(fechaCorte: string): number {
    const hoy = dayjs();
    const corte = dayjs(fechaCorte);
    return corte.diff(hoy, 'day');
  }

  onTipoReemplazoChange() {
    // COMPRA_EXISTENTE: obtener cuentas disponibles por plataforma
    if (this.tipoReemplazo === 'COMPRA_EXISTENTE') {
      const plataformaId = this.cuentaOriginalSeleccionada?.plataformaId;
      if (plataformaId) {
        this.obtenerCuentasDisponibles(plataformaId);
      }
    }

    // COMPRA_NUEVA: precargar fecha actual
    if (this.tipoReemplazo === 'COMPRA_NUEVA') {
      const hoy = new Date().toISOString().split('T')[0];
      this.cuentaReemplazo.fecha_compra = hoy;
    }
  }
  abrirModalReemplazo(cuenta: any) {
    this.mostrarModalReemplazo = true;
    this.tipoReemplazo = '';
    this.cuentaOriginalSeleccionada = cuenta;
    this.cuentaReemplazo = {
      id: cuenta.id,
      fecha_compra: dayjs().format('YYYY-MM-DD'), // ← Aquí se asigna la fecha actual
    };
    this.cuentasDisponibles = [];
    this.cerrarDropdown();
  }

  cerrarModalReemplazo() {
    this.mostrarModalReemplazo = false;
    this.tipoReemplazo = '';
    this.cuentaOriginalSeleccionada = null;
    this.cuentaReemplazo = {};
  }

  guardarReemplazo() {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Construir el payload en función del tipo de reemplazo
    const payload: any = {
      tipo: this.tipoReemplazo,
    };

    // Tipo: PROVEEDOR
    if (this.tipoReemplazo === 'PROVEEDOR') {
      payload.nuevoCorreo = this.cuentaReemplazo.nuevoCorreo;
      payload.nuevaClave = this.cuentaReemplazo.nuevaClave;
    }

    // Tipo: COMPRA_NUEVA
    if (this.tipoReemplazo === 'COMPRA_NUEVA') {
      payload.nuevoCorreo = this.cuentaReemplazo.nuevoCorreo;
      payload.nuevaClave = this.cuentaReemplazo.nuevaClave;
      payload.proveedor = this.cuentaReemplazo.proveedor;
      payload.fecha_compra = this.cuentaReemplazo.fecha_compra;
      payload.tiempo_establecido = this.cuentaReemplazo.tiempo_establecido;
      payload.costo = this.cuentaReemplazo.costo;
    }

    // Tipo: COMPRA_EXISTENTE
    if (this.tipoReemplazo === 'COMPRA_EXISTENTE') {
      payload.cuentaExistenteId = this.cuentaReemplazo.cuentaExistenteId;
    }

    this.http
      .patch(
        `${environment.apiUrl}/cuentas/reemplazar/${this.cuentaReemplazo.id}`,
        payload,
        { headers }
      )
      .subscribe({
        next: () => {
          this.cargarCuentas(); // 🔄 Recarga las cuentas
          this.cerrarModalReemplazo(); // ✅ Cierra la modal
        },
        error: (err) => {
          alert(err?.error?.message || 'Error al guardar cambios');
        },
      });
  }

  hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  abrirModalRenovar(cuenta: Cuenta) {
    this.cuentaRenovar = {
      id: cuenta.id,
      fecha_compra:
        (cuenta.fecha_compra || '').toString().slice(0, 10) || this.hoyISO(),
      costo_total: cuenta.costo_total, // puede venir string; lo casteamos al enviar
      tiempo_asignado: cuenta.tiempo_asignado,
    };
    this.mostrarModalRenovar = true; // opcional si existe
  }

  cerrarModalRenovar() {
    this.mostrarModalRenovar = false;
  }

  guardarRenovacion() {
    const payload: RenovarPayload = {
      fecha_compra: this.cuentaRenovar.fecha_compra,
      tiempo_asignado: this.cuentaRenovar.tiempo_asignado,
      costo_total: Number(this.cuentaRenovar.costo_total), // backend espera number
    };

    if (
      !payload.fecha_compra ||
      !payload.tiempo_asignado ||
      isNaN(Number(payload.costo_total))
    ) {
      alert('Completa fecha_compra, tiempo_asignado y costo_total numérico.');
      return;
    }

    this.cuentasService
      .renovarCuenta(this.cuentaRenovar.id, payload)
      .subscribe({
        next: () => {
          this.cargarCuentas?.();
          this.cerrarModalRenovar();
        },
        error: (err) => {
          alert(err?.error?.message || 'Error al renovar la cuenta');
        },
      });
  }

  tiempoPreset: '1m' | '3m' | '6m' | null = '1m';
  customDias: number | null = null;

  inicializarTiempoAsignado() {
    this.tiempoPreset = '1m';
    this.customDias = null;
    this.nuevaCuenta.tiempo_asignado = '1 mes';
  }

  setPreset(preset: '1m' | '3m' | '6m') {
    this.tiempoPreset = preset;
    this.customDias = null; // limpia input

    switch (preset) {
      case '1m':
        this.nuevaCuenta.tiempo_asignado = '1 mes';
        break;
      case '3m':
        this.nuevaCuenta.tiempo_asignado = '3 meses';
        break;
      case '6m':
        this.nuevaCuenta.tiempo_asignado = '6 meses';
        break;
    }
  }

  onCustomDiasChange() {
    const n = Number(this.customDias);
    if (n > 0) {
      this.tiempoPreset = null; // desactiva botones
      this.nuevaCuenta.tiempo_asignado = `${n} dias`;
    } else if (this.tiempoPreset) {
      // si no hay días pero hay preset, mantenlo
      this.setPreset(this.tiempoPreset);
    } else {
      this.nuevaCuenta.tiempo_asignado = '';
    }
  }
}
