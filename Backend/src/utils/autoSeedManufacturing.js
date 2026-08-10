import bcrypt from 'bcryptjs';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Warehouse from '../models/Warehouse.js';
import Vendor from '../models/Vendor.js';
import PurchaseRequest from '../models/PurchaseRequest.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import GRN from '../models/GRN.js';
import BOM from '../models/BOM.js';
import ProductionOrder from '../models/ProductionOrder.js';
import Machine from '../models/Machine.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import Customer from '../models/Customer.js';
import GSTInvoice from '../models/GSTInvoice.js';
import CreditNote from '../models/CreditNote.js';
import DebitNote from '../models/DebitNote.js';
import GSTSettings from '../models/GSTSettings.js';

export const autoSeedManufacturing = async () => {
  try {
    const DEFAULT_PASS = 'Password123!';

    // 1. Direct MongoDB Migration: Update pre-existing vendor records to +91 Indian phone numbers
    await Vendor.updateMany(
      { $or: [{ phone: { $regex: /^\+1/ } }, { phone: { $regex: /555/ } }] },
      { $set: { phone: '+91 98765 43210' } }
    );
    await Vendor.updateMany(
      { vendorCode: 'VND-P-002' },
      { $set: { phone: '+91 98123 45678', email: 'orders@polymertech.in', address: '45 Chemical Zone, Sriperumbudur, Chennai' } }
    );
    await Vendor.updateMany(
      { vendorCode: 'VND-M-001' },
      { $set: { phone: '+91 98765 43210', email: 'sales@apexmetals.in', address: '100 MIDC Industrial Area, Bhosari, Pune' } }
    );

    // 2. Ensure Super Admin Account Exists
    let superAdmin = await User.findOne({ role: 'Super Admin' });
    if (!superAdmin) {
      superAdmin = await User.create({
        employeeId: 'SA-001',
        name: 'SaaS Platform Super Admin',
        email: 'superadmin@saaserp.com',
        password: DEFAULT_PASS,
        role: 'Super Admin',
        tenantId: null,
        department: 'Platform Administration',
        designation: 'Global Super Admin',
        status: 'active',
      });
      console.log(' -> Created Global Super Admin: superadmin@saaserp.com');
    }

    // 3. Ensure a Default Company Exists
    let companies = await Company.find({});
    if (companies.length === 0) {
      const defaultComp = await Company.create({
        name: 'Apex Manufacturing Pvt Ltd',
        code: 'APEX',
        industry: 'Automotive & Heavy Tooling',
        email: 'info@apexmanufacturing.in',
        phone: '+91 98765 43210',
        subscriptionPlan: 'enterprise',
        status: 'active',
      });
      companies = [defaultComp];
      console.log(' -> Created Default Company: Apex Manufacturing Pvt Ltd (APEX)');
    }

    // 4. Ensure Users Exist for ALL 13 ROLES in the Database
    const rolesToSeed = [
      { role: 'Company Admin', prefix: 'admin', name: 'Company Admin', dept: 'Executive Management', desig: 'Managing Director' },
      { role: 'Sales Manager', prefix: 'salesmanager', name: 'Sales Manager', dept: 'Sales & Business Development', desig: 'Head of B2B Sales' },
      { role: 'Sales Executive', prefix: 'salesexec', name: 'Sales Executive', dept: 'Sales & Business Development', desig: 'Senior Sales Representative' },
      { role: 'Purchase Manager', prefix: 'purchase', name: 'Purchase Manager', dept: 'Procurement', desig: 'Head of Purchasing' },
      { role: 'Inventory Manager', prefix: 'inventory', name: 'Inventory Manager', dept: 'Supply Chain', desig: 'Inventory Controller' },
      { role: 'Warehouse Manager', prefix: 'warehouse', name: 'Warehouse Manager', dept: 'Logistics', desig: 'Plant Warehouse Head' },
      { role: 'Production Manager', prefix: 'production', name: 'Production Manager', dept: 'Manufacturing Ops', desig: 'Plant Production Manager' },
      { role: 'Maintenance Manager', prefix: 'maintenance', name: 'Maintenance Manager', dept: 'Plant Maintenance', desig: 'Head of Machine Maintenance' },
      { role: 'Finance', prefix: 'finance', name: 'Finance Controller', dept: 'Finance & Accounts', desig: 'Senior Financial Analyst' },
      { role: 'HR', prefix: 'hr', name: 'HR Manager', dept: 'Human Resources', desig: 'Chief HR Officer' },
      { role: 'Manager', prefix: 'manager', name: 'Operations Manager', dept: 'Plant Operations', desig: 'Senior Operations Manager' },
      { role: 'Team Leader', prefix: 'teamleader', name: 'Assembly Line Leader', dept: 'Production Floor', desig: 'Shift Team Lead' },
      { role: 'Employee', prefix: 'employee', name: 'Plant Technician', dept: 'Assembly Line 1', desig: 'CNC Machine Operator' },
    ];

    // Purge any legacy Assistant Manager database accounts
    await User.deleteMany({ role: 'Assistant Manager' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASS, salt);

    for (const company of companies) {
      const compDomain = company.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      for (const roleDef of rolesToSeed) {
        const email = `${roleDef.prefix}@${compDomain}.com`;
        let userExists = await User.findOne({ email });

        if (!userExists) {
          userExists = await User.findOne({ tenantId: company._id, role: roleDef.role });
        }

        if (!userExists) {
          await User.create({
            employeeId: `${company.code}-${roleDef.prefix.toUpperCase()}-01`,
            name: `${company.name} ${roleDef.name}`,
            email: email,
            password: DEFAULT_PASS,
            role: roleDef.role,
            tenantId: company._id,
            department: roleDef.dept,
            designation: roleDef.desig,
            status: 'active',
          });
        }
      }
    }

    // Reset Super Admin password as well
    if (superAdmin) {
      await User.updateOne({ _id: superAdmin._id }, { $set: { password: hashedPassword } });
    }

    // 5. Check Manufacturing Suite Items / Data Seeding
    const itemCount = await Item.countDocuments();
    if (itemCount > 0) {
      return;
    }

    console.log('==================================================');
    console.log('[Auto-Seeding Phase 4 Manufacturing Module Data...]');
    console.log('==================================================');

    for (const company of companies) {
      const adminUser = (await User.findOne({ tenantId: company._id, role: 'Company Admin' })) || (await User.findOne({ tenantId: company._id }));
      const prodManager = (await User.findOne({ tenantId: company._id, role: 'Production Manager' })) || adminUser;
      const technician = (await User.findOne({ tenantId: company._id, role: 'Employee' })) || adminUser;

      if (!adminUser) continue;

      // Warehouses
      const wh1 = await Warehouse.create({
        tenantId: company._id,
        code: `${company.code}-WH1`,
        name: `${company.name} Central Storage & Assembly Hub`,
        location: `${company.location || 'Pune Industrial Corridor'}, Dock A`,
        capacitySqFt: 15000,
        managerId: adminUser._id,
        racks: [
          { rackNo: 'Rack A1 - High Alloy Steels', capacity: 250, occupied: 120 },
          { rackNo: 'Rack B2 - Precision Bearings & Seals', capacity: 200, occupied: 95 },
        ],
        status: 'active',
      });

      // Vendors with Indian Phone Numbers (+91)
      const vendor1 = await Vendor.create({
        tenantId: company._id,
        vendorCode: `VND-M-001`,
        companyName: 'Apex Precision Metals & Alloys Corp',
        contactPerson: 'Rahul Vance',
        email: `sales@apexmetals.in`,
        phone: '+91 98765 43210',
        gstin: '27AAACA1001A1Z5',
        pan: 'AAACA1001A',
        address: '100 MIDC Industrial Area, Bhosari, Pune',
        bankDetails: { accountNo: '998877665511', ifsc: 'HDFC0004521', bankName: 'HDFC Industrial Bank', branch: 'Bhosari Branch' },
        rating: 5,
        performanceScore: 98,
        outstandingBalance: 14500,
        status: 'active',
      });

      // Items
      const rawSteelBar = await Item.create({
        tenantId: company._id,
        itemCode: 'RM-STL-4140',
        name: '4140 High-Tensile Chrome-Moly Alloy Steel Rods',
        category: 'Metals & Alloys',
        itemGroup: 'Raw Materials',
        itemType: 'Raw Material',
        uom: 'Kg',
        barcode: 'BAR-RM-STL-4140',
        qrCode: `QR-${company.code}-STL-4140`,
        minStockLevel: 50,
        reorderLevel: 100,
        reorderQty: 500,
        unitPrice: 48,
        valuationMethod: 'FIFO',
        totalStock: 420,
      });

      const finishedDriveShaft = await Item.create({
        tenantId: company._id,
        itemCode: 'FG-SHF-900',
        name: 'Heavy Duty Automotive Transmission Drive Shaft',
        category: 'Drivetrain Components',
        itemGroup: 'Finished Goods',
        itemType: 'Finished Goods',
        uom: 'Pcs',
        barcode: 'BAR-FG-SHF-900',
        qrCode: `QR-${company.code}-SHF-900`,
        minStockLevel: 15,
        reorderLevel: 30,
        reorderQty: 100,
        unitPrice: 420,
        valuationMethod: 'FIFO',
        totalStock: 60,
      });

      // BOM
      const bom1 = await BOM.create({
        tenantId: company._id,
        bomNumber: `BOM-SHF-001`,
        finishedItemId: finishedDriveShaft._id,
        finishedQty: 1,
        components: [
          {
            rawItemId: rawSteelBar._id,
            quantityRequired: 5.2,
            wastagePercent: 3,
          },
        ],
        estimatedMaterialCost: 275,
        status: 'active',
      });

      // Machines
      const cncMachine = await Machine.create({
        tenantId: company._id,
        machineCode: 'CNC-VMC-850',
        name: '5-Axis Heavy Duty CNC Milling Center',
        category: 'CNC Machining Center',
        model: '2024 Haas VMC-850X',
        serialNumber: 'SN-HAAS-998811',
        location: 'Shopfloor Line 1 - Heavy Tooling',
        status: 'operational',
        lastServiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        nextServiceDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        totalDowntimeHours: 4.5,
      });

      // Maintenance Log
      await MaintenanceLog.create({
        tenantId: company._id,
        logNumber: 'MNT-1001',
        machineId: cncMachine._id,
        type: 'preventive',
        problemDescription: 'Routine 250-hour spindle calibration and lubrication.',
        technicianId: technician._id,
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        maintenanceCost: 380,
        status: 'completed',
      });

      // Work Order
      await ProductionOrder.create({
        tenantId: company._id,
        orderNumber: 'WO-2026-801',
        bomId: bom1._id,
        finishedItemId: finishedDriveShaft._id,
        plannedQty: 20,
        producedQty: 0,
        scrapQty: 0,
        startDate: new Date(),
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        assignedMachines: [cncMachine._id],
        assignedEmployees: [technician._id],
        status: 'scheduled',
        materialsDeducted: false,
        costCalculation: {
          materialCost: 5500,
          overheadCost: 825,
          totalProductionCost: 6325,
        },
      });

      // Seed CRM Customers
      const customer1 = await Customer.create({
        tenantId: company._id,
        customerCode: 'CUST-001',
        companyName: 'Apex Tooling & Heavy Auto Corp',
        contactPerson: 'Vikram Sundaram',
        email: 'billing@apextooling.in',
        phone: '+91 98450 12345',
        gstin: '33AAACA9999A1Z5',
        pan: 'AAACA9999A',
        billingAddress: { street: '12 Industrial Estate, Guindy', city: 'Chennai', state: 'Tamil Nadu', stateCode: '33', zipCode: '600032' },
        creditLimit: 1000000,
        status: 'active',
      });

      const customer2 = await Customer.create({
        tenantId: company._id,
        customerCode: 'CUST-002',
        companyName: 'Mumbai Heavy Drivetrains Pvt Ltd',
        contactPerson: 'Rajesh Kulkarni',
        email: 'accounts@mumbaidrivetrains.in',
        phone: '+91 98200 54321',
        gstin: '27AAACB8888A1Z2',
        pan: 'AAACB8888A',
        billingAddress: { street: '45 MIDC Zone 2, Andheri East', city: 'Mumbai', state: 'Maharashtra', stateCode: '27', zipCode: '400093' },
        creditLimit: 1500000,
        status: 'active',
      });

      // Seed GST Settings
      await GSTSettings.create({
        tenantId: company._id,
        gstin: '33AAACA1001A1Z5',
        state: 'Tamil Nadu',
        stateCode: '33',
        invoicePrefix: 'INV-2026-',
        defaultGstRate: 18,
      });

      // Seed GST Invoices
      const inv1 = await GSTInvoice.create({
        tenantId: company._id,
        invoiceNumber: 'INV-2026-1001',
        invoiceDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        customerId: customer1._id,
        sellerState: 'Tamil Nadu',
        placeOfSupply: 'Tamil Nadu',
        isInterState: false,
        items: [
          {
            itemId: finishedDriveShaft._id,
            name: finishedDriveShaft.name,
            itemCode: finishedDriveShaft.itemCode,
            hsnCode: '8471',
            uom: 'Pcs',
            qty: 10,
            unitPrice: 420,
            discountPercent: 0,
            taxableAmount: 4200,
            gstRate: 18,
            cgstRate: 9,
            cgstAmount: 378,
            sgstRate: 9,
            sgstAmount: 378,
            igstRate: 0,
            igstAmount: 0,
            totalAmount: 4956,
          },
        ],
        subTotal: 4200,
        totalDiscount: 0,
        totalTaxableAmount: 4200,
        cgstTotal: 378,
        sgstTotal: 378,
        igstTotal: 0,
        totalTaxAmount: 756,
        grandTotal: 4956,
        paidAmount: 4956,
        balanceDue: 0,
        paymentStatus: 'paid',
        notes: 'Invoice settled in full via NEFT.',
        createdBy: adminUser._id,
      });

      const inv2 = await GSTInvoice.create({
        tenantId: company._id,
        invoiceNumber: 'INV-2026-1002',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        customerId: customer2._id,
        sellerState: 'Tamil Nadu',
        placeOfSupply: 'Maharashtra',
        isInterState: true,
        items: [
          {
            itemId: finishedDriveShaft._id,
            name: finishedDriveShaft.name,
            itemCode: finishedDriveShaft.itemCode,
            hsnCode: '8471',
            uom: 'Pcs',
            qty: 25,
            unitPrice: 420,
            discountPercent: 5,
            taxableAmount: 9975,
            gstRate: 18,
            cgstRate: 0,
            cgstAmount: 0,
            sgstRate: 0,
            sgstAmount: 0,
            igstRate: 18,
            igstAmount: 1795.5,
            totalAmount: 11770.5,
          },
        ],
        subTotal: 10500,
        totalDiscount: 525,
        totalTaxableAmount: 9975,
        cgstTotal: 0,
        sgstTotal: 0,
        igstTotal: 1796,
        totalTaxAmount: 1796,
        grandTotal: 11771,
        paidAmount: 0,
        balanceDue: 11771,
        paymentStatus: 'pending',
        notes: 'Inter-state IGST B2B invoice.',
        createdBy: adminUser._id,
      });

      // Credit Note
      await CreditNote.create({
        tenantId: company._id,
        creditNoteNumber: 'CN-2026-101',
        invoiceId: inv1._id,
        customerId: customer1._id,
        reason: 'Damaged Goods',
        subTotalRefund: 420,
        gstRefundTotal: 76,
        totalRefundAmount: 496,
        status: 'refunded',
        createdBy: adminUser._id,
      });

      // Debit Note
      await DebitNote.create({
        tenantId: company._id,
        debitNoteNumber: 'DN-2026-101',
        invoiceId: inv2._id,
        customerId: customer2._id,
        reason: 'Additional Freight Charges',
        additionalAmount: 1500,
        gstAdditional: 270,
        totalDebitAmount: 1770,
        status: 'issued',
        createdBy: adminUser._id,
      });
    }
  } catch (error) {
    console.error('[Auto-Seed Manufacturing Error]:', error);
  }
};
