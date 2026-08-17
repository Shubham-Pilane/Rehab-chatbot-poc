const { Invoice, Project, Vendor } = require('../../models/main');
const { Op } = require('sequelize');

class InvoiceRepository {
  async getPendingInvoices() {
    return await Invoice.findAll({
      where: {
        status: { [Op.or]: [{ [Op.iLike]: 'Submitted' }, { [Op.iLike]: 'Due' }] }
      },
      include: [
        { model: Project },
        { model: Vendor, as: 'vendor' }
      ]
    });
  }

  async getInvoicesAwaitingApproval() {
    return await Invoice.findAll({
      where: {
        status: { [Op.iLike]: 'Submitted' }
      },
      include: [
        { model: Project },
        { model: Vendor, as: 'vendor' }
      ]
    });
  }

  async getInvoicesByVendorName(vendorName) {
    return await Invoice.findAll({
      include: [
        { model: Project },
        {
          model: Vendor,
          as: 'vendor',
          where: { name: { [Op.iLike]: `%${vendorName}%` } },
          required: true
        }
      ]
    });
  }

  async getInvoicesByProjectNumber(projectNumber) {
    return await Invoice.findAll({
      include: [
        {
          model: Project,
          where: { projectNumber: { [Op.iLike]: projectNumber } },
          required: true
        },
        { model: Vendor, as: 'vendor' }
      ]
    });
  }
}

module.exports = new InvoiceRepository();
