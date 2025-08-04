// src/app/pages/usuarios/empleados/empleados.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../../../services/usuario.service';
import { ModalEmpleadosComponent } from './modal-empleados/modal-empleados.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalEmpleadosComponent],
  templateUrl: './empleados.component.html',
})
export class EmpleadosComponent implements OnInit {
  empleados: Usuario[] = [];
  mostrarModal = false;
  empleadoSeleccionado: Usuario | null = null;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  empleadosActivos: any[] = [];
  empleadosInactivos: any[] = [];

  cargarEmpleados() {
    this.usuarioService.getTodosLosUsuarios().subscribe({
      next: (res: Usuario[]) => {
        const empleados = res.filter((u) => u.rol !== 'superadmin');
        this.empleadosActivos = empleados.filter((e) => e.activo);
        this.empleadosInactivos = empleados.filter((e) => !e.activo);
      },
      error: (err) => {
        console.error('Error al cargar empleados', err);
      },
    });
  }

  abrirModalCrear() {
    this.empleadoSeleccionado = null;
    this.mostrarModal = true;
  }

  abrirModalEditar(usuario: Usuario) {
    this.empleadoSeleccionado = usuario;
    this.mostrarModal = true;
  }

  cerrarModal(recargar: boolean = false) {
    this.mostrarModal = false;
    this.empleadoSeleccionado = null;
    if (recargar) this.cargarEmpleados();
  }

  eliminarEmpleado(id: number) {
    if (confirm('¿Deseas eliminar este empleado?')) {
      this.usuarioService.eliminarUsuario(id).subscribe(() => {
        this.cargarEmpleados();
      });
    }
  }

  reactivarEmpleado(id: number) {
    if (confirm('¿Deseas reactivar este empleado?')) {
      this.usuarioService
        .actualizarUsuario(id, { activo: true })
        .subscribe(() => {
          this.cargarEmpleados(); // recarga las listas
        });
    }
  }
}
