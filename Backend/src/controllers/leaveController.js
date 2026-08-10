import LeaveType from '../models/LeaveType.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Attendance from '../models/Attendance.js';
import CompOffCredit from '../models/CompOffCredit.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all leave types for tenant
// @route   GET /api/leaves/types
// @access  Private
export const getLeaveTypes = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    let types = await LeaveType.find({ tenantId }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: types.length, types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update custom leave type
// @route   POST /api/leaves/types
// @access  Private (Super Admin, Company Admin, HR)
export const saveLeaveType = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.body.tenantId || req.tenantId : req.user.tenantId;
    const { id, name, code, daysPerYear, maxMonthlyLimit, maxConsecutiveDays, allowHalfDay, requireAttachmentDays, allowCarryForward, isPaid, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and Code are required' });
    }

    let leaveType;
    if (id) {
      leaveType = await LeaveType.findById(id);
      if (leaveType) {
        leaveType.name = name;
        leaveType.code = code.toUpperCase();
        leaveType.daysPerYear = daysPerYear;
        leaveType.maxMonthlyLimit = maxMonthlyLimit;
        leaveType.maxConsecutiveDays = maxConsecutiveDays;
        leaveType.allowHalfDay = allowHalfDay;
        leaveType.requireAttachmentDays = requireAttachmentDays;
        leaveType.allowCarryForward = allowCarryForward;
        leaveType.isPaid = isPaid;
        leaveType.status = status || 'active';
        await leaveType.save();
      }
    } else {
      leaveType = await LeaveType.create({
        tenantId,
        name,
        code: code.toUpperCase(),
        daysPerYear: daysPerYear || 12,
        maxMonthlyLimit: maxMonthlyLimit || 0,
        maxConsecutiveDays: maxConsecutiveDays || 0,
        allowHalfDay: allowHalfDay !== undefined ? allowHalfDay : true,
        requireAttachmentDays: requireAttachmentDays || 0,
        allowCarryForward: allowCarryForward || false,
        isPaid: isPaid !== undefined ? isPaid : true,
        status: status || 'active',
      });
    }

    res.status(200).json({ success: true, message: 'Leave policy updated successfully', leaveType });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Leave Balances for logged-in employee or target user
// @route   GET /api/leaves/balances
// @access  Private
export const getLeaveBalances = async (req, res) => {
  try {
    const targetUserId = req.query.employeeId || req.user.id;
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const leaveTypes = await LeaveType.find({ tenantId, status: 'active' });

    const approvedRequests = await LeaveRequest.find({
      tenantId,
      employeeId: targetUserId,
      finalStatus: 'approved',
    });

    const compOffCredits = await CompOffCredit.find({
      tenantId,
      employeeId: targetUserId,
      status: 'available',
      expiryDate: { $gt: new Date() },
    });
    const compOffDaysEarned = compOffCredits.reduce((sum, c) => sum + c.creditDays, 0);

    const balances = leaveTypes.map((type) => {
      const usedDays = approvedRequests
        .filter((reqItem) => {
          if (!reqItem.leaveTypeId) return false;
          return reqItem.leaveTypeId.toString() === type._id.toString();
        })
        .reduce((sum, reqItem) => sum + reqItem.totalDays, 0);

      const totalAllowed = type.code === 'COMP_OFF' ? compOffDaysEarned : type.daysPerYear;
      const remainingDays = Math.max(0, totalAllowed - usedDays);

      return {
        leaveTypeId: type._id,
        name: type.name,
        leaveTypeName: type.name,
        code: type.code,
        leaveTypeCode: type.code,
        daysPerYear: totalAllowed,
        usedDays,
        remainingDays,
        isPaid: type.isPaid,
      };
    });

    res.status(200).json({ success: true, balances });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to check if a leave request belongs to a manager's department domain or direct reports
const isRequestForManager = (managerRole, managerDept, empRole, empDept, empDesignation, empReportingManager, managerId) => {
  const mRole = (managerRole || '').toLowerCase().trim();
  const mDept = (managerDept || '').toLowerCase().trim();
  const eRole = (empRole || '').toLowerCase().trim();
  const eDept = (empDept || '').toLowerCase().trim();
  const eDesig = (empDesignation || '').toLowerCase().trim();

  // 1. Determine Employee's primary department category
  let empCategory = 'other';
  if (eRole.includes('inventory') || eDept.includes('inventory') || eDept.includes('supply chain') || eDesig.includes('inventory')) {
    empCategory = 'inventory';
  } else if (eRole.includes('warehouse') || eDept.includes('warehouse') || eDept.includes('logistics') || eDesig.includes('warehouse')) {
    empCategory = 'warehouse';
  } else if (eRole.includes('purchase') || eDept.includes('purchase') || eDept.includes('procurement') || eDesig.includes('purchase')) {
    empCategory = 'purchase';
  } else if (eRole.includes('production') || eRole.includes('assembly') || eDept.includes('production') || eDept.includes('assembly') || eDept.includes('fabrication') || eDept.includes('robotic')) {
    empCategory = 'production';
  } else if (eRole.includes('maintenance') || eDept.includes('maintenance') || eDesig.includes('maintenance')) {
    empCategory = 'maintenance';
  } else if (eRole.includes('sales') || eRole.includes('crm') || eDept.includes('sales') || eDept.includes('crm')) {
    empCategory = 'sales';
  } else if (eRole.includes('finance') || eDept.includes('finance') || eDept.includes('accounts')) {
    empCategory = 'finance';
  }

  // 2. Determine Manager's primary department category
  let managerCategory = 'other';
  if (mRole.includes('inventory manager') || mDept.includes('inventory') || mDept.includes('supply chain')) {
    managerCategory = 'inventory';
  } else if (mRole.includes('warehouse manager') || mDept.includes('warehouse') || mDept.includes('logistics')) {
    managerCategory = 'warehouse';
  } else if (mRole.includes('purchase manager') || mDept.includes('purchase') || mDept.includes('procurement')) {
    managerCategory = 'purchase';
  } else if (mRole.includes('production manager') || mDept.includes('production') || mDept.includes('assembly') || mDept.includes('fabrication') || mDept.includes('robotic')) {
    managerCategory = 'production';
  } else if (mRole.includes('maintenance manager') || mDept.includes('maintenance')) {
    managerCategory = 'maintenance';
  } else if (mRole.includes('sales manager') || mDept.includes('sales') || mDept.includes('crm')) {
    managerCategory = 'sales';
  } else if (mRole.includes('finance manager') || mRole.includes('finance') || mDept.includes('finance') || mDept.includes('accounts')) {
    managerCategory = 'finance';
  }

  // 3. Department Specific Manager: If manager has a designated department category, ONLY match same category
  if (managerCategory !== 'other') {
    return managerCategory === empCategory;
  }

  // 4. Generic 'Manager' role fallback: Check direct reporting manager or exact department name match
  if (empReportingManager && managerId && empReportingManager.toString() === managerId.toString()) {
    return true;
  }

  if (mDept && eDept && mDept === eDept && mDept !== '') {
    return true;
  }

  return false;
};

// @desc    Apply for Leave -> Notifications sent to Applicant, Manager & HR
// @route   POST /api/leaves/apply
// @access  Private
export const applyLeave = async (req, res) => {
  try {
    const {
      leaveTypeId,
      fromDate,
      toDate,
      isHalfDay,
      halfDaySession,
      reason,
      description,
      attachmentUrl,
    } = req.body;

    if (!leaveTypeId || !fromDate || !toDate || !reason) {
      return res.status(400).json({ success: false, message: 'Leave Type, From Date, To Date, and Reason are required.' });
    }

    const tenantId = req.user.tenantId;
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({ success: false, message: 'Invalid Leave Type selection.' });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return res.status(400).json({ success: false, message: 'From Date cannot be later than To Date.' });
    }

    // Exclude Weekends (Saturday & Sunday) from Working Days calculation
    const calculateWorkingDays = (startDate, endDate, halfDay) => {
      if (halfDay) return 0.5;
      let count = 0;
      const cur = new Date(startDate);
      cur.setHours(0, 0, 0, 0);
      const finish = new Date(endDate);
      finish.setHours(0, 0, 0, 0);

      while (cur <= finish) {
        const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    };

    let totalDays = calculateWorkingDays(start, end, isHalfDay);

    if (
      leaveType.requireAttachmentDays > 0 &&
      totalDays >= leaveType.requireAttachmentDays &&
      !attachmentUrl
    ) {
      return res.status(400).json({
        success: false,
        message: `Medical attachment is required for ${leaveType.name} exceeding ${leaveType.requireAttachmentDays} days.`,
      });
    }

    if (leaveType.maxConsecutiveDays > 0 && totalDays > leaveType.maxConsecutiveDays) {
      return res.status(400).json({
        success: false,
        message: `Maximum consecutive days allowed for ${leaveType.name} is ${leaveType.maxConsecutiveDays} days.`,
      });
    }

    const newRequest = await LeaveRequest.create({
      tenantId,
      employeeId: req.user.id,
      leaveTypeId,
      fromDate: start,
      toDate: end,
      totalDays,
      isHalfDay: !!isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession || 'First Half' : 'N/A',
      reason,
      description: description || '',
      attachmentUrl: attachmentUrl || '',
      managerStatus: 'pending',
      hrStatus: 'pending',
      finalStatus: 'pending_manager',
    });

    // 1. Send confirmation notification to APPLICANT EMPLOYEE
    await Notification.create({
      tenantId,
      recipientId: req.user.id,
      leaveRequestId: newRequest._id,
      title: `Leave Application Submitted`,
      message: `Your leave request for ${totalDays} day(s) of ${leaveType.name} (${start.toLocaleDateString()} to ${end.toLocaleDateString()}) has been submitted for approval.`,
      type: 'leave_applied',
      link: '/hrms',
      isRead: false,
    });

    // 2. Dispatch notifications to HR, Company Admin, Super Admin, and matching Dept Manager
    const potentialApprovers = await User.find({
      tenantId,
      role: {
        $in: [
          'Super Admin',
          'Company Admin',
          'HR',
          'Manager',
          'Inventory Manager',
          'Warehouse Manager',
          'Purchase Manager',
          'Production Manager',
          'Maintenance Manager',
          'Sales Manager',
          'Finance Manager',
          'Finance Manger',
        ],
      },
      _id: { $ne: req.user.id },
    }).select('_id email role department reportingManager');

    const approvers = potentialApprovers.filter((userItem) => {
      const isGeneralAdminOrHR = ['Super Admin', 'Company Admin', 'HR'].includes(userItem.role);
      if (isGeneralAdminOrHR) return true;
      return isRequestForManager(userItem.role, userItem.department, req.user.role, req.user.department, req.user.designation, req.user.reportingManager, userItem._id);
    });

    const notifTitle = `[Pending Approval] New Leave Application`;
    const notifMsg = `[Pending] ${req.user.name} (${req.user.department || req.user.role}) applied for ${totalDays} day(s) of ${leaveType.name}.`;

    for (const appUser of approvers) {
      await Notification.create({
        tenantId,
        recipientId: appUser._id,
        leaveRequestId: newRequest._id,
        title: notifTitle,
        message: notifMsg,
        type: 'leave_applied',
        link: '/hrms',
        isRead: false,
      });
    }

    res.status(201).json({
      success: true,
      message: `Leave application submitted! Notification sent to Department Manager and HR.`,
      leaveRequest: newRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Leave Applications List
// @route   GET /api/leaves/requests
// @access  Private
export const getLeaveRequests = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const isApprover = ['Super Admin', 'Company Admin', 'HR', 'Manager', 'Purchase Manager', 'Inventory Manager', 'Warehouse Manager', 'Production Manager', 'Maintenance Manager', 'Team Leader'].includes(req.user.role);

    let query = { tenantId };
    if (!isApprover) {
      query.employeeId = req.user.id;
    }

    const requests = await LeaveRequest.find(query)
      .populate('employeeId', 'name email employeeId role department designation reportingManager')
      .populate('leaveTypeId', 'name code isPaid')
      .populate('managerApprovedBy', 'name')
      .populate('hrApprovedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Pending Approvals for Approvers Queue (Filtered by Department Manager Domain)
// @route   GET /api/leaves/approvals
// @access  Private
export const getPendingApprovals = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const allRequests = await LeaveRequest.find({
      tenantId,
      finalStatus: { $in: ['pending_manager', 'pending_hr'] },
    })
      .populate('employeeId', 'name email employeeId role department designation reportingManager')
      .populate('leaveTypeId', 'name code isPaid')
      .sort({ createdAt: -1 });

    // Auto-repair department/role fields for any inventory employee records
    for (const reqItem of allRequests) {
      if (reqItem.employeeId) {
        const emp = reqItem.employeeId;
        const info = `${emp.name} ${emp.role} ${emp.designation} ${emp.department}`.toLowerCase();
        if (info.includes('inventory') && (emp.department !== 'Inventory Automation' || emp.role !== 'Inventory Employee')) {
          await User.findByIdAndUpdate(emp._id, { department: 'Inventory Automation', role: 'Inventory Employee' });
          emp.department = 'Inventory Automation';
          emp.role = 'Inventory Employee';
        }
      }
    }

    const role = req.user.role;
    const isGeneralApprover = ['Super Admin', 'Company Admin', 'HR'].includes(role);

    let filteredRequests = allRequests;

    if (!isGeneralApprover) {
      filteredRequests = allRequests.filter((reqItem) => {
        const empRole = reqItem.employeeId?.role || '';
        const empDept = reqItem.employeeId?.department || '';
        const empDesig = reqItem.employeeId?.designation || '';
        const empReporting = reqItem.employeeId?.reportingManager;

        return isRequestForManager(req.user.role, req.user.department, empRole, empDept, empDesig, empReporting, req.user._id);
      });
    }

    res.status(200).json({ success: true, count: filteredRequests.length, requests: filteredRequests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Department Manager, General Manager or HR Instant 1-Click Leave Approval Workflow
// @route   PATCH /api/leaves/requests/:id/approve-manager
// @access  Private (Department Managers, General Manager, HR, Company Admin)
export const approveByManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const leaveRequest = await LeaveRequest.findById(id).populate('employeeId').populate('leaveTypeId');
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const isHrOrAdmin = ['Super Admin', 'Company Admin', 'HR', 'Manager'].includes(req.user.role);
    const isDeptManager = ['Purchase Manager', 'Inventory Manager', 'Warehouse Manager', 'Production Manager', 'Maintenance Manager'].includes(req.user.role);

    if (!isHrOrAdmin && !isDeptManager) {
      return res.status(403).json({ success: false, message: 'Only Department Manager, General Manager, or HR can approve leave applications.' });
    }

    const approverRole = req.user.role;
    leaveRequest.managerStatus = 'approved';
    leaveRequest.managerApprovedBy = req.user.id;
    leaveRequest.managerComment = comment || `${approverRole} Approved`;
    leaveRequest.managerApprovedAt = new Date();

    leaveRequest.hrStatus = 'approved';
    leaveRequest.hrApprovedBy = req.user.id;
    leaveRequest.hrComment = comment || `${approverRole} Approved`;
    leaveRequest.hrApprovedAt = new Date();

    leaveRequest.finalStatus = 'approved';
    await leaveRequest.save();

    // 1. Mark Attendance as "On Leave" (excluding Saturdays and Sundays)
    let curr = new Date(leaveRequest.fromDate);
    const last = new Date(leaveRequest.toDate);
    while (curr <= last) {
      const dayOfWeek = curr.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        await Attendance.findOneAndUpdate(
          { tenantId: leaveRequest.tenantId, employeeId: leaveRequest.employeeId._id, date: new Date(curr) },
          { status: 'On Leave', notes: `Approved ${leaveRequest.leaveTypeId?.name || 'Leave'}` },
          { upsert: true }
        );
      }
      curr.setDate(curr.getDate() + 1);
    }

    // 2. Synchronize notifications for ALL Approvers
    const updatedTitle = `${approverRole} Approved – Leave Approved`;
    const updatedMsg = `${approverRole} (${req.user.name}) approved leave for ${leaveRequest.employeeId?.name}. Status: APPROVED.`;

    await Notification.updateMany(
      { leaveRequestId: leaveRequest._id, recipientId: { $ne: leaveRequest.employeeId._id } },
      { title: updatedTitle, message: updatedMsg, type: 'leave_hr_approved' }
    );

    // 3. Send Notification to Employee
    await Notification.create({
      tenantId: leaveRequest.tenantId,
      recipientId: leaveRequest.employeeId._id,
      leaveRequestId: leaveRequest._id,
      title: 'Leave Approved!',
      message: `Your leave request for ${leaveRequest.totalDays} day(s) of ${leaveRequest.leaveTypeId?.name} has been APPROVED by ${req.user.name} (${approverRole}).`,
      type: 'leave_hr_approved',
      link: '/hrms',
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: `Leave APPROVED! Status changed to APPROVED, employee balance updated, and attendance marked On Leave.`,
      leaveRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export approveByHr as alias for Either Manager or HR 1-click approval
export const approveByHr = approveByManager;

// @desc    Reject Leave Application
// @route   PATCH /api/leaves/requests/:id/reject
// @access  Private (Manager, HR, Company Admin)
export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const leaveRequest = await LeaveRequest.findById(id).populate('employeeId').populate('leaveTypeId');
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    leaveRequest.finalStatus = 'rejected';
    leaveRequest.rejectionReason = rejectionReason || 'Rejection reason not provided';
    await leaveRequest.save();

    await Notification.create({
      tenantId: leaveRequest.tenantId,
      recipientId: leaveRequest.employeeId._id,
      leaveRequestId: leaveRequest._id,
      title: 'Leave Request Rejected',
      message: `Your leave request for ${leaveRequest.totalDays} day(s) of ${leaveRequest.leaveTypeId?.name} was rejected. Reason: ${rejectionReason || 'N/A'}`,
      type: 'leave_rejected',
      link: '/hrms',
      isRead: false,
    });

    res.status(200).json({ success: true, message: 'Leave request rejected', leaveRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
