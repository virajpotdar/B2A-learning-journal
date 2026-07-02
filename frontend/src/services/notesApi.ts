import type { JournalNote } from '../types';
import { supabase } from '../supabase/client';

export async function fetchNotes(): Promise<JournalNote[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', user.email)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', user.email)
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

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
