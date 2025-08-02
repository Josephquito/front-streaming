import { Component } from '@angular/core';
import { KardexInventariosComponent } from './kardex-inventarios/kardex-inventarios.component';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [KardexInventariosComponent], // Asegúrate de incluirlo aquí
  templateUrl: './finanzas.component.html',
})
export class FinanzasComponent {}
