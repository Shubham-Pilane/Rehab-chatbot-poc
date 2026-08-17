const { DataTypes } = require('sequelize');
const { mainDbConnection } = require('../../config/database');

// Define Tenant model (Not directly queried, mapped to dummy schema)
const Tenant = mainDbConnection.define('Tenant', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'tenant' });

// Define Role model for Main RPM (Not directly queried, mapped to dummy schema)
const MainRole = mainDbConnection.define('MainRole', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'role' });

// Define User model for Main RPM (mapped to homeowner table)
const MainUser = mainDbConnection.define('MainUser', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  tenantId: { type: DataTypes.UUID, field: 'tenant_id' },
  firstName: { type: DataTypes.STRING, field: 'first_name' },
  lastName: { type: DataTypes.STRING, field: 'last_name' },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, field: 'phone_number' }
}, { tableName: 'homeowner' });

// Define ProjectGroup model
const ProjectGroup = mainDbConnection.define('ProjectGroup', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  tenantId: { type: DataTypes.UUID, field: 'tenant_id' },
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'project_group' });

// Define Project model
const Project = mainDbConnection.define('Project', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  homeId: { type: DataTypes.UUID, field: 'home_id' },
  tenantId: { type: DataTypes.UUID, field: 'tenant_id' },
  projectNumber: { type: DataTypes.STRING, allowNull: false, unique: true, field: 'project_number' },
  status: { type: DataTypes.STRING, allowNull: false },
  projectState: { type: DataTypes.STRING, field: 'project_state' },
  hudNumber: { type: DataTypes.STRING, field: 'hud_number' }
}, { tableName: 'project' });

// Define Address model
const Address = mainDbConnection.define('Address', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  street: { type: DataTypes.STRING, allowNull: false, field: 'street_address' },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  zip: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'address' });

// Define Home model
const Home = mainDbConnection.define('Home', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  homeownerId: { type: DataTypes.UUID, field: 'homeowner_id' },
  addressId: { type: DataTypes.UUID, field: 'address_id' }
}, { tableName: 'home' });

// Define Vendor model
const Vendor = mainDbConnection.define('Vendor', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  tenantId: { type: DataTypes.UUID, field: 'tenant_id' },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, field: 'phone_number' }
}, { tableName: 'vendor' });

// Define Invoice model
const Invoice = mainDbConnection.define('Invoice', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' },
  vendorId: { type: DataTypes.UUID, field: 'vendor_id' },
  amount: { type: DataTypes.DOUBLE, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
  dueDate: { type: DataTypes.DATE, field: 'due_date' },
  invoiceDate: { type: DataTypes.DATE, field: 'invoice_date' }
}, { tableName: 'invoice' });

// Define Task model (mapped to assigned_task)
const Task = mainDbConnection.define('Task', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
}, { tableName: 'assigned_task' });

// Define Milestone model (mapped to custom_milestone)
const Milestone = mainDbConnection.define('Milestone', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' },
  name: { type: DataTypes.STRING, allowNull: false, field: 'milestone_name' },
  milestoneDate: { type: DataTypes.DATE, field: 'milestone_date' },
  index: { type: DataTypes.INTEGER }
}, { tableName: 'custom_milestone' });

// Define Note model (mapped to notes)
const Note = mainDbConnection.define('Note', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' },
  userId: { type: DataTypes.UUID, field: 'user_id' },
  content: { type: DataTypes.TEXT, allowNull: false, field: 'description' }
}, { tableName: 'notes' });

// Define Attachment model (mapped to attachment)
const Attachment = mainDbConnection.define('Attachment', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' },
  fileName: { type: DataTypes.STRING, allowNull: false, field: 'title' },
  fileType: { type: DataTypes.STRING, field: 'file_type' }
}, { tableName: 'attachment' });

// Dummy models for tables not present in read-only backup database (to prevent sequelize errors on startup)
const GrantDetail = mainDbConnection.define('GrantDetail', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' }
}, { tableName: 'project' });

const Budget = mainDbConnection.define('Budget', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' }
}, { tableName: 'project' });

const ProjectImage = mainDbConnection.define('ProjectImage', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' }
}, { tableName: 'project' });

const ProjectDocument = mainDbConnection.define('ProjectDocument', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  projectId: { type: DataTypes.UUID, field: 'project_id' }
}, { tableName: 'project' });

// Set up Associations
Tenant.hasMany(MainUser, { foreignKey: 'tenant_id' });
MainUser.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// MainRole.hasMany(MainUser, { foreignKey: 'role_id' });
// MainUser.belongsTo(MainRole, { foreignKey: 'role_id' });

Tenant.hasMany(Project, { foreignKey: 'tenant_id' });
Project.belongsTo(Tenant, { foreignKey: 'tenant_id' });

// Associated through a join table project_project_group in database, leaving unassociated for chatbot scope
// ProjectGroup.hasMany(Project, { foreignKey: 'project_group_id' });
// Project.belongsTo(ProjectGroup, { foreignKey: 'project_group_id' });

Project.hasMany(Milestone, { foreignKey: 'project_id', as: 'milestones' });
Milestone.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(Invoice, { foreignKey: 'project_id', as: 'invoices' });
Invoice.belongsTo(Project, { foreignKey: 'project_id' });

Vendor.hasMany(Invoice, { foreignKey: 'vendor_id', as: 'invoices' });
Invoice.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(Note, { foreignKey: 'project_id', as: 'notes' });
Note.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(Attachment, { foreignKey: 'project_id', as: 'attachments' });
Attachment.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasOne(GrantDetail, { foreignKey: 'project_id', as: 'grantDetail' });
GrantDetail.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(Budget, { foreignKey: 'project_id', as: 'budgets' });
Budget.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(ProjectImage, { foreignKey: 'project_id', as: 'images' });
ProjectImage.belongsTo(Project, { foreignKey: 'project_id' });

Project.hasMany(ProjectDocument, { foreignKey: 'project_id', as: 'documents' });
ProjectDocument.belongsTo(Project, { foreignKey: 'project_id' });

// Project table has home_id pointing to home
Project.belongsTo(Home, { foreignKey: 'home_id', as: 'home' });
Home.hasMany(Project, { foreignKey: 'home_id' });

Address.hasMany(Home, { foreignKey: 'address_id' });
Home.belongsTo(Address, { foreignKey: 'address_id', as: 'address' });

MainUser.hasMany(Home, { foreignKey: 'homeowner_id' });
Home.belongsTo(MainUser, { foreignKey: 'homeowner_id', as: 'homeowner' });

module.exports = {
  Tenant,
  MainRole,
  MainUser,
  ProjectGroup,
  Project,
  Address,
  Home,
  Vendor,
  Invoice,
  Task,
  Milestone,
  Note,
  Attachment,
  GrantDetail,
  Budget,
  ProjectImage,
  ProjectDocument
};
