import { DatosBloque } from '../Interfaces/DatosBloque';
import { IBloqueConsulta } from '../Interfaces/IBloqueConsulta';
import { IBloqueModificacion } from '../Interfaces/IBloqueModificacion';
import { validar } from '../validar';

export class BloqueMemoria implements IBloqueConsulta, IBloqueModificacion {
 
 // encapslacion
  private _inicio: number = 0;
  private _tamano: number = 0;
  private _pid: string | null = null;

  constructor(inicio: number, tamano: number) {
    validar(Number.isInteger(inicio) && inicio >= 0, 'El inicio del bloque no puede ser negativo');
    this._inicio = inicio;
    this.setTamano(tamano);
  }

  public getInicio(): number {
    return this._inicio;
  }

  public getTamano(): number {
    return this._tamano;
  }

  public getFin(): number {
    return this._inicio + this._tamano;
  }

  public getPid(): string | null {
    return this._pid;
  }

  public estaLibre(): boolean {
    return this._pid === null;
  }

  public obtenerDatos(): DatosBloque {
    return { inicio: this._inicio, tamano: this._tamano, libre: this.estaLibre(), pid: this._pid };
  }

  public asignar(pid: string): void {
    validar(this.estaLibre(), `El bloque en ${this._inicio} ya está ocupado`);
    this._pid = pid;
  }

  public liberar(): void {
    this._pid = null;
  }

  public partir(tamanoNecesario: number): BloqueMemoria {
    validar(this.estaLibre(), 'Solo se puede partir un bloque libre');
    validar(tamanoNecesario < this._tamano, 'Para partir tiene que sobrar espacio');
    const sobrante = new BloqueMemoria(this._inicio + tamanoNecesario, this._tamano - tamanoNecesario);
    this.setTamano(tamanoNecesario);
    return sobrante;
  }

  public unirCon(siguiente: BloqueMemoria): void {
    const sePuedenUnir = this.estaLibre() && siguiente.estaLibre() && this.getFin() === siguiente.getInicio();
    validar(sePuedenUnir, 'Solo se pueden unir dos bloques libres y pegados');
    this.setTamano(this._tamano + siguiente.getTamano());
  }

  private setTamano(valor: number): void {
    validar(Number.isInteger(valor) && valor > 0, 'El tamaño del bloque tiene que ser un entero mayor a 0');
    this._tamano = valor;
  }
}
