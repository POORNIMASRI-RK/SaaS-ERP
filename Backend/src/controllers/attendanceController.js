import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';
import HrmsConfig from '../models/HrmsConfig.js';

// @desc    Web Check-In / Clock In
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const employeeId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check if employee has an approved leave on today's date
    const approvedLeave = await LeaveRequest.findOne({
      tenantId,
      employeeId,
      finalStatus: 'approved',
      fromDate: { $lte: new Date() },
      toDate: { $gte: today },
    });

    if (approvedLeave) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check-in. You have an approved leave for today.',
      });
    }

    let record = await Attendance.findOne({ tenantId, employeeId, date: today });

    if (record && record.status === 'On Leave') {
      return res.status(400).json({
        success: false,
        message: 'Cannot check-in. You have an approved leave for today.',
      });
    }

    if (record && record.checkInTime) {
      return res.status(400).json({
        success: false,
        message: `You have already clocked in today at ${new Date(record.checkInTime).toLocaleTimeString()}`,
      });
    }

    const config = await HrmsConfig.findOne({ tenantId });
    const graceMins = config?.lateGracePeriodMinutes || 15;
    const shiftStart = config?.workingHours?.startTime || '09:00';

    const now = new Date();
    const [startHour, startMin] = shiftStart.split(':').map(Number);
    const expectedTime = new Date();
    expectedTime.setHours(startHour, startMin + graceMins, 0, 0);

    const isLate = now > expectedTime;
    const status = isLate ? 'Late Arrival' : 'Present';

    if (!record) {
      record = new Attendance({
        tenantId,
        employeeId,
        date: today,
        checkInTime: now,
        status,
        isLate,
        biometricDeviceId: 'WEB-CLOCK-IN',
        isBiometricVerified: true,
      });
    } else {
      record.checkInTime = now;
      record.status = status;
      record.isLate = isLate;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Clock-in successful at ${now.toLocaleTimeString()}! Status: ${status}`,
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Web Check-Out / Clock Out
// @route   POST /api/attendance/check-out
// @access  Private
export const checkOut = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const employeeId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if on leave
    const approvedLeave = await LeaveRequest.findOne({
      tenantId,
      employeeId,
      finalStatus: 'approved',
      fromDate: { $lte: new Date() },
      toDate: { $gte: today },
    });

    if (approvedLeave) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check-out. You have an approved leave for today.',
      });
    }

    const record = await Attendance.findOne({ tenantId, employeeId, date: today });

    if (!record || !record.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Cannot clock out without clocking in first.',
      });
    }

    if (record.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: `You have already clocked out today at ${new Date(record.checkOutTime).toLocaleTimeString()}`,
      });
    }

    const now = new Date();
    record.checkOutTime = now;

    const durationMs = now - new Date(record.checkInTime);
    const durationMins = Math.floor(durationMs / (1000 * 60));
    record.workDurationMinutes = durationMins;

    const config = await HrmsConfig.findOne({ tenantId });
    const overtimeThreshold = (config?.overtimeThresholdHours || 8) * 60;

    if (durationMins > overtimeThreshold) {
      record.overtimeMinutes = durationMins - overtimeThreshold;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Clock-out successful at ${now.toLocaleTimeString()}! Total hours worked: ${(durationMins / 60).toFixed(2)} hrs.`,
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Attendance Records for employee or team
// @route   GET /api/attendance
// @access  Private
export const getAttendanceRecords = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    const tenantId = req.user.tenantId;

    let query = { tenantId };

    const isHrOrAdmin = ['Super Admin', 'Company Admin', 'HR'].includes(req.user.role);

    if (employeeId) {
      query.employeeId = employeeId;
    } else if (!isHrOrAdmin) {
      query.employeeId = req.user.id;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const records = await Attendance.find(query)
      .populate('employeeId', 'name email employeeId role department')
      .populate('correctionAuditLog.correctedBy', 'name role')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync Attendance Punch from Biometric Machine Simulator
// @route   POST /api/attendance/biometric-sync
// @access  Private (Super Admin, Company Admin, HR)
export const syncBiometricPunch = async (req, res) => {
  try {
    const { employeeIdStr, punchTime, biometricDeviceId, eventType } = req.body;
    const tenantId = req.user.tenantId;

    if (!employeeIdStr || !punchTime) {
      return res.status(400).json({ success: false, message: 'Employee ID and Punch Time are required.' });
    }

    const employee = await User.findOne({ tenantId, employeeId: employeeIdStr });
    if (!employee) {
      return res.status(404).json({ success: false, message: `No active employee found with ID: ${employeeIdStr}` });
    }

    const pTime = new Date(punchTime);
    const today = new Date(pTime);
    today.setHours(0, 0, 0, 0);

    // Check if employee is on approved leave
    const approvedLeave = await LeaveRequest.findOne({
      tenantId,
      employeeId: employee._id,
      finalStatus: 'approved',
      fromDate: { $lte: pTime },
      toDate: { $gte: today },
    });

    if (approvedLeave) {
      return res.status(400).json({
        success: false,
        message: `Biometric punch rejected: ${employee.name} (${employeeIdStr}) is on APPROVED LEAVE today.`,
      });
    }

    let record = await Attendance.findOne({ tenantId, employeeId: employee._id, date: today });

    const config = await HrmsConfig.findOne({ tenantId });
    const graceMins = config?.lateGracePeriodMinutes || 15;
    const shiftStart = config?.workingHours?.startTime || '09:00';

    const [startHour, startMin] = shiftStart.split(':').map(Number);
    const expectedTime = new Date(today);
    expectedTime.setHours(startHour, startMin + graceMins, 0, 0);

    if (!record) {
      const isLate = pTime > expectedTime;
      const status = isLate ? 'Late Arrival' : 'Present';

      record = new Attendance({
        tenantId,
        employeeId: employee._id,
        date: today,
        checkInTime: pTime,
        status,
        isLate,
        biometricDeviceId: biometricDeviceId || 'BIO-DEVICE-01',
        isBiometricVerified: true,
      });
    } else if (!record.checkOutTime && eventType === 'check_out') {
      record.checkOutTime = pTime;
      const durationMins = Math.floor((pTime - new Date(record.checkInTime)) / (1000 * 60));
      record.workDurationMinutes = durationMins;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Biometric punch synced for ${employee.name} (${employeeIdStr}) via ${record.biometricDeviceId}!`,
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export alias for biometricSync route
export const biometricSync = syncBiometricPunch;

// @desc    Manual Attendance Correction (with Mandatory Audit Log Trail)
// @route   PUT /api/attendance/:id/correct
// @access  Private (Super Admin, Company Admin, HR)
export const correctAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, checkInTime, checkOutTime, reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed reason (min 5 chars) is mandatory for manual attendance corrections.',
      });
    }

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const auditEntry = {
      correctedBy: req.user.id,
      previousStatus: record.status,
      newStatus: newStatus || record.status,
      reason,
      timestamp: new Date(),
    };

    if (newStatus) record.status = newStatus;
    if (checkInTime) record.checkInTime = new Date(checkInTime);
    if (checkOutTime) record.checkOutTime = new Date(checkOutTime);

    record.correctionAuditLog.push(auditEntry);
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Attendance record corrected successfully. Audit log trail created.',
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
