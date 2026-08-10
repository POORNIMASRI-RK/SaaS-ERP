import Machine from '../models/Machine.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import Item from '../models/Item.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ==========================================
// 1. MACHINE MASTER
// ==========================================

export const getMachines = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const machines = await Machine.find({ tenantId }).sort({ createdAt: -1 });

    const totalOperational = machines.filter((m) => m.status === 'operational').length;
    const totalBreakdown = machines.filter((m) => m.status === 'breakdown').length;

    res.status(200).json({
      success: true,
      count: machines.length,
      totalOperational,
      totalBreakdown,
      machines,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveMachine = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { id, machineCode, name, category, model, serialNumber, location, status, nextServiceDate } = req.body;

    if (!machineCode || !name) {
      return res.status(400).json({ success: false, message: 'Machine Code and Name are required.' });
    }

    let machine;
    if (id) {
      machine = await Machine.findById(id);
      if (machine) {
        machine.machineCode = machineCode;
        machine.name = name;
        machine.category = category || machine.category;
        machine.model = model || machine.model;
        machine.serialNumber = serialNumber || machine.serialNumber;
        machine.location = location || machine.location;
        machine.status = status || machine.status;
        if (nextServiceDate) machine.nextServiceDate = nextServiceDate;
        await machine.save();
      }
    } else {
      machine = await Machine.create({
        tenantId,
        machineCode,
        name,
        category: category || 'CNC Machining',
        model: model || '2024 VMC-850',
        serialNumber: serialNumber || `SN-${Date.now().toString().slice(-6)}`,
        location: location || 'Shopfloor Line 1',
        status: status || 'operational',
        lastServiceDate: new Date(),
        nextServiceDate: nextServiceDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    res.status(200).json({ success: true, message: 'Machine saved successfully', machine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. MAINTENANCE LOGS & BREAKDOWN TICKETS
// ==========================================

export const getMaintenanceLogs = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const logs = await MaintenanceLog.find({ tenantId })
      .populate('machineId', 'name machineCode location status')
      .populate('technicianId', 'name role')
      .populate('sparePartsUsed.itemId', 'name itemCode uom unitPrice')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMaintenanceLog = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { machineId, type, problemDescription, technicianId, scheduledDate, sparePartsUsed, maintenanceCost } = req.body;

    if (!machineId || !type || !problemDescription) {
      return res.status(400).json({ success: false, message: 'Machine, Type, and Problem Description are required.' });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ success: false, message: 'Machine not found.' });
    }

    const logNumber = `MNT-${Date.now().toString().slice(-6)}`;

    const log = await MaintenanceLog.create({
      tenantId,
      logNumber,
      machineId,
      type, // 'preventive' | 'corrective' | 'breakdown'
      problemDescription,
      technicianId: technicianId || req.user.id,
      scheduledDate: scheduledDate || new Date(),
      sparePartsUsed: sparePartsUsed || [],
      maintenanceCost: maintenanceCost || 0,
      status: type === 'breakdown' ? 'in_progress' : 'scheduled',
    });

    // If breakdown, update machine status to 'breakdown' and alert Production Planning
    if (type === 'breakdown') {
      machine.status = 'breakdown';
      await machine.save();

      const prodManagers = await User.find({
        tenantId,
        role: { $in: ['Company Admin', 'Production Manager', 'Manager'] },
      }).select('_id');

      for (const mgr of prodManagers) {
        await Notification.create({
          tenantId,
          recipientId: mgr._id,
          title: `[MACHINE BREAKDOWN ALERT] ${machine.name}`,
          message: `Machine ${machine.name} (${machine.machineCode}) on ${machine.location} reported a BREAKDOWN! Description: ${problemDescription}`,
          type: 'machine_breakdown',
          link: '/manufacturing/maintenance',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Maintenance Ticket ${logNumber} created! ${type === 'breakdown' ? 'Production Planning notified of breakdown.' : ''}`,
      log,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await MaintenanceLog.findById(id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Maintenance log not found.' });
    }

    log.status = 'completed';
    log.completionDate = new Date();
    await log.save();

    // Restore machine status to operational
    const machine = await Machine.findById(log.machineId);
    if (machine) {
      machine.status = 'operational';
      machine.lastServiceDate = new Date();
      machine.nextServiceDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await machine.save();
    }

    res.status(200).json({ success: true, message: `Maintenance completed! Machine restored to OPERATIONAL status.`, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
