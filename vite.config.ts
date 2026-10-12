import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import crypto from 'crypto';
import { defineConfig, Plugin } from 'vite';

function sesmsAuthServerPlugin(): Plugin {
  return {
    name: 'sesms-auth-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/auth/hash-password' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const { password } = JSON.parse(body || '{}');
              if (!password || typeof password !== 'string') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Password string required' }));
                return;
              }
              const salt = process.env.AUTH_SALT || 'SESMS_AUTH_SALT_v1_2026';
              const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, hash: `pbkdf2:${hash}` }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (req.url === '/api/auth/verify-password' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const { password, storedHash } = JSON.parse(body || '{}');
              if (!password || !storedHash) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: false, error: 'Password and storedHash required' }));
                return;
              }
              const salt = process.env.AUTH_SALT || 'SESMS_AUTH_SALT_v1_2026';
              const cleanHash = storedHash.replace(/^pbkdf2:/, '');
              const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
              const matches = calculated === cleanHash;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, matches }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), sesmsAuthServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
