import { ABIMethod, ABIMethodParams } from './method';

export interface ABIContractNetworkInfo {
  appID: number;
}

export interface ABIContractNetworks {
  [network: string]: ABIContractNetworkInfo;
}

export interface ABIContractParams {
  name: string;
  networks?: ABIContractNetworks;
  methods: ABIMethodParams[];
}

export class ABIContract {
  public readonly name: string;
  public readonly networks: ABIContractNetworks;
  public readonly methods: ABIMethod[];

  constructor(params: ABIContractParams) {
    if (
      typeof params.name !== 'string' ||
      !Array.isArray(params.methods) ||
      (params.networks && typeof params.networks !== 'object')
    ) {
      throw new Error('Invalid ABIContract parameters');
    }

    this.name = params.name;
    this.networks = params.networks ? { ...params.networks } : {};
    this.methods = params.methods.map((method) => new ABIMethod(method));
  }

  toJSON(): ABIContractParams {
    return {
      name: this.name,
      networks: this.networks,
      methods: this.methods.map((method) => method.toJSON()),
    };
  }
}
