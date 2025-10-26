// app/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LoggerOptions {
  minLevel: LogLevel;
  enableConsole: boolean;
}

/**
 * Simple structured logger with support for different environments
 */
class Logger {
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private options: LoggerOptions = {
    minLevel: process.env.LOG_LEVEL as LogLevel || 'info',
    enableConsole: process.env.NODE_ENV !== 'production'
  };

  /**
   * Initializes the logger with custom options
   */
  public initialize(options: Partial<LoggerOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Debug level logging
   */
  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Info level logging
   */
  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  public warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  public error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    // Skip if below minimum level
    if (this.levels[level] < this.levels[this.options.minLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context
    };

    // In production, we could send to a logging service
    if (process.env.NODE_ENV === 'production') {
      this.productionLog(logEntry);
    }

    // Console logging for development or if explicitly enabled
    if (this.options.enableConsole || process.env.NODE_ENV !== 'production') {
      this.consoleLog(level, message, context, timestamp);
    }
  }

  /**
   * Production logging - could be extended to send to a service
   */
  private productionLog(logEntry: any): void {
    // In a real app, we might send logs to a service like:
    // - Vercel Logs
    // - CloudWatch
    // - Datadog
    // - Sentry
    // For now, just use console.log with JSON structure
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Console formatting for development
   */
  private consoleLog(level: LogLevel, message: string, context?: LogContext, timestamp?: string): void {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[34m', // Blue
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m'  // Red
    };
    
    const reset = '\x1b[0m';
    const color = colors[level] || reset;
    
    // Format: [TIMESTAMP] [LEVEL] MESSAGE
    const prefix = `${color}[${timestamp || new Date().toISOString()}] [${level.toUpperCase()}]${reset}`;
    
    console.log(`${prefix} ${message}`);
    
    if (context) {
      console.log(context);
    }
  }
}

// Export singleton
export const logger = new Logger();

// Initialize with default options
logger.initialize({
  minLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
  enableConsole: process.env.NODE_ENV !== 'production'
});