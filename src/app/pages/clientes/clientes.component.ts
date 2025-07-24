import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalNuevoClienteComponent } from './modal/modal-nuevo-cliente.component';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalNuevoClienteComponent],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  busqueda: string = '';

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clienteService.getClientes().subscribe({
      next: (res) => {
        this.clientes = res;
        this.filtrarClientes();
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
      },
    });
  }

  filtrarClientes() {
    const texto = this.busqueda.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(texto) ||
        c.contacto.toLowerCase().includes(texto)
    );
  }

  mostrarModal = false;

  abrirModalNuevoCliente() {
    this.mostrarModal = true;
  }

  importarDesdeCsv(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const datos: any[] = result.data;

        const clientesValidos = datos
          .filter((row) => row['First Name'] && row['Phone 1 - Value'])
          .map((row) => ({
            nombre: row['First Name'].trim(),
            contacto: '+' + row['Phone 1 - Value'].trim().replace(/\D/g, ''),
            clave: this.generarClaveAleatoria(),
          }));

        this.guardarClientesEnLote(clientesValidos);
      },
    });
  }

  generarClaveAleatoria(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let clave = 'cliente';
    for (let i = 0; i < 6; i++) {
      clave += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return clave;
  }

  guardarClientesEnLote(clientes: any[]) {
    let pendientes = clientes.length;

    clientes.forEach((cliente) => {
      this.clienteService.crearCliente(cliente).subscribe({
        next: () => {
          pendientes--;
          if (pendientes === 0) {
            this.cargarClientes();
            alert('Importación completada ✅');
          }
        },
        error: (err) => {
          console.error('Error al guardar cliente', cliente, err);
          pendientes--;
        },
      });
    });
  }

  exportarParaGoogleContactos() {
    const plantilla = this.clientes.map((cliente) => ({
      'First Name': cliente.nombre,
      'Phone 1 - Value': cliente.contacto,
      // Puedes incluir más columnas si quieres, pero no son necesarias
    }));

    const csv = Papa.unparse(plantilla);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'google_contactos.csv');
    link.click();
  }
}
