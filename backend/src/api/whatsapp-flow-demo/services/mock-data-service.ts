/**
 * Mock Data Service for WhatsApp Flow Demo
 *
 * Provides hardcoded demo data for ships, machines, and users.
 * This service simulates a real database without requiring actual Strapi content types.
 */

// Type Definitions
export interface Ship {
  id: string;
  name: string;
  imo: string;
  flag: string;
  active: boolean;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: MachineType;
  ship_id: string;
  module: MachineModule;
  current_hours: number;
  last_maintenance_hours: number;
  next_maintenance_hours: number;
  maintenance_interval: number;
  last_updated: string;
  updated_by: string;
  version: number; // For optimistic locking
}

export type MachineType =
  | 'main_engine'
  | 'generator'
  | 'pump'
  | 'cargo_pump'
  | 'ballast_pump'
  | 'hvac';

export type MachineModule =
  | 'propulsion'
  | 'electrical'
  | 'hydraulic'
  | 'cargo'
  | 'ballast'
  | 'hvac';

export interface User {
  user_id: string;
  name: string;
  phone: string;
  role: 'captain' | 'chief_engineer' | 'engineer';
  ship_ids: string[];
  permissions: string[];
}

export interface WorkingHoursHistory {
  id: string;
  machine_id: string;
  old_hours: number;
  new_hours: number;
  difference: number;
  updated_by: string;
  updated_at: string;
  source: string;
}

// Mock Data Store
class MockDataService {
  private ships: Map<string, Ship>;
  private machines: Map<string, Machine>;
  private users: Map<string, User>;
  private history: WorkingHoursHistory[];

