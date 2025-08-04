// src/app/pages/usuarios/empleados/modal-empleados/modal-empleados.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../../services/usuario.service';

@Component({
  selector: 'app-modal-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-empleados.component.html',
})
export class ModalEmpleadosComponent {
  @Input() empleado: Usuario | null = null;
  @Output() cerrar = new EventEmitter<boolean>();

  datos: any = {
    nombre: '',
    apellido: '',
    correo: '',
    clave: '',
    telefono: '',
    rol: 'empleado',
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    if (this.empleado) {
      this.datos = { ...this.empleado, clave: '' }; // clave vacía al editar
    }
  }

  guardar() {
    const datos = { ...this.datos };

    // Si estás editando y la clave está vacía, no la envíes
    if (this.empleado && (!datos.clave || datos.clave.trim() === '')) {
      delete datos.clave;
    }

    const accion = this.empleado
      ? this.usuarioService.actualizarUsuario(this.empleado.id, datos)
      : this.usuarioService.crearUsuario(datos);

    accion.subscribe({
      next: () => this.cerrar.emit(true),
      error: (err) => console.error('Error al guardar empleado:', err),
    });
  }

  cerrarModal() {
    this.cerrar.emit(false);
  }
}
