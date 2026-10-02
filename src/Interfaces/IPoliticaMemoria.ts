import { IBloqueConsulta } from './IBloqueConsulta';

export interface IPoliticaMemoria {
  elegirBloque(bloques: IBloqueConsulta[], tamano: number): IBloqueConsulta | null;
}
