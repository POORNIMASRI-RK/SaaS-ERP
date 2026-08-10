import HrmsConfig from '../models/HrmsConfig.js';
import LeaveType from '../models/LeaveType.js';

const DEFAULT_LEAVE_TYPES = [
  { name: 'Casual Leave', code: 'CL', daysPerYear: 12, maxMonthlyLimit: 2, maxConsecutiveDays: 3, isPaid: true },
  { name: 'Sick Leave', code: 'SL', daysPerYear: 12, maxMonthlyLimit: 0, requireAttachmentDays: 2, isPaid: true },
  { name: 'Annual Leave', code: 'AL', daysPerYear: 15, maxMonthlyLimit: 0, allowCarryForward: true, isPaid: true },
  { name: 'Maternity Leave', code: 'ML', daysPerYear: 180, maxMonthlyLimit: 0, isPaid: true },
  { name: 'Paternity Leave', code: 'PL', daysPerYear: 15, maxMonthlyLimit: 0, isPaid: true },
  { name: 'Emergency Leave', code: 'EL', daysPerYear: 5, maxMonthlyLimit: 0, isPaid: true },
  { name: 'Compensatory Off', code: 'COMP_OFF', daysPerYear: 0, maxMonthlyLimit: 0, isPaid: true },
  { name: 'Loss of Pay', code: 'LOP', daysPerYear: 0, maxMonthlyLimit: 0, isPaid: false },
];

// @desc    Get HRMS Setup Configuration for Tenant (Auto-initializes defaults)
// @route   GET /api/hrms/config
// @access  Private
export const getHrmsConfig = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Tenant ID required' });
    }

    let config = await HrmsConfig.findOne({ tenantId });

    if (!config) {
      config = await HrmsConfig.create({
        tenantId,
        isConfigured: true,
        organizationName: req.user.tenant?.name || 'Manufacturing Plant',
        branchLocations: [{ name: 'Detroit Main Plant', city: 'Detroit' }],
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        workingHours: { startTime: '09:00', endTime: '17:30' },
        weeklyOffs: ['Sunday'],
        lateGracePeriodMinutes: 15,
        overtimeThresholdHours: 8,
        holidayCalendar: [
          { name: 'New Year Day', date: new Date('2026-01-01'), isOptional: false },
          { name: 'Independence Day', date: new Date('2026-07-04'), isOptional: false },
          { name: 'Labor Day', date: new Date('2026-09-07'), isOptional: false },
          { name: 'Diwali / Festival', date: new Date('2026-11-08'), isOptional: false },
          { name: 'Christmas Day', date: new Date('2026-12-25'), isOptional: false },
        ],
      });

      for (const lt of DEFAULT_LEAVE_TYPES) {
        const exists = await LeaveType.findOne({ tenantId, code: lt.code });
        if (!exists) {
          await LeaveType.create({ ...lt, tenantId });
        }
      }
    } else if (!config.isConfigured) {
      config.isConfigured = true;
      await config.save();
    }

    res.status(200).json({
      success: true,
      config,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Complete HRMS Setup Wizard
// @route   POST /api/hrms/config
// @access  Private
export const saveHrmsConfig = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.body.tenantId || req.tenantId : req.user.tenantId;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Tenant ID required' });
    }

    const {
      organizationName,
      branchLocations,
      workingDays,
      workingHours,
      weeklyOffs,
      lateGracePeriodMinutes,
      overtimeThresholdHours,
      requireMedicalAttachmentDays,
      compOffRules,
      approvalWorkflow,
      holidayCalendar,
    } = req.body;

    let config = await HrmsConfig.findOne({ tenantId });

    if (!config) {
      config = new HrmsConfig({ tenantId });
    }

    config.isConfigured = true;
    if (organizationName) config.organizationName = organizationName;
    if (branchLocations) config.branchLocations = branchLocations;
    if (workingDays) config.workingDays = workingDays;
    if (workingHours) config.workingHours = workingHours;
    if (weeklyOffs) config.weeklyOffs = weeklyOffs;
    if (lateGracePeriodMinutes !== undefined) config.lateGracePeriodMinutes = lateGracePeriodMinutes;
    if (overtimeThresholdHours !== undefined) config.overtimeThresholdHours = overtimeThresholdHours;
    if (requireMedicalAttachmentDays !== undefined) config.requireMedicalAttachmentDays = requireMedicalAttachmentDays;
    if (compOffRules) config.compOffRules = compOffRules;
    if (approvalWorkflow) config.approvalWorkflow = approvalWorkflow;
    
    if (holidayCalendar && Array.isArray(holidayCalendar)) {
      config.holidayCalendar = holidayCalendar.map((h) => ({
        name: h.name,
        date: h.date ? new Date(h.date) : new Date(),
        isOptional: !!h.isOptional,
      }));
    }

    await config.save();

    for (const lt of DEFAULT_LEAVE_TYPES) {
      const exists = await LeaveType.findOne({ tenantId, code: lt.code });
      if (!exists) {
        await LeaveType.create({ ...lt, tenantId });
      }
    }

    res.status(200).json({
      success: true,
      message: 'HRMS Configuration updated successfully!',
      config,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
