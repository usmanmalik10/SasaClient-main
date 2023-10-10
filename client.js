const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) });
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const methodOverride = require('method-override');
const MSSQLStore = require('connect-mssql-v2');

const envVars = require('./config/env-vars');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error');
const { poolPromise, sqlConfig } = require('./config/database');
const orderRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const User = require('./models/user');
const initializePassport = require('./config/passport');

const app = express();

initializePassport(passport, User.findByCodePwd, User.findByCode);

app.set('view engine', 'ejs');
app.set('json spaces', 3);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(
  session({
    secret: envVars.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MSSQLStore(sqlConfig),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

const server = app.listen(
  envVars.port,
  console.log(`Listening on port ${envVars.port} on environment ${envVars.environment}`)
);

app.use('/auth', authRouter);
app.use('/orders', auth.isAuthenticated, orderRouter);
app.use('/', auth.isAuthenticated, (_req, res) =>
  res.redirect('/orders/showordercompletetimeform')
);

app.use(errorHandler);

(async () => {
  await poolPromise;
})();

process.on('unhandledRejection', (err) => {
  console.error(err);
  server.close(() => process.exit(1));
});
