import Link from 'next/link'

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Panel de admin</h2>
      <p className="text-sm text-gray-500 mb-6">
        Configura tu club y gestiona el ranking.
      </p>

      <div className="space-y-3">
        <AdminCard
          href="/admin/club"
          icon="🏢"
          title="Configurar club"
          description="Nombre, regla de desafíos, ventana y cooldown."
        />
        <AdminCard
          href="/admin/jugadores"
          icon="👥"
          title="Jugadores"
          description="Agregar, editar o eliminar miembros del club."
        />
        <AdminCard
          href="/admin/ranking"
          icon="🏅"
          title="Ordenar ranking"
          description="Subir / bajar jugadores para fijar la posición inicial."
        />
      </div>
    </div>
  )
}

function AdminCard({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{description}</p>
        </div>
        <div className="text-gray-400 text-2xl leading-none">›</div>
      </div>
    </Link>
  )
}
