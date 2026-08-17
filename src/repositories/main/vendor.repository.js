const { Vendor, Invoice, Project } = require('../../models/main');
const { Op } = require('sequelize');

class VendorRepository {
  async getAssignedVendors() {
    // Find vendors who have invoices/contracts/active engagements
    return await Vendor.findAll({
      where: { status: 'active' },
      include: [
        {
          model: Invoice,
          as: 'invoices',
          include: [{ model: Project }]
        }
      ]
    });
  }

  async getExpiringLicenses(daysAhead = 30) {
    const expiryLimit = new Date();
    expiryLimit.setDate(expiryLimit.getDate() + daysAhead);

    return await Vendor.findAll({
      where: {
        licenseExpiryDate: {
          [Op.and]: {
            [Op.gt]: new Date(),
            [Op.lte]: expiryLimit
          }
        }
      }
    });
  }

  async getVendorDetailsByName(vendorName) {
    return await Vendor.findOne({
      where: { name: { [Op.iLike]: `%${vendorName}%` } },
      include: [
        {
          model: Invoice,
          as: 'invoices',
          include: [{ model: Project }]
        }
      ]
    });
  }

  async getAllVendors() {
    return await Vendor.findAll();
  }
}

module.exports = new VendorRepository();
