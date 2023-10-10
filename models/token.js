const { poolPromise } = require('../config/database');
const tables = require('../constants/tables');
const dateService = require('../services/date');

const isEmpty = async () => {
  const pool = await poolPromise;
  const result = await pool.query(`SELECT count(1) tokens_count FROM ${tables.TOKENS}`);
  const tokensCount = result.recordset[0].tokens_count;
  if (tokensCount === 0) return true;
  return false;
};

const getToken = async () => {
  const isTableEmpty = await isEmpty();
  if (isTableEmpty) return null;
  const pool = await poolPromise;
  const result = await pool.query(`SELECT TOP(1) * FROM ${tables.TOKENS}
    ORDER BY UniqueID DESC`);
  return result.recordset[0];
};

const isValid = (token, isRefreshToken = false) => {
  const now = new Date();
  if (token === null) return false;
  if (isRefreshToken) return true;
  if (token.ExpireAt.getTime() < now.getTime()) return false;
  return true;
};

const tableDataFromResponse = (response) => {
  const expireAt = dateService.timestampToDatabaseDate(
    dateService.addTimestampToCurrentTime(response.expire_in)
  );
  const tokenRow = {
    AccessToken: response.access_token,
    RefreshToken: response.refresh_token,
    ExpireAt: expireAt,
    RequestID: response.request_id,
  };

  return tokenRow;
};

module.exports = {
  getToken,
  isValid,
  tableDataFromResponse,
};
