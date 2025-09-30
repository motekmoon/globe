// Environment variable validation utility
// Ensures all required environment variables are present

interface RequiredEnvVars {
  REACT_APP_SUPABASE_URL: string;
  REACT_APP_SUPABASE_ANON_KEY: string;
  REACT_APP_MAPBOX_ACCESS_TOKEN: string;
}

interface OptionalEnvVars {
  REACT_APP_ANALYTICS_ID?: string;
  REACT_APP_SENTRY_DSN?: string;
}

const REQUIRED_ENV_VARS: (keyof RequiredEnvVars)[] = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY',
  'REACT_APP_MAPBOX_ACCESS_TOKEN'
];

const validateEnvironment = (): { isValid: boolean; missingVars: string[] } => {
  const missingVars: string[] = [];
  
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === `your-${varName.toLowerCase().replace('react_app_', '').replace('_', '-')}`) {
      missingVars.push(varName);
    }
  });
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
};

const logEnvironmentStatus = (): void => {
  const { isValid, missingVars } = validateEnvironment();
  
  if (isValid) {
    console.log('✅ All required environment variables are configured');
  } else {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Please check your .env.local file or Vercel environment variables');
  }
};

// Validate environment on module load
if (process.env.NODE_ENV === 'production') {
  logEnvironmentStatus();
}

export { validateEnvironment, logEnvironmentStatus };
export type { RequiredEnvVars, OptionalEnvVars };
