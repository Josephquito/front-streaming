import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanzasService } from '../../../services/finanzas.service';

// Interfaces
interface EgresoFijo {
  id: number;
  detalle: string;
  valor: number;
  fecha_creacion: string;
}

interface NuevoEgreso {
  detalle: string;
  valor: number | null;
}

@Component({
  selector: 'app-egresos-fijos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './egresos-fijos.component.html',
  providers: [DatePipe],
})
export class EgresosFijosComponent implements OnInit {
  egresos: EgresoFijo[] = [];
  mostrarModal = false;
  cargando = false;

  // Egreso en edición o nuevo
  nuevoEgreso: NuevoEgreso = {
    detalle: '',
    valor: null,
  };

  egresoSeleccionado: EgresoFijo | null = null;
  egresoIndex: number | null = null;

  // Dropdown
  dropdownAbierto = false;
  dropdownPosX = 0;
  dropdownPosY = 0;

  constructor(private finanzasService: FinanzasService) {}

  ngOnInit() {
    this.cargarEgresos();
    document.addEventListener('click', () => this.cerrarDropdown());
  }

  cargarEgresos() {
    this.finanzasService.obtenerEgresosFijos().subscribe({
      next: (data: EgresoFijo[]) => {
        this.egresos = data;
      },
      error: () => {
        alert('Error al cargar egresos');
      },
    });
  }

  abrirModal() {
    this.mostrarModal = true;
    this.egresoSeleccionado = null;
    this.nuevoEgreso = {
      detalle: '',
      valor: null,
    };
  }

  guardarEgreso() {
    if (
      !this.nuevoEgreso.detalle ||
      this.nuevoEgreso.valor === null ||
      this.nuevoEgreso.valor <= 0
    ) {
      alert('Completa todos los campos correctamente');
      return;
    }

    this.cargando = true;

    if (this.egresoSeleccionado) {
      // Editar
      this.finanzasService
        .editarEgresoFijo(this.egresoSeleccionado.id, {
          detalle: this.nuevoEgreso.detalle,
          valor: this.nuevoEgreso.valor,
        })
        .subscribe({
          next: () => {
            this.cargarEgresos();
            this.resetModal();
          },
          error: () => {
            alert('Error al actualizar');
            this.cargando = false;
          },
        });
    } else {
      // Crear
      this.finanzasService
        .crearEgresoFijo({
          detalle: this.nuevoEgreso.detalle,
          valor: this.nuevoEgreso.valor,
        })
        .subscribe({
          next: () => {
            this.cargarEgresos();
            this.resetModal();
          },
          error: () => {
            alert('Error al guardar');
            this.cargando = false;
          },
        });
    }
  }

  resetModal() {
    this.cargando = false;
    this.mostrarModal = false;
    this.egresoSeleccionado = null;
    this.nuevoEgreso = {
      detalle: '',
      valor: null,
    };
  }

  toggleDropdown(event: MouseEvent, egreso: EgresoFijo, index: number) {
    event.stopPropagation();
    this.dropdownAbierto = true;
    this.egresoSeleccionado = egreso;
    this.egresoIndex = index;

    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const menuWidth = 160;
    this.dropdownPosX = rect.right - menuWidth;
    this.dropdownPosY = rect.bottom;
  }

  cerrarDropdown() {
    this.dropdownAbierto = false;
    this.egresoSeleccionado = null;
    this.egresoIndex = null;
  }

  editarEgreso() {
    if (this.egresoSeleccionado) {
      this.nuevoEgreso = {
        detalle: this.egresoSeleccionado.detalle,
        valor: this.egresoSeleccionado.valor,
      };
      this.mostrarModal = true;
      this.cerrarDropdown();
    }
  }

  eliminarEgreso() {
    if (
      this.egresoSeleccionado &&
      confirm('¿Estás seguro de eliminar este egreso?')
    ) {
      this.finanzasService
        .eliminarEgresoFijo(this.egresoSeleccionado.id)
        .subscribe({
          next: () => {
            this.egresos.splice(this.egresoIndex!, 1);
            this.cerrarDropdown();
          },
          error: () => {
            alert('Error al eliminar');
          },
        });
    }
  }
}
