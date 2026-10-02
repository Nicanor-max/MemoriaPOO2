import { describe, it, expect } from 'vitest';
import { BloqueMemoria } from '../Memoria/BloqueMemoria';

describe('BloqueMemoria', () => {
  it('arranca libre con su inicio y tamaño', () => {
    const bloque = new BloqueMemoria(0, 1024);
    expect(bloque.obtenerDatos()).toEqual({ inicio: 0, tamano: 1024, libre: true, pid: null });
    expect(bloque.getFin()).toBe(1024);
  });

  it('rechaza tamaño 0 o inicio negativo', () => {
    expect(() => new BloqueMemoria(0, 0)).toThrow();
    expect(() => new BloqueMemoria(-10, 100)).toThrow();
  });

  it('se asigna a un proceso y se vuelve a liberar', () => {
    const bloque = new BloqueMemoria(0, 200);
    bloque.asignar('P1');
    expect(bloque.estaLibre()).toBe(false);
    expect(bloque.getPid()).toBe('P1');
    bloque.liberar();
    expect(bloque.estaLibre()).toBe(true);
  });

  it('no se puede asignar un bloque ocupado', () => {
    const bloque = new BloqueMemoria(0, 200);
    bloque.asignar('P1');
    expect(() => bloque.asignar('P2')).toThrow();
  });

  it('partir deja el tamaño pedido y devuelve el sobrante (RF04)', () => {
    const bloque = new BloqueMemoria(0, 1024);
    const sobrante = bloque.partir(300);
    expect(bloque.obtenerDatos()).toEqual({ inicio: 0, tamano: 300, libre: true, pid: null });
    expect(sobrante.obtenerDatos()).toEqual({ inicio: 300, tamano: 724, libre: true, pid: null });
  });

  it('no parte si no sobra espacio', () => {
    const bloque = new BloqueMemoria(0, 300);
    expect(() => bloque.partir(300)).toThrow();
  });

  it('se une con el bloque libre que le sigue (RF05)', () => {
    const bloque = new BloqueMemoria(0, 300);
    bloque.unirCon(new BloqueMemoria(300, 200));
    expect(bloque.getTamano()).toBe(500);
  });

  it('no se une si el otro está ocupado o no están pegados', () => {
    const bloque = new BloqueMemoria(0, 300);
    const ocupado = new BloqueMemoria(300, 200);
    ocupado.asignar('P1');
    expect(() => bloque.unirCon(ocupado)).toThrow();
    expect(() => bloque.unirCon(new BloqueMemoria(600, 100))).toThrow();
  });
});
