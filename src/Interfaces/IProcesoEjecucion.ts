export interface IProcesoEjecucion {
  despachar(): void;
  ejecutarTick(): void;
  haTerminado(): boolean;
  agotoQuantum(limite: number): boolean;
  renovarQuantum(): void;
  expulsar(): void;
  debeBloquearse(): boolean;
  bloquear(): void;
  avanzarBloqueo(): boolean;
  terminar(): void;
}
