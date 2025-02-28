module.exports = {
  apps: [
    {
      name: "SRCC",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/var/www/html/SRCC",
      instances: "1",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};