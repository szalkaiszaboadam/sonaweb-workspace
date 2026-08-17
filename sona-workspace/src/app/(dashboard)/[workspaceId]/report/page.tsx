import { Bug, Mail, ExternalLink, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function ReportPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params
  const supportEmail = "tv3adam@gmail.com"

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <Bug className="w-7 h-7 text-primary" />
          Hibabejelentés és Ötletek
        </h1>
        <p className="text-sm text-sona-neutral mt-2">
          Találtál egy hibát, vagy van egy jó ötleted, amivel jobbá tehetnénk a rendszert?
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative z-10">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-3 relative z-10">Írj nekünk közvetlenül!</h2>
        <p className="text-sona-neutral max-w-md leading-relaxed mb-8 relative z-10">
          Jelenleg a hibabejelentéseket és a fejlesztési javaslatokat e-mailben fogadjuk. Kérlek, írd le minél részletesebben a tapasztalt problémát, vagy az új funkció ötletét.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
          <a 
            href={`mailto:${supportEmail}?subject=SONAWEB. Workspace - Hibabejelentés / Ötlet`}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <MessageSquare className="w-5 h-5" />
            E-mail írása
          </a>

        </div>
      </div>

      <div className="mt-4 bg-sona-neutral/5 border border-border rounded-xl p-6 flex items-start gap-4">
        <div className="p-2 bg-background rounded-lg shrink-0">
          <ExternalLink className="w-5 h-5 text-sona-neutral" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground mb-1">Mit érdemes beleírni az e-mailbe?</h3>
          <ul className="text-xs text-sona-neutral space-y-1.5 list-disc list-inside">
            <li>Ha hibát találtál, írd le a lépéseket, ahogy elő tudjuk idézni.</li>
            <li>Készíts képernyőfotót, ha valami furcsán jelenik meg.</li>
            <li>Írd meg, hogy milyen böngészőt (Chrome, Safari, stb.) használsz.</li>
          </ul>
        </div>
      </div>

    </div>
  )
}