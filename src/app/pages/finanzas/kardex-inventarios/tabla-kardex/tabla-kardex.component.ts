import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { KardexService } from '../../../../services/kardex.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-kardex',
  standalone: true,
  templateUrl: './tabla-kardex.component.html',
  imports: [CommonModule], // Asegúrate de incluir los módulos necesarios aquí
})
export class TablaKardexComponent implements OnInit {
  movimientos: any[] = [];
  plataformaId!: number;

  constructor(
    private route: ActivatedRoute,
    private kardexService: KardexService
  ) {}

  ngOnInit() {
    this.plataformaId = Number(
      this.route.snapshot.paramMap.get('plataformaId')
    );
    this.kardexService
      .getMovimientosPorPlataforma(this.plataformaId)
      .subscribe((data) => {
        this.movimientos = data;
      });
  }
}
