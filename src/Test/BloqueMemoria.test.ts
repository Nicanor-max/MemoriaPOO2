import { describe, it, expect } from 'vitest';
import { BloqueMemoria } from '../Memoria/BloqueMemoria';

describe('BloqueMemoria', () => {
  it('arranca libre con su inicio y tamaño', () => {
    const bloque = new BloqueMemoria(0, 1024);
    expect(bloque.obtenerDatos()).toEqual({ inicio: 0, tamano: 1024, libre: true, pid: null });
    expect(bloque.getFin()).toBe(1024);
  });
 }