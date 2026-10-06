import { describe, it, expect } from 'vitest';
import { Simulador } from '../Simulador';
import { FirstFit } from '../Memoria/Reglas/FirstFit';
import { EventoES } from '../ProcesosConfig/EventoES';
import { EstadoProceso } from '../ProcesosConfig/EstadoProcesos';

function nuevoSimulador(memoria = 1024, quantum = 2): Simulador {
  return new Simulador(memoria, quantum, new FirstFit()); //La política se inyecta desde afuera; el gestor depende de la interfaz, no de una clase concreta
}

function correr(simulador: Simulador, ticks: number): string[] {
  const orden: string[] = [];
  for (let i = 0; i < ticks; i++) {
    const antes = simulador.obtenerProcesos();
    simulador.avanzarTick();
    const despues = simulador.obtenerProcesos();
    const ejecutado = despues.find((p, j) => p.cpuRestante < antes[j].cpuRestante);
    orden.push(ejecutado?.pid ?? '-');
  }
  return orden;
}

describe('Simulador', () => {
  describe('configuración (RF01)', () => {
    it('arranca en el tick 0 con la memoria vacía y todo en cero', () => {
      expect(nuevoSimulador().obtenerEstado()).toEqual({
        tick: 0,
        enCPU: null,
        listos: [],
        esperandoMemoria: [],
        bloqueados: [],
        terminados: [],
        mapaMemoria: [{ inicio: 0, tamano: 1024, libre: true, pid: null }],
        metricas: {
          ocupacionMemoria: 0,
          utilizacionCpu: 0,
          cambiosDeContexto: 0,
          memoriaLibreTotal: 1024,
          mayorBloqueLibre: 1024,
          fragmentacionExterna: 0,
        },
      });
    });

    it('rechaza memoria o quantum inválidos', () => {
      expect(() => nuevoSimulador(0, 2)).toThrow();
      expect(() => nuevoSimulador(1024, 0)).toThrow();
    });
  });

  describe('registro de procesos (RF02)', () => {
    it('rechaza un PID repetido', () => {
      const simulador = nuevoSimulador();
      simulador.registrarProceso('P1', 100, 3);
      expect(() => simulador.registrarProceso('P1', 200, 2)).toThrow();
    });

    it('rechaza un proceso que pide más memoria que la total', () => {
      expect(() => nuevoSimulador(1024).registrarProceso('P1', 2000, 3)).toThrow();
    });

    it('los procesos se consultan como copias', () => {
      const simulador = nuevoSimulador();
      simulador.registrarProceso('P1', 100, 3);
      simulador.obtenerProcesos()[0].cpuRestante = 0;
      expect(simulador.obtenerProcesos()[0].cpuRestante).toBe(3);
    });
  });
  describe('admisión (RF03)', () => {
    it('en el primer tick le asigna memoria y lo ejecuta', () => {
      const simulador = nuevoSimulador();
      simulador.registrarProceso('P1', 300, 3);
      simulador.avanzarTick();
      expect(simulador.obtenerEstado().mapaMemoria[0]).toEqual({ inicio: 0, tamano: 300, libre: false, pid: 'P1' });
      expect(simulador.obtenerProcesos()[0].estado).toBe(EstadoProceso.EJECUTANDO);
    });

    it('si no entra queda esperando y no frena a los que sí entran', () => {
      const simulador = nuevoSimulador(1024);
      simulador.registrarProceso('P1', 800, 5);
      simulador.registrarProceso('P2', 400, 5);
      simulador.registrarProceso('P3', 200, 5);
      simulador.avanzarTick();
      const estado = simulador.obtenerEstado();
      expect(estado.esperandoMemoria.map((p) => p.pid)).toEqual(['P2']);
      expect(estado.esperandoMemoria[0].estado).toBe(EstadoProceso.ESPERANDO_MEMORIA);
      expect(estado.listos.map((p) => p.pid)).toEqual(['P3']);
    });

    it('la memoria que se libera al final de un tick se usa en el siguiente', () => {
      const simulador = nuevoSimulador(500);
      simulador.registrarProceso('P1', 500, 1);
      simulador.registrarProceso('P2', 300, 1);
      expect(correr(simulador, 1)).toEqual(['P1']);
      expect(simulador.obtenerEstado().esperandoMemoria.map((p) => p.pid)).toEqual(['P2']);
      expect(correr(simulador, 1)).toEqual(['P2']);
    });
  });

  describe('ciclo completo de ticks (RF06, RF07, RF08, RF09)', () => {
    it('Round Robin con Q=2: P1, P1, P2, P2, P1 y un cambio de contexto', () => {
      const simulador = nuevoSimulador(1024, 2);
      simulador.registrarProceso('P1', 100, 3);
      simulador.registrarProceso('P2', 100, 2);
      expect(correr(simulador, 5)).toEqual(['P1', 'P1', 'P2', 'P2', 'P1']);
      expect(simulador.obtenerMetricas().cambiosDeContexto).toBe(1);
      expect(simulador.obtenerEstado().mapaMemoria).toEqual([{ inicio: 0, tamano: 1024, libre: true, pid: null }]);
    });

    it('el bloqueado conserva su memoria y vuelve a ejecutar en el mismo tick que se desbloquea', () => {
      const simulador = nuevoSimulador();
      simulador.registrarProceso('P1', 200, 3, new EventoES(1, 1));
      expect(correr(simulador, 1)).toEqual(['P1']);
      expect(simulador.obtenerEstado().bloqueados.map((p) => p.pid)).toEqual(['P1']);
      expect(simulador.obtenerEstado().mapaMemoria[0].pid).toBe('P1');
      expect(correr(simulador, 1)).toEqual(['P1']);
    });

    it('calcula la utilización de CPU sobre los ticks transcurridos', () => {
      const simulador = nuevoSimulador();
      simulador.registrarProceso('P1', 100, 2);
      correr(simulador, 4);
      expect(simulador.getTick()).toBe(4);
      expect(simulador.obtenerMetricas().utilizacionCpu).toBe(50);
    });

    it('nunca hay procesos repetidos ni más de uno en CPU', () => {
      const simulador = nuevoSimulador(600, 1);
      simulador.registrarProceso('P1', 300, 3, new EventoES(1, 2));
      simulador.registrarProceso('P2', 300, 2);
      simulador.registrarProceso('P3', 400, 2);
      for (let i = 0; i < 10; i++) {
        simulador.avanzarTick();
        const e = simulador.obtenerEstado();
        const todos = [e.enCPU, ...e.listos, ...e.esperandoMemoria, ...e.bloqueados, ...e.terminados];
        const pids = todos.filter((p) => p !== null).map((p) => p!.pid);
        expect(new Set(pids).size).toBe(pids.length);
      }
      expect(simulador.obtenerEstado().terminados).toHaveLength(3);
    });
  });
});
