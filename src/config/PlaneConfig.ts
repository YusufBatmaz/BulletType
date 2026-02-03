export interface PlaneOption {
  id: string;
  name: string;
  texture: string;
  icon: string; // Emoji veya küçük görsel
}

export const planeOptions: PlaneOption[] = [
  {
    id: 'plane1',
    name: 'Classic',
    texture: 'classic',
    icon: '🛩️'
  },
  {
    id: 'plane2',
    name: 'Bit-Striker',
    texture: 'bit-striker',
    icon: '✈️'
  },
  {
    id: 'plane3',
    name: 'Sky Warden',
    texture: 'sky-warden',
    icon: '🚀'
  },
  {
    id: 'plane4',
    name: 'Nebula Ghost',
    texture: 'nebula-ghost',
    icon: '🛸'
  },
  {
    id: 'plane5',
    name: 'Apex Sentinel',
    texture: 'apex-sentinel',
    icon: '🚁'
  },
  {
    id: 'plane6',
    name: 'Stormbringer',
    texture: 'stormbringer',
    icon: '⚡'
  },
];

// Seçili uçağı localStorage'da sakla
export class PlaneSelector {
  private static STORAGE_KEY = 'bullettype_selected_plane';
  
  static getSelectedPlane(): string {
    return localStorage.getItem(this.STORAGE_KEY) || 'plane1';
  }
  
  static setSelectedPlane(planeId: string): void {
    localStorage.setItem(this.STORAGE_KEY, planeId);
  }
  
  static getSelectedTexture(): string {
    const selectedId = this.getSelectedPlane();
    const plane = planeOptions.find(p => p.id === selectedId);
    return plane?.texture || 'classic';
  }
}
