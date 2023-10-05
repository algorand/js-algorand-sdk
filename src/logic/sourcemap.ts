import * as vlq from 'vlq';

/**
 * Represents a location in a source file.
 */
export interface SourceLocation {
  line: number;
  column: number;
}

/**
 * Represents the location of a specific PC in a source line.
 */
export interface PcLineLocation {
  pc: number;
  column: number;
}

/**
 * Contains a mapping from TEAL program PC to source file location.
 */
export class SourceMap {
  public readonly version: number;
  public readonly sources: string[];
  public readonly names: string[];
  public readonly mappings: string;

  private pcToLocation: Map<number, SourceLocation>;
  private lineToPc: Map<number, PcLineLocation[]>;

  constructor({
    version,
    sources,
    names,
    mappings,
  }: {
    version: number;
    sources: string[];
    names: string[];
    mappings: string;
  }) {
    this.version = version;
    this.sources = sources;
    this.names = names;
    this.mappings = mappings;

    if (this.version !== 3)
      throw new Error(`Only version 3 is supported, got ${this.version}`);

    if (this.mappings === undefined)
      throw new Error(
        'mapping undefined, cannot build source map without `mapping`'
      );

    const pcList = this.mappings.split(';').map(vlq.decode);

    this.pcToLocation = new Map();
    this.lineToPc = new Map();

    const lastLocation: SourceLocation = {
      line: 0,
      column: 0,
    };
    for (const [pc, data] of pcList.entries()) {
      if (data.length < 4) continue;

      const [, , lineDelta, columnDelta] = data;

      lastLocation.line += lineDelta;
      lastLocation.column += columnDelta;

      let pcsForLine = this.lineToPc.get(lastLocation.line);
      if (pcsForLine === undefined) {
        pcsForLine = [];
        this.lineToPc.set(lastLocation.line, pcsForLine);
      }

      pcsForLine.push({
        pc,
        column: lastLocation.column,
      });
      this.pcToLocation.set(pc, {
        line: lastLocation.line,
        column: lastLocation.column,
      });
    }
  }

  getPcs(): number[] {
    return Array.from(this.pcToLocation.keys());
  }

  getLocationForPc(pc: number): SourceLocation | undefined {
    return this.pcToLocation.get(pc);
  }

  getPcsForLine(line: number): PcLineLocation[] {
    const pcs = this.lineToPc.get(line);
    if (pcs === undefined) return [];
    return pcs;
  }
}
