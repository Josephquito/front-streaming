import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ClienteService,
  HistorialCliente,
  Perfil,
} from '../../../services/cliente.service';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { ModalNuevoClienteComponent } from '../modal/modal-nuevo-cliente.component';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-info-cliente',
  imports: [CommonModule, ModalNuevoClienteComponent, FormsModule],
  templateUrl: './info-cliente.component.html',
})
export class InfoClienteComponent implements OnInit {
  historial: HistorialCliente | null = null;
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private clienteService: ClienteService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.cargarHistorial(id);
    }
  }

  cargarHistorial(id: number) {
    this.clienteService.getHistorialCliente(id).subscribe({
      next: (res) => {
        this.historial = res;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar historial del cliente', err);
        this.cargando = false;
      },
    });
  }

  formatearFecha(fecha?: string): string {
    return fecha ? dayjs(fecha).format('D/M/YYYY') : '-';
  }

  mostrarModalCliente = false;
  clienteEditar: any = null;

  abrirModalEditar(cliente: any) {
    this.clienteEditar = cliente;
    this.mostrarModalCliente = true;
  }

  cerrarModalCliente() {
    this.mostrarModalCliente = false;
    this.clienteEditar = null;
  }

  recargarCliente() {
    const id = this.historial?.cliente?.id;
    if (id) {
      this.cargando = true;
      this.cargarHistorial(id);
    }
  }
}
