import { ABIMethod, ABIMethodParams } from './method';

export interface ABIInterfaceParams {
  name: string;
  methods: ABIMethodParams[];
}

export class ABIInterface {
  public readonly name: string;
  public readonly methods: ABIMethod[];

  constructor(params: ABIInterfaceParams) {
    if (typeof params.name !== 'string' || !Array.isArray(params.methods)) {
      throw new Error('Invalid ABIInterface parameters');
    }

    this.name = params.name;
    this.methods = params.methods.map((method) => new ABIMethod(method));
  }

  toJSON(): ABIInterfaceParams {
    return {
      name: this.name,
      methods: this.methods.map((method) => method.toJSON()),
    };
  }
}
