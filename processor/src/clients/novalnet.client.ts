import axios, { AxiosInstance } from 'axios';
import { getConfig } from '../config/config.js';

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
    const response = await this.client.post('/payment', {
      ...paymentData,
      vendor: this.config.novalnetVendorId,
      auth_code: this.config.novalnetAuthCode,
      product: this.config.novalnetProductId,
      test_mode: this.config.novalnetTestMode ? 1 : 0,
    });
    return response.data;
  }

  async capturePayment(transactionId: string, amount: number) {
    const response = await this.client.post('/transaction/capture', {
      transaction: { tid: transactionId },
      capture: { amount },
      custom: {
        lang: 'EN'
      }
    });
    return response.data;
  }

  async refundPayment(transactionId: string, amount: number) {
    const response = await this.client.post('/transaction/refund', {
      transaction: { tid: transactionId },
      refund: { amount },
      custom: {
        lang: 'EN'
      }
    });
    return response.data;
  }

  async cancelPayment(transactionId: string) {
    const response = await this.client.post('/transaction/cancel', {
      transaction: { tid: transactionId },
      custom: {
        lang: 'EN'
      }
    });
    return response.data;
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