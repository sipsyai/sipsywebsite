/**
 * Validation Service for WhatsApp Flow Demo
 *
 * Handles validation logic for machine working hours updates,
 * optimistic locking, and business rules.
 */

import mockDataService, { Machine } from './mock-data-service';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errorCode?: string;
}

export interface UpdateValidationInput {
  machineId: string;
  newHours: number;
  expectedCurrentHours?: number;
  expectedVersion?: number;
  updatedBy: string;
}

class ValidationService {
  /**
   * Validate working hours update
   */
  validateHoursUpdate(input: UpdateValidationInput): ValidationResult {
    const { machineId, newHours, expectedCurrentHours, expectedVersion } = input;

    // Get machine
    const machine = mockDataService.getMachineById(machineId);

    if (!machine) {
      return {
        isValid: false,
        error: 'Machine not found',
        errorCode: 'MACHINE_NOT_FOUND'
      };
    }

    // Optimistic locking check
    if (expectedVersion !== undefined && machine.version !== expectedVersion) {
      return {
        isValid: false,
        error: 'Machine data was updated by another user. Please refresh and try again.',
        errorCode: 'VERSION_CONFLICT'
      };
    }

    // Check if expected current hours match (additional safety check)
    if (expectedCurrentHours !== undefined && machine.current_hours !== expectedCurrentHours) {
      return {
        isValid: false,
        error: `Current hours mismatch. Expected ${expectedCurrentHours}, but machine has ${machine.current_hours}.`,
        errorCode: 'HOURS_MISMATCH'
      };
    }

    // Validate new hours format
    if (!Number.isFinite(newHours) || newHours < 0) {
      return {
        isValid: false,
        error: 'Invalid hours value. Must be a non-negative number.',
        errorCode: 'INVALID_HOURS_FORMAT'
      };
    }

    // Validate: new hours cannot be less than current hours
    if (newHours < machine.current_hours) {
      return {
        isValid: false,
        error: `New hours (${newHours}) cannot be less than current hours (${machine.current_hours}). Working hours can only increase.`,
        errorCode: 'HOURS_DECREASED'
      };
    }

    // Validate: increase should be reasonable
    const increase = newHours - machine.current_hours;
    const MAX_INCREASE = 500; // Maximum allowed increase at once

    if (increase > MAX_INCREASE) {
      return {
        isValid: false,
        error: `Hours increase of ${increase} is too large. Maximum allowed increase is ${MAX_INCREASE} hours. Please check the value.`,
        errorCode: 'INCREASE_TOO_LARGE'
      };
    }

    // Validate: warn if increase is unusually small (less than 1 hour)
    // This is just a warning, not a blocking error
    if (increase > 0 && increase < 1) {
      console.warn(
        `[ValidationService] Small hours increase: ${increase} hours for machine ${machine.code}`
      );
    }

    // All validations passed
    return {
      isValid: true
    };
  }

  /**
   * Validate user permissions
   */
  validateUserPermissions(phone: string, requiredPermission: string): ValidationResult {
    const user = mockDataService.getUserByPhone(phone);

    if (!user) {
      return {
        isValid: false,
        error: 'User not found or not authorized',
        errorCode: 'USER_NOT_FOUND'
      };
    }

    if (!user.permissions.includes(requiredPermission)) {
      return {
        isValid: false,
        error: `User does not have permission: ${requiredPermission}`,
        errorCode: 'INSUFFICIENT_PERMISSIONS'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Validate user has access to a specific ship
   */
  validateShipAccess(phone: string, shipId: string): ValidationResult {
    const user = mockDataService.getUserByPhone(phone);

    if (!user) {
      return {
        isValid: false,
        error: 'User not found',
        errorCode: 'USER_NOT_FOUND'
      };
    }

    if (!user.ship_ids.includes(shipId)) {
      return {
        isValid: false,
        error: 'User does not have access to this ship',
        errorCode: 'SHIP_ACCESS_DENIED'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Validate user has access to a specific machine (through its ship)
   */
  validateMachineAccess(phone: string, machineId: string): ValidationResult {
    const machine = mockDataService.getMachineById(machineId);

    if (!machine) {
      return {
        isValid: false,
        error: 'Machine not found',
        errorCode: 'MACHINE_NOT_FOUND'
      };
    }

    return this.validateShipAccess(phone, machine.ship_id);
  }

  /**
   * Get maintenance status for a machine
   */
  getMachineMaintenanceStatus(machine: Machine): {
    status: 'ok' | 'warning' | 'overdue';
    message: string;
    hoursUntilMaintenance: number;
  } {
    const hoursUntilMaintenance = machine.next_maintenance_hours - machine.current_hours;

    if (hoursUntilMaintenance < 0) {
      return {
        status: 'overdue',
        message: `⚠️ Maintenance overdue by ${Math.abs(hoursUntilMaintenance)} hours!`,
        hoursUntilMaintenance
      };
    }

    if (hoursUntilMaintenance <= 50) {
      return {
        status: 'warning',
        message: `⚡ Maintenance due soon: ${hoursUntilMaintenance} hours remaining`,
        hoursUntilMaintenance
      };
    }

    return {
      status: 'ok',
      message: `✅ ${hoursUntilMaintenance} hours until next maintenance`,
      hoursUntilMaintenance
    };
  }

  /**
   * Validate flow action input
   */
  validateFlowAction(action: string): ValidationResult {
    const validActions = ['INIT', 'data_exchange'];

    if (!validActions.includes(action)) {
      return {
        isValid: false,
        error: `Invalid action: ${action}. Must be one of: ${validActions.join(', ')}`,
        errorCode: 'INVALID_ACTION'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Validate screen name
   */
  validateScreen(screen: string): ValidationResult {
    const validScreens = [
      'MAIN_MENU',
      'SHIP_SELECT',
      'MODULE_SELECT',
      'MACHINE_LIST',
      'UPDATE_HOURS',
      'CONFIRMATION'
    ];

    if (!validScreens.includes(screen)) {
      return {
        isValid: false,
        error: `Invalid screen: ${screen}`,
        errorCode: 'INVALID_SCREEN'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Sanitize and validate phone number
   */
  sanitizePhoneNumber(phone: string): string {
    // Remove all non-digit characters except '+'
    let sanitized = phone.replace(/[^\d+]/g, '');

    // Ensure it starts with '+'
    if (!sanitized.startsWith('+')) {
      // Assume Turkish number if no country code
      if (sanitized.startsWith('0')) {
        sanitized = '+90' + sanitized.substring(1);
      } else {
        sanitized = '+' + sanitized;
      }
    }

    return sanitized;
  }
}

// Export singleton instance
export default new ValidationService();
