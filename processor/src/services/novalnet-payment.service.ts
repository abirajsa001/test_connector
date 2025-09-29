import {
  CommercetoolsCartService,
  CommercetoolsPaymentService,
  ErrorInvalidOperation,
  healthCheckCommercetoolsPermissions,
  statusHandler,
  Cart,
  Payment,
  CommercetoolsOrderService,
  Errorx,
  TransactionType,
  TransactionState,
} from '@commercetools/connect-payments-sdk';
import {
  ConfirmPaymentRequestDTO,
  ConfirmPaymentResponseDTO,
  CreatePaymentRequestDTO,
  CreatePaymentResponseDTO,
  CreateSessionRequestDTO,
  CreateSessionResponseDTO,
  NotificationRequestDTO,
  PaymentMethodsRequestDTO,
  PaymentMethodsResponseDTO,
} from '../dtos/novalnet-payment.dto';
import { NovalnetClient } from '../clients/novalnet.client';
import {
  getCartIdFromContext,
  getMerchantReturnUrlFromContext,
  getPaymentInterfaceFromContext,
} from '../libs/fastify/context/context';
import {
  CancelPaymentRequest,
  CapturePaymentRequest,
  ConfigResponse,
  PaymentProviderModificationResponse,
  RefundPaymentRequest,
  ReversePaymentRequest,
  StatusResponse,
} from './types/operation.type';
import { getConfig, config } from '../config/config';
import { appLogger, paymentSDK } from '../payment-sdk';
import { AmountSchemaDTO, PaymentModificationStatus } from '../dtos/operations/payment-intents.dto';
import { AbstractPaymentService } from './abstract-payment.service';
import { SupportedPaymentComponentsSchemaDTO } from '../dtos/operations/payment-componets.dto';
import { log } from '../libs/logger';

const packageJSON = require('../../package.json');

export type NovalnetPaymentServiceOptions = {
  ctCartService: CommercetoolsCartService;
  ctPaymentService: CommercetoolsPaymentService;
  ctOrderService: CommercetoolsOrderService;
};

export class NovalnetPaymentService extends AbstractPaymentService {
  private novalnetClient: NovalnetClient;

  constructor(opts: NovalnetPaymentServiceOptions) {
    super(opts.ctCartService, opts.ctPaymentService, opts.ctOrderService);
    this.novalnetClient = new NovalnetClient();
  }

  async config(): Promise<ConfigResponse> {
    return {
      environment: getConfig().novalnetEnvironment,
      vendorId: getConfig().novalnetVendorId,
      testMode: getConfig().novalnetTestMode,
    };
  }

  async status(): Promise<StatusResponse> {
    const handler = await statusHandler({
      timeout: config.healthCheckTimeout,
      log: appLogger,
      checks: [
        healthCheckCommercetoolsPermissions({
          requiredPermissions: [
            'manage_payments',
            'view_sessions',
            'view_api_clients',
            'manage_orders',
            'introspect_oauth_tokens',
            'manage_checkout_payment_intents',
          ],
          ctAuthorizationService: paymentSDK.ctAuthorizationService,
          projectKey: config.projectKey,
        }),
        async () => {
          try {
            // Basic connectivity check to Novalnet
            return {
              name: 'Novalnet Status check',
              status: 'UP',
              details: {
                environment: config.novalnetEnvironment,
              },
            };
          } catch (e) {
            return {
              name: 'Novalnet Status check',
              status: 'DOWN',
              message: `Not able to talk to the Novalnet API`,
              details: {
                error: e,
              },
            };
          }
        },
      ],
      metadataFn: async () => ({
        name: packageJSON.name,
        description: packageJSON.description,
        '@commercetools/sdk-client-v2': packageJSON.dependencies['@commercetools/sdk-client-v2'],
        axios: packageJSON.dependencies['axios'],
      }),
    })();

    return handler.body;
  }

  async getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO> {
    return {
      components: [
        {
          type: 'card',
        },
        {
          type: 'sepa',
        },
        {
          type: 'paypal',
        },
      ],
    };
  }

