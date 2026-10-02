import { IProcesoConsulta } from './IProcesoConsulta';

export interface IAsignadorMemoria {
  asignar(proceso: IProcesoConsulta): boolean;
  liberar(pid: string): boolean;
}
