import { validar } from '../validar';

export class EventoES {
  private _ticksParaDisparar: number = 0;
  private _duracion: number = 0;

  constructor(ticksParaDisparar: number, duracion: number) {
    this.setTicksParaDisparar(ticksParaDisparar);
    this.setDuracion(duracion);
  }

  public getTicksParaDisparar(): number {
    return this._ticksParaDisparar;
  }

  public getDuracion(): number {
    return this._duracion;
  }

  private setTicksParaDisparar(valor: number): void {
    this.validarEnteroPositivo(valor, 'Los ticks para disparar la E/S');
    this._ticksParaDisparar = valor;
  }

  private setDuracion(valor: number): void {
    this.validarEnteroPositivo(valor, 'La duración de la E/S');
    this._duracion = valor;
  }

  private validarEnteroPositivo(valor: number, campo: string): void {
    validar(Number.isInteger(valor) && valor > 0, `${campo} tiene que ser un entero mayor a 0`);
  }
}
