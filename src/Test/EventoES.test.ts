import { describe, it, expect } from 'vitest';
import { EventoES } from '../ProcesosConfig/EventoES';

describe('EventoES', () => {
  it('guarda los ticks para disparar y la duración', () => {
    const evento = new EventoES(2, 3);
    expect(evento.getTicksParaDisparar()).toBe(2);
    expect(evento.getDuracion()).toBe(3);
  });

  it('acepta el mínimo válido (1 y 1)', () => {
    const evento = new EventoES(1, 1);
    expect(evento.getTicksParaDisparar()).toBe(1);
    expect(evento.getDuracion()).toBe(1);
  });

  it('rechaza ticksCpuParaDisparar en 0', () => {
    expect(() => new EventoES(0, 3)).toThrow();
  });

  it('rechaza ticksCpuParaDisparar negativo', () => {
    expect(() => new EventoES(-1, 3)).toThrow();
  });

  it('rechaza duración en 0', () => {
    expect(() => new EventoES(2, 0)).toThrow();
  });

  it('rechaza duración negativa', () => {
    expect(() => new EventoES(2, -1)).toThrow();
  });

  it('rechaza valores con decimales', () => {
    expect(() => new EventoES(1.5, 3)).toThrow();
    expect(() => new EventoES(2, 2.5)).toThrow();
  });
});