import { genericHash } from '../nacl/naclWrappers';
import { ABIType, ABITupleType } from './abi_type';

const transactionTypes = ['pay', 'keyreg', 'acfg', 'axfer', 'afrz', 'appl'];

function parseMethodSignature(
  signature: string
): { name: string; args: string[]; returns: string } {
  const argsStart = signature.indexOf('(');
  const argsEnd = signature.lastIndexOf(')');

  if (argsStart === -1 || argsEnd === -1) {
    throw new Error(`Invalid method signature: ${signature}`);
  }

  return {
    name: signature.slice(argsStart),
    args: ABITupleType.parseTupleContent(
      signature.slice(argsStart + 1, argsEnd)
    ),
    returns: signature.slice(argsEnd + 1),
  };
}

export interface ABIMethodParams {
  name: string;
  desc?: string;
  args: Array<{ name?: string; type: string; desc?: string }>;
  returns?: { type: string; desc?: string };
}

export class ABIMethod {
  public readonly name: string;
  public readonly desc?: string;
  public readonly args: Array<{ name?: string; type: string; desc?: string }>;
  public readonly returns?: { type: string; desc?: string };

  constructor(params: ABIMethodParams) {
    this.name = params.name;
    this.desc = params.desc;
    this.args = params.args;
    this.returns = params.returns;
  }

  getSignature(): string {
    const args = this.args.map((arg) => arg.type).join(',');
    const returns = this.returns ? this.returns.type : 'void';
    return `${this.name}(${args})${returns}`;
  }

  getSelector(): Uint8Array {
    const hash = genericHash(this.getSignature());
    return new Uint8Array(hash.slice(0, 4));
  }

  txnCount(): number {
    let count = 1;
    for (const arg of this.args) {
      if (transactionTypes.includes(arg.type)) {
        count += 1;
      }
    }
    return count;
  }

  static fromSignature(signature: string): ABIMethod {
    const { name, args, returns } = parseMethodSignature(signature);

    // ensure each arg and return type is valid
    args.forEach((arg) => {
      if (!transactionTypes.includes(arg)) {
        ABIType.from(arg);
      }
    });
    if (returns !== 'void') {
      ABIType.from(returns);
    }

    return new ABIMethod({
      name,
      args: args.map((arg) => ({ type: arg })),
      returns: returns === 'void' ? undefined : { type: returns },
    });
  }
}
