/**
 * Server-only error logging utilities
 * This file should only be imported in server-side code (API routes, server components)
 */

import { writeFile, mkdir, readdir, stat, unlink, rename } from 'fs/promises'
import { join } from 'path'

export interface ErrorLog {
  id: string
  timestamp: Date
  level: 'error' | 'warn' | 'info'
  message: string
  error?: {
    name: string
    message: string
    stack?: string
  }
  context?: Record<string, any>
  user?: {
    id?: string
    email?: string
  }
  request?: {
    method?: string
    url?: string
    userAgent?: string
    ip?: string
  }
}

class ServerErrorLogger {
  private logDir = join(process.cwd(), 'logs')
  private maxLogFiles = 10
  private maxLogSize = 10 * 1024 * 1024 // 10MB

  /**
   * Log an error to file system (server-side only)
   */
  async logToFile(errorLog: ErrorLog): Promise<void> {
    try {
      // Ensure logs directory exists
      await mkdir(this.logDir, { recursive: true })

      const date = new Date().toISOString().split('T')[0]
      const logFile = join(this.logDir, `error-${date}.log`)
      
      const logEntry = JSON.stringify({
        ...errorLog,
        timestamp: errorLog.timestamp.toISOString()
      }) + '\n'

      await writeFile(logFile, logEntry, { flag: 'a' })
      
      // Rotate logs if needed
      await this.rotateLogs()
    } catch (error) {
      // Fail silently to avoid logging loops
      console.error('Failed to write error log:', error)
    }
  }

  /**
   * Rotate log files to prevent disk space issues
   */
  private async rotateLogs(): Promise<void> {
    try {
      const files = await readdir(this.logDir)
      const logFiles = files
        .filter(file => file.startsWith('error-') && file.endsWith('.log'))
        .sort()
        .reverse()

      // Remove old log files if we have too many
      if (logFiles.length > this.maxLogFiles) {
        const filesToDelete = logFiles.slice(this.maxLogFiles)
        for (const file of filesToDelete) {
          await unlink(join(this.logDir, file)).catch(() => {})
        }
      }

      // Check file sizes and rotate if needed
      for (const file of logFiles.slice(0, this.maxLogFiles)) {
        const filePath = join(this.logDir, file)
        const stats = await stat(filePath)
        
        if (stats.size > this.maxLogSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
          const archiveName = file.replace('.log', `-${timestamp}.log`)
          await rename(filePath, join(this.logDir, archiveName))
        }
      }
    } catch (error) {
      // Fail silently
      console.error('Failed to rotate logs:', error)
    }
  }

  /**
   * Get recent error logs (for admin dashboard)
   */
  async getRecentLogs(limit: number = 50): Promise<ErrorLog[]> {
    try {
      // Ensure logs directory exists
      await mkdir(this.logDir, { recursive: true })
      
      const files = await readdir(this.logDir)
      const logFiles = files
        .filter(file => file.startsWith('error-') && file.endsWith('.log'))
        .sort()
        .reverse()

      const logs: ErrorLog[] = []
      
      for (const file of logFiles) {
        if (logs.length >= limit) break
        
        try {
          const { readFile } = await import('fs/promises')
          const content = await readFile(join(this.logDir, file), 'utf-8')
          const lines = content.trim().split('\n').reverse()
          
          for (const line of lines) {
            if (logs.length >= limit) break
            if (!line.trim()) continue
            
            try {
              const log = JSON.parse(line)
              logs.push({
                ...log,
                timestamp: new Date(log.timestamp)
              })
            } catch (parseError) {
              // Skip invalid log entries
              continue
            }
          }
        } catch (fileError) {
          // Skip files that can't be read
          continue
        }
      }
      
      return logs
    } catch (error) {
      console.error('Failed to get recent logs:', error)
      return []
    }
  }

  /**
   * Clear old logs
   */
  async clearLogs(olderThanDays: number = 30): Promise<void> {
    try {
      const files = await readdir(this.logDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
      
      for (const file of files) {
        if (!file.startsWith('error-') || !file.endsWith('.log')) continue
        
        const filePath = join(this.logDir, file)
        const stats = await stat(filePath)
        
        if (stats.mtime < cutoffDate) {
          await unlink(filePath)
        }
      }
    } catch (error) {
      console.error('Failed to clear old logs:', error)
    }
  }

  /**
   * Create error log entry
   */
  createErrorLog(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    level: ErrorLog['level'] = 'error'
  ): ErrorLog {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      context
    }
  }

  /**
   * Log error with context (server-side only)
   */
  async log(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    level: ErrorLog['level'] = 'error'
  ): Promise<void> {
    const errorLog = this.createErrorLog(message, error, context, level)
    
    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${level.toUpperCase()}] ${message}`, error, context)
    }
    
    // Log to file in production
    if (process.env.NODE_ENV === 'production') {
      await this.logToFile(errorLog)
    }
    
    // Send to external service if configured
    await this.sendToExternalService(errorLog)
  }

  /**
   * Send error to external monitoring service
   */
  private async sendToExternalService(errorLog: ErrorLog): Promise<void> {
    const webhookUrl = process.env.ERROR_WEBHOOK_URL
    if (!webhookUrl) return

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'gitmesh-ce-website',
          environment: process.env.NODE_ENV,
          ...errorLog
        })
      })
    } catch (error) {
      // Fail silently to avoid logging loops
      console.error('Failed to send error to external service:', error)
    }
  }
}

// Export singleton instance
export const serverErrorLogger = new ServerErrorLogger()