const getRequiredEnv = (key: keyof ImportMetaEnv, fallback = '') => {
  const value = import.meta.env[key] ?? fallback

  if (!value && import.meta.env.PROD) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export const env = {
  apiBaseUrl: getRequiredEnv('VITE_API_BASE_URL', 'http://localhost:5220/api'),
  appName: import.meta.env.VITE_APP_NAME || 'Court Management',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const
