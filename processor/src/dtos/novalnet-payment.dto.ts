export interface PaymentMethodsRequestDTO {
  countryCode?: string;
  amount?: {
    currency: string;
    value: number;
  };
}

export interface PaymentMethodsResponseDTO {
  paymentMethods: Array<{
    type: string;
    name: string;
  }>;
}

export interface CreateSessionRequestDTO {
  amount: {
    currency: string;
    value: number;
  };
  countryCode?: string;
  returnUrl?: string;
}

export interface CreateSessionResponseDTO {
  sessionData: {
    sessionId: string;
    environment: string;
  };
  paymentReference: string;
}

export interface CreatePaymentRequestDTO {
  paymentMethod: {
    type: string;
  };
  paymentReference?: string;
  returnUrl?: string;
}

export interface CreatePaymentResponseDTO {
  resultCode: string;
  pspReference?: string;
  paymentReference: string;
  merchantReturnUrl?: string;
}

export interface ConfirmPaymentRequestDTO {
  paymentReference: string;
  details?: any;
}

export interface ConfirmPaymentResponseDTO {
  resultCode: string;
  pspReference?: string;
  paymentReference: string;
  merchantReturnUrl?: string;
}

export interface NotificationRequestDTO {
  live: string;
  notificationItems: Array<{
    NotificationRequestItem: {
      amount: {
        currency: string;
        value: number;
      };
      eventCode: string;
      eventDate: string;
      merchantAccountCode: string;
      merchantReference: string;
      pspReference: string;
      success: string;
    };
  }>;
}