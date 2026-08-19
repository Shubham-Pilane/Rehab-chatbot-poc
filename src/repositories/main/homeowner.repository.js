const { Home, Address, MainUser, Project } = require('../../models/main');
const { Op } = require('sequelize');

class HomeownerRepository {
  async getHomeownerUpdateByProjectNumber(projectNumber) {
    return await Home.findOne({
      include: [
        {
          model: Project,
          where: { projectNumber: { [Op.iLike]: projectNumber } },
          required: true
        },
        { model: Address, as: 'address' },
        { model: MainUser, as: 'homeowner' }
      ]
    });
  }

  async getHomeownerByName(name) {
    return await MainUser.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${name}%` } },
          { lastName: { [Op.iLike]: `%${name}%` } }
        ]
      },
      include: [
        {
          model: Home,
          include: [
            { model: Project },
            { model: Address, as: 'address' }
          ]
        }
      ]
    });
  }

  async getGrantDetailsByProject(projectNumber) {
    // GrantDetails table is not present in backup, returning null
    return null;
  }

  async getAllHomeowners() {
    return await MainUser.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      limit: 25
    });
  }
}

module.exports = new HomeownerRepository();
