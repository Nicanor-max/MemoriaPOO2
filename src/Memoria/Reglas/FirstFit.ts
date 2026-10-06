import { IBloqueConsulta } from '../../Interfaces/IBloqueConsulta';
import { PoliticaBase } from './PoliticaBase';

//herencia

export class FirstFit extends PoliticaBase {
  protected elegirEntre(candidatos: IBloqueConsulta[]): IBloqueConsulta {
    return candidatos[0];
  }
}
