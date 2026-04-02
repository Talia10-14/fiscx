import { generateKeyPairSync } from 'crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const toEnvLine = (name, value) => `${name}="${value.replace(/\n/g, '\\n')}"`;

console.log('# Copy these lines into your .env');
console.log(toEnvLine('JWT_PRIVATE_KEY', privateKey));
console.log(toEnvLine('JWT_PUBLIC_KEY', publicKey));
