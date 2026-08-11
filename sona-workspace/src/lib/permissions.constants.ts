export type WorkspacePermission = 
  | 'workspace:settings'
  | 'team:manage'
  | 'roles:manage'
  | 'project:create'
  | 'project:manage_all'
  | 'task:manage_all'
  | 'document:manage_all'
  | 'time:view_all'
  | 'time:manage_all'

export const PERMISSION_DEFINITIONS: { id: WorkspacePermission, label: string, desc: string }[] = [
  { id: 'workspace:settings', label: 'Munkaterület beállítások', desc: 'Átnevezés, törlés, alap beállítások' },
  { id: 'team:manage', label: 'Csapat kezelése', desc: 'Tagok és csoportok meghívása, eltávolítása' },
  { id: 'roles:manage', label: 'Jogosultságok', desc: 'Szerepkörök és egyéni jogok módosítása' },
  { id: 'project:create', label: 'Projekt létrehozása', desc: 'Új projektek indítása' },
  { id: 'project:manage_all', label: 'Minden projekt kezelése', desc: 'Bármely projekt szerkesztése/törlése' },
  { id: 'task:manage_all', label: 'Minden feladat kezelése', desc: 'Bármely feladat módosítása/törlése' },
  { id: 'document:manage_all', label: 'Minden dokumentum kezelése', desc: 'Bármely dokumentum módosítása/törlése' },
  { id: 'time:view_all', label: 'Globális időkövetés', desc: 'Mindenki idejének megtekintése' },
  { id: 'time:manage_all', label: 'Minden idő kezelése', desc: 'Mások időbejegyzéseinek szerkesztése/törlése' }
]