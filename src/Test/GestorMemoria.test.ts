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

    it('la política se cambia sin tocar el gestor (polimorfismo)', () => {
      const conFirst = new GestorMemoria(600, new FirstFit());
      const conBest = new GestorMemoria(600, new BestFit());
      [conFirst, conBest].forEach((gestor) => {
        asignarVarios(gestor, [300, 100, 100]);
        gestor.liberar('P1');
      });
      conFirst.asignar(new Proceso('P9', 100, 5));
      conBest.asignar(new Proceso('P9', 100, 5));
      expect(conFirst.obtenerMapa().find((b) => b.pid === 'P9')?.inicio).toBe(0);
      expect(conBest.obtenerMapa().find((b) => b.pid === 'P9')?.inicio).toBe(500);
    });
  });
  describe('liberación y unión de bloques libres (RF05)', () => {
    it('se une con el vecino libre de la izquierda', () => {
      const gestor = new GestorMemoria(400, new FirstFit());
      asignarVarios(gestor, [100, 100, 100, 100]);
      gestor.liberar('P1');
      gestor.liberar('P2');
      expect(gestor.obtenerMapa()[0]).toEqual({ inicio: 0, tamano: 200, libre: true, pid: null });
    });

    it('se une con el vecino libre de la derecha', () => {
      const gestor = new GestorMemoria(400, new FirstFit());
      asignarVarios(gestor, [100, 100, 100, 100]);
      gestor.liberar('P3');
      gestor.liberar('P2');
      expect(gestor.obtenerMapa()[1]).toEqual({ inicio: 100, tamano: 200, libre: true, pid: null });
    });

    it('se une con los dos vecinos a la vez', () => {
      const gestor = new GestorMemoria(400, new FirstFit());
      asignarVarios(gestor, [100, 100, 100, 100]);
      gestor.liberar('P1');
      gestor.liberar('P3');
      gestor.liberar('P2');
      expect(gestor.obtenerMapa()).toHaveLength(2);
      expect(gestor.obtenerMapa()[0]).toEqual({ inicio: 0, tamano: 300, libre: true, pid: null });
    });
