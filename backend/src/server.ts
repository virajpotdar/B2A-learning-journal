import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 1. Load the secret keys from the .env file
dotenv.config();

const app = express();
const PORT = 4000;

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

  res.status(201).json({ message: "Note saved permanently!", note: data[0] });
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

// Admin create user (avoids email confirmation and rate limits when using service role key)
app.post('/api/auth/admin-create', async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  
  // Requirement 9: Validate username is required
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'email, password, and username are required' });
  }

  // Requirement 9: Validate username format
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 3 and 30 characters' });
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain alphanumeric characters, hyphens, and underscores' });
  }

  try {
    // Requirement 9: Check username uniqueness in profiles table
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', username)
      .single();
    
    if (existingProfile) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Create user with Supabase admin API
    const url = `${supabaseUrl}/auth/v1/admin/users`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ 
        email, 
        password, 
        email_confirm: true,
        user_metadata: { username }
      }),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);

    // Requirement 9: Create profile with username
    if (data.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: data.id, 
          email, 
          full_name: username 
        }]);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway as user was created
      }
    }

    return res.json(data);
  } catch (err: any) {
    console.error('admin-create error', err);
    return res.status(500).json({ error: String(err) });
  }
});

// Requirement 1: Check username uniqueness endpoint
app.get('/api/auth/check-username/:username', async (req: Request, res: Response) => {
  const { username } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', username)
      .single();
    
    if (data) {
      return res.json({ available: false });
    }
    return res.json({ available: true });
  } catch (err: any) {
    // If no profile found, username is available
    return res.json({ available: true });
  }
});