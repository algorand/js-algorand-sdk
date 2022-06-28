import * as vlq from 'vlq';

export class SourceMap {
  version: number;
  sources: string[];
  names: string[];
  mappings: string;

  pcToLine: { [key: number]: number };
  lineToPc: { [key: number]: number[] };

  constructor({
    version,
    sources,
    names,
    mappings,
    mapping,
  }: {
    version: number;
    sources: string[];
    names: string[];
    mappings?: string;
    mapping?: string;
  }) {
    this.version = version;
    this.sources = sources;
    this.names = names;
    // Backwards compat
    this.mappings = mapping !== undefined ? mapping : mappings;

    if (this.version !== 3)
      throw new Error(`Only version 3 is supported, got ${this.version}`);

    if (this.mappings === undefined)
      throw new Error(
        'mapping undefined, please specify in key `mapping` or `mappings`'
      );

    const pcList = this.mappings.split(';').map((m) => {
      const decoded = vlq.decode(m);
      if (decoded.length > 1) return decoded[2];
      return undefined;
    });

    // Init to 0,0
    this.pcToLine = { 0: 0 };
    this.lineToPc = { 0: [0] };

    let lastLine = 0;
    for (const [idx, val] of pcList.entries()) {
      if (val !== undefined) {
        if (!(val in this.lineToPc)) this.lineToPc[val] = [];
        this.lineToPc[val].push(idx);
        lastLine = val;
      }
      this.pcToLine[idx] = lastLine;
    }
  }

  getLineForPc(pc: number): number {
    return this.pcToLine[pc];
  }

  getPcsForLine(line: number): number[] {
    return this.lineToPc[line];
  }
}
