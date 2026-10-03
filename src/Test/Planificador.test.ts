import { describe, it, expect } from 'vitest';
import { Planificador } from '../Planificador';
import { Proceso } from '../ProcesosConfig/Proceso';
import { EventoES } from '../ProcesosConfig/EventoES';
import { EstadoProceso } from '../ProcesosConfig/EstadoProcesos';

function procesoListo(pid: string, cpu: number, evento: EventoES | null = null): Proceso {
  const proceso = new Proceso(pid, 100, cpu, evento);
  proceso.admitir();
  return proceso;
}

function correr(planificador: Planificador, procesos: Proceso[], ticks: number): string[] {
  const orden: string[] = [];
  for (let i = 0; i < ticks; i++) {
    const antes = procesos.map((p) => p.getCpuRestante());
    planificador.actualizarBloqueados();
    planificador.ejecutarTick();
    const ejecutado = procesos.find((p, j) => p.getCpuRestante() < antes[j]);
    orden.push(ejecutado?.getPid() ?? '-');
  }
  return orden;
}

describe('Planificador', () => {
  describe('configuración y cola', () => {
    it('arranca vacío y con los contadores en 0', () => {
      const planificador = new Planificador(2);
      expect(planificador.obtenerEstado()).toEqual({ enCPU: null, listos: [], bloqueados: [], terminados: [] });
      expect(planificador.getCambiosDeContexto()).toBe(0);
      expect(planificador.getTicksCpuOcupada()).toBe(0);
    });

    it('rechaza un quantum inválido', () => {
      expect(() => new Planificador(0)).toThrow();
    });

    it('solo encola procesos LISTOS y sin repetir', () => {
      const planificador = new Planificador(2);
      expect(() => planificador.encolar(new Proceso('P1', 100, 3))).toThrow();
      const proceso = procesoListo('P2', 3);
      planificador.encolar(proceso);
      expect(() => planificador.encolar(proceso)).toThrow();
    });
  });
  describe('Round Robin (RF07)', () => {
    it('Q=2, P1 con CPU 3 y P2 con CPU 2: P1, P1, P2, P2, P1', () => {
      const planificador = new Planificador(2);
      const procesos = [procesoListo('P1', 3), procesoListo('P2', 2)];
      procesos.forEach((p) => planificador.encolar(p));
      expect(correr(planificador, procesos, 5)).toEqual(['P1', 'P1', 'P2', 'P2', 'P1']);
      expect(planificador.getCambiosDeContexto()).toBe(1);
      expect(planificador.obtenerEstado().terminados.map((p) => p.pid)).toEqual(['P2', 'P1']);
    });

    it('un proceso solo renueva el quantum sin cambio de contexto', () => {
      const planificador = new Planificador(2);
      const procesos = [procesoListo('P1', 5)];
      planificador.encolar(procesos[0]);
      expect(correr(planificador, procesos, 5)).toEqual(['P1', 'P1', 'P1', 'P1', 'P1']);
      expect(planificador.getCambiosDeContexto()).toBe(0);
    });

    it('si termina justo al agotar el quantum no vuelve a la cola', () => {
      const planificador = new Planificador(2);
      const procesos = [procesoListo('P1', 2), procesoListo('P2', 2)];
      procesos.forEach((p) => planificador.encolar(p));
      expect(correr(planificador, procesos, 4)).toEqual(['P1', 'P1', 'P2', 'P2']);
      expect(planificador.getCambiosDeContexto()).toBe(0);
      expect(procesos[0].getEstado()).toBe(EstadoProceso.TERMINADO);
    });

    it('con la cola vacía no ejecuta nada ni cuenta CPU ocupada', () => {
      const planificador = new Planificador(2);
      expect(planificador.ejecutarTick()).toBeNull();
      expect(planificador.getTicksCpuOcupada()).toBe(0);
    });
  });

  describe('Entrada/Salida (RF08)', () => {
    it('se bloquea, no usa CPU mientras espera y vuelve al final de listos', () => {
      const planificador = new Planificador(2);
      const procesos = [procesoListo('P1', 4, new EventoES(1, 2)), procesoListo('P2', 3)];
      procesos.forEach((p) => planificador.encolar(p));
      expect(correr(planificador, procesos, 1)).toEqual(['P1']);
      expect(planificador.obtenerEstado().bloqueados.map((p) => p.pid)).toEqual(['P1']);
      expect(correr(planificador, procesos, 3)).toEqual(['P2', 'P2', 'P1']);
      expect(planificador.getCambiosDeContexto()).toBe(2);
    });

    it('el bloqueo tiene prioridad sobre el fin del quantum', () => {
      const planificador = new Planificador(1);
      const procesos = [procesoListo('P1', 3, new EventoES(1, 1)), procesoListo('P2', 3)];
      procesos.forEach((p) => planificador.encolar(p));
      correr(planificador, procesos, 1);
      expect(procesos[0].getEstado()).toBe(EstadoProceso.BLOQUEADO);
      expect(planificador.obtenerEstado().listos.map((p) => p.pid)).toEqual(['P2']);
    });

    it('cuenta los ticks con CPU ocupada', () => {
      const planificador = new Planificador(2);
      const procesos = [procesoListo('P1', 2)];
      planificador.encolar(procesos[0]);
      correr(planificador, procesos, 4);
      expect(planificador.getTicksCpuOcupada()).toBe(2);
    });
  });


  it('devuelve el quantum configurado', () => {
  const planificador = new Planificador(2);

  expect(planificador.getQuantum()).toBe(2);
});

});
