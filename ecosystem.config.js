module.exports = {
  apps: [
    {
      name: "backend",
      cwd: "/app/server",
      script: "index.js",
      watch: false
    },
    {
      name: "frontend",
      cwd: "/app",
      script: "start-frontend.sh",
      watch: false,
      interpreter: "/bin/sh"
    }
  ]
};
