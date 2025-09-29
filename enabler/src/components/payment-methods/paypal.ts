import {
  ComponentOptions,
  PaymentComponent,
  PaymentMethod,
} from "../../payment-enabler/payment-enabler";
import { NovalnetBaseComponentBuilder, DefaultNovalnetComponent } from "../base";
import { BaseOptions } from "../../payment-enabler/novalnet-payment-enabler";

/**
 * PayPal component for Novalnet
 */
export class PaypalBuilder extends NovalnetBaseComponentBuilder {
  public componentHasSubmit = false;

  constructor(baseOptions: BaseOptions) {
    super(PaymentMethod.paypal, baseOptions);
  }

  build(config: ComponentOptions): PaymentComponent {
    const paypalComponent = new PaypalComponent({
      paymentMethod: this.paymentMethod,
      componentOptions: config,
      sessionId: this.sessionId,
      processorUrl: this.processorUrl,
      environment: this.environment,
    });
    paypalComponent.init();
    return paypalComponent;
  }
}

export class PaypalComponent extends DefaultNovalnetComponent {
  constructor(opts: {
    paymentMethod: PaymentMethod;
    componentOptions: ComponentOptions;
    sessionId: string;
    processorUrl: string;
    environment: string;
  }) {
    super(opts);
  }

  init(): void {
    // Create basic PayPal button for Novalnet
    this.paypalButton = document.createElement('div');
    this.paypalButton.innerHTML = `
      <div class="novalnet-paypal-button">
        <button type="button" class="paypal-button">Pay with PayPal</button>
      </div>
    `;
    
    const button = this.paypalButton.querySelector('.paypal-button');
    if (button) {
      button.addEventListener('click', () => {
        if (this.componentOptions.onPayButtonClick) {
          this.componentOptions.onPayButtonClick();
        }
      });
    }
  }

  mount(selector: string): void {
    const element = document.querySelector(selector);
    if (element && this.paypalButton) {
      element.appendChild(this.paypalButton);
    }
  }

  private paypalButton: HTMLElement | null = null;
}
