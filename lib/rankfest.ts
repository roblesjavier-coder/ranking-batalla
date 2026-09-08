/**
 * Configuracion del Rank Fest (celebracion anual del club).
 *
 * Para la edicion del proximo año basta con cambiar las fechas, el lugar y
 * el cronograma aca. La pagina /rankfest y el banner de /ranking leen todo
 * de este archivo.
 */

export const RANKFEST = {
  edition: 2026,
  title: 'Rank Fest',
  subtitle: 'Oficial',
  slogan: 'Por el orden · Por la gloria · Por el infierno',

  /** Inicio del evento (hora de Chile, UTC-3 en septiembre). */
  startsAt: '2026-09-12T14:00:00-03:00',
  /** Hasta cuando se muestra el banner en /ranking (fin de la fiesta). */
  endsAt: '2026-09-13T02:00:00-03:00',

  dateLabel: '12 de septiembre',
  timeLabel: 'Desde las 14:00',

  venue: {
    name: 'Plaia House',
    address: 'Dragones de la Reina 750',
    commune: 'La Reina, Santiago',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Dragones%20de%20la%20Reina%20750%20La%20Reina',
  },

  warriors: '14 aprox.',

  intro:
    'El Rank Fest es mucho mas que una celebracion patria. Es una jornada de competencia, juegos, comida, musica y gloria entre los guerreros del Rank Batalla.',

  activities: [
    {
      icon: '🇨🇱',
      name: 'Juegos chilenos',
      description: 'Tirar la cuerda, carrera de sacos y lanzamiento de huevo.',
    },
    {
      icon: '🏓',
      name: 'Torneo ping pong',
      description: 'Batalla individual por el titulo de campeon. El que pierde, lava los platos.',
    },
    {
      icon: '🎩',
      name: 'Batalla de pallas huasas',
      description: 'Ingenio, tradicion, orgullo y zapateo.',
    },
    {
      icon: '🔥',
      name: 'Asado',
      description: 'Carne, conversacion y gloria.',
    },
    {
      icon: '🎤',
      name: 'Batalla de rap',
      description: 'Letras afiladas y rimas mortales.',
    },
  ],

  schedule: [
    { time: '14:00 – 14:30', name: 'Bienvenida e inauguracion', description: 'Recepcion de guerreros y brindis inicial.' },
    { time: '14:30 – 16:00', name: 'Juegos chilenos', description: 'Equipos, risas y competencia sana.' },
    { time: '16:00 – 17:30', name: 'Torneo ping pong', description: 'El camino hacia la copa.' },
    { time: '17:30 – 18:30', name: 'Batalla de pallas huasas', description: 'Ingenio, humor y tradicion.' },
    { time: '18:30 – 20:30', name: 'Asado', description: 'Comida, descanso y celebracion.' },
    { time: '20:30 – 22:00', name: 'Batalla de rap', description: 'Rimas, ataques y gloria.' },
    { time: '22:00 – 02:00', name: 'Fiesta y descontrol total', description: 'Musica, baile y cierre epico.' },
  ],
} as const

/** true mientras el evento no haya terminado (para mostrar el banner). */
export function isRankFestUpcoming(now: Date = new Date()): boolean {
  return now < new Date(RANKFEST.endsAt)
}
