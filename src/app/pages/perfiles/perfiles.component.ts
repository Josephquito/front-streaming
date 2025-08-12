// src/app/pages/perfiles/perfiles.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuentasService } from '../../services/cuentas.service';
import { PerfilService } from '../../services/perfiles.service';
import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../guards/auth.service';
import dayjs from 'dayjs';

type Slot = { pos: number; perfil?: any | null };

const SLOT_KEY = (cuentaId: number) => `slotMap_cuenta_${cuentaId}`;

@Component({
  selector: 'app-perfiles',
  standalone: true,
  templateUrl: './perfiles.component.html',
  imports: [CommonModule, FormsModule],
})
export class PerfilesComponent implements OnInit {
  cuentaId: number = 0;
  cuentaSeleccionada: any = {};
  perfiles: any[] = [];
  clientes: any[] = [];

  // ✅ NUEVO: slots fijos
  slots: Slot[] = [];
  // Mapa perfilId -> pos (1..N) persistido en localStorage
  private slotMap: Record<number, number> = {};
  // Para vender en un slot específico
  slotSeleccionado: number | null = null;

  mostrarFormulario: boolean = false;
  mostrarModalVender = false;

  nuevoPerfil = {
    clienteId: 0,
    fecha_venta: '',
    tiempo_asignado: '',
    precio: undefined as number | undefined,
  };

  constructor(
    private route: ActivatedRoute,
    private cuentaService: CuentasService,
    private perfilService: PerfilService,
    private auth: AuthService,
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cuentaId = Number(this.route.snapshot.paramMap.get('cuentaId'));

    // cargar slotMap persistido (si existe)
    try {
      const raw = localStorage.getItem(SLOT_KEY(this.cuentaId));
      this.slotMap = raw ? JSON.parse(raw) : {};
    } catch {
      this.slotMap = {};
    }

    this.cargarCuenta();
    this.cargarPerfiles();
    this.cargarClientes();
  }

  get isAdmin(): boolean {
    return this.auth.getRole()?.toLowerCase() === 'admin';
  }

  volverAtras() {
    this.router.navigate(['/cuentas']);
  }

  // -----------------------
  // CARGAS Y CONSTRUCCIÓN DE SLOTS
  // -----------------------
  cargarCuenta() {
    this.cuentaService.getCuenta(this.cuentaId).subscribe({
      next: (cuenta) => {
        this.cuentaSeleccionada = cuenta;
        this.buildSlots(); // intenta construir slots (si ya hay perfiles)
      },
      error: (err) => console.error('Error al cargar cuenta', err),
    });
  }

  cargarPerfiles() {
    this.perfilService.getPerfilesByCuenta(this.cuentaId).subscribe({
      next: (perfilesExistentes) => {
        // Sólo activos visibles como “ocupados”
        this.perfiles = perfilesExistentes.filter((p) => p.activo !== false);

        // Limpia del slotMap ids que ya no existen (vaciados/eliminados)
        const idsActuales = new Set(this.perfiles.map((p) => p.id));
        for (const id of Object.keys(this.slotMap).map(Number)) {
          if (!idsActuales.has(id)) delete this.slotMap[id];
        }
        this.persistirSlotMap();

        this.buildSlots(); // intenta construir slots (si ya hay cuenta)
      },
      error: (err) => console.error('Error al cargar perfiles', err),
    });
  }

  private buildSlots() {
    const N = Number(this.cuentaSeleccionada?.numero_perfiles || 0);
    if (!N) {
      this.slots = [];
      return;
    }

    // 1) crea N slots vacíos
    const nuevos: Slot[] = Array.from({ length: N }, (_, i) => ({
      pos: i + 1,
      perfil: null,
    }));

    // 2) orden determinista de perfiles (por id, puedes usar otra lógica)
    const orden = [...this.perfiles].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    // 3) asigna perfiles a su posición guardada; si falta, al primer slot libre
    const usados = new Set<number>();
    for (const p of orden) {
      let pos = this.slotMap[p.id];
      if (!pos || pos < 1 || pos > N || usados.has(pos)) {
        const libre = nuevos.find((s) => !s.perfil && !usados.has(s.pos));
        pos = libre ? libre.pos : N; // fallback
      }
      usados.add(pos);
      nuevos[pos - 1].perfil = p;
      this.slotMap[p.id] = pos;
    }

    this.slots = nuevos;
    this.persistirSlotMap();
  }

