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

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Admin create user (avoids email confirmation and rate limits when using service role key)
app.post('/api/auth/admin-create', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const url = `${supabaseUrl}/auth/v1/admin/users`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ email, password, email_confirm: true }),
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json(data);
    return res.json(data);
  } catch (err: any) {
    console.error('admin-create error', err);
    return res.status(500).json({ error: String(err) });
  }
});