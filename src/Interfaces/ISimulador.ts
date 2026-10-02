import { EventoES } from '../ProcesosConfig/EventoES';

export interface ISimulador {
  registrarProceso(pid: string, memoria: number, cpu: number, evento?: EventoES): void;
  avanzarTick(): void;
}
