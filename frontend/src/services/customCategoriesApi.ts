import { supabase } from '../supabase/client';

async function ensureProfileExists(userEmail: string, userName?: string, avatarUrl?: string): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (profile) return profile.id;

  // Create profile if it doesn't exist
  const username = userName || userEmail.split('@')[0];
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      email: userEmail,
      full_name: username,
      auth_provider: 'auth0',
      auth_provider_id: userEmail,
      avatar_url: avatarUrl,
    })
    .select('id')
    .single();

  if (error) {
    // If it's a conflict error, try to fetch the profile again
    if (error.code === '23505') {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (existingProfile) return existingProfile.id;
    }
    throw new Error('Failed to create user profile');
  }

  if (!newProfile) {
    throw new Error('Failed to create user profile');
  }

  return newProfile.id;
}

export interface CustomCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  gradient: string;
  created_at: string;
  updated_at: string;
}

export async function createCustomCategory(data: {
  name: string;
  description?: string;
  color: string;
  userEmail: string;
  userName?: string;
  avatarUrl?: string;
}): Promise<CustomCategory> {
  const profileId = await ensureProfileExists(data.userEmail, data.userName, data.avatarUrl);

  const { data: category, error } = await supabase
    .from('custom_categories')
    .insert({
      user_id: profileId,
      name: data.name,
      description: data.description,
      color: data.color,
      gradient: `linear-gradient(135deg, ${data.color} 0%, ${adjustColor(data.color, -20)} 100%)`,
    })
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function getUserCustomCategories(userEmail: string, userName?: string, avatarUrl?: string): Promise<CustomCategory[]> {
  const profileId = await ensureProfileExists(userEmail, userName, avatarUrl);

  const { data, error } = await supabase
    .from('custom_categories')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateCustomCategory(
  id: string,
  data: { name?: string; description?: string; color?: string }
): Promise<CustomCategory> {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.color) {
    updateData.color = data.color;
    updateData.gradient = `linear-gradient(135deg, ${data.color} 0%, ${adjustColor(data.color, -20)} 100%)`;
  }

  const { data: category, error } = await supabase
    .from('custom_categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return category;
}

export async function deleteCustomCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('custom_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Helper function to adjust color brightness for gradient
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
