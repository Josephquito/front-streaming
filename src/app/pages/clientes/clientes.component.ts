import { Component, OnInit } from '@angular/core';
import { ClienteService } from '../../services/cliente.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalNuevoClienteComponent } from './modal/modal-nuevo-cliente.component';
import * as Papa from 'papaparse';
import { Router } from '@angular/router';
import { HostListener } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalNuevoClienteComponent],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent implements OnInit {
  mostrarModalCliente = false;
  clienteEditar: any = null;
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  clientesFiltradosCompletos: any[] = [];
  clientesFiltradosIncompletos: any[] = [];

  busqueda: string = '';

  constructor(private clienteService: ClienteService, private router: Router) {}

  ngOnInit(): void {
    this.cargarClientes();
    window.addEventListener('click', () => this.cerrarDropdown());
  }

  irAInfo(id: number) {
    this.router.navigate(['/clientes', id]);
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

  normalizarTexto(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  filtrarClientes() {
    const textoBusqueda = this.busqueda.toLowerCase();
    const textoNormalizado = this.normalizarTexto(textoBusqueda);

    const resultados = this.clientes.filter((c) => {
      const nombre = (c.nombre || '').toLowerCase();
      const contactoNormalizado = this.normalizarTexto(c.contacto || '');

      return (
        nombre.includes(textoBusqueda) ||
        contactoNormalizado.includes(textoNormalizado)
      );
    });

    this.clientesFiltradosIncompletos = resultados.filter((c) => {
      const nombre = (c.nombre || '').trim().toLowerCase();
      const contacto = (c.contacto || '').trim();

      return (
        !nombre || // sin nombre
        !contacto || // sin número
        nombre === 'cliente sin registrar' // nombre genérico
      );
    });

    this.clientesFiltradosCompletos = resultados.filter(
      (c) => !this.clientesFiltradosIncompletos.includes(c)
    );
  }

  mostrarModal = false;

  abrirModalNuevoCliente() {
    this.clienteEditar = null;
    this.mostrarModalCliente = true;
  }

  abrirModalEditar(cliente: any) {
    this.clienteEditar = cliente;
    this.mostrarModalCliente = true;
  }

  cerrarModalCliente() {
    this.mostrarModalCliente = false;
    this.clienteEditar = null;
  }

  recargarClientes() {
    this.cargarClientes(); // o como se llame tu método de refrescar lista
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
    let clave = '';
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

  @ViewChild('menuOpcionesRef') menuOpcionesRef!: ElementRef;

  dropdownAbierto: number | null = null;
  dropdownPosX = 0;
  dropdownPosY = 0;
  clienteSeleccionado: any = null;
  clienteEsIncompleto: boolean = false; // nueva propiedad

  toggleDropdown(event: MouseEvent, clienteId: number) {
    event.stopPropagation();

    if (this.dropdownAbierto === clienteId) {
      this.cerrarDropdown();
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const menuWidth = 180;
    const padding = 8;
    const viewportWidth = window.innerWidth;

    const abreALaIzquierda = rect.left + menuWidth > viewportWidth;
    const nuevaPosX = abreALaIzquierda ? rect.right - menuWidth : rect.left;
    const nuevaPosY = rect.bottom + padding;

    this.dropdownAbierto = clienteId;
    this.dropdownPosX = nuevaPosX;
    this.dropdownPosY = nuevaPosY;

    const clienteCompleto = this.clientesFiltradosCompletos.find(
      (c) => c.id === clienteId
    );
    const clienteIncompleto = this.clientesFiltradosIncompletos.find(
      (c) => c.id === clienteId
    );

    if (clienteCompleto) {
      this.clienteSeleccionado = clienteCompleto;
      this.clienteEsIncompleto = false;
    } else if (clienteIncompleto) {
      this.clienteSeleccionado = clienteIncompleto;
      this.clienteEsIncompleto = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.dropdownAbierto !== null &&
      this.menuOpcionesRef &&
      !this.menuOpcionesRef.nativeElement.contains(event.target)
    ) {
      this.cerrarDropdown();
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    this.cerrarDropdown();
  }

  cerrarDropdown() {
    this.dropdownAbierto = null;
    this.clienteSeleccionado = null;
  }

  eliminarCliente(id: number) {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    this.clienteService.eliminarCliente(id).subscribe({
      next: () => this.cargarClientes(),
      error: (err) => {
        if (err.status === 400) {
          alert(err.error.message); // o usar SweetAlert/Toastr
        } else {
          console.error('Error al eliminar', err);
        }
      },
    });
  }

  mostrarModalTelefono = false;
  telefonoNuevo = '';

  anadirCliente(cliente: any) {
    this.clienteSeleccionado = cliente;
    this.telefonoNuevo = cliente.contacto || '';
    this.mostrarModalTelefono = true;
  }

  cerrarModalTelefono() {
    this.mostrarModalTelefono = false;
    this.clienteSeleccionado = null;
    this.telefonoNuevo = '';
  }

  guardarTelefono() {
    if (!this.telefonoNuevo.trim()) return;

    const cambios = { contacto: this.telefonoNuevo };

    this.clienteService
      .editarCliente(this.clienteSeleccionado.id, cambios)
      .subscribe({
        next: () => {
          this.cerrarModalTelefono();
          this.cargarClientes(); // o el método que uses para refrescar
        },
        error: (err) => {
          console.error('Error al guardar número', err);
        },
      });
  }
}
