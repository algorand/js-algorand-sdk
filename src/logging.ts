import { Logger } from 'tslog';

/**
 * LOG is the SDK's base logger
 */
export const LOG = new Logger();

/**
 * setLogLevel adjusts the minimum level of logs which are output by the SDK's logger
 */
export function setLogLevel(level: number) {
  LOG.settings.minLevel = level;
}
