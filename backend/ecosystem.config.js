module.exports = {
  apps: [
    {
      name: 'ai-counsellor-backend',
      script: './dist/index.js',
      instances: 'max', // Scale across all available CPUs in cluster mode
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      }
    }
  ]
};
