import { EstadoPlanificador } from './EstadoPlanificador';

export interface IConsultaPlanificador {
  getQuantum(): number;
  getCambiosDeContexto(): number;
  getTicksCpuOcupada(): number;
  obtenerEstado(): EstadoPlanificador;
}
