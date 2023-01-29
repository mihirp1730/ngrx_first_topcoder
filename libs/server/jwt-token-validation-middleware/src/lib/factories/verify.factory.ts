import { verify } from 'jsonwebtoken';

export function VerifyFactory(): () => typeof verify {
  return () => verify;
}
