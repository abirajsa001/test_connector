import {
  DropinType,
  EnablerOptions,
  getPaymentMethodType,
  PaymentComponentBuilder,
  PaymentDropinBuilder,
  PaymentEnabler,
} from "./payment-enabler";
import { CardBuilder } from "../components/payment-methods/card";
import { PaypalBuilder } from "../components/payment-methods/paypal";
import { SepaBuilder } from "../components/payment-methods/sepadirectdebit";

class NovalnetInitError extends Error {
  sessionId: string;
  constructor(message: string, sessionId: string) {
    super(message);
    this.name = "NovalnetInitError";
    this.message = message;
    this.sessionId = sessionId;
  }
}

type NovalnetEnablerOptions = EnablerOptions & {
  onActionRequired?: (action: any) => Promise<void>;
};

export type BaseOptions = {
  sessionId: string;
  processorUrl: string;
  environment: string;
};

export class NovalnetPaymentEnabler implements PaymentEnabler {
  setupData: Promise<{ baseOptions: BaseOptions }>;

  constructor(options: NovalnetEnablerOptions) {
    this.setupData = NovalnetPaymentEnabler._Setup(options);
  }

  private static _Setup = async (options: NovalnetEnablerOptions): Promise<{ baseOptions: BaseOptions }> => {
    const [sessionResponse, configResponse] = await Promise.all([
      fetch(options.processorUrl + "/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": options.sessionId,
        },
        body: JSON.stringify({}),
      }),
      fetch(options.processorUrl + "/operations/config", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": options.sessionId,
        },
      }),
    ]);

    const [sessionJson, configJson] = await Promise.all([
      sessionResponse.json(),
      configResponse.json(),
    ]);

    const { sessionData: data, paymentReference } = sessionJson;

    if (!data || !data.sessionId) {
      throw new NovalnetInitError(
        "Not able to initialize Novalnet, session data missing",
        options.sessionId,
      );
    }

    return {
      baseOptions: {
        sessionId: options.sessionId,
        processorUrl: options.processorUrl,
        environment: configJson.environment,
      },
    };
  };

  async createComponentBuilder(
    type: string,
  ): Promise<PaymentComponentBuilder | never> {
    const setupData = await this.setupData;
    if (!setupData) {
      throw new Error("NovalnetPaymentEnabler not initialized");
    }
    
    const supportedMethods = {
      card: CardBuilder,
      sepadirectdebit: SepaBuilder,
      paypal: PaypalBuilder,
    };

    if (!Object.keys(supportedMethods).includes(type)) {
      throw new Error(
        `Component type not supported: ${type}. Supported types: ${Object.keys(supportedMethods).join(", ")}`,
      );
    }
    return new supportedMethods[type](setupData.baseOptions);
  }

  async createDropinBuilder(
    type: DropinType,
  ): Promise<PaymentDropinBuilder | never> {
    throw new Error("Dropin not supported for Novalnet");
  }
}