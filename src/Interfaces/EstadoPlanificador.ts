import { DatosProceso } from './DatosProceso';

export interface EstadoPlanificador {
  enCPU: DatosProceso | null;
  listos: DatosProceso[];
  bloqueados: DatosProceso[];
  terminados: DatosProceso[];
}
