import { GetPublicKeyOrSecret } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

export function GetKeyFactory(client: JwksClient): () => GetPublicKeyOrSecret {
  return () => (header, callback) => {
    if (!header?.kid) {
      return callback(new Error('No key id (`kid`) was found: https://datatracker.ietf.org/doc/html/rfc7515#section-4.1.4'));
    }
    client.getSigningKey(header.kid, (err, keys) => {
      if (err) {
        return callback(err);
      }
      if (!keys) {
        return callback(new Error('No public keys were received.'));
      }
      const publicKey = keys.getPublicKey();
      if (!publicKey) {
        return callback(new Error('No matching public key was found.'));
      }
      callback(null, publicKey);
    });
  };
}
