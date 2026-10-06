import { describe, it, expect } from 'vitest';
import { BloqueMemoria } from '../Memoria/BloqueMemoria';
import { FirstFit } from '../Memoria/Reglas/FirstFit';
import { BestFit } from '../Memoria/Reglas/BestFit';
import { WorstFit } from '../Memoria/Reglas/WorstFit';

function armarMemoria(): BloqueMemoria[] {
  const tamanos = [200, 100, 100, 100, 300];
  let inicio = 0;
  const bloques = tamanos.map((tamano) => {
    const bloque = new BloqueMemoria(inicio, tamano);
    inicio += tamano;
    return bloque;
  });
  bloques[1].asignar('X');
  bloques[3].asignar('Y');
  return bloques;
}

describe('Políticas de asignación (RF04)', () => {
  it('FirstFit elige el primer bloque libre que alcanza', () => {
    expect(new FirstFit().elegirBloque(armarMemoria(), 100)?.getInicio()).toBe(0);
  });

  it('BestFit elige el bloque libre más chico que alcanza', () => {
    expect(new BestFit().elegirBloque(armarMemoria(), 100)?.getInicio()).toBe(300);
  });

  it('WorstFit elige el bloque libre más grande', () => {
    expect(new WorstFit().elegirBloque(armarMemoria(), 100)?.getInicio()).toBe(500);
  });
//test que nos muestra la L de solid ya que las tres hijas intercambian sin que nada se rompa

  it('si ningún bloque alcanza devuelven null', () => {
    const politicas = [new FirstFit(), new BestFit(), new WorstFit()];
    politicas.forEach((politica) => expect(politica.elegirBloque(armarMemoria(), 400)).toBeNull());
  });

  it('ante un empate eligen la menor dirección', () => {
    const bloques = [new BloqueMemoria(0, 300), new BloqueMemoria(300, 300)];
    expect(new BestFit().elegirBloque(bloques, 100)?.getInicio()).toBe(0);
    expect(new WorstFit().elegirBloque(bloques, 100)?.getInicio()).toBe(0);
  });
});
