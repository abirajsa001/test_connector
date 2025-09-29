import axios, { AxiosInstance } from 'axios';
import { getConfig } from '../config/config';

export class NovalnetClient {
  private client: AxiosInstance;
  private config = getConfig();

  constructor() {
    const baseURL = this.config.novalnetEnvironment === 'LIVE' 
      ? 'https://payport.novalnet.de/v2' 
      : 'https://payport.novalnet.de/v2';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-NN-Access-Key': this.config.novalnetAccessKey,
      },
    });
  }

  async createPayment(paymentData: any) {
    try {
      const response = await this.client.post('/payment', {
        ...paymentData,
        vendor: this.config.novalnetVendorId,
        auth_code: this.config.novalnetAuthCode,
        product: this.config.novalnetProductId,
        test_mode: this.config.novalnetTestMode ? 1 : 0,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Novalnet payment creation failed: ${error}`);
    }
  }

  async capturePayment(transactionId: string, amount: number) {
    try {
      const response = await this.client.post('/transaction/capture', {
        transaction: { tid: transactionId },
        capture: { amount },
        custom: {
          lang: 'EN'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Novalnet capture failed: ${error}`);
    }
  }

  async refundPayment(transactionId: string, amount: number) {
    try {
      const response = await this.client.post('/transaction/refund', {
        transaction: { tid: transactionId },
        refund: { amount },
        custom: {
          lang: 'EN'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Novalnet refund failed: ${error}`);
    }
  }

  async cancelPayment(transactionId: string) {
    try {
      const response = await this.client.post('/transaction/cancel', {
        transaction: { tid: transactionId },
        custom: {
          lang: 'EN'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Novalnet cancel failed: ${error}`);
    }
  }

  async getTransactionDetails(transactionId: string) {
    const response = await this.client.post('/transaction/details', {
      transaction: { tid: transactionId },
      custom: {
        lang: 'EN'
      }
    });
    return response.data;
  }
}