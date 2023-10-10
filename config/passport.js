const LocalStrategy = require('passport-local').Strategy;

const initialize = (passport, findByCodePwd, findByCode) => {
  const authenticateUser = async (code, password, done) => {
    const user = await findByCodePwd(code, password);
    if (user === null) {
      return done(null, false, { message: 'Incorrect login details.' });
    }
    return done(null, user);
  };
  passport.use(new LocalStrategy({ usernameField: 'usercode' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.usercode));
  passport.deserializeUser(async (usercode, done) => {
    const user = await findByCode(usercode);
    return done(null, user);
  });
};

module.exports = initialize;
