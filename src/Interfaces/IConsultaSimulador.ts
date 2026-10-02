import { DatosProceso } from './DatosProceso';
import { EstadoSistema } from './EstadoSitemas';
import { Metricas } from './Metricas';

export interface IConsultaSimulador {
  getTick(): number;
  obtenerProcesos(): DatosProceso[];
  obtenerMetricas(): Metricas;
  obtenerEstado(): EstadoSistema;
}
