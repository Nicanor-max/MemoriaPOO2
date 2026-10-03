function asignarVarios(gestor: GestorMemoria, tamanos: number[]): void {
  tamanos.forEach((tamano, i) => gestor.asignar(new Proceso(`P${i + 1}`, tamano, 5)));
}

describe('GestorMemoria', () => {
  describe('asignación (RF04)', () => {
    it('arranca con un único bloque libre del tamaño total', () => {
      const gestor = new GestorMemoria(1024, new FirstFit());
      expect(gestor.obtenerMapa()).toEqual([{ inicio: 0, tamano: 1024, libre: true, pid: null }]);
    });

    it('rechaza una memoria total inválida', () => {
      expect(() => new GestorMemoria(0, new FirstFit())).toThrow();
    });

    it('parte el bloque y deja el sobrante libre', () => {
      const gestor = new GestorMemoria(1024, new FirstFit());
      expect(gestor.asignar(new Proceso('P1', 200, 5))).toBe(true);
      expect(gestor.obtenerMapa()).toEqual([
        { inicio: 0, tamano: 200, libre: false, pid: 'P1' },
        { inicio: 200, tamano: 824, libre: true, pid: null },
      ]);
    });

    it('con ajuste exacto no deja bloques de tamaño 0', () => {
      const gestor = new GestorMemoria(300, new FirstFit());
      gestor.asignar(new Proceso('P1', 300, 5));
      expect(gestor.obtenerMapa()).toEqual([{ inicio: 0, tamano: 300, libre: false, pid: 'P1' }]);
    });

    it('falla sin tocar los bloques aunque la suma libre alcance', () => {
      const gestor = new GestorMemoria(400, new FirstFit());
      asignarVarios(gestor, [100, 100, 100, 100]);
      gestor.liberar('P1');
      gestor.liberar('P3');
      const antes = gestor.obtenerMapa();
      expect(gestor.asignar(new Proceso('P9', 200, 5))).toBe(false);
      expect(gestor.obtenerMapa()).toEqual(antes);
    });