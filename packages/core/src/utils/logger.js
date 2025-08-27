/**
 * Logging utilities for Niko Bathrooms PIM
 */
class Logger {
    isDevelopment = process.env.NODE_ENV === 'development';
    context = {};
    constructor(defaultContext = {}) {
        this.context = defaultContext;
    }
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    formatMessage(level, message, context) {
        const timestamp = new Date().toISOString();
        const fullContext = { ...this.context, ...context };
        const contextStr = Object.keys(fullContext).length > 0
            ? ` ${JSON.stringify(fullContext)}`
            : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
    }
    debug(message, context) {
        if (this.isDevelopment) {
            console.debug(this.formatMessage('debug', message, context));
        }
    }
    info(message, context) {
        console.info(this.formatMessage('info', message, context));
    }
    warn(message, context) {
        console.warn(this.formatMessage('warn', message, context));
    }
    error(message, error, context) {
        const errorContext = error ? {
            error: error.message,
            stack: error.stack,
            ...context
        } : context;
        console.error(this.formatMessage('error', message, errorContext));
    }
    createChild(childContext) {
        return new Logger({ ...this.context, ...childContext });
    }
}
// Default logger instance
export const logger = new Logger({ module: 'niko-pim' });
// Create module-specific loggers
export const createLogger = (module) => {
    return new Logger({ module });
};
//# sourceMappingURL=logger.js.map