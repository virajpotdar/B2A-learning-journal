import type { JournalNote } from '../types';
import { supabase } from '../supabase/client';

// Helper function to get user email from Auth0
async function getUserEmail(): Promise<string> {
  // First check if we stored the email in localStorage
  const storedEmail = localStorage.getItem('user_email');
  if (storedEmail) {
    return storedEmail;
  }

  // Try to get from Supabase auth first
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (supabaseUser?.email) {
    return supabaseUser.email;
  }

  // Try to get from Auth0 session storage
  const auth0Keys = Object.keys(localStorage).filter(key => key.includes('auth0') || key.includes('Auth0'));
  console.log('Auth0 keys in localStorage:', auth0Keys);
  
  for (const key of auth0Keys) {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        // Check for user data in various possible locations
        if (parsed.user?.email) {
          return parsed.user.email;
        }
        if (parsed.body?.user?.email) {
          return parsed.body.user.email;
        }
        if (parsed.email) {
          return parsed.email;
        }
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  // Try sessionStorage as well
  const sessionKeys = Object.keys(sessionStorage).filter(key => key.includes('auth0') || key.includes('Auth0'));
  for (const key of sessionKeys) {
    try {
      const value = sessionStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        if (parsed.user?.email) {
          return parsed.user.email;
        }
        if (parsed.body?.user?.email) {
          return parsed.body.user.email;
        }
        if (parsed.email) {
          return parsed.email;
        }
      }
    } catch (e) {
      // Skip invalid JSON
    }
  }

  throw new Error('User not authenticated - no email found in Auth0 storage');
}

export async function fetchNotes(): Promise<JournalNote[]> {
  const email = await getUserEmail();

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!profile) throw new Error('User profile not found');

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(note => ({
    id: note.id,
    title: note.title,
    content: note.content || '',
    category: note.category,
    created_at: note.created_at,
  }));
}

export async function createNote(note: {
  title: string;
  content: string;
  category: string;
}): Promise<JournalNote> {
  const email = await getUserEmail();

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!profile) throw new Error('User profile not found');

  const { data, error } = await supabase
    .from('notes')
    .insert({
      title: note.title,
      content: note.content,
      category: note.category,
      user_id: profile.id,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    content: data.content || '',
    category: data.category,
    created_at: data.created_at,
  };
}

export async function updateNote(
  id: string,
  data: { title: string; content: string }
): Promise<JournalNote> {
  const { data: updated, error } = await supabase
    .from('notes')
    .update({
      title: data.title,
      content: data.content,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: updated.id,
    title: updated.title,
    content: updated.content || '',
    category: updated.category,
    created_at: updated.created_at,
  };
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
