const database = require('../config/database');

const getTimestamp = () => Math.floor(Date.now() / 1000);

const keysToDBQueryString = (keys) => {
  const keysWithSign = keys.map((key) => `@${key}`);

  let firstPart = null;
  let lastPart = null;

  firstPart = keys.join(',');
  lastPart = keysWithSign.join(',');

  return { firstPart, lastPart };
};

const generateQueryRequest = async (fieldsObj) => {
  const pool = await database.poolPromise;
  const request = pool.request();

  for (const [key, field] of Object.entries(fieldsObj)) {
    if (['ResponseData', 'RequestURL'].includes(key)) {
      request.input(key, database.sql.NVarChar(database.sql.MAX), field);
    } else {
      request.input(key, field);
    }
  }

  const keys = Object.keys(fieldsObj);

  const queryParts = keysToDBQueryString(keys);

  return { request, queryParts };
};

const insertQuery = async (tableName, data) => {
  const { request, queryParts } = await generateQueryRequest(data);

  const result = await request.query(
    `INSERT INTO ${tableName} (${queryParts.firstPart}) OUTPUT inserted.UniqueID 
        VALUES (${queryParts.lastPart})`
  );

  return result.recordset[0].UniqueID;
};
const insertQueryWithoutID = async (tableName, data) => {
  const { request, queryParts } = await generateQueryRequest(data);

  const result = await request.query(
    `INSERT INTO ${tableName} (${queryParts.firstPart})
      VALUES (${queryParts.lastPart})`
  );

  return result.rowsAffected.length;
};

const callStoredProcedure = async (spName, params = {}) => {
  const pool = await database.poolPromise;
  const request = pool.request();
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  const result = await request.execute(spName);
  return result.recordset;
};

const mapOrderStatus = (orderStatus) => {
  const statuses = {
    'To ship': 'READY_TO_SHIP',
    Shipping: ['SHIPPED', 'TO_CONFIRM_RECEIVE', 'TO_RETURN'],
    Completed: 'COMPLETED',
    Cancelled: 'CANCELLED',
    Unpaid: 'UNPAID',
    'Cancellation requested': 'IN_CANCEL',
  };

  const allEntries = Object.entries(statuses);
  const { length } = allEntries;

  for (let i = 0; i < length; i++) {
    const [key, value] = allEntries[i];
    if (Array.isArray(value) && value.includes(orderStatus)) return key;
    if (value === orderStatus) return key;
  }

  return orderStatus;
};

module.exports = {
  getTimestamp,
  insertQuery,
  insertQueryWithoutID,
  callStoredProcedure,
  mapOrderStatus,
};
