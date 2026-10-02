export function validar(condicion: boolean, mensaje: string): void {
  condicion || lanzarError(mensaje);
}

function lanzarError(mensaje: string): never {
  throw new Error(mensaje);
}
