const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const APP_DIR = path.join(UPLOADS_DIR, 'application');
const ER_DIR = path.join(UPLOADS_DIR, 'er');

// Ensure directories exist
if (!fs.existsSync(APP_DIR)) {
  fs.mkdirSync(APP_DIR, { recursive: true });
}
if (!fs.existsSync(ER_DIR)) {
  fs.mkdirSync(ER_DIR, { recursive: true });
}

/**
 * Dynamically loads the homeowner application and environmental review report JSON data for a project.
 * @param {string} projectId - The UUID/string ID of the project.
 * @returns {object} An object containing applicationData and erData.
 */
function loadProjectJsonData(projectId) {
  if (!projectId) return { applicationData: null, erData: null };

  let applicationData = null;
  let erData = null;

  try {
    const appPath = path.join(APP_DIR, `${projectId}.json`);
    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, 'utf8');
      applicationData = JSON.parse(content);
    }
  } catch (err) {
    console.error(`Failed to read application JSON for project ${projectId}:`, err.message);
  }

  try {
    const erPath = path.join(ER_DIR, `${projectId}.json`);
    if (fs.existsSync(erPath)) {
      const content = fs.readFileSync(erPath, 'utf8');
      erData = JSON.parse(content);
    }
  } catch (err) {
    console.error(`Failed to read ER JSON for project ${projectId}:`, err.message);
  }

  return { applicationData, erData };
}

module.exports = {
  loadProjectJsonData
};
