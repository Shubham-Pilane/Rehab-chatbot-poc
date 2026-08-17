const { ChatUser, ChatRole, ChatUserRole } = require('../../models/chatbot');

class ChatUserRepository {
  async findByUsername(username) {
    return await ChatUser.findOne({
      where: { username },
      include: [{ model: ChatRole, as: 'roles' }]
    });
  }

  async findByEmail(email) {
    return await ChatUser.findOne({
      where: { email },
      include: [{ model: ChatRole, as: 'roles' }]
    });
  }

  async findById(id) {
    return await ChatUser.findByPk(id, {
      include: [{ model: ChatRole, as: 'roles' }]
    });
  }

  async createChatUser(userData, roleNames = ['Viewer']) {
    const user = await ChatUser.create(userData);
    
    if (roleNames && roleNames.length > 0) {
      const roles = await ChatRole.findAll({
        where: { name: roleNames }
      });
      
      for (const role of roles) {
        await ChatUserRole.create({
          userId: user.id,
          roleId: role.id
        });
      }
    }
    
    return await this.findById(user.id);
  }
}

module.exports = new ChatUserRepository();