  constructor() {
    this.ships = new Map();
    this.machines = new Map();
    this.users = new Map();
    this.history = [];

    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize Ships
    const ships: Ship[] = [
      {
        id: 'ship_001',
        name: 'MV ATLAS',
        imo: '9876543',
        flag: 'Turkey',
        active: true
      },
      {
        id: 'ship_002',
        name: 'MV NEPTUNE',
        imo: '9876544',
        flag: 'Turkey',
        active: true
      },
      {
        id: 'ship_003',
        name: 'MV POSEIDON',
        imo: '9876545',
        flag: 'Turkey',
        active: true
      }
    ];

    ships.forEach(ship => this.ships.set(ship.id, ship));

    // Initialize Machines for MV ATLAS
    const atlasDate = new Date('2025-11-15T10:00:00Z').toISOString();
    const atlasMachines: Machine[] = [
      {
        id: 'machine_001',
        code: 'ME-01',
        name: 'Ana Motor (Main Engine)',
        type: 'main_engine',
        ship_id: 'ship_001',
        module: 'propulsion',
        current_hours: 12450,
        last_maintenance_hours: 12000,
        next_maintenance_hours: 12500,
        maintenance_interval: 500,
        last_updated: atlasDate,
        updated_by: 'Kaptan Ahmet',
        version: 1
      },
      {
        id: 'machine_002',
        code: 'GE-01',
        name: 'Jeneratör 1 (Generator 1)',
        type: 'generator',
        ship_id: 'ship_001',
        module: 'electrical',
        current_hours: 8320,
        last_maintenance_hours: 8000,
        next_maintenance_hours: 9000,
        maintenance_interval: 1000,
        last_updated: atlasDate,
        updated_by: 'Başmühendis Ali',
        version: 1
      },
      {
        id: 'machine_003',
        code: 'GE-02',
        name: 'Jeneratör 2 (Generator 2)',
        type: 'generator',
        ship_id: 'ship_001',
        module: 'electrical',
        current_hours: 7890,
        last_maintenance_hours: 7000,
        next_maintenance_hours: 8000,
        maintenance_interval: 1000,
        last_updated: atlasDate,
        updated_by: 'Başmühendis Ali',
        version: 1
      },
      {
        id: 'machine_004',
        code: 'PP-01',
        name: 'Pompa 1 (Pump 1)',
        type: 'pump',
        ship_id: 'ship_001',
        module: 'hydraulic',
        current_hours: 5670,
        last_maintenance_hours: 5500,
        next_maintenance_hours: 6000,
        maintenance_interval: 500,
        last_updated: atlasDate,
        updated_by: 'Kaptan Ahmet',
        version: 1
      },
      {
        id: 'machine_005',
        code: 'CP-01',
        name: 'Kargo Pompası (Cargo Pump)',
        type: 'cargo_pump',
        ship_id: 'ship_001',
        module: 'cargo',
        current_hours: 3210,
        last_maintenance_hours: 3000,
        next_maintenance_hours: 3500,
        maintenance_interval: 500,
        last_updated: atlasDate,
        updated_by: 'Başmühendis Ali',
        version: 1
      }
    ];

    // Initialize Machines for MV NEPTUNE
    const neptuneDate = new Date('2025-11-18T14:30:00Z').toISOString();
    const neptuneMachines: Machine[] = [
      {
        id: 'machine_006',
        code: 'ME-01',
        name: 'Ana Motor (Main Engine)',
        type: 'main_engine',
        ship_id: 'ship_002',
        module: 'propulsion',
        current_hours: 15230,
        last_maintenance_hours: 15000,
        next_maintenance_hours: 15500,
        maintenance_interval: 500,
        last_updated: neptuneDate,
        updated_by: 'Kaptan Mehmet',
        version: 1
      },
      {
        id: 'machine_007',
        code: 'GE-01',
        name: 'Jeneratör 1 (Generator 1)',
        type: 'generator',
        ship_id: 'ship_002',
        module: 'electrical',
        current_hours: 9540,
        last_maintenance_hours: 9000,
        next_maintenance_hours: 10000,
        maintenance_interval: 1000,
        last_updated: neptuneDate,
        updated_by: 'Kaptan Mehmet',
        version: 1
      },
      {
        id: 'machine_008',
        code: 'BP-01',
        name: 'Balast Pompası (Ballast Pump)',
        type: 'ballast_pump',
        ship_id: 'ship_002',
        module: 'ballast',
        current_hours: 4320,
        last_maintenance_hours: 4000,
        next_maintenance_hours: 4500,
        maintenance_interval: 500,
        last_updated: neptuneDate,
        updated_by: 'Kaptan Mehmet',
        version: 1
      }
    ];

    // Initialize Machines for MV POSEIDON
    const poseidonDate = new Date('2025-11-20T09:15:00Z').toISOString();
    const poseidonMachines: Machine[] = [
      {
        id: 'machine_009',
        code: 'ME-01',
        name: 'Ana Motor (Main Engine)',
        type: 'main_engine',
        ship_id: 'ship_003',
        module: 'propulsion',
        current_hours: 18750,
        last_maintenance_hours: 18500,
        next_maintenance_hours: 19000,
        maintenance_interval: 500,
        last_updated: poseidonDate,
        updated_by: 'Başmühendis Ali',
        version: 1
      },
      {
        id: 'machine_010',
        code: 'AC-01',
        name: 'Klima (Air Conditioning)',
        type: 'hvac',
        ship_id: 'ship_003',
        module: 'hvac',
        current_hours: 12100,
        last_maintenance_hours: 12000,
        next_maintenance_hours: 13000,
        maintenance_interval: 1000,
        last_updated: poseidonDate,
        updated_by: 'Başmühendis Ali',
        version: 1
      }
    ];

    [...atlasMachines, ...neptuneMachines, ...poseidonMachines].forEach(machine =>
      this.machines.set(machine.id, machine)
    );

    // Initialize Users
    const users: User[] = [
      {
        user_id: 'user_001',
        name: 'Kaptan Ahmet',
        phone: '+905551234567',
        role: 'captain',
        ship_ids: ['ship_001', 'ship_002'],
        permissions: ['read_working_hours', 'write_working_hours', 'view_maintenance']
      },
      {
        user_id: 'user_002',
        name: 'Kaptan Mehmet',
        phone: '+905559876543',
        role: 'captain',
        ship_ids: ['ship_002', 'ship_003'],
        permissions: ['read_working_hours', 'write_working_hours', 'view_maintenance']
      },
      {
        user_id: 'user_003',
        name: 'Başmühendis Ali',
        phone: '+905555555555',
        role: 'chief_engineer',
        ship_ids: ['ship_001', 'ship_003'],
        permissions: ['read_working_hours', 'write_working_hours', 'view_maintenance', 'manage_machines']
      },
      {
        user_id: 'user_004',
        name: 'Ali',
        phone: '+905079720490',
        role: 'captain',
        ship_ids: ['ship_001', 'ship_002', 'ship_003'],
        permissions: ['read_working_hours', 'write_working_hours', 'view_maintenance', 'manage_machines']
      }
    ];

    users.forEach(user => this.users.set(user.phone, user));
  }

