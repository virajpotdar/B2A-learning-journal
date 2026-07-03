import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { initializeTelemetry, logToGrafana } from './telemetry';

// 1. Load the secret keys from the .env file
dotenv.config();

// 2. Initialize logging system
initializeTelemetry();

const app = express();
const PORT = 4000;
const BCRYPT_SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Learning Journal API',
      version: '1.0.0',
      description: 'API documentation for Learning Journal backend',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/server.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 2. Connect to the Supabase Filing Cabinet
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. The Menu (Now connected to real data!)

/**
 * @swagger
 * /api/notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: List of all notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
app.get('/api/notes', async (req: Request, res: Response) => {
  logToGrafana('info', 'GET /api/notes called', { ip: req.ip });
  
  // Go to the 'notes' table and select all columns (*)
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    logToGrafana('error', 'Failed to fetch notes', { error: error.message });
    return res.status(500).json({ error: error.message });
  }
  
  logToGrafana('info', 'Successfully fetched notes', { count: data?.length || 0 });
  res.json(data || []);
});

/**
 * @swagger
 * /api/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       500:
 *         description: Server error
 */
app.post('/api/notes', async (req: Request, res: Response) => {
  logToGrafana('info', 'POST /api/notes called', { ip: req.ip });
  
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
    logToGrafana('error', 'Failed to create note', { error: error.message });
    return res.status(500).json({ error: error.message });
  }

  logToGrafana('info', 'Successfully created note', { noteId: data?.[0]?.id });
  res.status(201).json({ message: "Note saved permanently!", note: data?.[0] || null });
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Email or username already exists
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Email required
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP or missing fields
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/share/create:
 *   post:
 *     summary: Create a share link for a learning path
 *     tags: [Sharing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Share link created successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: No notes found for this category
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/share/{shareId}:
 *   get:
 *     summary: Get shared learning path data
 *     tags: [Sharing]
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shared path data retrieved successfully
 *       404:
 *         description: Shared path not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/share/{shareId}/import:
 *   post:
 *     summary: Import a shared learning path
 *     tags: [Sharing]
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               newCategory:
 *                 type: string
 *     responses:
 *       200:
 *         description: Learning path imported successfully
 *       400:
 *         description: Missing userId
 *       404:
 *         description: Shared path not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/notes/{id}:
 *   put:
 *     summary: Update an existing note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       400:
 *         description: No fields to update
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 *       500:
 *         description: Server error
 */
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
  logToGrafana('info', 'Backend server started', { port: PORT, env: process.env.DEPLOYMENT_ENV || 'local' });
});