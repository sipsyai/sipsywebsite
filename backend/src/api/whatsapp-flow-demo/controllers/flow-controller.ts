/**
 * Flow Controller for WhatsApp Flow Demo
 *
 * Handles WhatsApp Flow API endpoint requests:
 * - INIT: Initial flow data
 * - data_exchange: Screen-specific data exchanges
 */

import mockDataService, { MachineModule } from '../services/mock-data-service';
import sessionService from '../services/session-service';
import validationService from '../services/validation-service';

// Type definitions for WhatsApp Flow API
interface FlowRequest {
  action: 'INIT' | 'data_exchange';
  flow_token: string;
  version?: string;
  screen?: string;
  data?: Record<string, any>;
}

interface FlowResponse {
  version?: string;
  screen?: string;
  data?: Record<string, any>;
  error_message?: string;
}

export default {
  /**
   * Main flow endpoint handler
   * POST /api/whatsapp-flow-demo/endpoint
   */
  async handle(ctx) {
    try {
      const requestBody: FlowRequest = ctx.request.body;
      const { action, flow_token, screen, data } = requestBody;

      console.log(`[FlowController] Received ${action} request`, {
        flow_token,
        screen,
        data
      });

      // Validate action
      const actionValidation = validationService.validateFlowAction(action);
      if (!actionValidation.isValid) {
        ctx.status = 400;
        ctx.body = {
          error_message: actionValidation.error
        };
        return;
      }

      // Extract phone number from flow_token
      // In production, flow_token would be encrypted/signed
      // For demo, we'll use flow_token as phone number or extract it
      const phone = this.extractPhoneFromFlowToken(flow_token);

      if (!phone) {
        ctx.status = 400;
        ctx.body = {
          error_message: 'Invalid flow token'
        };
        return;
      }

      // Handle based on action type
      let response: FlowResponse;

      if (action === 'INIT') {
        response = await this.handleInit(phone);
      } else if (action === 'data_exchange') {
        if (!screen) {
          ctx.status = 400;
          ctx.body = {
            error_message: 'Screen is required for data_exchange'
          };
          return;
        }

        response = await this.handleDataExchange(phone, screen, data || {});
      } else {
        ctx.status = 400;
        ctx.body = {
          error_message: 'Invalid action'
        };
        return;
      }

      // Return response
      ctx.status = 200;
      ctx.body = response;

      console.log(`[FlowController] Response sent:`, response);
    } catch (error) {
      console.error('[FlowController] Error handling flow request:', error);

      ctx.status = 500;
      ctx.body = {
        error_message: 'Internal server error'
      };
    }
  },

  /**
   * Handle INIT action - provide initial data
   */
  async handleInit(phone: string): Promise<FlowResponse> {
    // Get user by phone
    const user = mockDataService.getUserByPhone(phone);

    if (!user) {
      return {
        error_message: 'User not found. Please contact support.'
      };
    }

    // Get user's ships
    const ships = mockDataService.getShipsByIds(user.ship_ids);

    // Create initial session
    sessionService.saveSession(phone, 'MAIN_MENU', {
      user_id: user.user_id,
      user_name: user.name
    });

    // Return initial screen data
    return {
      version: '1.0',
      screen: 'MAIN_MENU',
      data: {
        user_name: user.name,
        ships: ships.map(ship => ({
          id: ship.id,
          title: ship.name,
          description: `${ship.flag} | IMO: ${ship.imo}`
        }))
      }
    };
  },

  /**
   * Handle data_exchange action - screen-specific data
   */
  async handleDataExchange(
    phone: string,
    screen: string,
    data: Record<string, any>
  ): Promise<FlowResponse> {
    // Validate screen
    const screenValidation = validationService.validateScreen(screen);
    if (!screenValidation.isValid) {
      return {
        error_message: screenValidation.error
      };
    }

    // Get or create session
    let session = sessionService.getSession(phone);
    if (!session) {
      // Session expired, return to init
      return {
        screen: 'MAIN_MENU',
        error_message: 'Session expired. Please start again.'
      };
    }

    // Route to appropriate handler based on screen
    switch (screen) {
      case 'SHIP_SELECT':
        return this.handleShipSelect(phone, data, session.context);

      case 'MODULE_SELECT':
        return this.handleModuleSelect(phone, data, session.context);

      case 'MACHINE_LIST':
        return this.handleMachineList(phone, data, session.context);

      case 'UPDATE_HOURS':
        return this.handleUpdateHours(phone, data, session.context);

      case 'CONFIRMATION':
        return this.handleConfirmation(phone, data, session.context);

      default:
        return {
          error_message: `Unknown screen: ${screen}`
        };
    }
  },

  /**
   * Handle SHIP_SELECT screen
   */
  async handleShipSelect(
    phone: string,
    data: Record<string, any>,
    context: Record<string, any>
  ): Promise<FlowResponse> {
    const { selected_ship_id } = data;

    if (!selected_ship_id) {
      return {
        error_message: 'Please select a ship'
      };
    }

    // Validate ship access
    const accessValidation = validationService.validateShipAccess(phone, selected_ship_id);
    if (!accessValidation.isValid) {
      return {
        error_message: accessValidation.error
      };
    }

    // Get ship
    const ship = mockDataService.getShipById(selected_ship_id);
    if (!ship) {
      return {
        error_message: 'Ship not found'
      };
    }

    // Get available modules for this ship
    const modules = mockDataService.getModulesForShip(selected_ship_id);

    // Update session
    sessionService.updateSessionContext(phone, {
      selected_ship_id,
      selected_ship_name: ship.name
    });

    // Return modules
    const moduleLabels: Record<MachineModule, string> = {
      propulsion: '🚢 Propulsion (İtici Sistem)',
      electrical: '⚡ Electrical (Elektrik)',
      hydraulic: '💧 Hydraulic (Hidrolik)',
      cargo: '📦 Cargo (Kargo)',
      ballast: '⚓ Ballast (Balast)',
      hvac: '❄️ HVAC (İklimlendirme)'
    };

    return {
      version: '1.0',
      screen: 'MODULE_SELECT',
      data: {
        ship_name: ship.name,
        modules: modules.map(module => ({
          id: module,
          title: moduleLabels[module] || module
        }))
      }
    };
  },

  /**
   * Handle MODULE_SELECT screen
   */
  async handleModuleSelect(
    phone: string,
    data: Record<string, any>,
    context: Record<string, any>
  ): Promise<FlowResponse> {
    const { selected_module } = data;
    const { selected_ship_id } = context;

    if (!selected_module || !selected_ship_id) {
      return {
        error_message: 'Invalid selection'
      };
    }

    // Get machines for ship and module
    const machines = mockDataService.getMachinesByShipIdAndModule(
      selected_ship_id,
      selected_module as MachineModule
    );

    if (machines.length === 0) {
      return {
        error_message: 'No machines found for this module'
      };
    }

    // Update session
    sessionService.updateSessionContext(phone, {
      selected_module
    });

    // Return machines with maintenance status
    return {
      version: '1.0',
      screen: 'MACHINE_LIST',
      data: {
        machines: machines.map(machine => {
          const maintenanceStatus = validationService.getMachineMaintenanceStatus(machine);

          return {
            id: machine.id,
            title: `${machine.code} - ${machine.name}`,
            description: `${maintenanceStatus.message} | ${machine.current_hours} saat`,
            code: machine.code,
            name: machine.name,
            current_hours: machine.current_hours,
            next_maintenance: machine.next_maintenance_hours,
            maintenance_status: maintenanceStatus.message,
            last_updated: new Date(machine.last_updated).toLocaleString('tr-TR'),
            updated_by: machine.updated_by,
            version: machine.version
          };
        })
      }
    };
  },

  /**
   * Handle MACHINE_LIST screen (machine selected for update)
   */
  async handleMachineList(
    phone: string,
    data: Record<string, any>,
    context: Record<string, any>
  ): Promise<FlowResponse> {
    const { selected_machine_id } = data;

    if (!selected_machine_id) {
      return {
        error_message: 'Please select a machine'
      };
    }

    // Validate machine access
    const accessValidation = validationService.validateMachineAccess(phone, selected_machine_id);
    if (!accessValidation.isValid) {
      return {
        error_message: accessValidation.error
      };
    }

    // Get machine details
    const machine = mockDataService.getMachineById(selected_machine_id);
    if (!machine) {
      return {
        error_message: 'Machine not found'
      };
    }

    // Update session
    sessionService.updateSessionContext(phone, {
      selected_machine_id,
      selected_machine_code: machine.code,
      selected_machine_version: machine.version,
      selected_machine_current_hours: machine.current_hours
    });

    // Return update hours screen
    return {
      version: '1.0',
      screen: 'UPDATE_HOURS',
      data: {
        machine_code: machine.code,
        machine_name: machine.name,
        current_hours: machine.current_hours,
        next_maintenance: machine.next_maintenance_hours,
        version: machine.version
      }
    };
  },

  /**
   * Handle UPDATE_HOURS screen (validate and update)
   */
  async handleUpdateHours(
    phone: string,
    data: Record<string, any>,
    context: Record<string, any>
  ): Promise<FlowResponse> {
    const { new_hours } = data;
    const { selected_machine_id, selected_machine_version, user_name } = context;

    if (!selected_machine_id || !new_hours) {
      return {
        error_message: 'Missing required data'
      };
    }

    // Validate and update
    const validation = validationService.validateHoursUpdate({
      machineId: selected_machine_id,
      newHours: parseFloat(new_hours),
      expectedVersion: selected_machine_version,
      updatedBy: user_name || phone
    });

    if (!validation.isValid) {
      return {
        error_message: validation.error
      };
    }

    // Perform update
    const updateResult = mockDataService.updateMachineHours(
      selected_machine_id,
      parseFloat(new_hours),
      user_name || phone,
      selected_machine_version
    );

    if (!updateResult.success) {
      return {
        error_message: updateResult.error
      };
    }

    const updatedMachine = updateResult.machine!;

    // Update session
    sessionService.updateSessionContext(phone, {
      update_success: true,
      updated_hours: new_hours,
      new_version: updatedMachine.version
    });

    // Return confirmation screen
    return {
      version: '1.0',
      screen: 'CONFIRMATION',
      data: {
        success: true,
        machine_code: updatedMachine.code,
        machine_name: updatedMachine.name,
        old_hours: context.selected_machine_current_hours,
        new_hours: updatedMachine.current_hours,
        next_maintenance: updatedMachine.next_maintenance_hours,
        updated_at: new Date().toLocaleString('tr-TR')
      }
    };
  },

  /**
   * Handle CONFIRMATION screen (flow complete)
   */
  async handleConfirmation(
    phone: string,
    data: Record<string, any>,
    context: Record<string, any>
  ): Promise<FlowResponse> {
    // Clear session (flow complete)
    sessionService.deleteSession(phone);

    return {
      version: '1.0',
      screen: 'CONFIRMATION',
      data: {
        message: 'Working hours updated successfully! ✅'
      }
    };
  },

  /**
   * Extract phone number from flow token
   * In production, this would decrypt/verify the token
   * For demo, we'll use a simple format: "flow_<phone>"
   */
  extractPhoneFromFlowToken(flowToken: string): string | null {
    if (!flowToken) {
      return null;
    }

    // Demo format: "flow_+905551234567" or just "+905551234567"
    if (flowToken.startsWith('flow_')) {
      return validationService.sanitizePhoneNumber(flowToken.replace('flow_', ''));
    }

    // Try to use as-is
    return validationService.sanitizePhoneNumber(flowToken);
  }
};
