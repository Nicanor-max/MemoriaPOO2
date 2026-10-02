import { BloqueMemoria } from '../Memoria/BloqueMemoria';

export interface IBloqueModificacion {
  asignar(pid: string): void;
  liberar(): void;
  partir(tamanoNecesario: number): BloqueMemoria;
  unirCon(siguiente: BloqueMemoria): void;
}