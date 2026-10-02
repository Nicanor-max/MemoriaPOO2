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


  