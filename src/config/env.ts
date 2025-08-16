interface EnvConfig {
  GEMINI_API_KEY: string;
  API_URL: string;
  NODE_ENV: string;
}

const env: EnvConfig = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  NODE_ENV: import.meta.env.MODE || 'development'
};

export default env;