export class Turno {
  constructor(id, medicoId, medicoNombre, medicoApellido, especialidad, fecha, horario, reservado = false) {
    this.id = id;
    this.medicoId = medicoId;
    this.medicoNombre = medicoNombre;
    this.medicoApellido = medicoApellido;
    this.especialidad = especialidad;
    this.fecha = fecha;
    this.horario = horario; // ✅ usamos "horario" para mantener coherencia
    this.reservado = reservado;
    this.usuario = null; // hasta que se reserve
  }

  reservar(usuario) {
    this.reservado = true;
    this.usuario = usuario;
  }

  liberar() {
    this.reservado = false;
    this.usuario = null;
  }
}