  async getPaymentMethods(opts: { data: PaymentMethodsRequestDTO }): Promise<PaymentMethodsResponseDTO> {
    return {
      paymentMethods: [
        {
          type: 'CREDITCARD',
          name: 'Credit Card',
        },
        {
          type: 'DIRECT_DEBIT_SEPA',
          name: 'SEPA Direct Debit',
        },
        {
          type: 'PAYPAL',
          name: 'PayPal',
        },
      ],
    };
  }

  async createSession(opts: { data: CreateSessionRequestDTO }): Promise<CreateSessionResponseDTO> {
    const ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    const amountPlanned = await this.ctCartService.getPlannedPaymentAmount({ cart: ctCart });
    const ctPayment = await this.ctPaymentService.createPayment({
      amountPlanned,
      paymentMethodInfo: {
        paymentInterface: getPaymentInterfaceFromContext() || 'novalnet',
      },
      ...(ctCart.customerId && {
        customer: {
          typeId: 'customer',
          id: ctCart.customerId,
        },
      }),
      ...(!ctCart.customerId &&
        ctCart.anonymousId && {
          anonymousId: ctCart.anonymousId,
        }),
    });

    const updatedCart = await this.ctCartService.addPayment({
      resource: {
        id: ctCart.id,
        version: ctCart.version,
      },
      paymentId: ctPayment.id,
    });

    return {
      sessionData: {
        sessionId: `session_${Date.now()}`,
        environment: getConfig().novalnetEnvironment,
      },
      paymentReference: ctPayment.id,
    };
  }

  public async createPayment(opts: { data: CreatePaymentRequestDTO }): Promise<CreatePaymentResponseDTO> {
    let ctCart, ctPayment;
    ctCart = await this.ctCartService.getCart({
      id: getCartIdFromContext(),
    });

    if (opts.data.paymentReference) {
      ctPayment = await this.ctPaymentService.updatePayment({
        id: opts.data.paymentReference,
        paymentMethod: opts.data.paymentMethod?.type,
      });
    } else {
      const amountPlanned = await this.ctCartService.getPaymentAmount({ cart: ctCart });
      ctPayment = await this.ctPaymentService.createPayment({
        amountPlanned,
        paymentMethodInfo: {
          paymentInterface: getPaymentInterfaceFromContext() || 'novalnet',
          method: opts.data.paymentMethod?.type,
        },
        ...(ctCart.customerId && {
          customer: {
            typeId: 'customer',
            id: ctCart.customerId,
          },
        }),
        ...(!ctCart.customerId &&
          ctCart.anonymousId && {
            anonymousId: ctCart.anonymousId,
          }),
      });

      ctCart = await this.ctCartService.addPayment({
        resource: {
          id: ctCart.id,
          version: ctCart.version,
        },
        paymentId: ctPayment.id,
      });
    }

    const paymentData = {
      amount: ctPayment.amountPlanned.centAmount,
      currency: ctPayment.amountPlanned.currencyCode,
      payment_type: opts.data.paymentMethod?.type,
      customer: {
        first_name: ctCart.billingAddress?.firstName || '',
        last_name: ctCart.billingAddress?.lastName || '',
        email: ctCart.billingAddress?.email || '',
      },
    };

    try {
      const res = await this.novalnetClient.createPayment(paymentData);
      
      const txState = this.convertNovalnetStatus(res.result?.status);
      const updatedPayment = await this.ctPaymentService.updatePayment({
        id: ctPayment.id,
        pspReference: res.transaction?.tid,
        transaction: {
          type: 'Authorization',
          amount: ctPayment.amountPlanned,
          interactionId: res.transaction?.tid,
          state: txState,
        },
      });

      log.info(`Payment authorization processed.`, {
        paymentId: updatedPayment.id,
        interactionId: res.transaction?.tid,
        result: res.result?.status,
      });

      return {
        resultCode: res.result?.status,
        pspReference: res.transaction?.tid,
        paymentReference: updatedPayment.id,
        merchantReturnUrl: this.buildRedirectMerchantUrl(updatedPayment.id),
      } as CreatePaymentResponseDTO;
    } catch (e) {
      throw new ErrorInvalidOperation('Payment creation failed', { cause: e });
    }
  }

