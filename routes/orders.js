const router = require('express').Router();
const orderController = require('../controllers/order');
const validateRequest = require('../middlewares/validateRequest');
const returnRefundRequest = require('../requests/returnRefundRequest');

router.get('/showordercompletetimeform', orderController.showOrderCompleteTimeForm);
router.post('/fixordercompletetime', orderController.fixOrderCompleteTime);
router.get('/returnrefundstatus', orderController.returnRefundStatusForm);
router.get(
  '/getreturnrefundstatuses',
  validateRequest(returnRefundRequest),
  orderController.returnRefundStatus
);
router.get('/showorderdetailsform', orderController.showOrderDetailsForm);
router.get('/getorderdetails', orderController.getOrderDetails);

module.exports = router;
