import { LifeBuoy, Book, Shield, FolderKanban, Clock, Mail, MessageSquare, Layers, Lock, Users, AlertCircle, FileText, CheckSquare, Search, Bell, MonitorPlay, Zap, ArrowRight, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function HelpPage({
  params
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = await params

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-10 animate-in fade-in duration-500 pb-12">
      
      {/* FEJLÉC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-primary/5 via-surface to-background border border-primary/20 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-3 mb-4">
            <LifeBuoy className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            Tudásbázis és Súgó
          </h1>
          <p className="text-sona-neutral text-base sm:text-lg leading-relaxed">
            Üdvözlünk a Sonaweb hivatalos tudásbázisában! Itt mindent megtalálsz, amire szükséged lehet: a rendszer alapjaitól kezdve a haladó jogosultság-kezelésig és a mindennapi munkafolyamatok optimalizálásáig.
          </p>
        </div>
        <div className="relative z-10 shrink-0 flex flex-col gap-3">
          <Link href={`/${workspaceId}/report`} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95">
            <MessageSquare className="w-4 h-4" /> Hibabejelentés
          </Link>
          <a href="mailto:tv3adam@gmail.com" className="inline-flex items-center justify-center gap-2 bg-background border border-border text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-sona-neutral/10 transition-colors shadow-sm">
             <Mail className="w-4 h-4" /> Írj nekünk
          </a>
        </div>
      </div>

      {/* TARTALOMJEGYZÉK */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
         <a href="#alapok" className="p-3 bg-surface border border-border rounded-xl text-center font-semibold text-sona-neutral hover:text-primary hover:border-primary/50 transition-colors">1. Alapok</a>
         <a href="#jogosultsagok" className="p-3 bg-surface border border-border rounded-xl text-center font-semibold text-sona-neutral hover:text-primary hover:border-primary/50 transition-colors">2. Jogosultságok</a>
         <a href="#modulok" className="p-3 bg-surface border border-border rounded-xl text-center font-semibold text-sona-neutral hover:text-primary hover:border-primary/50 transition-colors">3. Modulok</a>
         <a href="#gyik" className="p-3 bg-surface border border-border rounded-xl text-center font-semibold text-sona-neutral hover:text-primary hover:border-primary/50 transition-colors">4. GYIK</a>
      </div>

      {/* 1. SZEKCIÓ: A RENDSZER ALAPJAI */}
      <section id="alapok" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-3 border-b border-border pb-3 mb-2">
          <Layers className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">1. A Rendszer Felépítése és Alapfogalmak</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Globe2Icon className="w-5 h-5 text-sona-neutral" />
              Munkaterület (Workspace)
            </h3>
            <div className="space-y-3 text-sm text-sona-neutral leading-relaxed">
                <p>A Munkaterület a legfelső szint a hierarchiában. Tekints rá úgy, mint a <strong>céged virtuális irodájára</strong>. Minden projekt, feladat és munkatárs ehhez a területhez tartozik.</p>
                <p>Jellemzők:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Egy felhasználó (e-mail cím) több Munkaterületnek is tagja lehet.</li>
                    <li>A bal felső sarokban lévő menüvel tudsz váltani a Munkaterületek között.</li>
                    <li>A Munkaterület szintű beállítások (név, tagok, szerepkörök) a bal alsó sarokban (Beállítások) érhetők el.</li>
                </ul>
            </div>
          </div>
          
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-sona-neutral" />
              Projektek (Projects)
            </h3>
            <div className="space-y-3 text-sm text-sona-neutral leading-relaxed">
                <p>A Projektek a Munkaterületen belüli, konkrét <strong>munkák, ügyfelek vagy részlegek</strong>. Minden érdemi munka (feladatok, dokumentumok, időmérés) egy projekten belül zajlik.</p>
                <p>Láthatóság és Hozzáférés:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Publikus Projekt:</strong> A Munkaterület minden tagja automatikusan látja és hozzáfér (szerepkörétől függően).</li>
                    <li><strong>Privát Projekt:</strong> Csak azok a tagok látják, akiket a projekt beállításaiban (Hozzáférés fül) kifejezetten hozzáadtak. Kiváló ügyfélprojektekhez vagy szenzitív munkákhoz.</li>
                </ul>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm mt-2">
           <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-sona-neutral" />
              Navigáció a Sonaweb-ben
            </h3>
            <p className="text-sm text-sona-neutral leading-relaxed mb-4">A rendszer felülete két fő részre oszlik a hatékonyság érdekében:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-background border border-border rounded-xl">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> Globális Nézetek (Felső Menü / Dashboard)</h4>
                    <p className="text-xs text-sona-neutral">Amikor a bal oldali menü felső részére kattintasz (Áttekintés, Feladatok, Időkövetés), akkor az <strong>összes projekted adatát látod egyben</strong>. Ezek az úgynevezett összesített vagy globális nézetek.</p>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> Projekt Nézetek (Projektek lista)</h4>
                    <p className="text-xs text-sona-neutral">Ha kiválasztasz egy konkrét projektet a listából, a menü átvált. Innentől kezdve a Feladatok, Dokumentumok és Időkövetés fülek <strong>kizárólag az adott projekt</strong> adatait mutatják.</p>
                </div>
            </div>
        </div>
      </section>

      {/* 2. SZEKCIÓ: JOGOSULTSÁGOK (RBAC) - RÉSZLETES MAGYARÁZAT */}
      <section id="jogosultsagok" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-3 border-b border-border pb-3 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">2. Jogosultságok és Szerepkörök (RBAC)</h2>
        </div>
        
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 bg-sona-neutral/5 border-b border-border">
            <p className="text-sm text-foreground font-medium leading-relaxed">
              A rendszer egy fejlett, négy rétegű <strong>Szerepkör-alapú Hozzáférés-kezelési (RBAC)</strong> rendszert használ. Ennek lényege, hogy mindenki csak ahhoz férjen hozzá, amire valóban szüksége van. <br/><br/>
              <strong>Alapszabály:</strong> Ha valahol egy <Lock className="w-4 h-4 inline-block mx-1 text-sona-neutral/70" /> <strong>Lakat ikont</strong> látsz, vagy egy gomb elszürkült (nem kattintható), az azt jelenti, hogy az adott műveletre a jelenlegi szerepköröd nem ad engedélyt. A rendszer kliens és szerver (adatbázis) oldalon is szigorúan ellenőrzi ezt.
            </p>
          </div>
          
          <div className="divide-y divide-border">
            <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-start">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl shrink-0"><AlertCircle className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-foreground mb-1">A Tulajdonos (Owner) - "Isteni" mód</h3>
                <p className="text-sm text-sona-neutral leading-relaxed mb-3">
                  Aki létrehozta a munkaterületet, ő automatikusan Tulajdonos lesz. Neki korlátlan joga van mindenhez, rábírál a rendszer minden szabályára.
                </p>
                <ul className="text-xs text-sona-neutral list-disc pl-5 space-y-1">
                    <li>Láthat, szerkeszthet és törölhet bármilyen feladatot, dokumentumot vagy időt (akkor is, ha más hozta létre).</li>
                    <li>Kizárólag ő törölheti véglegesen magát a Munkaterületet.</li>
                    <li>Kezelheti a többi tulajdonos státuszát (kinevezhet mást is Tulajdonossá).</li>
                </ul>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-start">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl shrink-0"><Users className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Alap Tagok (Members) - Biztonságos napi munka</h3>
                <p className="text-sm text-sona-neutral leading-relaxed mb-3">
                  Ha meghívnak valakit, alapértelmezetten "Tag" lesz. Egy Tag egy teljesen használható fiókot kap, amivel el tudja végezni a napi munkáját, de nem tud kárt tenni másokéban.
                </p>
                 <ul className="text-xs text-sona-neutral list-disc pl-5 space-y-1">
                    <li><strong>Amit tud:</strong> Projekt feladatainak megtekintése, <i>saját</i> feladatok létrehozása/szerkesztése, dokumentumok írása, <i>saját</i> munkaidő rögzítése és módosítása.</li>
                    <li><strong>Amit NEM tud:</strong> Mások feladatait törölni, mások dokumentumait átírni, mások munkaidejét megnézni (az időkövetőben csak a sajátját látja), új projekteket létrehozni, vagy a beállításokhoz hozzáférni.</li>
                </ul>
              </div>
            </div>

            <div className="p-6 flex flex-col sm:flex-row gap-4 sm:items-start">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl shrink-0"><Shield className="w-6 h-6" /></div>
              <div>
                <h3 className="font-bold text-foreground mb-1">Szerepkörök és Egyedi Jogok (Overrides)</h3>
                <p className="text-sm text-sona-neutral leading-relaxed mb-3">
                  A Munkaterület beállításaiban (ha van hozzá jogod) létrehozhatsz <strong>Szerepköröket</strong> (pl. "Projekt Menedzser", "Könyvelő"). Ezekhez a szerepkörökhöz különböző "Extra Jogokat" rendelhetsz (pl. <i>Projekt létrehozása</i>, <i>Mások idejének megtekintése</i>). 
                </p>
                <p className="text-sm text-sona-neutral leading-relaxed">
                  Ha egy Tagnak nem akarsz egy egész szerepkört adni, csak egyetlen extra képességet (pl. hogy szerkeszthesse a feladatokat), a Csapat menüben a tag neve mellett adhatsz neki <strong>Egyedi Extra Jogokat</strong> is. Ha a tag megkapja a jogot, a felületen azonnal lekerülnek a lakatok.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SZEKCIÓ: MODULOK RÉSZLETESEN */}
      <section id="modulok" className="flex flex-col gap-4 scroll-mt-24">
         <div className="flex items-center gap-3 border-b border-border pb-3 mb-2">
          <MonitorPlay className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">3. A Modulok működése (Napi használat)</h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
            
            {/* FELADATOK */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-sona-neutral" />
                Feladatok (Kanban tábla)
                </h3>
                <div className="space-y-3 text-sm text-sona-neutral leading-relaxed">
                    <p>A feladatkezelő egy drag-and-drop (húzd és ejtsd) Kanban tábla. A feladatokat szabadon mozgathatod az oszlopok (Tennivalók, Folyamatban, Ellenőrzésre vár, Kész) között.</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Kattints egy feladatra a részletes nézet (Modal) megnyitásához.</li>
                        <li>Itt beállíthatsz felelőst, határidőt (due date), prioritást és becsült időt.</li>
                        <li>A feladatokhoz <strong>Alsófeladatokat (Subtasks)</strong> is rendelhetsz a finomabb bontáshoz.</li>
                        <li><strong>Jogosultság tipp:</strong> Ha a feladat neve szürke és nem tudsz belekattintani, vagy a Törlés gomb el van halványítva, az azért van, mert nem te vagy a feladat létrehozója vagy felelőse, és nincs <i>"Mások feladatainak szerk."</i> jogosultságod.</li>
                    </ul>
                </div>
            </div>

            {/* TUDÁSBÁZIS */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-sona-neutral" />
                Dokumentumok és Tudásbázis
                </h3>
                <div className="space-y-3 text-sm text-sona-neutral leading-relaxed">
                    <p>Minden projekt saját dokumentum-kezelővel rendelkezik. Ez kiválóan alkalmas specifikációk, jelszavak, folyamatleírások vagy jegyzetek tárolására.</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>A dokumentumokat Mappákba szervezheted. A mappákat és a dokumentumokat is szabadon mozgathatod (Drag & Drop) a bal oldali sávban.</li>
                        <li>A szerkesztő Rich Text alapú (vastagítás, dőlés, listák stb.).</li>
                        <li>A jobb felső sarokban lévő <strong>Részletek</strong> gombra kattintva csatolhatsz fájlokat (képeket, PDF-eket) az adott dokumentumhoz, és kommentelhetsz is alá.</li>
                    </ul>
                </div>
            </div>

            {/* IDŐKÖVETÉS */}
            <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sona-neutral" />
                Időkövetés (Time Tracker)
                </h3>
                <div className="space-y-3 text-sm text-sona-neutral leading-relaxed">
                    <p>A munkaórák pontos mérése elengedhetetlen a statisztikákhoz és a számlázáshoz. Kétféleképpen rögzíthetsz időt:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Stopper (Élő):</strong> Válaszd ki a projektet (és opcionálisan a feladatot), írd be mit csinálsz, és indítsd el! A stopper a háttérben fut (akkor is, ha más oldalra navigálsz), amíg le nem állítod a jobb alsó sarokban.</li>
                        <li><strong>Kézi rögzítés:</strong> Utólagosan is felvihetsz órákat a "Kézi" fülön (dátum és óra/perc megadásával).</li>
                        <li><strong>Láthatóság:</strong> Alapból <strong>mindenki csak a saját munkaidejét látja</strong> a listában. Ha látnod kell a kollégáid által beírt órákat (pl. bérszámfejtéshez), a Tulajdonosnak adnia kell neked egy <i>"Mások idejének megtekintése"</i> jogot a beállításokban. Ezt egy szürke info ikon jelzi is neked az oldalon.</li>
                    </ul>
                </div>
            </div>

        </div>
      </section>

      {/* 4. SZEKCIÓ: GYAKORI KÉRDÉSEK (NAPI MUNKA) */}
      <section id="gyik" className="flex flex-col gap-4 scroll-mt-24">
        <div className="flex items-center gap-3 border-b border-border pb-3 mb-2">
          <Book className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">4. Gyakori kérdések (GYIK)</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          
          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="text-primary mt-0.5">Q:</span> Hogyan hívjak be ügyfelet a rendszerbe biztonságosan?
            </h3>
            <p className="text-sm text-sona-neutral leading-relaxed">
              <span className="font-bold text-foreground mt-0.5 opacity-50 mr-2">A:</span>
              Ha egy ügyfélnek csak a saját (egyetlen) projektjét szeretnéd megmutatni: 
              <br/>1. Lépj a <i>Beállítások {'>'} Csapat Tagjai</i> menübe, és hívd meg a Munkaterületre (alap Tag-ként).
              <br/>2. Menj a projektjébe: <i>Projekt beállításai {'>'} Hozzáférés fül</i>.
              <br/>3. Állítsd a projektet <strong>Privátra</strong> (ha még nem az).
              <br/>4. Görgess le, és kattints a <strong>"Hozzáadás"</strong> gombra az ügyfél neve mellett.
              <br/>Így az ügyfél be tud lépni, de a többi (publikus vagy mások privát) projektjét egyáltalán nem fogja látni a bal oldali menüjében!
            </p>
          </div>

           <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="text-primary mt-0.5">Q:</span> Véletlenül elindítottam a stoppert, hogyan törölhetem a bejegyzést?
            </h3>
            <p className="text-sm text-sona-neutral leading-relaxed">
              <span className="font-bold text-foreground mt-0.5 opacity-50 mr-2">A:</span>
               Állítsd le a stoppert. Menj az <strong>Időkövetés</strong> oldalra, keresd meg a listában az imént rögzített (általában 0 óra 0 perces) bejegyzést. Vidd fölé az egeret, és a jobb oldalán megjelenő kuka (Törlés) ikonra kattintva törölheted. (Saját bejegyzést mindig törölhetsz, ehhez nem kell extra jogosultság).
            </p>
          </div>

          <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
              <span className="text-primary mt-0.5">Q:</span> Elutasítva hibaüzenetet ("Nincs jogosultságod") kapok egy mentésnél, miért?
            </h3>
            <p className="text-sm text-sona-neutral leading-relaxed">
              <span className="font-bold text-foreground mt-0.5 opacity-50 mr-2">A:</span>
               A rendszer szerver oldalon is ellenőrzi a jogosultságokat. Ha megnyitottál egy oldalt (pl. egy feladatot), de időközben a Tulajdonos elvette a szerkesztési jogodat, a felület még lehet, hogy engedi a gombnyomást, de a szerver már blokkolja a mentést. Ilyenkor frissítsd az oldalt (F5), hogy a felület szinkronba kerüljön az aktuális jogosultságaiddal (meg fognak jelenni a lakatok).
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}

function Globe2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}