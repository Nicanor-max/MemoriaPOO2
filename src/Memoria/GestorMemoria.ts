import { BloqueMemoria } from './BloqueMemoria';
import { DatosBloque } from '../Interfaces/DatosBloque';
import { MetricasMemoria } from '../Interfaces/MetricasMemoria';
import { IAsignadorMemoria } from '../Interfaces/IAsignadorMemoria';
import { IConsultaMemoria } from '../Interfaces/IConsultaMemoria';
import { IPoliticaMemoria } from '../Interfaces/IPoliticaMemoria';
import { IProcesoConsulta } from '../Interfaces/IProcesoConsulta';
import { validar } from '../validar';

export class GestorMemoria implements IAsignadorMemoria, IConsultaMemoria {
  private _capacidad: number = 0;
  private _bloques: BloqueMemoria[] = [];
  private _politica: IPoliticaMemoria;

  constructor(capacidad: number, politica: IPoliticaMemoria) {
    validar(Number.isInteger(capacidad) && capacidad > 0, 'La memoria total tiene que ser un entero mayor a 0');
    this._capacidad = capacidad;
    this._politica = politica;
    this._bloques = [new BloqueMemoria(0, capacidad)];
  }

  public asignar(proceso: IProcesoConsulta): boolean {
    const elegido = this._politica.elegirBloque(this._bloques, proceso.getMemoriaRequerida());
    return elegido === null ? false : this.ocupar(elegido as BloqueMemoria, proceso);
  }

  private ocupar(bloque: BloqueMemoria, proceso: IProcesoConsulta): boolean {
    const sobraEspacio = bloque.getTamano() > proceso.getMemoriaRequerida();
    const partes = sobraEspacio ? [bloque, bloque.partir(proceso.getMemoriaRequerida())] : [bloque];
    this._bloques.splice(this._bloques.indexOf(bloque), 1, ...partes);
    bloque.asignar(proceso.getPid());
    return true;
  }

  public liberar(pid: string): boolean {
    const bloque = this._bloques.find((b) => b.getPid() === pid);
    bloque?.liberar();
    this.unirLibres();
    return bloque !== undefined;
  }

  public getCapacidad(): number {
    return this._capacidad;
  }

  public obtenerMapa(): DatosBloque[] {
    return this._bloques.map((bloque) => bloque.obtenerDatos());
  }