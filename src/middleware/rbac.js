// Map Intents to allowed Roles
const INTENT_ROLE_MAP = {
  PROJECT_STATUS: ['Admin', 'Project Manager', 'Finance Manager', 'Vendor Manager', 'Viewer', 'Homeowner'],
  PROJECT_SUMMARY: ['Admin', 'Project Manager', 'Finance Manager', 'Vendor Manager', 'Viewer'],
  PROJECT_DELAY: ['Admin', 'Project Manager', 'Finance Manager', 'Viewer'],
  PROJECT_RISK: ['Admin', 'Project Manager', 'Finance Manager', 'Viewer'],
  PROJECT_BUDGET: ['Admin', 'Finance Manager'],
  PROJECT_COST: ['Admin', 'Finance Manager'],
  PROJECT_TIMELINE: ['Admin', 'Project Manager', 'Finance Manager', 'Viewer'],
  TASK_STATUS: ['Admin', 'Project Manager', 'Vendor Manager', 'Viewer'],
  TASK_DELAY: ['Admin', 'Project Manager', 'Vendor Manager', 'Viewer'],
  MILESTONE_STATUS: ['Admin', 'Project Manager', 'Finance Manager', 'Viewer'],
  MILESTONE_DELAY: ['Admin', 'Project Manager', 'Finance Manager', 'Viewer'],
  INVOICE_STATUS: ['Admin', 'Finance Manager'],
  INVOICE_PENDING: ['Admin', 'Finance Manager'],
  VENDOR_INFORMATION: ['Admin', 'Vendor Manager', 'Project Manager', 'Finance Manager'],
  VENDOR_ASSIGNMENT: ['Admin', 'Vendor Manager', 'Project Manager'],
  DOCUMENT_SEARCH: ['Admin', 'Project Manager', 'Finance Manager'],
  HOMEOWNER_UPDATE: ['Admin', 'Project Manager'],
  HOMEOWNER_LIST: ['Admin', 'Project Manager', 'Finance Manager', 'Viewer'],
  MANAGEMENT_SUMMARY: ['Admin', 'Project Manager', 'Finance Manager'],
  UNKNOWN: ['Admin', 'Project Manager', 'Finance Manager', 'Vendor Manager', 'Homeowner', 'Viewer']
};

const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ error: 'Access denied. No roles assigned.' });
    }

    const userRoles = req.user.roles.map(r => r.name);
    
    // Admin has superuser status
    if (userRoles.includes('Admin')) {
      return next();
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    const hasAccess = userRoles.some(role => allowedRoles.includes(role));
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. Insufficient role permission.' });
    }

    next();
  };
};

const checkIntentPermission = (intent, roles) => {
  const roleNames = roles.map(r => r.name);
  if (roleNames.includes('Admin')) return true;

  const allowedRoles = INTENT_ROLE_MAP[intent];
  if (!allowedRoles) return false;

  return roleNames.some(role => allowedRoles.includes(role));
};

module.exports = {
  authorize,
  checkIntentPermission,
  INTENT_ROLE_MAP
};
