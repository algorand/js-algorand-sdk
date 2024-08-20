import { ABIMethod, ABIMethodParams, getMethodByName } from './method.js';
import { ARC28Event } from './event.js';

export interface ABIContractNetworkInfo {
  appID: number;
}

export interface ABIContractNetworks {
  [network: string]: ABIContractNetworkInfo;
}

export interface ABIContractParams {
  name: string;
  desc?: string;
  networks?: ABIContractNetworks;
  methods: ABIMethodParams[];
  events?: ARC28Event[];
}

export class ABIContract {
  public readonly name: string;
  public readonly description?: string;
  public readonly networks: ABIContractNetworks;
  public readonly methods: ABIMethod[];
  /** [ARC-28](https://arc.algorand.foundation/ARCs/arc-0028) events that MAY be emitted by this contract */
  public readonly events?: ARC28Event[];

  constructor(params: ABIContractParams) {
    if (
      typeof params.name !== 'string' ||
      !Array.isArray(params.methods) ||
      (params.networks && typeof params.networks !== 'object')
    ) {
      throw new Error('Invalid ABIContract parameters');
    }

    this.name = params.name;
    this.description = params.desc;
    this.networks = params.networks ? { ...params.networks } : {};
    this.methods = params.methods.map((method) => new ABIMethod(method));
    this.events = params.events;
  }

  toJSON(): ABIContractParams {
    return {
      name: this.name,
      desc: this.description,
      networks: this.networks,
      methods: this.methods.map((method) => method.toJSON()),
      events: this.events,
    };
  }

  getMethodByName(name: string): ABIMethod {
    return getMethodByName(this.methods, name);
  }
}