  private persistirSlotMap() {
    try {
      localStorage.setItem(
        SLOT_KEY(this.cuentaId),
        JSON.stringify(this.slotMap)
      );
    } catch {}
  }

  // -----------------------
  // MODAL VENDER
  // -----------------------
  abrirModal() {
    this.mostrarModalVender = true;
    this.nuevoPerfil = {
      clienteId: 0,
      fecha_venta: dayjs().format('YYYY-MM-DD'),
      tiempo_asignado: '',
      precio: undefined,
    };
    this.inicializarTiempoAsignadoPerfil(); // 👈 aquí
  }

  // abrir modal directamente sobre un slot fijo
  abrirModalVenderEnSlot(pos: number) {
    this.slotSeleccionado = pos;
    this.abrirModal();
  }

  cerrarModal() {
    this.mostrarModalVender = false;
    this.busquedaCliente = '';
    this.clientesFiltrados = [];
    this.slotSeleccionado = null;
    this.nuevoPerfil = {
      clienteId: 0,
      fecha_venta: dayjs().format('YYYY-MM-DD'),
      tiempo_asignado: '',
      precio: undefined,
    };
  }

  // -----------------------
  // CLIENTES (buscador)
  // -----------------------

  clientesFiltrados: any[] = [];
  busquedaCliente: string = '';
  mostrarListaClientes = false;

