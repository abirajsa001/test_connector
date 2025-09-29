import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { Type } from '@sinclair/typebox';
import { NovalnetPaymentService } from '../services/novalnet-payment.service';

export const novalnetPaymentRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & {
    paymentService: NovalnetPaymentService;
    sessionHeaderAuthHook: any;
    sessionQueryParamAuthHook: any;
    hmacAuthHook: any;
  },
) => {
  fastify.post(
    '/sessions',
    {
      preHandler: opts.sessionHeaderAuthHook,
      schema: {
        body: Type.Object({
          shopperLocale: Type.Optional(Type.String()),
        }),
        response: {
          200: Type.Object({
            sessionData: Type.Object({
              sessionId: Type.String(),
              environment: Type.String(),
            }),
            paymentReference: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await opts.paymentService.createSession({
        data: request.body as any,
      });
      return reply.status(200).send(result);
    },
  );

  fastify.post(
    '/payments',
    {
      preHandler: opts.sessionHeaderAuthHook,
      schema: {
        body: Type.Object({
          paymentMethod: Type.Object({
            type: Type.String(),
          }),
          paymentReference: Type.Optional(Type.String()),
          returnUrl: Type.Optional(Type.String()),
        }),
        response: {
          200: Type.Object({
            resultCode: Type.String(),
            pspReference: Type.Optional(Type.String()),
            paymentReference: Type.String(),
            merchantReturnUrl: Type.Optional(Type.String()),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await opts.paymentService.createPayment({
        data: request.body as any,
      });
      return reply.status(200).send(result);
    },
  );

  fastify.post(
    '/payments/details',
    {
      preHandler: opts.sessionHeaderAuthHook,
      schema: {
        body: Type.Object({
          paymentReference: Type.String(),
          details: Type.Optional(Type.Any()),
        }),
        response: {
          200: Type.Object({
            resultCode: Type.String(),
            pspReference: Type.Optional(Type.String()),
            paymentReference: Type.String(),
            merchantReturnUrl: Type.Optional(Type.String()),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await opts.paymentService.confirmPayment({
        data: request.body as any,
      });
      return reply.status(200).send(result);
    },
  );

  fastify.post(
    '/webhooks',
    {
      preHandler: opts.hmacAuthHook,
      schema: {
        body: Type.Any(),
      },
    },
    async (request, reply) => {
      await opts.paymentService.processNotification({
        data: request.body as any,
      });
      return reply.status(200).send('[accepted]');
    },
  );
};