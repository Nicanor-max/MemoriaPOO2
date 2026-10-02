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
  }