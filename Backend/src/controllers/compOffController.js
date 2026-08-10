import CompOffCredit from '../models/CompOffCredit.js';
import User from '../models/User.js';

// @desc    Get Comp Off Credits for Tenant / Employee
// @route   GET /api/compoff
// @access  Private
export const getCompOffCredits = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    let query = { tenantId };

    if (req.user.role === 'Employee') {
      query.employeeId = req.user.id;
    } else if (req.query.employeeId) {
      query.employeeId = req.query.employeeId;
    }

    const credits = await CompOffCredit.find(query)
      .populate('employeeId', 'name email employeeId role department')
      .sort({ workDate: -1 });

    res.status(200).json({ success: true, count: credits.length, credits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Allocate Comp Off Credit to Employee (Weekend/Holiday Work)
// @route   POST /api/compoff/allocate
// @access  Private (Super Admin, Company Admin, HR, Manager)
export const allocateCompOff = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { employeeId, workDate, creditDays, reason } = req.body;

    if (!employeeId || !workDate) {
      return res.status(400).json({ success: false, message: 'Employee ID and Work Date are required.' });
    }

    const expiryDate = new Date(workDate);
    expiryDate.setDate(expiryDate.getDate() + 90); // 90 days validity

    const credit = await CompOffCredit.create({
      tenantId,
      employeeId,
      workDate: new Date(workDate),
      creditDays: creditDays || 1.0,
      expiryDate,
      reason: reason || 'Worked on weekend/public holiday',
      approvedBy: req.user.id,
      status: 'available',
    });

    const populatedCredit = await CompOffCredit.findById(credit._id).populate('employeeId', 'name email employeeId');

    res.status(201).json({
      success: true,
      message: `Comp Off credit of ${credit.creditDays} day(s) allocated to ${populatedCredit.employeeId.name}!`,
      credit: populatedCredit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
