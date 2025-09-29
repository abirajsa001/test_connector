import {
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
  PaymentMethod,
} from "../payment-enabler/payment-enabler";
import { BaseOptions } from "../payment-enabler/novalnet-payment-enabler";

/**
 * Base Web Component for Novalnet
 */
export abstract class NovalnetBaseComponentBuilder
  implements PaymentComponentBuilder
{
  public componentHasSubmit = true;

  protected paymentMethod: PaymentMethod;
  protected sessionId: string;
  protected processorUrl: string;
  protected environment: string;

  constructor(paymentMethod: PaymentMethod, baseOptions: BaseOptions) {
    this.paymentMethod = paymentMethod;
    this.sessionId = baseOptions.sessionId;
    this.processorUrl = baseOptions.processorUrl;
    this.environment = baseOptions.environment;
  }

  abstract build(config: ComponentOptions): PaymentComponent;
}

export abstract class DefaultNovalnetComponent implements PaymentComponent {
  protected paymentMethod: PaymentMethod;
  protected componentOptions: ComponentOptions;
  protected sessionId: string;
  protected processorUrl: string;
  protected environment: string;

  constructor(opts: {
    paymentMethod: PaymentMethod;
    componentOptions: ComponentOptions;
    sessionId: string;
    processorUrl: string;
    environment: string;
  }) {
    this.paymentMethod = opts.paymentMethod;
    this.componentOptions = opts.componentOptions;
    this.sessionId = opts.sessionId;
    this.processorUrl = opts.processorUrl;
    this.environment = opts.environment;
  }
  
  abstract init(): void;

  submit(): void {
    // Basic form submission for Novalnet
    const form = document.querySelector('form');
    if (form) {
      form.submit();
    }
  }

  mount(selector: string): void {
    const element = document.querySelector(selector);
    if (element) {
      this.init();
    }
  }

  isAvailable(): Promise<boolean> {
    // Basic availability check for supported payment methods
    const supportedMethods = ['card', 'sepadirectdebit', 'paypal'];
    return Promise.resolve(supportedMethods.includes(this.paymentMethod));
  }
}