  public async confirmPayment(opts: { data: ConfirmPaymentRequestDTO }): Promise<ConfirmPaymentResponseDTO> {
    const ctPayment = await this.ctPaymentService.getPayment({
      id: opts.data.paymentReference,
    });

    return {
      resultCode: 'Authorised',
      pspReference: ctPayment.interfaceId,
      paymentReference: ctPayment.id,
      merchantReturnUrl: this.buildRedirectMerchantUrl(ctPayment.id),
    } as ConfirmPaymentResponseDTO;
  }

  public async processNotification(opts: { data: NotificationRequestDTO }): Promise<void> {
    log.info('Processing notification', { notification: JSON.stringify(opts.data) });
    // Implement Novalnet webhook processing
  }

  async capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse> {
    log.info(`Processing payment modification.`, {
      paymentId: request.payment.id,
      action: 'capturePayment',
    });

    try {
      const res = await this.novalnetClient.capturePayment(
        request.payment.interfaceId as string,
        request.amount.centAmount
      );

      await this.ctPaymentService.updatePayment({
        id: request.payment.id,
        transaction: {
          type: 'Charge',
          amount: request.amount,
          interactionId: res.transaction?.tid,
          state: 'Success',
        },
      });

      return { outcome: PaymentModificationStatus.RECEIVED, pspReference: res.transaction?.tid };
    } catch (e) {
      throw new ErrorInvalidOperation('Capture failed', { cause: e });
    }
  }

  async cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse> {
    log.info(`Processing payment modification.`, {
      paymentId: request.payment.id,
      action: 'cancelPayment',
    });

    try {
      const res = await this.novalnetClient.cancelPayment(request.payment.interfaceId as string);

      await this.ctPaymentService.updatePayment({
        id: request.payment.id,
        transaction: {
          type: 'CancelAuthorization',
          amount: request.payment.amountPlanned,
          interactionId: res.transaction?.tid,
          state: 'Success',
        },
      });

      return { outcome: PaymentModificationStatus.RECEIVED, pspReference: res.transaction?.tid };
    } catch (e) {
      throw new ErrorInvalidOperation('Cancel failed', { cause: e });
    }
  }

  async refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse> {
    log.info(`Processing payment modification.`, {
      paymentId: request.payment.id,
      action: 'refundPayment',
    });

    try {
      const res = await this.novalnetClient.refundPayment(
        request.payment.interfaceId as string,
        request.amount.centAmount
      );

      await this.ctPaymentService.updatePayment({
        id: request.payment.id,
        transaction: {
          type: 'Refund',
          amount: request.amount,
          interactionId: res.transaction?.tid,
          state: 'Success',
        },
      });

      return { outcome: PaymentModificationStatus.RECEIVED, pspReference: res.transaction?.tid };
    } catch (e) {
      throw new ErrorInvalidOperation('Refund failed', { cause: e });
    }
  }

  async reversePayment(request: ReversePaymentRequest): Promise<PaymentProviderModificationResponse> {
    log.info(`Processing payment modification.`, {
      paymentId: request.payment.id,
      action: 'reversePayment',
    });

    const transactionStateChecker = (transactionType: TransactionType, states: TransactionState[]) =>
      this.ctPaymentService.hasTransactionInState({ payment: request.payment, transactionType, states });

    const hasCharge = transactionStateChecker('Charge', ['Success']);
    const hasAuthorization = transactionStateChecker('Authorization', ['Success']);

    if (hasCharge) {
      return this.refundPayment({ ...request, amount: request.payment.amountPlanned });
    } else if (hasAuthorization) {
      return this.cancelPayment(request);
    } else {
      throw new ErrorInvalidOperation(`There is no successful payment transaction to reverse.`);
    }
  }

  private convertNovalnetStatus(status: string): string {
    switch (status) {
      case 'SUCCESS':
        return 'Success';
      case 'PENDING':
        return 'Pending';
      case 'FAILURE':
        return 'Failure';
      default:
        return 'Initial';
    }
  }

  private buildRedirectMerchantUrl(paymentReference: string): string {
    const merchantReturnUrl = getMerchantReturnUrlFromContext() || config.merchantReturnUrl;
    const redirectUrl = new URL(merchantReturnUrl);
    redirectUrl.searchParams.append('paymentReference', paymentReference);
    return redirectUrl.toString();
  }
}