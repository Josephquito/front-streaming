import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import type { Cuenta } from '../services/cuentas.service'; // 👈 reusa el tipo

export type ModoCuenta = 'create' | 'view' | 'edit';

/**
 * Tipo UI: mantiene la forma del backend,
 * pero permite trabajar con plataformaId en la vista.
 */
export type CuentaUI = Partial<Cuenta> & {
  plataformaId?: number | null;
};

@Injectable({ providedIn: 'root' })
export class ModalCuentaService {
  private _open$ = new Subject<{ cuenta: CuentaUI | null; modo: ModoCuenta }>();
  open$ = this._open$.asObservable();

  open(cuenta: CuentaUI | null, modo: ModoCuenta = 'create') {
    this._open$.next({ cuenta, modo });
  }
}
