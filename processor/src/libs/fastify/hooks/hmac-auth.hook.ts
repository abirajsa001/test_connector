import { config } from '../../../config/config';
import { FastifyRequest } from 'fastify';
import { ErrorAuthErrorResponse } from '@commercetools/connect-payments-sdk';
import { NotificationRequestDTO } from '../../../dtos/novalnet-payment.dto';
import crypto from 'crypto';

export class HmacAuthHook {
  public authenticate() {
    return async (request: FastifyRequest) => {
      const data = request.body as NotificationRequestDTO;
      if (!data) {
        throw new ErrorAuthErrorResponse('Unexpected payload');
      }

      // TODO: Implement proper Novalnet HMAC validation
      // For production, validate webhook signature using Novalnet's HMAC method
      const signature = request.headers['x-novalnet-signature'] as string;
      if (!signature) {
        throw new ErrorAuthErrorResponse('Missing webhook signature');
      }
      
      return;
    };
  }
}
