const router = require('express').Router();
const passport = require('passport');
const auth = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');
const validateLoginRequest = require('../requests/loginRequest');
const authController = require('../controllers/auth');

router.get('/login', auth.isNotAuthenticated, authController.showLoginForm);
router.post(
  '/login',
  auth.isNotAuthenticated,
  validateRequest(validateLoginRequest),
  passport.authenticate('local', {
    successRedirect: '/inventory/update',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);
router.delete('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);
    return res.redirect('/auth/login');
  });
});

module.exports = router;
