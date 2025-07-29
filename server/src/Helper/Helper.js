import crypto from 'crypto'

export const generateReferralCode = () => {
  return crypto.randomBytes(5).toString('hex') 
}