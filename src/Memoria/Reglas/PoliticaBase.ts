import { IBloqueConsulta } from '../../Interfaces/IBloqueConsulta';
import { IPoliticaMemoria } from '../../Interfaces/IPoliticaMemoria';

export abstract class PoliticaBase implements IPoliticaMemoria {
  public elegirBloque(bloques: IBloqueConsulta[], tamano: number): IBloqueConsulta | null {
    const candidatos = bloques.filter((bloque) => bloque.estaLibre() && bloque.getTamano() >= tamano);
    return candidatos.length === 0 ? null : this.elegirEntre(candidatos);
  }

  protected abstract elegirEntre(candidatos: IBloqueConsulta[]): IBloqueConsulta;
}
