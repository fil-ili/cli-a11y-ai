import path from 'path'
import fs from 'fs'

const CONSOLE_COLOR_CODES = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  end: '\x1b[0m',
}

export const successLog = (message: string) => console.log(`${CONSOLE_COLOR_CODES.green}${message}${CONSOLE_COLOR_CODES.end}`)
export const errorLog = (message: string) => console.log(`${CONSOLE_COLOR_CODES.red}${message}${CONSOLE_COLOR_CODES.end}`)
export const warnLog = (message: string) => console.log(`${CONSOLE_COLOR_CODES.yellow}${message}${CONSOLE_COLOR_CODES.end}`)
export const infoLog = (message: string) => console.log(`${CONSOLE_COLOR_CODES.blue}${message}${CONSOLE_COLOR_CODES.end}`)
export const debugLog = (message: string) => console.log(`${CONSOLE_COLOR_CODES.magenta}${message}${CONSOLE_COLOR_CODES.end}`)

export const getGitIgnoredDirs = (startPath: string): string[] => {
  const gitIgnorePath = path.join(startPath, '.gitignore')
  if (!fs.existsSync(gitIgnorePath)) {
    warnLog('No .gitignore file found. Using default ignore list.')
    return []
  }

  const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8')
  const ignored = gitIgnoreContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.trim().replace(/^\/|\/$/g, ''))

  return ignored
}