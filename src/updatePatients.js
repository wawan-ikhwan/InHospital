const fs = require('fs');

module.exports = (newPatients) => {
  fs.writeFileSync('./src/patients.json', JSON.stringify(newPatients, null, 2));
};
