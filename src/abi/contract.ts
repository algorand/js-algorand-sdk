import { ABIMethod, ABIMethodParams } from './method';

export interface ABIContractParams {
  name: string;
  // eslint-disable-next-line camelcase
  app_id: number;
  methods: ABIMethodParams[];
}

export class ABIContract {
  public readonly name: string;
  // eslint-disable-next-line camelcase
  public readonly app_id: number;
  public readonly methods: ABIMethod[];

  constructor(params: ABIContractParams) {
    this.name = params.name;
    this.app_id = params.app_id;
    this.methods = params.methods.map((method) => new ABIMethod(method));
  }
}
