import { DatosBloque } from './DatosBloque';

export interface IBloqueConsulta {
  getInicio(): number;
  getTamano(): number;
  getFin(): number;
  getPid(): string | null;
  estaLibre(): boolean;
  obtenerDatos(): DatosBloque;
}
