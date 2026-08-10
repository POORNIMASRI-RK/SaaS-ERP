import PayrollConfig from '../models/PayrollConfig.js';
import SalaryStructure from '../models/SalaryStructure.js';
import EmployeeSalary from '../models/EmployeeSalary.js';
import PayrollBatch from '../models/PayrollBatch.js';
import PayrollRecord from '../models/PayrollRecord.js';
import LoanAdvance from '../models/LoanAdvance.js';
import ReimbursementClaim from '../models/ReimbursementClaim.js';
import PayrollAuditLog from '../models/PayrollAuditLog.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Notification from '../models/Notification.js';

// Helper for exact component breakup
const calculateSalaryBreakup = (annualCtc) => {
  const monthlyCtc = Math.round(annualCtc / 12);
  const basicSalary = Math.round(monthlyCtc * 0.5);
  const hra = Math.round(monthlyCtc * 0.2);
  const da = Math.round(monthlyCtc * 0.1);
  const conveyance = 1600;
  const medicalAllowance = 1250;
  const specialAllowance = Math.max(0, monthlyCtc - (basicSalary + hra + da + conveyance + medicalAllowance));
  return { monthlyCtc, basicSalary, hra, da, conveyance, medicalAllowance, specialAllowance };
};

// @desc    Get Payroll Configuration for tenant
// @route   GET /api/payroll/config
// @access  Private (Super Admin, Company Admin, HR)
export const getPayrollConfig = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Tenant ID required' });
    }

    let config = await PayrollConfig.findOne({ tenantId });
    if (!config) {
      config = await PayrollConfig.create({
        tenantId,
        payrollCycle: 'monthly',
        paymentDay: 30,
        standardWorkingDays: 26,
        overtimeRateMultiplier: 1.5,
        enablePf: true,
        pfEmployeeRate: 12,
        enableEsi: true,
        esiEmployeeRate: 0.75,
        enablePt: true,
        enableTds: true,
      });
    }

    res.status(200).json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Payroll Configuration