  cargarClientes() {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => (this.clientes = clientes),
      error: (err) => console.error('Error al cargar clientes', err),
    });
  }

  normalizarTexto(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9+]/g, '')
      .toLowerCase()
      .trim();
  }

  filtrarClientes() {
    const textoNombre = (this.busquedaCliente || '').toLowerCase().trim();
    const textoNumerico = this.normalizarTexto(this.busquedaCliente || '');

    this.clientesFiltrados = this.clientes
      .filter((c) => {
        const nombre = (c.nombre || '').toLowerCase().trim();
        const contacto = this.normalizarTexto(c.contacto || '');
        return nombre.includes(textoNombre) || contacto.includes(textoNumerico);
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  seleccionarCliente(cliente: any) {
    this.nuevoPerfil.clienteId = cliente.id;
    this.busquedaCliente = `${cliente.nombre} (${
      cliente.contacto || 'sin número'
    })`;
    this.mostrarListaClientes = false;
  }

  ocultarListaClientes() {
    setTimeout(() => (this.mostrarListaClientes = false), 200);
  }

  // -----------------------
  // REGISTRAR VENTA
  // -----------------------
  private guardarPerfilConClienteId(clienteId: number) {
    const datos: any = {
      ...this.nuevoPerfil,
      cuentaId: this.cuentaSeleccionada.id,
      clienteId,
    };

    if (
      datos.precio === undefined ||
      datos.precio === null ||
      datos.precio === ''
    ) {
      delete datos.precio;
    } else {
      datos.precio = Number(datos.precio);
    }

    this.perfilService.crearPerfil(datos).subscribe({
      next: (perfilCreado) => {
        // asigna el perfil al slot seleccionado (si lo hubo)
        if (this.slotSeleccionado) {
          this.slotMap[perfilCreado.id] = this.slotSeleccionado;
          this.persistirSlotMap();
          this.slotSeleccionado = null;
        }
        // recarga y reconstruye slots (posiciones estables)
        this.cargarPerfiles();
        this.cargarCuenta();
        this.cerrarModal();
      },
      error: (err) => console.error('Error al registrar perfil', err),
    });
  }

  registrarPerfil() {
    const texto = (this.busquedaCliente || '').trim();

    if (this.nuevoPerfil.clienteId === 0 && texto) {
      const esNumero = /^[\s+]*\d[\d\s-]*$/.test(texto);
      const nombre = esNumero ? this.generarNombreClienteAuto() : texto;
      const contacto = esNumero ? texto : '';
      const clave = this.generarClaveAleatoria();

      const nombreNorm = this.normalizarTexto(nombre);
      const contactoNorm = this.normalizarTexto(contacto);

      const porNumero = this.clientes.find(
        (c) =>
          this.normalizarTexto(c.contacto || '') === contactoNorm &&
          !!contactoNorm
      );
      const porNombre = this.clientes.find(
        (c) =>
          this.normalizarTexto(c.nombre || '') === nombreNorm &&
          !contactoNorm &&
          !c.contacto
      );

      const clienteCoincidente = porNumero || porNombre;
      if (clienteCoincidente) {
        this.nuevoPerfil.clienteId = clienteCoincidente.id;
        this.busquedaCliente = `${clienteCoincidente.nombre} (${
          clienteCoincidente.contacto || 'sin número'
        })`;
        this.mostrarListaClientes = false;
        this.guardarPerfilConClienteId(clienteCoincidente.id);
        return;
      }

      const yaExiste = this.clientes.some((c) => {
        const nombreC = this.normalizarTexto(c.nombre || '');
        const contactoC = this.normalizarTexto(c.contacto || '');
        return (
          (nombreC === nombreNorm && !contactoNorm) ||
          (contactoC === contactoNorm && !nombreNorm) ||
          (nombreC === nombreNorm && contactoC === contactoNorm)
        );
      });
      if (yaExiste) {
        alert('Ya existe un cliente con ese nombre o número.');
        return;
      }

      // crear cliente y luego registrar venta
      const nuevoCliente = { nombre, contacto, clave };
      this.clienteService.crearCliente(nuevoCliente).subscribe({
        next: (clienteCreado) =>
          this.guardarPerfilConClienteId(clienteCreado.id),
        error: (err) =>
          console.error('Error al crear cliente sin registrar', err),
      });
    } else if (this.nuevoPerfil.clienteId !== 0) {
      this.guardarPerfilConClienteId(this.nuevoPerfil.clienteId);
    } else {
      alert('Por favor seleccione o escriba un nombre/número de cliente.');
    }
  }

  // Utilidades varias
  generarNombreClienteAuto(): string {
    const usados = this.clientes
      .map((c) => c.nombre)
      .filter((n) => /^Cliente \d+$/.test(n))
      .map((n) => parseInt(n.split(' ')[1], 10))
      .sort((a, b) => a - b);
    let siguiente = 1;
    for (let i = 0; i < usados.length; i++) {
      if (usados[i] !== siguiente) break;
      siguiente++;
    }
    return `Cliente ${siguiente}`;
  }

  generarClaveAleatoria(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let clave = 'cliente';
    for (let i = 0; i < 6; i++)
      clave += chars.charAt(Math.floor(Math.random() * chars.length));
    return clave;
  }

  eliminarPerfil(perfilId: number) {
    if (confirm('¿Estás seguro de eliminar este perfil?')) {
      this.perfilService.eliminarPerfil(perfilId).subscribe({
        next: () => {
          this.cargarPerfiles(); // 🔄 actualiza tabla con datos frescos
          this.cargarCuenta(); // 🔄 actualiza resumen de la cuenta
        },
        error: (err) => {
          console.error('Error al eliminar perfil', err);
        },
      });
    }
  }

  editandoId: number | null = null;
  perfilEditado: any = {};

  iniciarEdicion(perfilId: number) {
    this.editandoId = perfilId;
    const original = this.perfiles.find((p) => p.id === perfilId);
    this.perfilEditado = { ...original }; // copia para edición segura
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.perfilEditado = {};
  }

  guardarCambios(perfil: any) {
    const { id, ...datosActualizados } = this.perfilEditado;

    this.perfilService.actualizarPerfil(id, datosActualizados).subscribe({
      next: () => {
        this.cargarPerfiles();
        this.cargarCuenta();
        this.editandoId = null;
        this.perfilEditado = {};
      },
      error: (err) => {
        console.error('Error al guardar cambios', err);
      },
    });
  }

  filaSeleccionada: number | null = null;

  copiadoIdx: number | null = null;

  copiarPlantilla(perfil: any, idx: number) {
    const plataforma =
      this.cuentaSeleccionada.plataforma?.nombre?.toUpperCase() || '';
    const tiempo =
      perfil.tiempo_asignado?.toUpperCase().replace(/\s+/g, '') || '';
    const correo = this.cuentaSeleccionada.correo;
    const clave = this.cuentaSeleccionada.clave;
    const perfilNumero = `P${idx + 1}`;
    const corte = this.formatearFecha(perfil.fecha_corte);

    const plantilla =
      `${plataforma} ${tiempo}\n` +
      `${correo}\n` +
      `Clave: ${clave}\n` +
      `Perfil: ${perfilNumero}\n\n` +
      `Corte: ${corte}\n` +
      `•No reproducir en dos dispositivos a la vez.\n` +
      `•No modificar nada de la cuenta.`;

    navigator.clipboard.writeText(plantilla).then(() => {
      this.copiadoIdx = idx;

      setTimeout(() => {
        this.copiadoIdx = null;
      }, 2500);
    });
  }

  formatearFecha(fecha: string): string {
    const [a, m, d] = fecha.split('-');
    return `${parseInt(d)}/${parseInt(m)}/${a.slice(2)}`;
  }

  // --- NUEVO: estado del dropdown de perfiles ---
  dropdownPerfilAbierto: number | null = null;
  dropdownPerfilPosX = 0;
  dropdownPerfilPosY = 0;
  selectedPerfil: any = null;

  // Cerrar el menú si hacen click fuera
  @HostListener('document:click')
  onDocumentClick() {
    this.cerrarDropdownPerfil();
  }

  // Abrir/cerrar el menú de tres puntos del perfil
  toggleDropdownPerfil(event: MouseEvent, perfilId: number, perfil: any) {
    event.stopPropagation();

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const menuWidth = 180; // ancho estimado del menú
    const menuHeight = 200; // alto estimado del menú (ajusta según diseño)

    // 📌 Posición X: siempre intenta abrir hacia la izquierda
    let nuevaPosX = rect.left - menuWidth;
    if (nuevaPosX < 8) {
      // Si no cabe a la izquierda, lo pegamos al borde
      nuevaPosX = 8;
    }

    // 📌 Posición Y: debajo del botón, con ajuste si no cabe abajo
    let nuevaPosY = rect.bottom + 8;
    if (nuevaPosY + menuHeight > window.innerHeight) {
      nuevaPosY = window.innerHeight - menuHeight - 8;
    }

    // 📌 Abrir o cerrar el menú
    if (this.dropdownPerfilAbierto === perfilId) {
      this.dropdownPerfilAbierto = null;
    } else {
      this.dropdownPerfilAbierto = perfilId;
      this.dropdownPerfilPosX = nuevaPosX;
      this.dropdownPerfilPosY = nuevaPosY;
      this.selectedPerfil = perfil;
    }
  }

  cerrarDropdownPerfil() {
    this.dropdownPerfilAbierto = null;
    this.selectedPerfil = null;
  }

  // (si ya tienes esta función en el componente, NO la dupliques)
  diasRestantes(fechaISO?: string): number {
    if (!fechaISO) return 0;
    const hoy = new Date();
    const corte = new Date(fechaISO);
    const ms = corte.setHours(0, 0, 0, 0) - hoy.setHours(0, 0, 0, 0);
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }
  // Presets para el modal de PERFIL
  tiempoPresetPerfil: '1m' | '3m' | '6m' | null = '1m';
  customDiasPerfil: number | null = null;

  inicializarTiempoAsignadoPerfil() {
    this.tiempoPresetPerfil = '1m';
    this.customDiasPerfil = null;
    this.nuevoPerfil.tiempo_asignado = '1 mes';
  }

  setPresetPerfil(preset: '1m' | '3m' | '6m') {
    this.tiempoPresetPerfil = preset;
    this.customDiasPerfil = null;

    switch (preset) {
      case '1m':
        this.nuevoPerfil.tiempo_asignado = '1 mes';
        break;
      case '3m':
        this.nuevoPerfil.tiempo_asignado = '3 meses';
        break;
      case '6m':
        this.nuevoPerfil.tiempo_asignado = '6 meses';
        break;
    }
  }

  onCustomDiasChangePerfil() {
    const n = Number(this.customDiasPerfil);
    if (n > 0) {
      this.tiempoPresetPerfil = null; // desactiva botones
      this.nuevoPerfil.tiempo_asignado = `${n} dias`; // sin tilde
    } else if (this.tiempoPresetPerfil) {
      this.setPresetPerfil(this.tiempoPresetPerfil);
    } else {
      this.nuevoPerfil.tiempo_asignado = '';
    }
  }
}
