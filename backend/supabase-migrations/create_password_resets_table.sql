-- Create password_resets table for OTP-based password reset
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  used BOOLEAN DEFAULT FALSE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- Create index on OTP for verification
CREATE INDEX IF NOT EXISTS idx_password_resets_otp ON password_resets(otp);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);
