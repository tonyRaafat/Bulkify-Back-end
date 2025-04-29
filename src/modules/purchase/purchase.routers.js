import express from "express";
import * as PC from './purchase.controllers.js'
import * as PV from './purchase.validations.js'
import { auth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";


const purchaseRouter = express.Router({ mergeParams: true });

purchaseRouter.post('/startPurchase/:productId',
  auth(["customer"]),
  validate(PV.startPurchaseValidation),
  PC.startPurchase
)

purchaseRouter.post('/:purchaseId/vote',
  auth(["customer"]),
  validate(PV.voteForPurchaseValidation),
  PC.VoteForPurchase
)

purchaseRouter.get('/successPayment/:purchaseId/:userId',
  PC.successPaymentForStartPurchase
)
purchaseRouter.get('/vote/successPayment/:purchaseId/:userId',
  PC.successPaymentForVoting
)

// cancel order

export default purchaseRouter;
