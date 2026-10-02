import { EstadoProceso } from '../ProcesosConfig/EstadoProcesos';
import { DatosProceso } from './DatosProceso';

export interface IProcesoConsulta {
  getPid(): string;
  getMemoriaRequerida(): number;
  getCpuRestante(): number;
  getEstado(): EstadoProceso;
  obtenerDatos(): DatosProceso;
}
