let logCounter = 0;

/**
 * Generates a collision-resistant unique ID for simulation event logs.
 */
export function generateLogId(prefix: string): string {
  logCounter = (logCounter + 1) % 1000000;
  const rand = Math.random().toString(36).substring(2, 7);
  return `${prefix}-${Date.now()}-${logCounter}-${rand}`;
}
