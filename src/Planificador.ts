import { Proceso } from './ProcesosConfig/Proceso';
import { EstadoProceso } from './ProcesosConfig/EstadoProcesos';
import { EstadoPlanificador } from './Interfaces/EstadoPlanificador';
import { IPlanificadorCPU } from './Interfaces/IPlanificadorCPU';
import { IConsultaPlanificador } from './Interfaces/IConsultaPlanificador';
import { validar } from './validar';

export class Planificador implements IPlanificadorCPU, IConsultaPlanificador {
  private _quantum: number = 0;
  private _listos: Proceso[] = [];
  private _bloqueados: Proceso[] = [];
  private _terminados: Proceso[] = [];
  private _enCPU: Proceso | null = null;
  private _cambiosDeContexto: number = 0;
  private _ticksCpuOcupada: number = 0;

  constructor(quantum: number) {
    validar(Number.isInteger(quantum) && quantum > 0, 'El quantum tiene que ser un entero mayor a 0');
    this._quantum = quantum;
  }

  public encolar(proceso: Proceso): void {
    validar(proceso.getEstado() === EstadoProceso.LISTO, `El proceso ${proceso.getPid()} no está LISTO`);
    validar(!this._listos.includes(proceso), `El proceso ${proceso.getPid()} ya está en la cola`);
    this._listos.push(proceso);
  }

  public actualizarBloqueados(): void {
    const desbloqueados = this._bloqueados.filter((proceso) => proceso.avanzarBloqueo());
    this._bloqueados = this._bloqueados.filter((proceso) => !desbloqueados.includes(proceso));
    this._listos.push(...desbloqueados);
  }

  public ejecutarTick(): Proceso | null {
    this._enCPU = this._enCPU ?? this.despacharSiguiente();
    return this._enCPU === null ? null : this.ejecutar(this._enCPU);
  }

  private despacharSiguiente(): Proceso | null {
    const siguiente = this._listos.shift() ?? null;
    siguiente?.despachar();
    return siguiente;
  }

  private ejecutar(proceso: Proceso): Proceso | null {
    proceso.ejecutarTick();
    this.setTicksCpuOcupada(this.getTicksCpuOcupada() + 1);
    return proceso.haTerminado() ? this.terminar(proceso) : this.seguir(proceso);
  }

  private seguir(proceso: Proceso): null {
    proceso.debeBloquearse() ? this.bloquear(proceso) : this.controlarQuantum(proceso);
    return null;
  }

  private controlarQuantum(proceso: Proceso): void {
    const agotoQuantum = proceso.agotoQuantum(this._quantum);
    const hayOtrosListos = this._listos.length > 0;
    agotoQuantum && hayOtrosListos && this.expulsar(proceso);
    agotoQuantum && !hayOtrosListos && proceso.renovarQuantum();
  }

  private terminar(proceso: Proceso): Proceso {
    proceso.terminar();
    this._terminados.push(proceso);
    this._enCPU = null;
    return proceso;
  }

  private bloquear(proceso: Proceso): void {
    proceso.bloquear();
    this._bloqueados.push(proceso);
    this._enCPU = null;
    this.sumarCambioDeContexto();
  }

  private expulsar(proceso: Proceso): void {
    proceso.expulsar();
    this._listos.push(proceso);
    this._enCPU = null;
    this.sumarCambioDeContexto();
  }

  public getQuantum(): number {
    return this._quantum;
  }

  public getCambiosDeContexto(): number {
    return this._cambiosDeContexto;
  }

  public getTicksCpuOcupada(): number {
    return this._ticksCpuOcupada;
  }

  public obtenerEstado(): EstadoPlanificador {
    return {
      enCPU: this._enCPU?.obtenerDatos() ?? null,
      listos: this._listos.map((proceso) => proceso.obtenerDatos()),
      bloqueados: this._bloqueados.map((proceso) => proceso.obtenerDatos()),
      terminados: this._terminados.map((proceso) => proceso.obtenerDatos()),
    };
  }

  private sumarCambioDeContexto(): void {
    this._cambiosDeContexto = this.getCambiosDeContexto() + 1;
  }

  private setTicksCpuOcupada(valor: number): void {
    this._ticksCpuOcupada = valor;
  }
}
