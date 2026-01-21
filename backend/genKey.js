const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Save the keys to disk
fs.writeFileSync('./public.pem', publicKey);
fs.writeFileSync('./private.pem', privateKey);

console.log(" RSA key pair generated!");
