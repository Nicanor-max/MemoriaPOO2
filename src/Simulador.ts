export class Simulador implements ISimulador, IConsultaSimulador {
  private _tick: number = 0;
  private _memoria: GestorMemoria;
  private _planificador: Planificador;
  private _procesos: Proceso[] = [];
  private _esperandoMemoria: Proceso[] = [];

  constructor(memoriaTotal: number, quantum: number, politica: IPoliticaMemoria) {
    this._memoria = new GestorMemoria(memoriaTotal, politica);
    this._planificador = new Planificador(quantum);
  }

  public registrarProceso(pid: string, memoria: number, cpu: number, evento: EventoES | null = null): void {
    validar(!this._procesos.some((p) => p.getPid() === pid), `Ya existe un proceso con PID ${pid}`);
    validar(memoria <= this._memoria.getCapacidad(), `El proceso ${pid} pide más memoria que la total`);
    const proceso = new Proceso(pid, memoria, cpu, evento);
    this._procesos.push(proceso);
    this._esperandoMemoria.push(proceso);
  }

  public avanzarTick(): void {
    this.admitirEsperando();
    this._planificador.actualizarBloqueados();
    const terminado = this._planificador.ejecutarTick();
    terminado !== null && this._memoria.liberar(terminado.getPid());
    this.setTick(this.getTick() + 1);
  }

  private admitirEsperando(): void {
    this._esperandoMemoria = this._esperandoMemoria.filter((proceso) => !this.intentarAdmitir(proceso));
  }

  private intentarAdmitir(proceso: Proceso): boolean {
    const entro = this._memoria.asignar(proceso);
    entro ? this.pasarAListos(proceso) : proceso.esperarMemoria();
    return entro;
  }

  private pasarAListos(proceso: Proceso): void {
    proceso.admitir();
    this._planificador.encolar(proceso);
  }

  public getTick(): number {
    return this._tick;
  }

  public obtenerProcesos(): DatosProceso[] {
    return this._procesos.map((proceso) => proceso.obtenerDatos());
  }