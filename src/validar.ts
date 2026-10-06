export function validar(condicion: boolean, mensaje: string): void {
  condicion || lanzarError(mensaje);
}

function lanzarError(mensaje: string): never {
  throw new Error(mensaje);
}
// Valida si se cumple una condicion, sino lamza un error 