import { HmacAuthHook } from '../libs/fastify/hooks/hmac-auth.hook';
import { paymentSDK } from '../payment-sdk';
import { NovalnetPaymentService } from '../services/novalnet-payment.service';

const paymentService = new NovalnetPaymentService({
  ctCartService: paymentSDK.ctCartService,
  ctPaymentService: paymentSDK.ctPaymentService,
  ctOrderService: paymentSDK.ctOrderService,
});

export const app = {
  services: {
    paymentService,
  },
  hooks: {
    hmacAuthHook: new HmacAuthHook(),
  },
};
