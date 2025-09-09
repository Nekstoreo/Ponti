import { PoiItem } from "./types";

export const mockPois: PoiItem[] = [
  {
    id: "poi_lib",
    title: "Biblioteca Central",
    category: "academico",
    x: 30,
    y: 45,
    isOpenNow: true,
    hours: "8:00 - 20:00",
    description: "Centro académico con salas de estudio y préstamo de libros.",
  },
  {
    id: "poi_cafe",
    title: "Café Campus",
    category: "comida",
    x: 55,
    y: 60,
    isOpenNow: true,
    hours: "7:00 - 21:00",
    description: "Cafetería con opciones vegetarianas y café de especialidad.",
  },
  {
    id: "poi_copy",
    title: "Fotocopiado Express",
    category: "servicios",
    x: 70,
    y: 35,
    isOpenNow: false,
    hours: "9:00 - 17:00",
    description: "Impresiones, escaneo y encuadernación.",
  },
  {
    id: "poi_court",
    title: "Cancha Polideportiva",
    category: "bienestar",
    x: 20,
    y: 70,
    description: "Cancha multiuso para actividades deportivas estudiantiles.",
  },
  {
    id: "poi_aud",
    title: "Auditorio Principal",
    category: "cultura",
    x: 80,
    y: 25,
    description: "Eventos culturales, conciertos y ceremonias.",
  },
];


