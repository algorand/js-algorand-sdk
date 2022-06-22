import * as vlq from 'vlq';

export class SourceMap {
  version: number;
  sources: string[];
  names: string[];
  mapping: string;
  delimiter: string;

  pcToLine: { [key: number]: number };
  lineToPc: { [key: number]: number[] };

  constructor({
    version,
    sources,
    names,
    mapping,
    delimiter,
  }: {
    version: number;
    sources: string[];
    names: string[];
    mapping: string;
    delimiter?: string;
  }) {
    this.version = version;
    this.sources = sources;
    this.names = names;
    this.mapping = mapping;
    this.delimiter = delimiter === undefined ? ';' : delimiter;

    const pcList = this.mapping.split(this.delimiter).map((m) => {
      const decoded = vlq.decode(m);
      if (decoded.length > 1) return decoded[2];
      return undefined;
    });

    this.pcToLine = {};
    this.lineToPc = {};

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
