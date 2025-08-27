/**
 * Logging utilities for Niko Bathrooms PIM
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  module?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private context: LogContext = {};
  
  constructor(defaultContext: LogContext = {}) {
    this.context = defaultContext;
  }
  
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const fullContext = { ...this.context, ...context };
    const contextStr = Object.keys(fullContext).length > 0 
      ? ` ${JSON.stringify(fullContext)}`
      : '';
    
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }
  
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
  
  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }
  
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }
  
  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error ? { 
      error: error.message, 
      stack: error.stack,
      ...context 
    } : context;
    
    console.error(this.formatMessage('error', message, errorContext));
  }
  
  createChild(childContext: LogContext): Logger {
    return new Logger({ ...this.context, ...childContext });
  }
}

// Default logger instance
export const logger = new Logger({ module: 'niko-pim' });

// Create module-specific loggers
export const createLogger = (module: string): Logger => {
  return new Logger({ module });
};