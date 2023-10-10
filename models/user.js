const database = require('../config/database');

const findByCodePwd = async (usercode, password) => {
  try {
    const pool = await database.poolPromise;
    const result = await pool.request().input('usercode', usercode).input('password', password)
      .query(`SELECT sul.usercode, sul.pwd FROM [SYSCOMDB].[dbo].system_user_login sul
        INNER JOIN [SYSCOMDB].[dbo].[sys_login_menu] slm ON slm.usercode=sul.usercode
        WHERE slm.menu_code='1005'
        AND sul.status='ACTIVE'
        AND sul.usercode=@usercode and sul.pwd=@password`);

    return result.recordset.length !== 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const findByCode = async (usercode) => {
  try {
    const pool = await database.poolPromise;
    const result = await pool.request().input('usercode', usercode).query(`
      SELECT sul.usercode, sul.pwd FROM [SYSCOMDB].[dbo].system_user_login sul
      INNER JOIN [SYSCOMDB].[dbo].[sys_login_menu] slm ON slm.usercode=sul.usercode
      WHERE slm.menu_code='1005'
      AND sul.status='ACTIVE'
      AND sul.usercode=@usercode`);

    return result.recordset.length !== 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = { findByCodePwd, findByCode };
