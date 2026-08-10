import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Warehouse from '../models/Warehouse.js';
import Vendor from '../models/Vendor.js';
import BOM from '../models/BOM.js';
import Machine from '../models/Machine.js';
import MaintenanceLog from '../models/MaintenanceLog.js';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI missing in .env');
      process.exit(1);
    }

    console.log('[Connecting to MongoDB Atlas for seeding...]');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 });
    console.log('[Connected to DB successfully]');

    await Company.deleteMany({});
    await User.deleteMany({});
    await Item.deleteMany({});
    await Warehouse.deleteMany({});
    await Vendor.deleteMany({});
    await BOM.deleteMany({});
    await Machine.deleteMany({});
    await MaintenanceLog.deleteMany({});
    console.log('[Wiped existing collections for clean manufacturing seed]');

    const defaultPassword = 'Password123!';

    const superAdmin = await User.create({
      employeeId: 'SA-001',
      name: 'Super Admin',
      email: 'superadmin@saaserp.com',
      password: defaultPassword,
      role: 'Super Admin',
      department: 'Global SaaS Governance',
      designation: 'Platform Owner',
      phoneNumber: '+1 (800) 555-0100',
      branchLocation: 'Global HQ',
      joiningDate: new Date('2024-01-01'),
      status: 'active',
    });

    const companiesData = [
      {
        name: 'Company A',
        code: 'CMP-A',
        industry: 'Automotive Parts & Heavy Machining',
        subscriptionPlan: 'Enterprise',
        contactEmail: 'admin@companya.com',
        phone: '+1 (555) 101-0001',
        maxEmployees: 1000,
        status: 'active',
        location: 'Detroit Assembly Plant',
      },
      {
        name: 'Company B',
        code: 'CMP-B',
        industry: 'Aerospace Components & Precision Metals',
        subscriptionPlan: 'Enterprise',
        contactEmail: 'admin@companyb.com',
        phone: '+1 (555) 202-0002',
        maxEmployees: 750,
        status: 'active',
        location: 'Seattle Precision Works',
      },
    ];

    for (const compData of companiesData) {
      const company = await Company.create(compData);
      const prefix = company.name.toLowerCase().replace(/\s+/g, '');

      const compAdmin = await User.create({
        employeeId: `${company.code}-101`,
        name: `${company.name} Admin`,
        email: `admin@${prefix}.com`,
        password: defaultPassword,
        role: 'Company Admin',
        tenantId: company._id,
        department: 'Executive Management',
        designation: 'Managing Director / Plant Head',
        joiningDate: new Date('2024-02-01'),
        status: 'active',
      });

      const hrUser = await User.create({
        employeeId: `${company.code}-102`,
        name: `${company.name} HR Lead`,
        email: `hr@${prefix}.com`,
        password: defaultPassword,
        role: 'HR',
        tenantId: company._id,
        department: 'Human Resources',
        designation: 'Chief HR Officer',
        joiningDate: new Date('2024-02-15'),
        status: 'active',
      });

      const managerUser = await User.create({
        employeeId: `${company.code}-103`,
        name: `${company.name} Ops Manager`,
        email: `manager@${prefix}.com`,
        password: defaultPassword,
        role: 'Manager',
        tenantId: company._id,
        department: 'Operations',
        designation: 'General Operations Manager',
        joiningDate: new Date('2024-03-01'),
        status: 'active',
      });

      const prodManager = await User.create({
        employeeId: `${company.code}-105`,
        name: `${company.name} Production Head`,
        email: `production@${prefix}.com`,
        password: defaultPassword,
        role: 'Production Manager',
        tenantId: company._id,
        department: 'Production',
        designation: 'Head of Tooling & Production',
        joiningDate: new Date('2024-04-01'),
        status: 'active',
      });

      const empTechnician = await User.create({
        employeeId: `${company.code}-107`,
        name: `${company.name} Employee`,
        email: `employee@${prefix}.com`,
        password: defaultPassword,
        role: 'Employee',
        tenantId: company._id,
        department: 'Assembly',
        designation: 'Technician',
        joiningDate: new Date('2024-05-01'),
        status: 'active',
      });

      // Seed Manufacturing Module Data for Tenant
      const wh1 = await Warehouse.create({
        tenantId: company._id,
        code: `${company.code}-WH1`,
        name: `${company.name} Central Storage Warehouse`,
        location: company.location,
        capacitySqFt: 12000,
        managerId: compAdmin._id,
        racks: [
          { rackNo: 'Rack A1 - Raw Steels', capacity: 200, occupied: 85 },
          { rackNo: 'Rack B2 - Components', capacity: 150, occupied: 60 },
        ],
      });

      const vendor1 = await Vendor.create({
        tenantId: company._id,
        vendorCode: `VND-001`,
        companyName: 'Precision Steel Supplies Inc.',
        contactPerson: 'Robert Miller',
        email: `sales@precisionsteel.com`,
        phone: '+1 (555) 999-1001',
        gstin: '27AAACP1234A1Z5',
        rating: 5,
        performanceScore: 98,
        outstandingBalance: 12500,
      });

      const rawSteel = await Item.create({
        tenantId: company._id,
        itemCode: 'RAW-STL-001',
        name: 'High-Grade Alloy Steel Bars',
        category: 'Metals & Alloys',
        itemGroup: 'Raw Materials',
        itemType: 'Raw Material',
        uom: 'Kg',
        barcode: `BAR-STL-1001`,
        qrCode: `QR-${company._id}-STL`,
        minStockLevel: 50,
        reorderLevel: 100,
        reorderQty: 500,
        unitPrice: 45,
        totalStock: 350,
      });

      const finishedShaft = await Item.create({
        tenantId: company._id,
        itemCode: 'FG-SHF-900',
        name: 'Precision Automotive Transmission Shaft',
        category: 'Transmission Parts',
        itemGroup: 'Finished Products',
        itemType: 'Finished Goods',
        uom: 'Pcs',
        barcode: `BAR-SHF-900`,
        qrCode: `QR-${company._id}-SHF`,
        minStockLevel: 20,
        reorderLevel: 50,
        reorderQty: 200,
        unitPrice: 380,
        totalStock: 85,
      });

      const bom1 = await BOM.create({
        tenantId: company._id,
        bomNumber: `BOM-SHF-01`,
        finishedItemId: finishedShaft._id,
        finishedQty: 1,
        components: [
          {
            rawItemId: rawSteel._id,
            quantityRequired: 4.5,
            wastagePercent: 2,
          },
        ],
        estimatedMaterialCost: 207,
      });

      const machine1 = await Machine.create({
        tenantId: company._id,
        machineCode: 'CNC-VMC-850',
        name: '5-Axis CNC Milling Center',
        category: 'CNC Machining',
        model: 'Haas VMC-850',
        serialNumber: 'SN-HAAS-88712',
        location: 'Shopfloor Line 1',
        status: 'operational',
        lastServiceDate: new Date(),
        nextServiceDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      });

      await MaintenanceLog.create({
        tenantId: company._id,
        logNumber: 'MNT-1001',
        machineId: machine1._id,
        type: 'preventive',
        problemDescription: 'Routine spindle alignment and hydraulic oil flush.',
        technicianId: empTechnician._id,
        scheduledDate: new Date(),
        status: 'completed',
        completionDate: new Date(),
        maintenanceCost: 450,
      });
    }

    console.log('\n======================================================');
    console.log('MANUFACTURING MODULE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Items, Warehouses, Vendors, BOMs, Machines, Maintenance Logs Populated!');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeding Error]:', error);
    process.exit(1);
  }
};

seed();
