const generalService = require('./general');

const getTimestamp = () => Math.floor(Date.now() / 1000);

/**
 * Function to convert timestamp into yyyy-mm-dd format
 *
 * @param {Number} timestamp timestamp to convert to db date
 * @param {Number} offset timezone offset, by default set to 8
 * @returns {string} db format converted date string
 */
const timestampToDatabaseDate = (timestamp, offset = 8) => {
  const offsetTimestamp = (timestamp + offset * 60 * 60) * 1000;
  const date = new Date(offsetTimestamp).toJSON().slice(0, 19).replace('T', ' ');
  return date;
};

/**
 * Function to add a timestamp to current timestamp
 *
 * @param {Number} timestamp timestamp to add in current timestamp
 * @returns {Number} timestamp number
 */
const addTimestampToCurrentTime = (timestamp) => {
  const currentTimestamp = generalService.getTimestamp();
  return timestamp + currentTimestamp;
};
/**
 * A function to get current time and add days to it
 * and return 00:00:00 date time of the day
 *
 * @param {number} days Number of days to add
 * @returns {Number} Timestamp
 */
const getStartDateTime = (days = 0) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return Math.floor(date.getTime() / 1000);
};

const getEndDateTime = (days = 0) => {
  const date = new Date();
  date.setUTCHours(23, 59, 59);
  date.setUTCDate(date.getUTCDate() + days);
  return Math.floor(date.getTime() / 1000);
};

module.exports = {
  addTimestampToCurrentTime,
  timestampToDatabaseDate,
  getStartDateTime,
  getEndDateTime,
  getTimestamp,
};
