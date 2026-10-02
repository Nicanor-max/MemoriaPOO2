import { IBloqueConsulta } from '../../Interfaces/IBloqueConsulta';
import { PoliticaBase } from './PoliticaBase';

export class BestFit extends PoliticaBase {
  protected elegirEntre(candidatos: IBloqueConsulta[]): IBloqueConsulta {
    return candidatos.reduce((mejor, bloque) => (bloque.getTamano() < mejor.getTamano() ? bloque : mejor));
  }
}
