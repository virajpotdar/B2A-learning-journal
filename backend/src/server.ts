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