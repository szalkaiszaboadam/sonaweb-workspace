// 1. Pontos típusdefiníciók az általad megadott struktúra alapján
export type WorkspacePermission = 
  // Munkaterület & Csapat
  | 'workspace:settings'
  | 'member:manage'
  | 'role:manage'
  | 'team:view_analytics'
  // Projektek
  | 'project:create'
  | 'project:edit'
  | 'project:delete'
  | 'project:manage_access'
  // Feladatok (A létrehozás alapjog!)
  | 'task:edit_others'
  | 'task:delete'
  // Dokumentumok & Fájlok (A létrehozás/feltöltés alapjog!)
  | 'document:edit_others'
  | 'document:delete'
  | 'file:delete'
  // Időkövetés (A saját idő mérése alapjog!)
  | 'time:view_others'
  | 'time:edit_others'
  | 'time:delete_others'

// 2. Definíciók és leírások a UI számára
export const PERMISSION_DEFINITIONS: { id: WorkspacePermission, label: string, desc: string }[] = [
  { id: 'workspace:settings', label: 'Workspace beállítások', desc: 'Név, logó és alapadatok módosítása' },
  { id: 'member:manage', label: 'Tagok kezelése', desc: 'Meghívások küldése és tagok eltávolítása' },
  { id: 'role:manage', label: 'Szerepkörök kezelése', desc: 'Szerepkörök és egyéni jogok kiosztása' },
  { id: 'team:view_analytics', label: 'Csapat statisztikák', desc: 'Részletes aktivitási és terheltségi adatok' },
  
  { id: 'project:create', label: 'Projekt létrehozása', desc: 'Új projektek indítása a munkaterületen' },
  { id: 'project:edit', label: 'Projektek szerkesztése', desc: 'Bármely projekt adatainak módosítása' },
  { id: 'project:delete', label: 'Projektek törlése', desc: 'Bármely projekt végleges törlése' },
  { id: 'project:manage_access', label: 'Hozzáférés kezelése', desc: 'Projektek publikus/privát állítása, tagok hozzáadása' },

  { id: 'task:edit_others', label: 'Mások feladatainak szerk.', desc: 'Nem saját feladatok átírása, kiosztása' },
  { id: 'task:delete', label: 'Feladatok törlése', desc: 'Bármely feladat végleges törlése' },

  { id: 'document:edit_others', label: 'Mások dokumentumainak szerk.', desc: 'Nem saját dokumentumok módosítása' },
  { id: 'document:delete', label: 'Dokumentumok törlése', desc: 'Bármely dokumentum végleges törlése' },
  { id: 'file:delete', label: 'Fájlok törlése', desc: 'Mások által feltöltött fájlok törlése' },

  { id: 'time:view_others', label: 'Mások idejének megtekintése', desc: 'Mindenki munkaidejének látása' },
  { id: 'time:edit_others', label: 'Mások idejének szerkesztése', desc: 'Mások időbejegyzéseinek módosítása' },
  { id: 'time:delete_others', label: 'Mások idejének törlése', desc: 'Mások időbejegyzéseinek törlése' },
]

// 3. Vizuális csoportok a Beállítások oldalakhoz (Modalokhoz)
export const PERMISSION_GROUPS = [
  { label: 'Munkaterület & Csapat', keys: ['workspace:settings', 'member:manage', 'role:manage', 'team:view_analytics'] as WorkspacePermission[] },
  { label: 'Projektek', keys: ['project:create', 'project:edit', 'project:delete', 'project:manage_access'] as WorkspacePermission[] },
  { label: 'Feladatok', keys: ['task:edit_others', 'task:delete'] as WorkspacePermission[] },
  { label: 'Dokumentumok & Fájlok', keys: ['document:edit_others', 'document:delete', 'file:delete'] as WorkspacePermission[] },
  { label: 'Időkövetés', keys: ['time:view_others', 'time:edit_others', 'time:delete_others'] as WorkspacePermission[] },
]