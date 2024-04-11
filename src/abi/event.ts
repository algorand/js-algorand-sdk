export interface ARC28Event {
  /** The name of the event */
  name: string;
  /** Optional, user-friendly description for the event */
  desc?: string;
  /** The arguments of the event, in order */
  args: Array<{
    /** The type of the argument */
    type: string;
    /** Optional, user-friendly name for the argument */
    name?: string;
    /** Optional, user-friendly description for the argument */
    desc?: string;
  }>;
}
