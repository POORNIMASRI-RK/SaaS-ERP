import Vendor from '../models/Vendor.js';

// @desc    Get all Vendors with ratings and performance
// @route   GET /api/manufacturing/vendors
// @access  Private
export const getVendors = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.query.tenantId || req.tenantId : req.user.tenantId;

    const vendors = await Vendor.find({ tenantId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: vendors.length, vendors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or Update Vendor Profile
// @route   POST /api/manufacturing/vendors
// @access  Private (Company Admin, Purchase Manager)
export const saveVendor = async (req, res) => {
  try {
    const tenantId = req.user.role === 'Super Admin' ? req.body.tenantId || req.tenantId : req.user.tenantId;
    const {
      id,
      vendorCode,
      companyName,
      contactPerson,
      email,
      phone,
      gstin,
      pan,
      address,
      bankDetails,
      rating,
      performanceScore,
      status,
    } = req.body;

    if (!vendorCode || !companyName || !email) {
      return res.status(400).json({ success: false, message: 'Vendor Code, Company Name, and Email are required.' });
    }

    let vendor;
    if (id) {
      vendor = await Vendor.findById(id);
      if (vendor) {
        vendor.vendorCode = vendorCode;
        vendor.companyName = companyName;
        vendor.contactPerson = contactPerson || vendor.contactPerson;
        vendor.email = email;
        vendor.phone = phone || vendor.phone;
        vendor.gstin = gstin || vendor.gstin;
        vendor.pan = pan || vendor.pan;
        vendor.address = address || vendor.address;
        if (bankDetails) vendor.bankDetails = bankDetails;
        vendor.rating = rating !== undefined ? rating : vendor.rating;
        vendor.performanceScore = performanceScore !== undefined ? performanceScore : vendor.performanceScore;
        vendor.status = status || vendor.status;
        await vendor.save();
      }
    } else {
      vendor = await Vendor.create({
        tenantId,
        vendorCode,
        companyName,
        contactPerson: contactPerson || 'Sales Head',
        email,
        phone: phone || '',
        gstin: gstin || '27AAAAA0000A1Z5',
        pan: pan || 'AAAAA0000A',
        address: address || '',
        bankDetails: bankDetails || { accountNo: '99988877711', ifsc: 'HDFC0001234', bankName: 'HDFC Bank' },
        rating: rating || 5,
        performanceScore: performanceScore || 95,
        status: status || 'active',
      });
    }

    res.status(200).json({ success: true, message: 'Vendor saved successfully', vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
