/**
 * Comprehensive error handling utilities and types
 */

import { ErrorCodes } from '@/types'

export interface ErrorContext {
  component?: string
  action?: string
  userId?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors?: string[]
}

export class AppError extends Error {
  public readonly code: ErrorCodes
  public readonly statusCode: number
  public readonly context: ErrorContext
  public readonly isRetryable: boolean
  public readonly originalError?: Error

  constructor(
    message: string,
    code: ErrorCodes,
    statusCode: number = 500,
    context: Partial<ErrorContext> = {},
    isRetryable: boolean = false,
    originalError?: Error
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.context = {
      timestamp: new Date(),
      ...context
    }
    this.isRetryable = isRetryable
    this.originalError = originalError

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      isRetryable: this.isRetryable,
      stack: this.stack
    }
  }
}

/**
 * Create standardized API error responses
 */
export function createAPIError(
  message: string,
  code: ErrorCodes,
  statusCode: number = 500,
  details?: any
) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  context?: Partial<ErrorContext>
): Promise<T> {
  let lastError: Error
  let attempt = 0

  while (attempt < config.maxAttempts) {
    try {
      const result = await operation()
      
      // Log successful retry if this wasn't the first attempt
      if (attempt > 0) {
        logInfo('Operation succeeded after retry', {
          ...context,
          attempt: attempt + 1,
          totalAttempts: config.maxAttempts
        })
      }
      
      return result
    } catch (error) {
      lastError = error as Error
      attempt++

      // Check if error is retryable
      const isRetryable = isErrorRetryable(error as Error, config.retryableErrors)
      
      if (!isRetryable || attempt >= config.maxAttempts) {
        logError('Operation failed after all retries', lastError, {
          ...context,
          attempt,
          totalAttempts: config.maxAttempts,
          isRetryable
        })
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      )

      logWarn('Operation failed, retrying', {
        ...context,
        attempt,
        totalAttempts: config.maxAttempts,
        delay,
        error: lastError.message
      })

      await sleep(delay)
    }
  }

  throw lastError!
}

/**
 * Check if an error is retryable based on configuration
 */
function isErrorRetryable(error: Error, retryableErrors?: string[]): boolean {
  if (!retryableErrors) {
    // Default retryable conditions
    return (
      error.message.includes('timeout') ||
      error.message.includes('network') ||
      error.message.includes('ECONNRESET') ||
      error.message.includes('ENOTFOUND') ||
      (error as any).code === 'ECONNRESET' ||
      (error as any).code === 'ETIMEDOUT' ||
      (error as any).status >= 500
    )
  }

  return retryableErrors.some(pattern => 
    error.message.toLowerCase().includes(pattern.toLowerCase()) ||
    (error as any).code === pattern
  )
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Logging utilities with different levels
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, any>
  error?: Error
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logLevel = process.env.LOG_LEVEL || 'info'

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG]
    const currentLevelIndex = levels.indexOf(this.logLevel as LogLevel)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex <= currentLevelIndex
  }

  private formatLog(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString()
    const context = entry.context ? JSON.stringify(entry.context) : ''
    const error = entry.error ? `\nError: ${entry.error.stack}` : ''
    
    return `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message} ${context}${error}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error
    }

    if (this.isDevelopment) {
      // In development, use console methods for better formatting
      const formattedMessage = this.formatLog(entry)
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage)
          break
        case LogLevel.WARN:
          console.warn(formattedMessage)
          break
        case LogLevel.INFO:
          console.info(formattedMessage)
          break
        case LogLevel.DEBUG:
          console.debug(formattedMessage)
          break
      }
    } else {
      // In production, use structured logging
      console.log(JSON.stringify(entry))
    }

    // In production, you might want to send logs to external service
    if (!this.isDevelopment && level === LogLevel.ERROR) {
      this.sendToExternalService(entry)
    }
  }

  private async sendToExternalService(entry: LogEntry) {
    // Send to file logger in production
    if (!this.isDevelopment && entry.level === LogLevel.ERROR) {
      try {
        // Check if we're on the server side
        if (typeof window === 'undefined') {
          // Server-side: use direct file logging
          const { serverErrorLogger } = await import('./error-logger.server')
          await serverErrorLogger.log(entry.message, entry.error, entry.context, 'error')
        } else {
          // Client-side: use API endpoint
          await fetch('/api/errors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: entry.message,
              error: entry.error ? {
                name: entry.error.name,
                message: entry.error.message,
                stack: entry.error.stack
              } : undefined,
              context: entry.context,
              level: 'error',
              url: window.location.href
            })
          }).catch(error => {
            // Fail silently to avoid logging loops
            console.error('Failed to send error to API:', error)
          })
        }
      } catch (error) {
        // Fail silently to avoid logging loops
        console.error('Failed to send log to external service:', error)
      }
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context)
  }
}

// Export singleton logger instance
export const logger = new Logger()

// Convenience functions
export const logError = (message: string, error?: Error, context?: Record<string, any>) => 
  logger.error(message, error, context)

export const logWarn = (message: string, context?: Record<string, any>) => 
  logger.warn(message, context)

export const logInfo = (message: string, context?: Record<string, any>) => 
  logger.info(message, context)

export const logDebug = (message: string, context?: Record<string, any>) => 
  logger.debug(message, context)

/**
 * Default retry configurations for different services
 */
export const RETRY_CONFIGS = {
  github: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'rate limit']
  },
  email: {
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 15000,
    backoffMultiplier: 2,
    retryableErrors: ['timeout', 'network', '5']
  },
  api: {
    maxAttempts: 2,
    baseDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
    retryableErrors: ['timeout', 'network']
  }
} as const

/**
 * Error boundary helper for catching and formatting errors
 */
export function handleAsyncError<T>(
  operation: () => Promise<T>,
  context?: Partial<ErrorContext>
): Promise<T> {
  return operation().catch(error => {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error.message || 'Unknown error occurred',
          ErrorCodes.VALIDATION_ERROR,
          500,
          context,
          false,
          error
        )
    
    logError('Async operation failed', appError, context)
    throw appError
  })
}

/**
 * Middleware for API route error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof AppError) {
        throw error
      }

      // Convert unknown errors to AppError
      const appError = new AppError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        ErrorCodes.VALIDATION_ERROR,
        500,
        { component: 'api-handler' },
        false,
        error instanceof Error ? error : undefined
      )

      logError('API handler error', appError)
      throw appError
    }
  }
}