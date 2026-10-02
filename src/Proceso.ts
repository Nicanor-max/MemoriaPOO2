import { EstadoProceso } from './EstadoProcesos';
import { EventoES } from './EventoES';
import { DatosProceso } from './Interfaces/DatosProceso';
import { IProcesoConsulta } from './Interfaces/IProcesoConsulta';
import { IProcesoAdmision } from './Interfaces/IProcesoAdmision';
import { IProcesoEjecucion } from './Interfaces/IProcesoEjecucion';
import { validar } from './validar';

export class Proceso implements IProcesoConsulta, IProcesoAdmision, IProcesoEjecucion {
  private _pid: string = '';
  private _memoriaRequerida: number = 0;
  private _cpuTotal: number = 0;
  private _cpuRestante: number = 0;
  private _cpuConsumida: number = 0;
  private _quantumConsumido: number = 0;
  private _tiempoBloqueoRestante: number = 0;
  private _estado: EstadoProceso = EstadoProceso.NUEVO;
  private _eventoES: EventoES | null = null;

  constructor(pid: string, memoriaRequerida: number, cpuTotal: number, eventoES: EventoES | null = null) {
    this.setPid(pid);
    this.setMemoriaRequerida(memoriaRequerida);
    this.setCpuTotal(cpuTotal);
    this.setCpuRestante(cpuTotal);
    this.setEventoES(eventoES);
  }

  public getPid(): string {
    return this._pid;
  }

  public getMemoriaRequerida(): number {
    return this._memoriaRequerida;
  }

  public getCpuRestante(): number {
    return this._cpuRestante;
  }

  public getEstado(): EstadoProceso {
    return this._estado;
  }

  public obtenerDatos(): DatosProceso {
    return {
      pid: this._pid,
      memoriaRequerida: this._memoriaRequerida,
      cpuTotal: this._cpuTotal,
      cpuRestante: this._cpuRestante,
      quantumConsumido: this._quantumConsumido,
      tiempoBloqueoRestante: this._tiempoBloqueoRestante,
      estado: this._estado,
    };
  }

  public esperarMemoria(): void {
    this.cambiarEstado([EstadoProceso.NUEVO, EstadoProceso.ESPERANDO_MEMORIA], EstadoProceso.ESPERANDO_MEMORIA);
  }

  public admitir(): void {
    this.cambiarEstado([EstadoProceso.NUEVO, EstadoProceso.ESPERANDO_MEMORIA], EstadoProceso.LISTO);
  }

  public despachar(): void {
    this.cambiarEstado([EstadoProceso.LISTO], EstadoProceso.EJECUTANDO);
    this.setQuantumConsumido(0);
  }

  public ejecutarTick(): void {
    validar(this._estado === EstadoProceso.EJECUTANDO, `El proceso ${this._pid} no está ejecutando`);
    this.setCpuRestante(this.getCpuRestante() - 1);
    this.setCpuConsumida(this.getCpuConsumida() + 1);
    this.setQuantumConsumido(this.getQuantumConsumido() + 1);
  }

  public haTerminado(): boolean {
    return this.getCpuRestante() === 0;
  }

  public agotoQuantum(limite: number): boolean {
    return this.getQuantumConsumido() >= limite;
  }

  public renovarQuantum(): void {
    this.setQuantumConsumido(0);
  }

  public expulsar(): void {
    this.cambiarEstado([EstadoProceso.EJECUTANDO], EstadoProceso.LISTO);
    this.setQuantumConsumido(0);
  }

  public debeBloquearse(): boolean {
    return this._eventoES !== null && !this.haTerminado()
      && this.getCpuConsumida() === this._eventoES.getTicksParaDisparar();
  }

  public bloquear(): void {
    const evento = this.getEventoES();
    this.cambiarEstado([EstadoProceso.EJECUTANDO], EstadoProceso.BLOQUEADO);
    this.setTiempoBloqueoRestante(evento.getDuracion());
    this.setQuantumConsumido(0);
  }

  public avanzarBloqueo(): boolean {
    validar(this._estado === EstadoProceso.BLOQUEADO, `El proceso ${this._pid} no está bloqueado`);
    this.setTiempoBloqueoRestante(this.getTiempoBloqueoRestante() - 1);
    const terminoLaEspera = this.getTiempoBloqueoRestante() === 0;
    this.cambiarEstado([EstadoProceso.BLOQUEADO], terminoLaEspera ? EstadoProceso.LISTO : EstadoProceso.BLOQUEADO);
    return terminoLaEspera;
  }

  public terminar(): void {
    this.cambiarEstado([EstadoProceso.EJECUTANDO], EstadoProceso.TERMINADO);
  }

  private cambiarEstado(permitidos: EstadoProceso[], nuevo: EstadoProceso): void {
    validar(permitidos.includes(this._estado), `No se puede pasar ${this._pid} de ${this._estado} a ${nuevo}`);
    this._estado = nuevo;
  }

  private getEventoES(): EventoES {
    validar(this._eventoES !== null, `El proceso ${this._pid} no tiene un evento de E/S`);
    return this._eventoES as EventoES;
  }

  private getCpuConsumida(): number {
    return this._cpuConsumida;
  }

  private getQuantumConsumido(): number {
    return this._quantumConsumido;
  }

  private getTiempoBloqueoRestante(): number {
    return this._tiempoBloqueoRestante;
  }

  private setPid(valor: string): void {
    validar(valor.trim() !== '', 'El PID no puede estar vacío');
    this._pid = valor;
  }

  private setMemoriaRequerida(valor: number): void {
    validar(this.esEnteroPositivo(valor), 'La memoria requerida tiene que ser un entero mayor a 0');
    this._memoriaRequerida = valor;
  }

  private setCpuTotal(valor: number): void {
    validar(this.esEnteroPositivo(valor), 'El tiempo de CPU tiene que ser un entero mayor a 0');
    this._cpuTotal = valor;
  }

  private setCpuRestante(valor: number): void {
    this._cpuRestante = valor;
  }

  private setCpuConsumida(valor: number): void {
    this._cpuConsumida = valor;
  }

  private setQuantumConsumido(valor: number): void {
    this._quantumConsumido = valor;
  }

  private setTiempoBloqueoRestante(valor: number): void {
    this._tiempoBloqueoRestante = valor;
  }

  private setEventoES(evento: EventoES | null): void {
    const seDisparaATiempo = evento === null || evento.getTicksParaDisparar() < this._cpuTotal;
    validar(seDisparaATiempo, 'La E/S tiene que dispararse antes de que el proceso termine');
    this._eventoES = evento;
  }

  private esEnteroPositivo(valor: number): boolean {
    return Number.isInteger(valor) && valor > 0;
  }
}
