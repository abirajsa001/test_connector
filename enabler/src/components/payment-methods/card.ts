import {
  ComponentOptions,
  PaymentComponent,
  PaymentMethod,
} from "../../payment-enabler/payment-enabler";
import { NovalnetBaseComponentBuilder, DefaultNovalnetComponent } from "../base";
import { BaseOptions } from "../../payment-enabler/novalnet-payment-enabler";

/**
 * Credit card component for Novalnet
 */

export class CardBuilder extends NovalnetBaseComponentBuilder {
  constructor(baseOptions: BaseOptions) {
    super(PaymentMethod.card, baseOptions);
  }

  build(config: ComponentOptions): PaymentComponent {
    try {
      const cardComponent = new CardComponent({
        paymentMethod: this.paymentMethod,
        componentOptions: config,
        sessionId: this.sessionId,
        processorUrl: this.processorUrl,
        environment: this.environment,
      });
      cardComponent.init();
      return cardComponent;
    } catch (error) {
      throw new Error(`Failed to build card component: ${error}`);
    }
  }
}

export class CardComponent extends DefaultNovalnetComponent {
  private cardForm: HTMLElement | null = null;

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
    if (typeof document === 'undefined') {
      throw new Error('Document is not available');
    }
    
    try {
      this.cardForm = document.createElement('div');
      this.cardForm.innerHTML = this.getCardFormTemplate();
    } catch (error) {
      throw new Error(`Failed to initialize card form: ${error}`);
    }
  }

  private getCardFormTemplate(): string {
    return `
      <div class="novalnet-card-form">
        <input type="text" placeholder="Card Number" name="cardNumber" required />
        <input type="text" placeholder="MM/YY" name="expiryDate" required />
        <input type="text" placeholder="CVV" name="cvv" required />
        <input type="text" placeholder="Cardholder Name" name="cardholderName" required />
      </div>
    `;
  }

  mount(selector: string): void {
    try {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element with selector '${selector}' not found`);
      }
      if (!this.cardForm) {
        throw new Error('Card form not initialized');
      }
      element.appendChild(this.cardForm);
    } catch (error) {
      throw new Error(`Failed to mount card component: ${error}`);
    }
  }

  showValidation(): void {
    // Validation display logic would be implemented here
  }

  isValid(): boolean {
    if (!this.cardForm) return false;
    
    const inputs = this.cardForm.querySelectorAll('input[required]');
    return Array.from(inputs).every(input => (input as HTMLInputElement).value.trim() !== '');
  }

  getState() {
    return {
      card: {
        type: 'CREDITCARD',
      },
    };
  }
}
