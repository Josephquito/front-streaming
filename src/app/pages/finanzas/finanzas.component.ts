import { Component } from '@angular/core';
import { EgresosFijosComponent } from './egresos-fijos/egresos-fijos.component'; // Ajusta la ruta según tu estructura
import { ComprasInversionComponent } from './compras-inversion/compras-inversion.component';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [EgresosFijosComponent, ComprasInversionComponent], // Asegúrate de incluirlo aquí
  templateUrl: './finanzas.component.html',
})
export class FinanzasComponent {}
