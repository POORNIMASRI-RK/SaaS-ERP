import Shift from '../models/Shift.js';
import User from '../models/User.js';

// @desc    Get all Shifts for Tenant
// @route   GET /api/shifts
// @access  Private
export const getShifts = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    let shifts = await Shift.find({ tenantId }).sort({ createdAt: 1 });

    if (shifts.length === 0) {
      // Seed default shifts for tenant if none exist
      shifts = await Shift.insertMany([
        { tenantId, name: 'General Shift', code: 'GEN', startTime: '09:00', endTime: '17:30', colorCode: '#2563eb' },
        { tenantId, name: 'Morning Shift', code: 'MORN', startTime: '06:00', endTime: '14:00', colorCode: '#059669' },
        { tenantId, name: 'Evening Shift', code: 'EVE', startTime: '14:00', endTime: '22:00', colorCode: '#d97706' },
        { tenantId, name: 'Night Shift', code: 'NIGHT', startTime: '22:00', endTime: '06:00', colorCode: '#7c3aed' },
      ]);
    }

    res.status(200).json({ success: true, count: shifts.length, shifts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new Custom Shift
// @route   POST /api/shifts
// @access  Private (Super Admin, Company Admin, HR)
export const createShift = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.body.tenantId || req.tenantId : req.user.tenantId;
    const { name, code, startTime, endTime, breakDurationMinutes, gracePeriodMinutes, overtimeEligible, colorCode } = req.body;

    if (!name || !code || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Name, code, start time, and end time are required.' });
    }

    const shift = await Shift.create({
      tenantId,
      name: name.trim(),
      code: code.toUpperCase().trim(),
      startTime,
      endTime,
      breakDurationMinutes: breakDurationMinutes || 45,
      gracePeriodMinutes: gracePeriodMinutes || 15,
      overtimeEligible: overtimeEligible !== undefined ? overtimeEligible : true,
      colorCode: colorCode || '#2563eb',
    });

    res.status(201).json({ success: true, message: `Shift [${shift.name}] created successfully!`, shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
