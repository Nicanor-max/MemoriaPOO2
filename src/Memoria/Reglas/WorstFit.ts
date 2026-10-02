import { IBloqueConsulta } from '../../Interfaces/IBloqueConsulta';
import { PoliticaBase } from './PoliticaBase';

export class WorstFit extends PoliticaBase {
  protected elegirEntre(candidatos: IBloqueConsulta[]): IBloqueConsulta {
    return candidatos.reduce((peor, bloque) => (bloque.getTamano() > peor.getTamano() ? bloque : peor));
  }
}
