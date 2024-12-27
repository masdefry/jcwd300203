declare module 'midtrans-client' {
    export class CoreApi {
      static transaction: any;
      constructor(options: { isProduction: boolean; serverKey: string; clientKey?: string });
      charge(parameters: any): Promise<any>;
      transaction: {
        status(transactionId: string): Promise<any>;
        cancel(transactionId: string): Promise<any>;
        refund(transactionId: string, parameters: any): Promise<any>;
      };
    }
  
    export class Snap {
      constructor(options: { isProduction: boolean; serverKey: string });
      createTransaction(parameters: any): Promise<{ token: string; redirect_url: string }>;
      getTransactionStatus(orderId: string): Promise<any>;
    }
  }
  