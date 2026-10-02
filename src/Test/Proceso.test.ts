function procesoEjecutando(cpuTotal: number, evento: EventoES | null = null): Proceso {
  const proceso = new Proceso('P1', 100, cpuTotal, evento);
  proceso.admitir();
  proceso.despachar();
  return proceso;
}

describe('Proceso', () => {
  describe('creación (RF02)', () => {
    it('arranca en NUEVO con sus datos y contadores iniciales', () => {
      const proceso = new Proceso('P1', 200, 4);
      expect(proceso.obtenerDatos()).toEqual({
        pid: 'P1',
        memoriaRequerida: 200,
        cpuTotal: 4,
        cpuRestante: 4,
        quantumConsumido: 0,
        tiempoBloqueoRestante: 0,
        estado: EstadoProceso.NUEVO,
      });
    });

    it('rechaza un PID vacío', () => {
      expect(() => new Proceso('', 100, 3)).toThrow();
    });

    it('rechaza memoria requerida que no sea entero positivo', () => {
      expect(() => new Proceso('P1', 0, 3)).toThrow();
      expect(() => new Proceso('P1', -10, 3)).toThrow();
    });

    it('rechaza tiempo de CPU que no sea entero positivo', () => {
      expect(() => new Proceso('P1', 100, 0)).toThrow();
      expect(() => new Proceso('P1', 100, -1)).toThrow();
    });

    it('rechaza un evento de E/S que se dispararía cuando el proceso ya terminó', () => {
      expect(() => new Proceso('P1', 100, 3, new EventoES(3, 2))).toThrow();
      expect(() => new Proceso('P1', 100, 3, new EventoES(5, 2))).toThrow();
    });

    it('acepta un evento que se dispara antes de terminar', () => {
      expect(() => new Proceso('P1', 100, 3, new EventoES(2, 2))).not.toThrow();
    });
  });

 describe('admisión (RF03)', () => {
    it('NUEVO -> ESPERANDO_MEMORIA -> LISTO', () => {
      const proceso = new Proceso('P1', 100, 3);
      proceso.esperarMemoria();
      expect(proceso.getEstado()).toBe(EstadoProceso.ESPERANDO_MEMORIA);
      proceso.admitir();
      expect(proceso.getEstado()).toBe(EstadoProceso.LISTO);
    });

    it('NUEVO -> LISTO directo si hay memoria', () => {
      const proceso = new Proceso('P1', 100, 3);
      proceso.admitir();
      expect(proceso.getEstado()).toBe(EstadoProceso.LISTO);
    });

    it('no puede despacharse si todavía no fue admitido', () => {
      const proceso = new Proceso('P1', 100, 3);
      expect(() => proceso.despachar()).toThrow();
    });
  });

  describe('ejecución en CPU (RF07)', () => {
    it('cada tick descuenta CPU restante y suma quantum', () => {
      const proceso = procesoEjecutando(3);
      proceso.ejecutarTick();
      expect(proceso.getCpuRestante()).toBe(2);
      expect(proceso.obtenerDatos().quantumConsumido).toBe(1);
    });

    it('no ejecuta si no está en EJECUTANDO', () => {
      const proceso = new Proceso('P1', 100, 3);
      expect(() => proceso.ejecutarTick()).toThrow();
    });

    it('agotoQuantum es true al llegar al límite', () => {
      const proceso = procesoEjecutando(5);
      proceso.ejecutarTick();
      expect(proceso.agotoQuantum(2)).toBe(false);
      proceso.ejecutarTick();
      expect(proceso.agotoQuantum(2)).toBe(true);
    });

    it('renovarQuantum lo pone en 0 y sigue ejecutando', () => {
      const proceso = procesoEjecutando(5);
      proceso.ejecutarTick();
      proceso.ejecutarTick();
      proceso.renovarQuantum();
      expect(proceso.agotoQuantum(2)).toBe(false);
      expect(proceso.getEstado()).toBe(EstadoProceso.EJECUTANDO);
    });

    it('expulsar lo vuelve a LISTO con quantum en 0', () => {
      const proceso = procesoEjecutando(5);
      proceso.ejecutarTick();
      proceso.expulsar();
      expect(proceso.getEstado()).toBe(EstadoProceso.LISTO);
      expect(proceso.obtenerDatos().quantumConsumido).toBe(0);
    });

    it('termina cuando la CPU restante llega a 0', () => {
      const proceso = procesoEjecutando(1);
      proceso.ejecutarTick();
      expect(proceso.haTerminado()).toBe(true);
      proceso.terminar();
      expect(proceso.getEstado()).toBe(EstadoProceso.TERMINADO);
    });

    it('un proceso TERMINADO no puede volver a admitirse ni despacharse', () => {
      const proceso = procesoEjecutando(1);
      proceso.ejecutarTick();
      proceso.terminar();
      expect(() => proceso.admitir()).toThrow();
      expect(() => proceso.despachar()).toThrow();
    });
  });

  