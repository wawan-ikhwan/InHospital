const fs = require('fs');

module.exports = (newUsers) => {
  fs.writeFileSync('./src/users.json', JSON.stringify(newUsers, null, 2));
};
