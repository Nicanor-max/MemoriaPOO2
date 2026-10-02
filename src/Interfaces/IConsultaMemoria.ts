import { DatosBloque } from './DatosBloque';
import { MetricasMemoria } from './MetricasMemoria';

export interface IConsultaMemoria {
  getCapacidad(): number;
  obtenerMapa(): DatosBloque[];
  obtenerMetricas(): MetricasMemoria;
}
