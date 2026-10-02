import { Proceso } from '../ProcesosConfig/Proceso';

export interface IPlanificadorCPU {
  encolar(proceso: Proceso): void;
  actualizarBloqueados(): void;
  ejecutarTick(): Proceso | null;
}

