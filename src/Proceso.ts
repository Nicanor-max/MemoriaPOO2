import { EstadoProceso } from './EstadoProcesos';
import { EventoES } from './EventoES';
import { DatosProceso } from './Interfaces/DatosProceso';
import { IProcesoConsulta } from './Interfaces/IProcesoConsulta';
import { IProcesoAdmision } from './Interfaces/IProcesoAdmision';
import { IProcesoEjecucion } from './Interfaces/IProcesoEjecucion';

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
}