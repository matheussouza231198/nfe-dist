export type LogContext = Record<string, unknown>;

export interface Logger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

function log(level: 'info' | 'warn' | 'error', message: string, context: LogContext = {}): void {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    ...context
  };
  console.log(JSON.stringify(payload));
}

export const logger: Logger = {
  info: (message, context) => log('info', message, context),
  warn: (message, context) => log('warn', message, context),
  error: (message, context) => log('error', message, context)
};
