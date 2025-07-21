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
    precio: 0,
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

  volverAtras() {
    this.router.navigate(['/cuentas']);
  }

  registrarPerfil() {
    const datos = {
      cuentaId: this.cuentaId,
      ...this.nuevoPerfil,
    };

    this.perfilService.crearPerfil(datos).subscribe({
      next: () => {
        this.mostrarFormulario = false;
        this.nuevoPerfil = {
          clienteId: 0,
          fecha_venta: '',
          tiempo_asignado: '',
          precio: 0,
        };
        this.cargarPerfiles();
        this.cargarCuenta(); // 🔄 Actualiza también los datos de la cuenta
      },
      error: (err) => {
        console.error('Error al registrar perfil', err);
      },
    });
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

  venderEnPosicion(pos: number) {
    this.filaSeleccionada = pos;
    this.mostrarFormulario = true;
    this.nuevoPerfil = {
      clienteId: 0,
      fecha_venta: '',
      tiempo_asignado: '',
      precio: 0,
    };
  }

  calcularGananciaTotal(): string {
    const total = this.perfiles.reduce((sum, perfil) => {
      return sum + (parseFloat(perfil.ganancia) || 0);
    }, 0);
    return total.toFixed(2);
  }

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
