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
declare class Logger {
    private isDevelopment;
    private context;
    constructor(defaultContext?: LogContext);
    setContext(context: LogContext): void;
    private formatMessage;
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    createChild(childContext: LogContext): Logger;
}
export declare const logger: Logger;
export declare const createLogger: (module: string) => Logger;
export {};
//# sourceMappingURL=logger.d.ts.map