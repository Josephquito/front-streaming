import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventarioPerfilService } from '../../../services/inventario-perfil.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kardex-inventarios',
  standalone: true,
  templateUrl: './kardex-inventarios.component.html',
  imports: [CommonModule],
})
export class KardexInventariosComponent implements OnInit {
  inventarios: any[] = [];

  constructor(
    private inventarioService: InventarioPerfilService,
    private router: Router
  ) {}

  ngOnInit() {
    this.inventarioService.getInventario().subscribe((data) => {
      this.inventarios = (data || []).sort((a, b) =>
        a.plataforma?.nombre?.localeCompare(b.plataforma?.nombre)
      );
    });
  }

  irAKardex(plataformaId: number) {
    this.router.navigate(['/finanzas/kardex', plataformaId]);
  }
}
