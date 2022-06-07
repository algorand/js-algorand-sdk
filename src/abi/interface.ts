import { ABIMethod, ABIMethodParams } from './method';

export interface ABIInterfaceParams {
  name: string;
  desc?: string;
  methods: ABIMethodParams[];
}

export class ABIInterface {
  public readonly name: string;
  public readonly description?: string;
  public readonly methods: ABIMethod[];

  constructor(params: ABIInterfaceParams) {
    if (typeof params.name !== 'string' || !Array.isArray(params.methods)) {
      throw new Error('Invalid ABIInterface parameters');
    }

    this.name = params.name;
    this.description = params.desc;
    this.methods = params.methods.map((method) => new ABIMethod(method));
  }

  toJSON(): ABIInterfaceParams {
    return {
      name: this.name,
      desc: this.description,
      methods: this.methods.map((method) => method.toJSON()),
    };
  }

  getMethodByName(name: string): ABIMethod {
    const methods = this.methods.filter((m: ABIMethod) => m.name === name);
    if (methods.length > 1)
      throw new Error(
        `found ${
          methods.length
        } methods with the same name ${methods
          .map((m: ABIMethod) => m.getSignature())
          .join(',')}`
      );

    if (methods.length === 0)
      throw new Error(`found 0 methods with the name ${name}`);

    return methods[0];
  }
}
