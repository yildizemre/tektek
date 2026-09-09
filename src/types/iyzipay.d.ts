declare module "iyzipay" {
  type Callback = (err: unknown, result: Record<string, unknown>) => void;

  interface IyzipayOptions {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  class Iyzipay {
    constructor(options: IyzipayOptions);
    checkoutFormInitialize: { create(request: Record<string, unknown>, cb: Callback): void };
    checkoutForm: { retrieve(request: Record<string, unknown>, cb: Callback): void };
  }

  export = Iyzipay;
}