// @route   PUT /api/payroll/config
// @access  Private (Company Admin, Super Admin)
export const updatePayrollConfig = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.body.tenantId || req.tenantId : req.user.tenantId;
    let config = await PayrollConfig.findOne({ tenantId });

    if (!config) {
      config = new PayrollConfig({ tenantId });
    }

    Object.assign(config, req.body);
    await config.save();

    await PayrollAuditLog.create({
      tenantId,
      performedBy: req.user.id,
      action: 'PAYROLL_CONFIG_UPDATE',
      details: `Updated payroll configuration.`,
    });

    res.status(200).json({ success: true, message: 'Payroll configuration updated successfully', config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Salary Structures
// @route   GET /api/payroll/structures
// @access  Private
export const getSalaryStructures = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    let structures = await SalaryStructure.find({ tenantId }).sort({ createdAt: -1 });

    if (structures.length === 0) {
      const defaultStruct = await SalaryStructure.create({
        tenantId,
        title: 'Standard Manufacturing Plant Structure',
        description: 'Standard salary breakup: Basic 50%, HRA 20%, DA 10%, Conveyance & Medical',
        basicPercent: 50,
        hraPercent: 20,
        daPercent: 10,
        conveyanceAllowance: 1600,
        medicalAllowance: 1250,
        specialAllowancePercent: 20,
      });
      structures = [defaultStruct];
    }

    res.status(200).json({ success: true, count: structures.length, structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Create Salary Structure
// @route   POST /api/payroll/structures
// @access  Private (Company Admin, HR)
export const saveSalaryStructure = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { title, description, basicPercent, hraPercent, daPercent, conveyanceAllowance, medicalAllowance, specialAllowancePercent } = req.body;

    const structure = await SalaryStructure.create({
      tenantId,
      title,
      description,
      basicPercent: basicPercent || 50,
      hraPercent: hraPercent || 20,
      daPercent: daPercent || 10,
      conveyanceAllowance: conveyanceAllowance || 1600,
      medicalAllowance: medicalAllowance || 1250,
      specialAllowancePercent: specialAllowancePercent || 20,
    });

    res.status(201).json({ success: true, message: 'Salary structure created successfully', structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Employee Assigned Salaries (Auto-populates structures for ALL company employees)
//          Admin/HR: Sees ALL employee salaries
//          Other roles: Sees ONLY THEIR OWN salary
// @route   GET /api/payroll/salaries
// @access  Private
export const getEmployeeSalaries = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const isHrOrAdmin = ['Super Admin', 'Company Admin', 'HR', 'Finance'].includes(req.user.role);

    // Auto-ensure EmployeeSalary document exists for EVERY active employee in the company
    const allEmployees = await User.find({ tenantId, status: 'active', role: { $ne: 'Super Admin' } });

    for (const emp of allEmployees) {
      let salaryExists = await EmployeeSalary.findOne({ tenantId, employeeId: emp._id });
      if (!salaryExists) {
        const r = (emp.role || '').toLowerCase();
        const defaultAnnual = r.includes('admin')
          ? 1200000
          : r.includes('manager')
          ? 840000
          : r.includes('leader')
          ? 600000
          : 480000;

        const { monthlyCtc, basicSalary, hra, da, conveyance, medicalAllowance, specialAllowance } = calculateSalaryBreakup(defaultAnnual);

        await EmployeeSalary.create({
          tenantId,
          employeeId: emp._id,
          annualCtc: defaultAnnual,
          monthlyCtc,
          basicSalary,
          hra,
          da,
          conveyance,
          medicalAllowance,
          specialAllowance,
        });
      }
    }

    let query = { tenantId };
    if (!isHrOrAdmin) {
      query.employeeId = req.user.id;
    }

    const salaries = await EmployeeSalary.find(query)
      .populate('employeeId', 'name email employeeId role department designation')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: salaries.length, salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign or Revise Employee Salary Structure
// @route   POST /api/payroll/salaries/assign
// @access  Private (Company Admin, HR)
export const assignEmployeeSalary = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { employeeId, annualCtc, bankAccountNumber, bankIfscCode, bankName, panNumber, pfUanNumber, esiNumber, revisionReason } = req.body;

    if (!employeeId || !annualCtc) {
      return res.status(400).json({ success: false, message: 'Employee ID and Annual CTC are required' });
    }

    const { monthlyCtc, basicSalary, hra, da, conveyance, medicalAllowance, specialAllowance } = calculateSalaryBreakup(annualCtc);

    let empSalary = await EmployeeSalary.findOne({ tenantId, employeeId });

    if (empSalary) {
      const prevCtc = empSalary.annualCtc;
      empSalary.revisionHistory.push({
        previousCtc: prevCtc,
        newCtc: annualCtc,
        revisedBy: req.user.id,
        reason: revisionReason || 'Annual Salary Revision / Increment',
        effectiveDate: new Date(),
      });

      empSalary.annualCtc = annualCtc;
      empSalary.monthlyCtc = monthlyCtc;
      empSalary.basicSalary = basicSalary;
      empSalary.hra = hra;
      empSalary.da = da;
      empSalary.conveyance = conveyance;
      empSalary.medicalAllowance = medicalAllowance;
      empSalary.specialAllowance = specialAllowance;
      if (bankAccountNumber) empSalary.bankAccountNumber = bankAccountNumber;
      if (bankIfscCode) empSalary.bankIfscCode = bankIfscCode;
      if (bankName) empSalary.bankName = bankName;
      if (panNumber) empSalary.panNumber = panNumber;
      if (pfUanNumber) empSalary.pfUanNumber = pfUanNumber;
      if (esiNumber) empSalary.esiNumber = esiNumber;

      await empSalary.save();

      await PayrollAuditLog.create({
        tenantId,
        performedBy: req.user.id,
        targetEmployeeId: employeeId,
        action: 'SALARY_REVISED',
        details: `Revised annual CTC from ₹${prevCtc.toLocaleString('en-IN')} to ₹${annualCtc.toLocaleString('en-IN')}.`,
      });
    } else {
      empSalary = await EmployeeSalary.create({
        tenantId,
        employeeId,
        annualCtc,
        monthlyCtc,
        basicSalary,
        hra,
        da,
        conveyance,
        medicalAllowance,
        specialAllowance,
        bankAccountNumber: bankAccountNumber || '',
        bankIfscCode: bankIfscCode || '',
        bankName: bankName || '',
        panNumber: panNumber || '',
        pfUanNumber: pfUanNumber || '',
        esiNumber: esiNumber || '',
      });

      await PayrollAuditLog.create({
        tenantId,
        performedBy: req.user.id,
        targetEmployeeId: employeeId,
        action: 'SALARY_ASSIGNED',
        details: `Assigned initial annual CTC of ₹${annualCtc.toLocaleString('en-IN')}.`,
      });
    }

    res.status(200).json({ success: true, message: 'Employee salary structure assigned/revised successfully', empSalary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate / Process Monthly Payroll Batch
// @route   POST /api/payroll/batches/generate
// @access  Private (Company Admin, HR)
export const generatePayrollBatch = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and Year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const config = (await PayrollConfig.findOne({ tenantId })) || { standardWorkingDays: 26, enablePf: true, enableEsi: true, enablePt: true };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const batchName = `${monthNames[month - 1]} ${year} Payroll Run`;

    let batch = await PayrollBatch.findOne({ tenantId, month, year });
    if (batch && ['approved', 'paid'].includes(batch.status)) {
      return res.status(400).json({ success: false, message: 'Payroll for this month has already been AUTHORIZED & DISBURSED by Company Admin.' });
    }

    if (!batch) {
      batch = await PayrollBatch.create({
        tenantId,
        batchName,
        month,
        year,
        status: 'draft',
        createdBy: req.user.id,
      });
    }

    await PayrollRecord.deleteMany({ batchId: batch._id });

    const employees = await User.find({ tenantId, status: 'active', role: { $ne: 'Super Admin' } });

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalOvertimeCost = 0;

    for (const emp of employees) {
      let empSalary = await EmployeeSalary.findOne({ tenantId, employeeId: emp._id });
      if (!empSalary) {
        const r = (emp.role || '').toLowerCase();
        const defaultAnnual = r.includes('admin')
          ? 1200000
          : r.includes('manager')
          ? 840000
          : r.includes('leader')
          ? 600000
          : 480000;
        const { monthlyCtc, basicSalary, hra, da, conveyance, medicalAllowance, specialAllowance } = calculateSalaryBreakup(defaultAnnual);
        empSalary = await EmployeeSalary.create({
          tenantId,
          employeeId: emp._id,
          annualCtc: defaultAnnual,
          monthlyCtc,
          basicSalary,
          hra,
          da,
          conveyance,
          medicalAllowance,
          specialAllowance,
        });
      }

      const attendanceRecords = await Attendance.find({
        tenantId,
        employeeId: emp._id,
        date: { $gte: startDate, $lte: endDate },
      });

      const presentCount = attendanceRecords.filter((r) => ['Present', 'Late Arrival'].includes(r.status)).length;
      const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;
      const otMinutes = attendanceRecords.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0);
      const otHours = Math.round((otMinutes / 60) * 10) / 10;

      const approvedLeaves = await LeaveRequest.find({
        tenantId,
        employeeId: emp._id,
        finalStatus: 'approved',
        fromDate: { $lte: endDate },
        toDate: { $gte: startDate },
      }).populate('leaveTypeId');

      const paidLeaveDays = approvedLeaves.filter((l) => l.leaveTypeId?.isPaid).reduce((sum, l) => sum + l.totalDays, 0);
      const unpaidLopDays = absentCount + approvedLeaves.filter((l) => !l.leaveTypeId?.isPaid).reduce((sum, l) => sum + l.totalDays, 0);

      const stdDays = config.standardWorkingDays || 26;
      const basic = empSalary.basicSalary;
      const hra = empSalary.hra;
      const da = empSalary.da;
      const conveyance = empSalary.conveyance;
      const medical = empSalary.medicalAllowance;
      const special = empSalary.specialAllowance;

      const baseGross = basic + hra + da + conveyance + medical + special;

      const lopDeduction = Math.round((baseGross / stdDays) * unpaidLopDays);
      const hourlyBasicRate = basic / stdDays / 8;
      const overtimePay = Math.round(hourlyBasicRate * 1.5 * otHours);

      const approvedClaims = await ReimbursementClaim.find({
        tenantId,
        employeeId: emp._id,
        status: 'approved',
        claimDate: { $gte: startDate, $lte: endDate },
      });
      const reimbursements = approvedClaims.reduce((sum, c) => sum + c.amount, 0);

      const activeLoan = await LoanAdvance.findOne({
        tenantId,
        employeeId: emp._id,
        status: 'active',
      });
      const loanEmiDeduction = activeLoan ? Math.min(activeLoan.emiAmount, activeLoan.remainingBalance) : 0;

      const pfDeduction = config.enablePf ? Math.round(Math.min(basic, 15000) * 0.12) : 0;
      const grossForEsi = baseGross - lopDeduction + overtimePay;
      const esiDeduction = config.enableEsi && grossForEsi <= 21000 ? Math.round(grossForEsi * 0.0075) : 0;
      const professionalTax = config.enablePt && grossForEsi > 15000 ? 200 : 0;
      const tdsTax = config.enableTds && empSalary.annualCtc > 700000 ? Math.round((baseGross * 0.05)) : 0;

      const grossSalary = Math.max(0, baseGross - lopDeduction + overtimePay + reimbursements);
      const totalEmpDeduction = pfDeduction + esiDeduction + professionalTax + tdsTax + loanEmiDeduction;
      const netSalary = Math.max(0, grossSalary - totalEmpDeduction);

      totalGross += grossSalary;
      totalDeductions += totalEmpDeduction;
      totalNet += netSalary;
      totalOvertimeCost += overtimePay;

      await PayrollRecord.create({
        tenantId,
        batchId: batch._id,
        employeeId: emp._id,
        month,
        year,
        standardWorkingDays: stdDays,
        presentDays: presentCount,
        absentDays: absentCount,
        paidLeaveDays,
        unpaidLopDays,
        overtimeHours: otHours,
        basicSalary: basic,
        hra,
        da,
        conveyance,
        medicalAllowance: medical,
        specialAllowance: special,
        overtimePay,
        performanceBonus: 0,
        reimbursements,
        grossSalary,
        pfDeduction,
        esiDeduction,
        professionalTax,
        tdsTax,
        lopDeduction,
        loanEmiDeduction,
        totalDeductions: totalEmpDeduction,
        netSalary,
        status: 'processed',
        paymentStatus: 'pending',
      });
    }

    batch.totalEmployees = employees.length;
    batch.totalGrossSalary = totalGross;
    batch.totalDeductions = totalDeductions;
    batch.totalNetSalary = totalNet;
    batch.totalOvertimeCost = totalOvertimeCost;
    batch.status = 'processed';
    await batch.save();

    await PayrollAuditLog.create({
      tenantId,
      performedBy: req.user.id,
      action: 'BATCH_PROCESSED',
      details: `HR processed payroll batch: ${batchName} for ${employees.length} employees. Total Net: ₹${totalNet.toLocaleString('en-IN')}`,
    });

    res.status(200).json({
      success: true,
      message: `HR processed payroll for ${employees.length} employees. Sent to Company Admin for approval.`,
      batch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Payroll Batches (Auto-syncs all department managers & recalculates totals)
// @route   GET /api/payroll/batches
// @access  Private
export const getPayrollBatches = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;
    const batches = await PayrollBatch.find({ tenantId }).sort({ year: -1, month: -1 });

    for (const batch of batches) {
      const activeEmployees = await User.find({ tenantId: batch.tenantId, status: 'active', role: { $ne: 'Super Admin' } });

      for (const emp of activeEmployees) {
        const existingRecord = await PayrollRecord.findOne({ batchId: batch._id, employeeId: emp._id });
        if (!existingRecord) {
          let empSalary = await EmployeeSalary.findOne({ tenantId: batch.tenantId, employeeId: emp._id });
          if (!empSalary) {
            const r = (emp.role || '').toLowerCase();
            const defaultAnnual = r.includes('admin') ? 1200000 : r.includes('manager') ? 840000 : r.includes('leader') ? 600000 : 480000;
            const { monthlyCtc, basicSalary, hra, da, conveyance, medicalAllowance, specialAllowance } = calculateSalaryBreakup(defaultAnnual);
            empSalary = await EmployeeSalary.create({
              tenantId: batch.tenantId,
              employeeId: emp._id,
              annualCtc: defaultAnnual,
              monthlyCtc,
              basicSalary,
              hra,
              da,
              conveyance,
              medicalAllowance,
              specialAllowance,
            });
          }

          const basic = empSalary.basicSalary || 20000;
          const hra = empSalary.hra || 8000;
          const da = empSalary.da || 4000;
          const conveyance = empSalary.conveyance || 1600;
          const medical = empSalary.medicalAllowance || 1250;
          const special = empSalary.specialAllowance || 5150;
          const gross = basic + hra + da + conveyance + medical + special;

          const pf = Math.round(basic * 0.12);
          const esi = Math.round(gross * 0.0075);
          const pt = gross > 15000 ? 200 : 0;
          const totalDed = pf + esi + pt;
          const net = Math.max(0, gross - totalDed);

          await PayrollRecord.create({
            tenantId: batch.tenantId,
            batchId: batch._id,
            employeeId: emp._id,
            month: batch.month,
            year: batch.year,
            standardWorkingDays: 26,
            presentDays: 26,
            absentDays: 0,
            paidLeaveDays: 0,
            unpaidLopDays: 0,
            overtimeHours: 0,
            basicSalary: basic,
            hra,
            da,
            conveyance,
            medicalAllowance: medical,
            specialAllowance: special,
            overtimePay: 0,
            grossSalary: gross,
            pfDeduction: pf,
            esiDeduction: esi,
            professionalTax: pt,
            tdsTax: 0,
            lopDeduction: 0,
            loanEmiDeduction: 0,
            totalDeductions: totalDed,
            netSalary: net,
            status: batch.status,
            paymentStatus: batch.status === 'paid' ? 'credited' : 'pending',
          });
        }
      }

      await PayrollRecord.deleteMany({ batchId: batch._id, employeeId: null });

      const allValidRecords = await PayrollRecord.find({ batchId: batch._id, employeeId: { $ne: null } });
      let bTotalGross = 0;
      let bTotalDed = 0;
      let bTotalNet = 0;
      allValidRecords.forEach((r) => {
        bTotalGross += r.grossSalary || 0;
        bTotalDed += r.totalDeductions || 0;
        bTotalNet += r.netSalary || 0;
      });

      batch.totalEmployees = allValidRecords.length;
      batch.totalGrossSalary = bTotalGross;
      batch.totalDeductions = bTotalDed;
      batch.totalNetSalary = bTotalNet;
      await batch.save();
    }

    const updatedBatches = await PayrollBatch.find({ tenantId }).sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, count: updatedBatches.length, batches: updatedBatches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Itemized Payslip Records for a Batch
//          Admin/HR/Finance: Sees ALL employee records
//          Other roles: Sees ONLY THEIR OWN record
// @route   GET /api/payroll/batches/:batchId/records
// @access  Private
export const getBatchRecords = async (req, res) => {
  try {
    const { batchId } = req.params;
    const isHrOrAdminOrFinance = ['Super Admin', 'Company Admin', 'HR', 'Finance'].includes(req.user.role);

    const batch = await PayrollBatch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Payroll batch not found' });
    }

    // Auto-sync missing active department managers and employees into batch for all batch statuses
    const activeEmployees = await User.find({ tenantId: batch.tenantId, status: 'active', role: { $ne: 'Super Admin' } });

    for (const emp of activeEmployees) {
      const existingRecord = await PayrollRecord.findOne({ batchId: batch._id, employeeId: emp._id });
      if (!existingRecord) {
        let empSalary = await EmployeeSalary.findOne({ tenantId: batch.tenantId, employeeId: emp._id });
        if (!empSalary) {
          const r = (emp.role || '').toLowerCase();
          const defaultAnnual = r.includes('admin') ? 1200000 : r.includes('manager') ? 840000 : r.includes('leader') ? 600000 : 480000;
          const { monthlyCtc, basicSalary, hra, da, conveyance, medicalAllowance, specialAllowance } = calculateSalaryBreakup(defaultAnnual);
          empSalary = await EmployeeSalary.create({
            tenantId: batch.tenantId,
            employeeId: emp._id,
            annualCtc: defaultAnnual,
            monthlyCtc,
            basicSalary,
            hra,
            da,
            conveyance,
            medicalAllowance,
            specialAllowance,
          });
        }

        const basic = empSalary.basicSalary || 20000;
        const hra = empSalary.hra || 8000;
        const da = empSalary.da || 4000;
        const conveyance = empSalary.conveyance || 1600;
        const medical = empSalary.medicalAllowance || 1250;
        const special = empSalary.specialAllowance || 5150;
        const gross = basic + hra + da + conveyance + medical + special;

        const pf = Math.round(basic * 0.12);
        const esi = Math.round(gross * 0.0075);
        const pt = gross > 15000 ? 200 : 0;
        const totalDed = pf + esi + pt;
        const net = Math.max(0, gross - totalDed);

        await PayrollRecord.create({
          tenantId: batch.tenantId,
          batchId: batch._id,
          employeeId: emp._id,
          month: batch.month,
          year: batch.year,
          standardWorkingDays: 26,
          presentDays: 26,
          absentDays: 0,
          paidLeaveDays: 0,
          unpaidLopDays: 0,
          overtimeHours: 0,
          basicSalary: basic,
          hra,
          da,
          conveyance,
          medicalAllowance: medical,
          specialAllowance: special,
          overtimePay: 0,
          grossSalary: gross,
          pfDeduction: pf,
          esiDeduction: esi,
          professionalTax: pt,
          tdsTax: 0,
          lopDeduction: 0,
          loanEmiDeduction: 0,
          totalDeductions: totalDed,
          netSalary: net,
          status: batch.status,
          paymentStatus: batch.status === 'paid' ? 'credited' : 'pending',
        });
      }
    }

    // Clean up orphaned records where employee was deleted
    await PayrollRecord.deleteMany({ batchId: batch._id, employeeId: null });

    // Recalculate batch summary totals
    const allValidRecords = await PayrollRecord.find({ batchId: batch._id, employeeId: { $ne: null } });
    let bTotalGross = 0;
    let bTotalDed = 0;
    let bTotalNet = 0;
    allValidRecords.forEach((r) => {
      bTotalGross += r.grossSalary || 0;
      bTotalDed += r.totalDeductions || 0;
      bTotalNet += r.netSalary || 0;
    });

    batch.totalEmployees = allValidRecords.length;
    batch.totalGrossSalary = bTotalGross;
    batch.totalDeductions = bTotalDed;
    batch.totalNetSalary = bTotalNet;
    await batch.save();

    let query = { batchId: batch._id };
    if (!isHrOrAdminOrFinance) {
      query.employeeId = req.user.id;
    }

    const rawRecords = await PayrollRecord.find(query)
      .populate('employeeId', 'name email employeeId role department designation')
      .sort({ createdAt: 1 });

    const records = rawRecords.filter((r) => r.employeeId != null);

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Adjust Individual Payroll Record
// @route   PATCH /api/payroll/records/:id/adjust
// @access  Private (Company Admin, HR)
export const adjustPayrollRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { performanceBonus, otherDeductions } = req.body;

    const record = await PayrollRecord.findById(id);
    if (!record) return res.status(404).json({ success: false, message: 'Payroll record not found' });

    if (record.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot adjust a DISBURSED & PAID payroll record.' });
    }

    if (performanceBonus !== undefined) record.performanceBonus = performanceBonus;
    if (otherDeductions !== undefined) record.otherDeductions = otherDeductions;

    const baseGross = record.basicSalary + record.hra + record.da + record.conveyance + record.medicalAllowance + record.specialAllowance;
    record.grossSalary = Math.max(0, baseGross - record.lopDeduction + record.overtimePay + record.performanceBonus + record.reimbursements);

    const totalDeductions = record.pfDeduction + record.esiDeduction + record.professionalTax + record.tdsTax + record.loanEmiDeduction + record.otherDeductions;
    record.totalDeductions = totalDeductions;
    record.netSalary = Math.max(0, record.grossSalary - totalDeductions);

    await record.save();

    const batchRecords = await PayrollRecord.find({ batchId: record.batchId });
    const batch = await PayrollBatch.findById(record.batchId);
    if (batch) {
      batch.totalGrossSalary = batchRecords.reduce((sum, r) => sum + r.grossSalary, 0);
      batch.totalDeductions = batchRecords.reduce((sum, r) => sum + r.totalDeductions, 0);
      batch.totalNetSalary = batchRecords.reduce((sum, r) => sum + r.netSalary, 0);
      await batch.save();
    }

    res.status(200).json({ success: true, message: 'Payroll record adjusted successfully', record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    STEP 2: COMPANY ADMIN APPROVES PAYROLL (Optional/Required per policy)
// @route   PATCH /api/payroll/batches/:batchId/approve
// @access  Private (Company Admin, Super Admin)
export const approvePayrollBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await PayrollBatch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Payroll batch not found' });
    }

    batch.status = 'approved';
    batch.approvedBy = req.user.id;
    batch.approvedAt = new Date();
    await batch.save();

    await PayrollRecord.updateMany({ batchId: batch._id }, { status: 'approved' });

    // Notify Finance Users that batch is ready for payment
    const financeUsers = await User.find({ tenantId: batch.tenantId, role: { $in: ['Finance', 'Company Admin'] } });
    for (const finUser of financeUsers) {
      await Notification.create({
        tenantId: batch.tenantId,
        recipientId: finUser._id,
        title: 'Payroll Approved - Action Required',
        message: `Payroll Batch [${batch.batchName}] (Total: ₹${batch.totalNetSalary.toLocaleString('en-IN')}) has been APPROVED by Company Admin. Ready for Finance salary disbursement.`,
        type: 'system',
        link: '/payroll',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payroll batch APPROVED by Company Admin! Ready for Finance salary disbursement.',
      batch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    STEP 3: FINANCE DISBURSES SALARIES & MARKS PAID
// @route   PATCH /api/payroll/batches/:batchId/disburse
// @access  Private (Finance, Company Admin)
export const disbursePayrollBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await PayrollBatch.findById(batchId);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Payroll batch not found' });
    }

    batch.status = 'paid';
    batch.paidBy = req.user.id;
    batch.paymentDate = new Date();
    await batch.save();

    await PayrollRecord.updateMany({ batchId: batch._id }, { status: 'paid', paymentStatus: 'credited' });

    const records = await PayrollRecord.find({ batchId: batch._id });
    for (const rec of records) {
      if (rec.loanEmiDeduction > 0) {
        const activeLoan = await LoanAdvance.findOne({ tenantId: rec.tenantId, employeeId: rec.employeeId, status: 'active' });
        if (activeLoan) {
          activeLoan.remainingBalance = Math.max(0, activeLoan.remainingBalance - rec.loanEmiDeduction);
          if (activeLoan.remainingBalance === 0) {
            activeLoan.status = 'completed';
          }
          await activeLoan.save();
        }
      }

      await Notification.create({
        tenantId: rec.tenantId,
        recipientId: rec.employeeId,
        title: 'Salary Credited & Payslip Unlocked!',
        message: `Your Net Salary of ₹${rec.netSalary.toLocaleString('en-IN')} for ${rec.month}/${rec.year} has been DISBURSED & PAID by Finance Accounts! Payslip is now available for download.`,
        type: 'system',
        link: '/payroll/payslips',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Salaries DISBURSED & PAID successfully! Employee payslips are now unlocked and credited.',
      batch,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Employee Personal Payslips (ESS Portal - Only own payslips)
// @route   GET /api/payroll/my-payslips
// @access  Private (All Employees)
export const getMyPayslips = async (req, res) => {
  try {
    const records = await PayrollRecord.find({ employeeId: req.user.id, status: { $in: ['approved', 'paid'] } })
      .populate('batchId', 'batchName month year status paymentDate')
      .sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Loans & Advances Endpoints
// @route   GET /api/payroll/loans & POST /api/payroll/loans
// @access  Private
export const getLoans = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const isHrOrAdmin = ['Super Admin', 'Company Admin', 'HR'].includes(req.user.role);

    let query = { tenantId };
    if (!isHrOrAdmin) {
      query.employeeId = req.user.id;
    }

    const loans = await LoanAdvance.find(query).populate('employeeId', 'name email employeeId role department').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: loans.length, loans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyLoan = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { principalAmount, emiAmount, tenureMonths, reason, type } = req.body;

    const loan = await LoanAdvance.create({
      tenantId,
      employeeId: req.user.id,
      type: type || 'Loan',
      principalAmount,
      emiAmount,
      tenureMonths: tenureMonths || 1,
      remainingBalance: principalAmount,
      reason,
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Loan application submitted for HR approval', loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLoanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const loan = await LoanAdvance.findById(id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan record not found' });

    loan.status = status;
    loan.approvedBy = req.user.id;
    await loan.save();

    res.status(200).json({ success: true, message: `Loan status updated to ${status}`, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reimbursements Endpoints
// @route   GET /api/payroll/reimbursements & POST /api/payroll/reimbursements
// @access  Private
export const getReimbursements = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const isHrOrAdmin = ['Super Admin', 'Company Admin', 'HR'].includes(req.user.role);

    let query = { tenantId };
    if (!isHrOrAdmin) {
      query.employeeId = req.user.id;
    }

    const claims = await ReimbursementClaim.find(query).populate('employeeId', 'name email employeeId role department').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: claims.length, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const applyReimbursement = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { claimType, amount, description, receiptUrl } = req.body;

    const claim = await ReimbursementClaim.create({
      tenantId,
      employeeId: req.user.id,
      claimType,
      amount,
      description,
      receiptUrl: receiptUrl || '',
      status: 'pending',
    });

    res.status(201).json({ success: true, message: 'Reimbursement claim submitted', claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReimbursementStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const claim = await ReimbursementClaim.findById(id);
    if (!claim) return res.status(404).json({ success: false, message: 'Claim record not found' });

    claim.status = status;
    claim.approvedBy = req.user.id;
    await claim.save();

    res.status(200).json({ success: true, message: `Reimbursement claim ${status}`, claim });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
