import * as vlq from 'vlq';

/**
 * Represents a location in a source file.
 */
export interface SourceLocation {
  line: number;
  column: number;
  sourceIndex: number;
  nameIndex?: number;
}

/**
 * Represents the location of a specific PC in a source line.
 */
export interface PcLineLocation {
  pc: number;
  column: number;
  nameIndex?: number;
}

/**
 * Contains a mapping from TEAL program PC to source file location.
 */
export class ProgramSourceMap {
  public readonly version: number;
  /**
   * A list of original sources used by the "mappings" entry.
   */
  public readonly sources: string[];
  /**
   * A list of symbol names used by the "mappings" entry.
   */
  public readonly names: string[];
  /**
   * A string with the encoded mapping data.
   */
  public readonly mappings: string;

  private pcToLocation: Map<number, SourceLocation>;

  // Key is `${sourceIndex}:${line}`
  private sourceAndLineToPc: Map<string, PcLineLocation[]>;

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
    this.sourceAndLineToPc = new Map();

    const lastLocation = {
      line: 0,
      column: 0,
      sourceIndex: 0,
      nameIndex: 0,
    } satisfies SourceLocation;
    for (const [pc, data] of pcList.entries()) {
      if (data.length < 4) continue;

      const nameDelta = data.length > 4 ? data[4] : undefined;
      const [, sourceDelta, lineDelta, columnDelta] = data;

      lastLocation.sourceIndex += sourceDelta;
      lastLocation.line += lineDelta;
      lastLocation.column += columnDelta;
      if (typeof nameDelta !== 'undefined') {
        lastLocation.nameIndex += nameDelta;
      }

      const sourceAndLineKey = `${lastLocation.sourceIndex}:${lastLocation.line}`;
      let pcsForSourceAndLine = this.sourceAndLineToPc.get(sourceAndLineKey);
      if (pcsForSourceAndLine === undefined) {
        pcsForSourceAndLine = [];
        this.sourceAndLineToPc.set(sourceAndLineKey, pcsForSourceAndLine);
      }

      const pcInLine: PcLineLocation = {
        pc,
        column: lastLocation.column,
      };
      const pcLocation: SourceLocation = {
        line: lastLocation.line,
        column: lastLocation.column,
        sourceIndex: lastLocation.sourceIndex,
      };
      if (typeof nameDelta !== 'undefined') {
        pcInLine.nameIndex = lastLocation.nameIndex;
        pcLocation.nameIndex = lastLocation.nameIndex;
      }

      pcsForSourceAndLine.push(pcInLine);
      this.pcToLocation.set(pc, pcLocation);
    }
  }

  getPcs(): number[] {
    return Array.from(this.pcToLocation.keys());
  }

  getLocationForPc(pc: number): SourceLocation | undefined {
    return this.pcToLocation.get(pc);
  }

  getPcsOnSourceLine(sourceIndex: number, line: number): PcLineLocation[] {
    const pcs = this.sourceAndLineToPc.get(`${sourceIndex}:${line}`);
    if (pcs === undefined) return [];
    return pcs;
  }
}
