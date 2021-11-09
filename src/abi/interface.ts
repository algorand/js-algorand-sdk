import { ABIMethod, ABIMethodParams } from './method';

export interface ABIInterfaceParams {
  name: string;
  methods: ABIMethodParams[];
}

export class ABIInterface {
  public readonly name: string;
  public readonly methods: ABIMethod[];

  constructor(params: ABIInterfaceParams) {
    this.name = params.name;
    this.methods = params.methods.map((method) => new ABIMethod(method));
  }
}
