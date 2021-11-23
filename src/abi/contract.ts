import { ABIMethod, ABIMethodParams } from './method';

export interface ABIContractParams {
  name: string;
  appId: number;
  methods: ABIMethodParams[];
}

export class ABIContract {
  public readonly name: string;
  public readonly appId: number;
  public readonly methods: ABIMethod[];

  constructor(params: ABIContractParams) {
    if (
      typeof params.name !== 'string' ||
      typeof params.appId !== 'number' ||
      !Array.isArray(params.methods)
    ) {
      throw new Error('Invalid ABIContract parameters');
    }

    this.name = params.name;
    this.appId = params.appId;
    this.methods = params.methods.map((method) => new ABIMethod(method));
  }

  toJSON(): ABIContractParams {
    return {
      name: this.name,
      appId: this.appId,
      methods: this.methods.map((method) => method.toJSON()),
    };
  }
}
