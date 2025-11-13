export class Turno {
  constructor(
    id,
    medicoId,
    medicoNombre,
    medicoApellido,
    especialidad,
    fecha,
    horario,
    reservado = false
  ) {
    this.id = id;
    this.medicoId = medicoId;
    this.medicoNombre = medicoNombre;
    this.medicoApellido = medicoApellido;
    this.especialidad = especialidad;
    this.fecha = fecha;
    this.horario = horario;
    this.reservado = reservado;
    this.usuario = null;
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
