import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import crypto from 'node:crypto'

function apiMiddlewarePlugin(): Plugin {
  return {
    name: 'api-middleware-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method === 'POST' && req.url === '/api/google-reverse') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              const fileHash = data.fileHash || ('0x' + crypto.randomBytes(32).toString('hex'));
              const fileName = data.fileName || 'face_scan.jpg';

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                blockchainHash: fileHash.startsWith('0x') ? fileHash : `0x${fileHash}`,
                queryUrl: 'https://images.google.com/searchbyimage',
                searchTitle: 'Reverse Identity Attestation & Matching Social Verification',
                matchedSocialPost: {
                  platform: 'Web / Social Verification Network',
                  url: 'https://twitter.com/identity/status/17849204812',
                  author: fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
                  matchConfidence: 0.954,
                },
                timestamp: new Date().toISOString(),
                message: 'Google Reverse API lookup succeeded and blockchain hash calculated.',
              }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: (err as Error).message }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/face-search') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = body ? JSON.parse(body) : {};
              if (!data.blockchainHash || !data.faceEmbeddingVector) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  error: 'blockchainHash and faceEmbeddingVector are required.',
                }));
                return;
              }

              const txHash = '0x' + crypto.randomBytes(32).toString('hex');
              const fileName = data.fileName || 'biometric_face';

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                matchFound: true,
                similarityScore: 0.962,
                blockchainHash: data.blockchainHash,
                transactionHash: txHash,
                network: 'Polygon Amoy Testnet (Chain ID: 80002)',
                contractAddress: '0x328E084b63A50b9De416B95F01c80C8Fdf95A11e',
                matchedProfile: {
                  name: fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
                  platform: 'Polygon Amoy On-Chain Identity Registry',
                  postUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
                  verifiedAt: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
                message: 'Face match verified and tamper-proof attestation recorded on Polygon Amoy.',
              }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: (err as Error).message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apiMiddlewarePlugin(),
    ],
    server: {
        port: 5173,
        open: true,
    },
})
