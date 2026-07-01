import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// 1. Load the secret keys from the .env file
dotenv.config();

const app = express();
const PORT = 4000;
const BCRYPT_SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

// 2. Connect to the Supabase Filing Cabinet
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. The Menu (Now connected to real data!)

// Route A: Get all notes from Supabase
app.get('/api/notes', async (req: Request, res: Response) => {
  // Go to the 'notes' table and select all columns (*)
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json(data || []);
});

// Route B: Save a new note to Supabase
app.post('/api/notes', async (req: Request, res: Response) => {
  const newNote = req.body;

  // Insert the new note into the 'notes' table
  const { data, error } = await supabase
    .from('notes')
    .insert([
      { 
        title: newNote.title, 
        category: newNote.category, 
        content: newNote.content 
      }
    ])
    .select(); // Ask Supabase to return the newly created row

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: "Note saved permanently!", note: data?.[0] || null });
});

// Register a new user in the custom users table
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'email, username and password required' });
  }

  try {
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: existingError.message });
    }

    if (existingUser) {
      return res.status(409).json({ error: 'Email or username already exists' });
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, username, password_hash }])
      .select('id, email, username')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ user: data });
  } catch (err: any) {
    console.error('register error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Authenticate a user from the custom users table
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'identifier and password required' });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, password_hash')
      .or(`email.eq.${identifier},username.eq.${identifier}`)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const isValid = await bcrypt.compare(password, data.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    res.json({ user: { id: data.id, email: data.email, username: data.username } });
  } catch (err: any) {
    console.error('login error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP for password reset
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      return res.status(500).json({ error: userError.message });
    }

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If the email exists, an OTP will be sent' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Store OTP in database
    const { error: otpError } = await supabase
      .from('password_resets')
      .insert([{ email, otp, expires_at: expiresAt }]);

    if (otpError) {
      return res.status(500).json({ error: otpError.message });
    }

    // Log OTP to console (in production, send via email service like SendGrid/Nodemailer)
    console.log(`OTP for ${email}: ${otp} (expires at ${expiresAt})`);

    res.json({ message: 'OTP sent successfully' });
  } catch (err: any) {
    console.error('forgot password error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const { data, error } = await supabase
      .from('password_resets')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (err: any) {
    console.error('verify otp error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Reset password with OTP
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }

  try {
    // Verify OTP and mark as used
    const { data: otpData, error: otpError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (otpError) {
      return res.status(500).json({ error: otpError.message });
    }

    if (!otpData) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    // Update user password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('email', email);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    // Mark OTP as used
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', otpData.id);

    res.json({ message: 'Password reset successfully' });
  } catch (err: any) {
    console.error('reset password error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Generate a unique share ID for a learning path
function generateShareId(): string {
  return Math.random().toString(36).substring(2, 10) + 
         Math.random().toString(36).substring(2, 10);
}

// Create a share link for a learning path
app.post('/api/share/create', async (req: Request, res: Response) => {
  const { category, userId } = req.body;
  if (!category || !userId) {
    return res.status(400).json({ error: 'Category and userId are required' });
  }

  try {
    const shareId = generateShareId();
    
    // Get all notes for this category
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('category', category);

    if (notesError) {
      return res.status(500).json({ error: notesError.message });
    }

    if (!notes || notes.length === 0) {
      return res.status(404).json({ error: 'No notes found for this category' });
    }

    // Store the share data
    const { data: shareData, error: shareError } = await supabase
      .from('shared_paths')
      .insert({
        share_id: shareId,
        category,
        user_id: userId,
        notes_data: notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (shareError) {
      return res.status(500).json({ error: shareError.message });
    }

    res.json({ 
      shareId, 
      shareUrl: `${req.protocol}://${req.get('host')}/share/${shareId}`,
      category,
      topicCount: notes.length 
    });
  } catch (err: any) {
    console.error('create share error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Get shared learning path data
app.get('/api/share/:shareId', async (req: Request, res: Response) => {
  const { shareId } = req.params;

  try {
    const { data, error } = await supabase
      .from('shared_paths')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Shared path not found' });
    }

    res.json({
      category: data.category,
      notes: data.notes_data,
      topicCount: data.notes_data?.length || 0,
      createdAt: data.created_at,
    });
  } catch (err: any) {
    console.error('get share error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Import/copy a shared learning path
app.post('/api/share/:shareId/import', async (req: Request, res: Response) => {
  const { shareId } = req.params;
  const { userId, newCategory } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // Get the shared path data
    const { data: shareData, error: shareError } = await supabase
      .from('shared_paths')
      .select('*')
      .eq('share_id', shareId)
      .single();

    if (shareError) {
      return res.status(500).json({ error: shareError.message });
    }

    if (!shareData) {
      return res.status(404).json({ error: 'Shared path not found' });
    }

    // Create independent copies of all notes with new IDs
    const importedNotes = [];
    for (const note of shareData.notes_data) {
      const { data: newNote, error: insertError } = await supabase
        .from('notes')
        .insert({
          title: note.title,
          content: note.content,
          category: newCategory || shareData.category,
          user_id: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error importing note:', insertError);
        continue;
      }

      importedNotes.push(newNote);
    }

    res.json({ 
      message: 'Learning path imported successfully',
      topicCount: importedNotes.length,
      category: newCategory || shareData.category,
    });
  } catch (err: any) {
    console.error('import share error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Route C: Update an existing note
app.put('/api/notes/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { title, content } = req.body;

  if (!title && !content) {
    return res.status(400).json({ error: 'Title or content is required to update the note.' });
  }

  const updatedFields: Record<string, unknown> = {};
  if (title !== undefined) updatedFields.title = title;
  if (content !== undefined) updatedFields.content = content;

  const { data, error } = await supabase
    .from('notes')
    .update(updatedFields)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  res.json({ message: 'Note updated successfully.', note: data[0] });
});

// Route D: Delete a note
app.delete('/api/notes/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  const { data, error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  res.json({ message: 'Note deleted successfully.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});