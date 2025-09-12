"use client";

const places = [
  { id: 1, name: "Templo Universitario Nuestra Señora del Santísimo Sacramento" },
  { id: 2, name: "Aula Magna Mons. Manuel José Sierra" },
  { id: 3, name: "Bloque Rectoral Mons. Tiberio de Jesús Salazar y Herrera" },
  { id: 4, name: "Colegio UPB • Primaria y Preescolar Pbro. Gonzalo Restrepo Villegas" },
  { id: 5, name: "Colegio UPB • Bachillerato" },
  { id: 6, name: "Bloque 6: Escuela de Economía, Administración y Negocios • Escuela de Educación y Pedagogía • Escuela de Teología, Filosofía y Humanidades / Auditorio Pío XII" },
  { id: 7, name: "Bloque 7: Escuela de Ciencias Sociales" },
  { id: 8, name: "Centro de Producción Audiovisual CPA Mons. Alberto Giraldo Jaramillo / Talleres y Laboratorios" },
  { id: 9, name: "Bloque 9: Postgrados Mons. Luis Fernando Rodríguez Velásquez" },
  { id: 10, name: "Bloque 10: Escuela de Arquitectura y Diseño / Auditorio Juan Pablo II / Auditorio Ignacio Vieira Jaramillo" },
  { id: 11, name: "Bloque 11 Edificio Laboratorios Mons. Félix Henao Botero • Centro de Eventos FORUM UPB Mons. Tulio Botero Salazar" },
  { id: 12, name: "Bloque 12: Escuela de Derecho y Ciencias Políticas / Auditorio Guillermo Jaramillo Barrientos" },
  { id: 13, name: "Editorial • Librería • Tienda Universitaria" },
  { id: 14, name: "Bienestar Universitario" },
  { id: 15, name: "Bloque 15: Biblioteca Central Mons. Darío Múnera Vélez" },
  { id: 16, name: "Canchas de fútbol sintéticas • Canchas de tenis Mons. Luis Alfonso Londoño Bernal" },
  { id: 17, name: "Polideportivo UPB Mons. Eugenio Restrepo Uribe / Gimnasio UPB" },
  { id: 18, name: "Bloque de Parqueaderos • Cancha Fundadores" },
  { id: 19, name: "Puestos de Estudio" },
  { id: 24, name: "Asesoría Integral" },
  { id: 50, name: "Centro de Familia • Carrera 73 No. C2-46" },
  { id: 51, name: "Casa de Institutos • Circular 1ª No. 73-30" },
  { id: 52, name: "Circular 1ª No. 73-74: Centro de Conciliación y Arbitraje Darío Velásquez Gaviria • Consultorio Jurídico y Centro de Conciliación Pío XII" },
  { id: 53, name: "Casa de Transferencia • Circular 1ª No. 73-74" },
  { id: 54, name: "Casa Bioingeniería • Circular 1ª No. 73-80" },
  { id: 55, name: "Casa GIA - Grupo de Investigaciones Ambientales" },
];

export default function PlacesList() {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3">Sitios de la Universidad</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {places.map((place) => (
          <div
            key={place.id}
            className="flex items-start gap-3 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
              {place.id}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {place.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
