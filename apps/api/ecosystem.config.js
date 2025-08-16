/**
 * PM2 ecosystem file for the education-api app
 * Minimal config: runs `npm run start` and exposes required env vars.
 * Ready for: `pm2 start ecosystem.config.js` / `pm2 save`
 */
module.exports = {
  apps: [
    {
      name: 'education-api',
      script: 'npm',
      args: 'run start',
      // when deploying on the target server this should match the app path
      cwd: '/home/ubuntu/education-app/apps/api',
      env: {
        NODE_ENV: 'development',
        PORT: '3000',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
      autorestart: true,
      instances: 1,
      watch: false,
      out_file: './logs/api-out.log',
      error_file: './logs/api-error.log',
  // By default this file starts a single process (fork mode).
  // To run in cluster mode and auto-scale to CPU cores, set `instances: 'max'` and `exec_mode: 'cluster'`.
  // You can also override at runtime: `pm2 start ecosystem.config.js --instances max --exec_mode cluster`.
  // instances: 'max',
  // exec_mode: 'cluster',
    },
  ],
};
