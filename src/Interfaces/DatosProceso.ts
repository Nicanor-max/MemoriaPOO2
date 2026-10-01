import { EstadoProceso } from '../EstadoProcesos';

export interface DatosProceso {
  pid: string;
  memoriaRequerida: number;
  cpuTotal: number;
  cpuRestante: number;
  quantumConsumido: number;
  tiempoBloqueoRestante: number;
  estado: EstadoProceso;
}
