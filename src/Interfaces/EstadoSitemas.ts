import { DatosBloque } from './DatosBloque';
import { DatosProceso } from './DatosProceso';
import { Metricas } from './Metricas';

export interface EstadoSistema {
  tick: number;
  enCPU: DatosProceso | null;
  listos: DatosProceso[];
  esperandoMemoria: DatosProceso[];
  bloqueados: DatosProceso[];
  terminados: DatosProceso[];
  mapaMemoria: DatosBloque[];
  metricas: Metricas;
}
