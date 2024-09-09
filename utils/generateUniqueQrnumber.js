const Project = require('../models/project');

const generateUniqueQrnumber = async () => {
  let qrnumber;
  let isUnique = false;

  while (!isUnique) {
    qrnumber = `QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const existingProject = await Project.findOne({ qrnumber }).lean().exec();
    if (!existingProject) {
      isUnique = true;
    }
  }

  return qrnumber;
};

module.exports = generateUniqueQrnumber;
