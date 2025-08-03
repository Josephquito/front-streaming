import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-nuevo-cliente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-nuevo-cliente.component.html',
})
export class ModalNuevoClienteComponent implements OnInit {
  @Input() clientes: any[] = [];
  @Input() clienteEditar: any = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;
  cargando = false;
  errorMsg: string = '';

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
    this.form = this.fb.group({
      nombre: [''],
      contacto: ['', [Validators.required, this.contactoDuplicadoValidator]],
      clave: [''],
    });
  }

  ngOnInit(): void {
    // Si se está editando, cargar valores en el formulario
    if (this.clienteEditar) {
      this.form.patchValue({
        nombre: this.clienteEditar.nombre,
        contacto: this.clienteEditar.contacto,
        clave: this.clienteEditar.clave,
      });
    }

    // Validación de nombre duplicado
    this.form.get('nombre')?.setValidators(this.nombreDuplicadoValidator);
    this.form.get('nombre')?.updateValueAndValidity();
  }

  contactoDuplicadoValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const contacto = control.value?.trim();
    if (!contacto || !this.clientes) return null;

    const yaExiste = this.clientes.some(
      (c) =>
        c.contacto.trim() === contacto &&
        (!this.clienteEditar || c.id !== this.clienteEditar.id)
    );

    return yaExiste ? { contactoDuplicado: true } : null;
  };

  nombreDuplicadoValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const nombre = control.value?.trim()?.toLowerCase();
    if (!nombre || !this.clientes) return null;

    const yaExiste = this.clientes.some(
      (c) =>
        c.nombre.trim().toLowerCase() === nombre &&
        (!this.clienteEditar || c.id !== this.clienteEditar.id)
    );

    return yaExiste ? { nombreDuplicado: true } : null;
  };

  cerrarModal() {
    this.form.reset();
    this.errorMsg = '';
    this.cargando = false;
    this.cerrar.emit();
  }

  guardar() {
    if (this.form.invalid) return;

    const clienteData = { ...this.form.value };

    // Generar nombre si está vacío
    if (!clienteData.nombre?.trim()) {
      clienteData.nombre = this.generarNombreDisponible();
    }

    // Generar clave si está vacía
    if (!clienteData.clave?.trim()) {
      clienteData.clave = this.generarClaveAleatoria();
    }

    this.cargando = true;
    this.errorMsg = '';

    if (this.clienteEditar) {
      // Modo edición
      this.clienteService
        .editarCliente(this.clienteEditar.id, clienteData)
        .subscribe({
          next: () => {
            this.cargando = false;
            this.guardado.emit();
            this.cerrarModal();
          },
          error: (err) => {
            this.cargando = false;
            this.errorMsg = err?.error?.message || 'Error al guardar';
          },
        });
    } else {
      // Modo nuevo
      this.clienteService.crearCliente(clienteData).subscribe({
        next: () => {
          this.cargando = false;
          this.guardado.emit();
          this.cerrarModal();
        },
        error: (err) => {
          this.cargando = false;
          this.errorMsg = err?.error?.message || 'Error al guardar';
        },
      });
    }
  }

  generarNombreDisponible(): string {
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
}
