document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("listaMedicos");

 
  const fmtPeso = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });


  async function loadJSON(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(path + " no encontrado");
      return await res.json();
    } catch (e) {
      console.warn("Error cargando", path, e);
      return [];
    }
  }

  let medicos = JSON.parse(localStorage.getItem("medicos")) || [];
  let especialidades = JSON.parse(localStorage.getItem("especialidades")) || [];
  let obrasSociales = JSON.parse(localStorage.getItem("obrasSociales")) || [];

  if (!medicos.length || !especialidades.length || !obrasSociales.length) {
    try {
      const [m, e, o] = await Promise.all([
        medicos.length ? medicos : loadJSON("data/medicos.json"),
        especialidades.length ? especialidades : loadJSON("data/especialidades.json"),
        obrasSociales.length ? obrasSociales : loadJSON("data/obrasSociales.json"),
      ]);
      medicos = m;
      especialidades = e;
      obrasSociales = o;

      localStorage.setItem("medicos", JSON.stringify(medicos));
      localStorage.setItem("especialidades", JSON.stringify(especialidades));
      localStorage.setItem("obrasSociales", JSON.stringify(obrasSociales));
    } catch (err) {
      console.error("Error al cargar datos:", err);
      contenedor.innerHTML =
        "<p class='text-center text-danger'>No se pudieron cargar los datos.</p>";
      return;
    }
  }


  const medicosLocales = JSON.parse(localStorage.getItem("medicos")) || [];
  const porId = new Map(medicos.map(m => [m.id, m]));
  medicosLocales.forEach(m => {
    if (!porId.has(m.id)) porId.set(m.id, m);
  });
  medicos = Array.from(porId.values());


  const mapEsp = Object.fromEntries(especialidades.map(e => [e.id, e.nombre]));
  const mapObra = Object.fromEntries(obrasSociales.map(o => [o.id, o.nombre]));


  render();

  function render() {
    contenedor.innerHTML = "";
    if (!medicos.length) {
      contenedor.innerHTML =
        "<p class='text-center text-muted'>No hay médicos registrados todavía.</p>";
      return;
    }

    medicos.forEach(med => {
      const nombreCompleto =
        med.nombreCompleto ||
        [med.nombre, med.apellido].filter(Boolean).join(" ") ||
        "Sin nombre";

  
      let especialidadTxt = "Sin asignar";
      if (med.especialidad !== undefined && med.especialidad !== null && med.especialidad !== "") {
        const num = Number(med.especialidad);
        especialidadTxt = !Number.isNaN(num) && mapEsp[num]
          ? mapEsp[num]
          : String(med.especialidad);
      }

     
      let obrasTxt = "Sin cobertura";
      if (Array.isArray(med.obrasSociales) && med.obrasSociales.length) {
        const nombres = med.obrasSociales.map(o => {
          const n = Number(o);
          return !Number.isNaN(n) && mapObra[n] ? mapObra[n] : String(o);
        });
        obrasTxt = nombres.join(", ");
      } else if (med.obraSocial) {
        const n = Number(med.obraSocial);
        obrasTxt = !Number.isNaN(n) && mapObra[n] ? mapObra[n] : String(med.obraSocial);
      } else if (med.obrasocial) {
      
        const n = Number(med.obrasocial);
        obrasTxt = !Number.isNaN(n) && mapObra[n] ? mapObra[n] : String(med.obrasocial);
      }

  
      let imgSrc = "img/default-doctor.png";
      const foto = med.fotografia || med.imagen || "";
      if (foto) {
        imgSrc = foto.startsWith("data:image") ? foto : foto.replace("../", "");
      }

     
      const matricula = med.matriculaProfesional ?? med.matricula ?? "—";

    
      const descripcion = med.descripcion || "—";

  
      const valor = med.valorConsulta != null ? fmtPeso.format(med.valorConsulta) : "—";

    
      const telefono = med.telefono || "—";
      const email = med.email || "—";

      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";

      col.innerHTML = `
        <div class="card h-100 text-center shadow-sm border-0">
          <img src="${imgSrc}" class="card-img-top" alt="${nombreCompleto}" style="height:250px; object-fit:cover;">
          <div class="card-body">
            <h5 class="card-title">${nombreCompleto}</h5>

            <p class="mb-1"><strong>Matrícula profesional:</strong> ${matricula}</p>
            <p class="mb-1"><strong>Especialidad:</strong> ${especialidadTxt}</p>
            <p class="mb-1"><strong>Descripción:</strong> ${descripcion}</p>
            <p class="mb-1"><strong>Obras Sociales:</strong> ${obrasTxt}</p>
            <p class="mb-1"><strong>Valor de consulta:</strong> ${valor}</p>
          </div>
        </div>
      `;

      contenedor.appendChild(col);
    });
  }
});
