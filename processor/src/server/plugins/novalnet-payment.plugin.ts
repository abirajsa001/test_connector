import { FastifyInstance } from 'fastify';
import { paymentSDK } from '../../payment-sdk';
import { novalnetPaymentRoutes } from '../../routes/novalnet-payment.route';
import { app } from '../app';

export default async function (server: FastifyInstance) {
  await server.register(novalnetPaymentRoutes, {
    paymentService: app.services.paymentService,
    sessionHeaderAuthHook: paymentSDK.sessionHeaderAuthHookFn,
    sessionQueryParamAuthHook: paymentSDK.sessionQueryParamAuthHookFn,
    hmacAuthHook: app.hooks.hmacAuthHook,
  });
}