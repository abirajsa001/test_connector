import { BaseOptions } from "../../payment-enabler/novalnet-payment-enabler";
import { ComponentOptions, PaymentComponent, PaymentMethod } from "../../payment-enabler/payment-enabler";
import { NovalnetBaseComponentBuilder, DefaultNovalnetComponent } from "../base";

export class SepaBuilder extends NovalnetBaseComponentBuilder {
  constructor(baseOptions: BaseOptions) {
    super(PaymentMethod.sepadirectdebit, baseOptions);
  }

  build(config: ComponentOptions): PaymentComponent {
    const sepaComponent = new SepaComponent({
      paymentMethod: this.paymentMethod,
      componentOptions: config,
      sessionId: this.sessionId,
      processorUrl: this.processorUrl,
      environment: this.environment,
    });
    sepaComponent.init();
    return sepaComponent;
  }
}

export class SepaComponent extends DefaultNovalnetComponent {
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
    // Create basic SEPA form for Novalnet
    this.sepaForm = document.createElement('div');
    this.sepaForm.innerHTML = `
      <div class="novalnet-sepa-form">
        <input type="text" placeholder="IBAN" name="iban" required />
        <input type="text" placeholder="Account Holder" name="accountHolder" required />
      </div>
    `;
  }

  mount(selector: string): void {
    const element = document.querySelector(selector);
    if (element && this.sepaForm) {
      element.appendChild(this.sepaForm);
    }
  }

  private sepaForm: HTMLElement | null = null;

  showValidation() {
    console.log('Showing validation for SEPA component');
  }

  isValid() {
    return true;
  }
}