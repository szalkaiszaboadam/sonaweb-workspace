export default async function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Áttekintés</h1>
        <p className="text-sm text-sona-neutral mt-1">
          A munkaterület legfontosabb statisztikái és frissítései.
        </p>
      </div>

      <div className="bg-surface border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <h3 className="text-lg font-medium text-foreground mb-2">Hamarosan érkezik</h3>
        <p className="text-sona-neutral max-w-sm">
          Ide fognak kerülni a legfrissebb feladatok, a folyamatban lévő projektek és az időkövetés összesítése.
        </p>
      </div>
    </div>
  )
}