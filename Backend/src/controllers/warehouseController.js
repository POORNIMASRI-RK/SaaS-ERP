import Warehouse from '../models/Warehouse.js';

// @desc    Get all warehouses with rack capacities
// @route   GET /api/manufacturing/warehouses
// @access  Private
export const getWarehouses = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const warehouses = await Warehouse.find({ tenantId }).populate('managerId', 'name email role').sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: warehouses.length, warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or Update Warehouse
// @route   POST /api/manufacturing/warehouses
// @access  Private (Company Admin, Warehouse Manager)
export const saveWarehouse = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.body.tenantId || req.tenantId : req.user.tenantId;
    const { id, code, name, location, capacitySqFt, managerId, racks, status } = req.body;

    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Warehouse Code and Name are required.' });
    }

    let warehouse;
    if (id) {
      warehouse = await Warehouse.findById(id);
      if (warehouse) {
        warehouse.code = code;
        warehouse.name = name;
        warehouse.location = location || warehouse.location;
        warehouse.capacitySqFt = capacitySqFt || warehouse.capacitySqFt;
        warehouse.managerId = managerId || warehouse.managerId;
        if (racks) warehouse.racks = racks;
        warehouse.status = status || warehouse.status;
        await warehouse.save();
      }
    } else {
      warehouse = await Warehouse.create({
        tenantId,
        code,
        name,
        location: location || 'Main Facility',
        capacitySqFt: capacitySqFt || 5000,
        managerId: managerId || req.user.id,
        racks: racks || [
          { rackNo: 'Rack A1', capacity: 100, occupied: 35 },
          { rackNo: 'Rack B1', capacity: 100, occupied: 20 },
        ],
        status: status || 'active',
      });
    }

    res.status(200).json({ success: true, message: 'Warehouse updated successfully', warehouse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
