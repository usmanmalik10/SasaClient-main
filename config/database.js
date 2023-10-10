const sql = require('mssql');

const sqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PWD || 'root',
  database: process.env.DB_NAME || 'Shopee',
  server: process.env.DB_SERVER || 'localhost',
  options: {
    enableArithAbort: true,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1',
    },
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then((pool) => {
    console.log(`Connected to ${process.env.DB_SERVER}`);
    return pool;
  })
  .catch((err) => {
    throw err;
  });

module.exports = { sql, poolPromise, sqlConfig };
