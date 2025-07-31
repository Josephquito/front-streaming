import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CompraInversion {
  id: number;
  detalle: string;
  valor: number;
  fecha_creacion: string;
}

@Component({
  selector: 'app-compras-inversion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compras-inversion.component.html',
})
export class ComprasInversionComponent implements OnInit {
  compras: CompraInversion[] = [];
  mostrarModal = false;
  nuevaCompra: { detalle: string; valor: number | null } = {
    detalle: '',
    valor: null,
  };
  cargando = false;
  compraSeleccionada: CompraInversion | null = null;
  dropdownAbierto = false;
  dropdownPosX = 0;
  dropdownPosY = 0;
  compraIndex: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCompras();
    document.addEventListener('click', () => this.cerrarDropdown());
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  cargarCompras() {
    this.http
      .get<CompraInversion[]>(
        `${environment.apiUrl}/finanzas/compras-inversiones`,
        {
          headers: this.getHeaders(),
        }
      )
      .subscribe((data) => (this.compras = data));
  }

  abrirModal() {
    this.mostrarModal = true;
    this.compraSeleccionada = null;
    this.nuevaCompra = { detalle: '', valor: null };
  }

  guardarCompra() {
    if (
      !this.nuevaCompra.detalle ||
      !this.nuevaCompra.valor ||
      this.nuevaCompra.valor <= 0
    ) {
      alert('Completa todos los campos correctamente');
      return;
    }

    this.cargando = true;

    this.http
      .post(
        `${environment.apiUrl}/finanzas/compras-inversiones`,
        this.nuevaCompra,
        {
          headers: this.getHeaders(),
        }
      )
      .subscribe({
        next: () => {
          this.cargarCompras();
          this.cargando = false;
          this.mostrarModal = false;
        },
        error: () => {
          alert('Error al guardar');
          this.cargando = false;
        },
      });
  }

  eliminarCompra(id: number) {
    if (confirm('¿Estás seguro de eliminar esta compra?')) {
      this.http
        .delete(`${environment.apiUrl}/finanzas/compras-inversiones/${id}`, {
          headers: this.getHeaders(),
        })
        .subscribe(() => {
          this.cargarCompras();
        });
    }
  }

  toggleDropdown(event: MouseEvent, compra: CompraInversion, index: number) {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dropdownAbierto = true;
    this.compraSeleccionada = compra;
    this.compraIndex = index;
    const menuWidth = 160;
    this.dropdownPosX = rect.right - menuWidth;
    this.dropdownPosY = rect.bottom;
  }

  cerrarDropdown() {
    this.dropdownAbierto = false;
    this.compraSeleccionada = null;
    this.compraIndex = null;
  }
}
