/**
 * Configuracion y TEXTOS del Rank Fest (ritual anual del club).
 *
 * Para la edicion del proximo año basta con cambiar las fechas, el lugar,
 * el cronograma y los chistes aca. La pagina /rankfest y el banner de
 * /ranking leen todo de este archivo.
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
  timeLabel: 'Desde las 14:00. Llegar tarde no se arregla con la máquina del tiempo.',

  venue: {
    name: 'Plaia House',
    address: 'Dragones de la Reina 750',
    commune: 'La Reina, Santiago',
    note: 'A pasos del Pucón, sede espiritual del grupo. Toda disputa que no se resuelva en la fiesta se zanja ahí, con ceviche de por medio.',
    mapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Dragones%20de%20la%20Reina%20750%20La%20Reina',
  },

  warriors: '14 aprox.',
  warriorsNote: 'Los que no inventen una excusa',

  mission: 'Ganar.',
  missionNote: 'Y si pierdes: pucha, qué lata.',

  // ---- Textos de la landing ----
  banner: {
    kicker: 'Ritual anual',
    cta: 'Ver el programa →',
  },
  countdown: {
    label: 'Faltan para el juicio final',
    live: '¡Es hoy! Ya no sirve la máquina del tiempo',
    done: 'Se acabó. A los que perdieron: pucha, qué lata.',
  },
  headline: 'Un día. Una fiesta. Cero excusas.',
  intro:
    'El Rank Fest no es una celebración, es un ritual. Un día al año los guerreros del Rank Batalla dejan la cancha, se juntan en La Reina e invocan al espíritu del ranking para resolver en la mesa lo que no pudieron resolver con el revés. Habrá juegos, asado, rimas, un par de invocaciones y por lo menos tres excusas nuevas para no jugar el lunes.',

  activitiesSubtitle: 'Cinco pruebas. Cero máquinas del tiempo.',
  activities: [
    {
      icon: '🇨🇱',
      name: 'Juegos chilenos',
      description:
        'Tirar la cuerda, carrera en saco y huevo en la cuchara. El mismo nivel de coordinación que muestras en la red, pero con público.',
    },
    {
      icon: '🏓',
      name: 'Torneo ping pong',
      description:
        'Para los que dicen "yo era bueno en el colegio". El que pierde lava los platos y no puede alegar cambio de grip.',
    },
    {
      icon: '🎩',
      name: 'Batalla de pallas huasas',
      description:
        'Rimas sobre tu rival, su grip y su última excusa. Tema obligatorio de la final: la máquina del tiempo.',
    },
    {
      icon: '🔥',
      name: 'Asado',
      description:
        'Carne, vino y la eterna discusión de quién es el Vegeta del ranking (siempre es el que perdió). Ki recargado para la noche.',
    },
    {
      icon: '🎤',
      name: 'Batalla de rap',
      description:
        'Letras afiladas y rimas mortales. Si te quedas sin rima, se anota como walkover.',
    },
  ],

  schedule: [
    {
      time: '14:00 – 14:30',
      name: 'Bienvenida e invocación',
      description: 'Brindis inicial y llamado al espíritu del ranking. El que llega tarde parte con un punto menos en las pallas.',
    },
    {
      time: '14:30 – 16:00',
      name: 'Juegos chilenos',
      description: 'Equipos al azar: Team Goku vs Team Vegeta. Nadie elige, como en la vida.',
    },
    {
      time: '16:00 – 17:30',
      name: 'Torneo ping pong',
      description: 'El camino hacia la copa. Prohibido pedir cambio de grip a mitad del set.',
    },
    {
      time: '17:30 – 18:30',
      name: 'Batalla de pallas huasas',
      description: 'Ingenio, zapateo y bajezas rimadas. Todo lo que se diga aquí queda en el averno.',
    },
    {
      time: '18:30 – 20:30',
      name: 'Asado',
      description: 'Comida, descanso y sesión oficial de "pucha, qué lata" para los que perdieron en la tarde.',
    },
    {
      time: '20:30 – 22:00',
      name: 'Batalla de rap',
      description: 'Rimas, ataques personales y gloria. Se recomienda haber comido bien.',
    },
    {
      time: '22:00 – 02:00',
      name: 'Fiesta y descontrol total',
      description: 'Música, baile, esoterismo de sobremesa y cierre en el Pucón si el cuerpo aguanta.',
    },
  ],

  rulesTitle: 'Reglamento del averno',
  rulesSubtitle: 'Las excusas oficiales del Rank Batalla y cómo se castigan en la fiesta.',
  rules: [
    {
      icon: '🕰️',
      name: 'Máquina del tiempo',
      description:
        'Cada guerrero tiene UN uso al año para atrasar un partido. Usarla en el torneo de ping pong es herejía y se paga lavando los platos.',
    },
    {
      icon: '💩',
      name: 'Ataque de caca',
      description:
        'Excusa válida solo con testigo. Sin testigo, walkover. Con testigo, walkover igual, pero con respeto.',
    },
    {
      icon: '🎾',
      name: 'Cambio de grip',
      description:
        'Si demoras más de cinco minutos, no estás cambiando el grip: estás cargando el Kamehameha. Se cobra punto.',
    },
    {
      icon: '😩',
      name: 'Llegar tarde',
      description:
        'Llegar tarde a un partido se perdona una vez. Llegar tarde al asado no se perdona nunca.',
    },
    {
      icon: '🙏',
      name: 'Pucha, qué lata',
      description:
        'Frase obligatoria al ganarle a un amigo. Debe decirse mirándolo a los ojos, sin sonreír y con la mano en el hombro.',
    },
    {
      icon: '🐉',
      name: 'Las esferas del dragón',
      description:
        'El que junte siete victorias en el año puede pedir un deseo. El admin lo va a ignorar, pero puede pedirlo.',
    },
    {
      icon: '🔮',
      name: 'Mercurio retrógrado',
      description:
        'No es excusa. Nunca ha sido excusa. Deja de mandarlo al grupo.',
    },
    {
      icon: '🐟',
      name: 'Ley del Pucón',
      description:
        'Toda disputa no resuelta se resuelve en el Pucón. El que pierde la discusión paga el pisco sour.',
    },
  ],
} as const

/** true mientras el evento no haya terminado (para mostrar el banner). */
export function isRankFestUpcoming(now: Date = new Date()): boolean {
  return now < new Date(RANKFEST.endsAt)
}