  // Ship Methods
  getAllShips(): Ship[] {
    return Array.from(this.ships.values()).filter(ship => ship.active);
  }

  getShipById(id: string): Ship | undefined {
    return this.ships.get(id);
  }

  getShipsByIds(ids: string[]): Ship[] {
    return ids.map(id => this.ships.get(id)).filter(Boolean) as Ship[];
  }

  // Machine Methods
  getAllMachines(): Machine[] {
    return Array.from(this.machines.values());
  }

  getMachineById(id: string): Machine | undefined {
    return this.machines.get(id);
  }

  getMachinesByShipId(shipId: string): Machine[] {
    return Array.from(this.machines.values()).filter(m => m.ship_id === shipId);
  }

  getMachinesByShipIdAndModule(shipId: string, module: MachineModule): Machine[] {
    return Array.from(this.machines.values()).filter(
      m => m.ship_id === shipId && m.module === module
    );
  }

  updateMachineHours(
    machineId: string,
    newHours: number,
    updatedBy: string,
    expectedVersion: number
  ): { success: boolean; error?: string; machine?: Machine } {
    const machine = this.machines.get(machineId);

    if (!machine) {
      return { success: false, error: 'Machine not found' };
    }

    // Optimistic locking check
    if (machine.version !== expectedVersion) {
      return {
        success: false,
        error: 'Machine was updated by another user. Please refresh and try again.'
      };
    }

    // Validation: new hours must be >= current hours
    if (newHours < machine.current_hours) {
      return {
        success: false,
        error: `New hours (${newHours}) cannot be less than current hours (${machine.current_hours})`
      };
    }

    // Validation: increase should be reasonable (max 500 hours at once)
    const increase = newHours - machine.current_hours;
    if (increase > 500) {
      return {
        success: false,
        error: `Increase of ${increase} hours is too large. Maximum allowed is 500 hours.`
      };
    }

    // Record history
    const historyEntry: WorkingHoursHistory = {
      id: `history_${Date.now()}`,
      machine_id: machineId,
      old_hours: machine.current_hours,
      new_hours: newHours,
      difference: increase,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
      source: 'whatsapp_flow'
    };
    this.history.push(historyEntry);

    // Update machine
    machine.current_hours = newHours;
    machine.last_updated = new Date().toISOString();
    machine.updated_by = updatedBy;
    machine.version += 1;

    // Recalculate next maintenance if needed
    if (newHours >= machine.next_maintenance_hours) {
      machine.last_maintenance_hours = machine.next_maintenance_hours;
      machine.next_maintenance_hours = machine.last_maintenance_hours + machine.maintenance_interval;
    }

    this.machines.set(machineId, machine);

    return { success: true, machine };
  }

  // User Methods
  getUserByPhone(phone: string): User | undefined {
    return this.users.get(phone);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // History Methods
  getMachineHistory(machineId: string): WorkingHoursHistory[] {
    return this.history.filter(h => h.machine_id === machineId);
  }

  getRecentHistory(limit: number = 10): WorkingHoursHistory[] {
    return this.history.slice(-limit).reverse();
  }

  // Utility Methods
  getModulesForShip(shipId: string): MachineModule[] {
    const machines = this.getMachinesByShipId(shipId);
    const modules = new Set(machines.map(m => m.module));
    return Array.from(modules);
  }

  getMachineTypesForShip(shipId: string): MachineType[] {
    const machines = this.getMachinesByShipId(shipId);
    const types = new Set(machines.map(m => m.type));
    return Array.from(types);
  }
}

// Export singleton instance
export default new MockDataService();
