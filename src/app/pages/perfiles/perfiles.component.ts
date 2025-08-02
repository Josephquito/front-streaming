// src/app/pages/perfiles/perfiles.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CuentasService } from '../../services/cuentas.service';
import { PerfilService } from '../../services/perfiles.service';
import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../guards/auth.service';
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
  mostrarFormulario: boolean = false;

  nuevoPerfil = {
    clienteId: 0,
    fecha_venta: '',
    tiempo_asignado: '',
    precio: undefined,
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

  cargarCuenta() {
    this.cuentaService.getCuenta(this.cuentaId).subscribe({
      next: (cuenta) => {
        this.cuentaSeleccionada = cuenta;
      },
      error: (err) => {
        console.error('Error al cargar cuenta', err);
      },
    });
  }

  cargarPerfiles() {
    this.perfilService.getPerfilesByCuenta(this.cuentaId).subscribe({
      next: (perfilesExistentes) => {
        console.log('✅ Perfiles recibidos:', perfilesExistentes);
        this.perfiles = perfilesExistentes;
      },
      error: (err) => {
        console.error('Error al cargar perfiles', err);
      },
    });
  }

  mostrarModalVender = false;

  abrirModal() {
    this.mostrarModalVender = true;
    this.nuevoPerfil = {
      clienteId: 0,
      fecha_venta: new Date().toISOString().split('T')[0],
      tiempo_asignado: '',
      precio: undefined,
    };
  }

  cerrarModal() {
    this.mostrarModalVender = false;
    this.busquedaCliente = '';
    this.clientesFiltrados = [];
    this.nuevoPerfil = {
      clienteId: 0,
      fecha_venta: new Date().toISOString().split('T')[0],
      tiempo_asignado: '',
      precio: undefined,
    };
  }

  cargarClientes() {
    this.clienteService.getClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
      },
      error: (err) => {
        console.error('Error al cargar clientes', err);
      },
    });
  }

  get espaciosLibres(): number[] {
    const total = this.cuentaSeleccionada?.numero_perfiles || 0;
    const usados = this.perfiles?.length || 0;
    const libres = Math.max(total - usados, 0);
    return Array.from({ length: libres });
  }

  normalizarTexto(texto: string): string {
    return (texto || '')
      .normalize('NFD') // elimina acentos
      .replace(/[\u0300-\u036f]/g, '') // sigue quitando tildes
      .replace(/[^a-zA-Z0-9+]/g, '') // quita todo menos letras, números y +
      .toLowerCase()
      .trim();
  }

  clientesFiltrados: any[] = [];
  busquedaCliente: string = '';
  mostrarListaClientes = false;

  filtrarClientes() {
    const textoNombre = (this.busquedaCliente || '').toLowerCase().trim();
    const textoNumerico = this.normalizarTexto(this.busquedaCliente || '');

    let resultados = this.clientes.filter((c) => {
      const nombre = (c.nombre || '').toLowerCase().trim();
      const contacto = this.normalizarTexto(c.contacto || '');

      return nombre.includes(textoNombre) || contacto.includes(textoNumerico);
    });

    this.clientesFiltrados = resultados.sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }

  seleccionarCliente(cliente: any) {
    this.nuevoPerfil.clienteId = cliente.id;
    this.busquedaCliente = `${cliente.nombre} (${cliente.contacto})`;
    this.mostrarListaClientes = false;
  }

  guardarPerfilConClienteId(clienteId: number) {
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
      next: () => {
        this.cargarPerfiles();
        this.cargarCuenta();
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al registrar perfil', err);
      },
    });
  }

  generarNombreClienteAuto(): string {
    const usados = this.clientes
      .map((c) => c.nombre)
      .filter((n) => /^Cliente \d+$/.test(n))
      .map((n) => parseInt(n.split(' ')[1]))
      .sort((a, b) => a - b);

    let siguiente = 1;
    for (let i = 0; i < usados.length; i++) {
      if (usados[i] !== siguiente) break;
      siguiente++;
    }

    return `Cliente ${siguiente}`;
  }

  generarClaveAleatoria(): string {
    const caracteres =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let clave = 'cliente';
    for (let i = 0; i < 6; i++) {
      clave += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return clave;
  }

  ocultarListaClientes() {
    setTimeout(() => {
      this.mostrarListaClientes = false;
    }, 200); // Espera breve para que se capture el click del item antes de ocultar
  }

  registrarPerfil() {
    const texto = this.busquedaCliente.trim();

    if (this.nuevoPerfil.clienteId === 0 && texto) {
      const esNumero = /^[\s+]*\d[\d\s-]*$/.test(texto);

      const nombre = esNumero ? this.generarNombreClienteAuto() : texto;

      const contacto = esNumero ? texto : '';
      const clave = this.generarClaveAleatoria();

      const nombreNormalizado = this.normalizarTexto(nombre);
      const contactoNormalizado = this.normalizarTexto(contacto);

      // 🟢 Si coincide por número → usar ese cliente
      const porNumero = this.clientes.find((c) => {
        return (
          this.normalizarTexto(c.contacto || '') === contactoNormalizado &&
          contactoNormalizado !== ''
        );
      });

      // 🟢 Si coincide por nombre (y contacto vacío) → usar ese cliente
      const porNombre = this.clientes.find((c) => {
        return (
          this.normalizarTexto(c.nombre || '') === nombreNormalizado &&
          !contactoNormalizado &&
          !c.contacto // contacto vacío
        );
      });

      const clienteCoincidente = porNumero || porNombre;

      if (clienteCoincidente) {
        // ✅ Seleccionar y continuar
        this.nuevoPerfil.clienteId = clienteCoincidente.id;
        this.busquedaCliente = `${clienteCoincidente.nombre} (${
          clienteCoincidente.contacto || 'sin número'
        })`;
        this.mostrarListaClientes = false;

        this.guardarPerfilConClienteId(clienteCoincidente.id);
        return;
      }

      // 🔒 Validación extra por combinación exacta
      const yaExiste = this.clientes.some((c) => {
        const nombreC = this.normalizarTexto(c.nombre || '');
        const contactoC = this.normalizarTexto(c.contacto || '');

        return (
          (nombreC === nombreNormalizado && !contactoNormalizado) ||
          (contactoC === contactoNormalizado && !nombreNormalizado) ||
          (nombreC === nombreNormalizado && contactoC === contactoNormalizado)
        );
      });

      if (yaExiste) {
        alert('Ya existe un cliente con ese nombre o número.');
        return;
      }

      // 🆕 Crear nuevo cliente
      const nuevoCliente = {
        nombre,
        contacto,
        clave,
      };

      this.clienteService.crearCliente(nuevoCliente).subscribe({
        next: (clienteCreado) => {
          this.guardarPerfilConClienteId(clienteCreado.id);
        },
        error: (err) => {
          console.error('Error al crear cliente sin registrar', err);
        },
      });
    } else if (this.nuevoPerfil.clienteId !== 0) {
      this.guardarPerfilConClienteId(this.nuevoPerfil.clienteId);
    } else {
      alert('Por favor seleccione o escriba un nombre/número de cliente.');
    }
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
}
