import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
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
  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form: FormGroup;
  cargando = false;
  errorMsg: string = '';

  constructor(private fb: FormBuilder, private clienteService: ClienteService) {
    this.form = this.fb.group({
      nombre: [''],
      contacto: [
        '',
        [
          Validators.required,
          Validators.pattern('^\\+[0-9]{9,15}$'),
          this.contactoDuplicadoValidator,
        ],
      ],
      clave: [''],
    });
  }

  ngOnInit(): void {
    // Aplica el validador personalizado cuando ya tengas los clientes
    this.form.get('nombre')?.setValidators(this.nombreDuplicadoValidator);
    this.form.get('nombre')?.updateValueAndValidity();
  }

  contactoDuplicadoValidator = (control: any) => {
    const contacto = control.value?.trim();
    if (!contacto || !this.clientes) return null;

    const yaExiste = this.clientes.some((c) => c.contacto.trim() === contacto);

    return yaExiste ? { contactoDuplicado: true } : null;
  };

  nombreDuplicadoValidator = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const nombre = control.value?.trim()?.toLowerCase();
    if (!nombre || !this.clientes) return null;

    const yaExiste = this.clientes.some(
      (c) => c.nombre.trim().toLowerCase() === nombre
    );

    return yaExiste ? { nombreDuplicado: true } : null;
  };

  cerrarModal() {
    this.cerrar.emit();
  }

  guardar() {
    if (this.form.invalid) return;

    const clienteData = { ...this.form.value };

    // Generar nombre automáticamente si está vacío
    if (!clienteData.nombre?.trim()) {
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

      clienteData.nombre = `Cliente ${siguiente}`;
    }

    if (!clienteData.clave?.trim()) {
      clienteData.clave = this.generarClaveAleatoria();
    }

    this.cargando = true;
    this.errorMsg = '';

    this.clienteService.crearCliente(clienteData).subscribe({
      next: () => {
        this.cargando = false;
        this.guardado.emit();
        this.cerrarModal();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMsg = err?.error?.message || 'Error al guardar el cliente';
      },
    });
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
