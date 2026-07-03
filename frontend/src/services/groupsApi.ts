import { supabase } from '../supabase/client';
import type { Group, GroupMember, SharedTopic, GroupActivity } from '../types';

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

export async function getUserGroups(userEmail: string, userName?: string, avatarUrl?: string): Promise<Group[]> {
  const profileId = await ensureProfileExists(userEmail, userName, avatarUrl);

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups (
        id,
        name,
        description,
        image_url,
        invite_code,
        created_by,
        created_at,
        updated_at
      )
    `)
    .eq('user_id', profileId);

  if (error) throw error;

  const groups: Group[] = (data || []).map((item: any) => ({
    ...item.groups,
    member_count: 0, // Will be populated separately
    topic_count: 0, // Will be populated separately
  }));

  // Get member counts and topic counts
  for (const group of groups) {
    const { count: memberCount } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id);

    const { count: topicCount } = await supabase
      .from('shared_topics')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', group.id);

    group.member_count = memberCount || 0;
    group.topic_count = topicCount || 0;
  }

  return groups;
}

export async function createGroup(data: {
  name: string;
  description?: string;
  image_url?: string;
  userEmail: string;
  userName?: string;
  avatarUrl?: string;
}): Promise<Group> {
  const profileId = await ensureProfileExists(data.userEmail, data.userName, data.avatarUrl);

  // Generate invite code
  const inviteCode = Math.random().toString(36).substring(2, 10);

  const { data: group, error } = await supabase
    .from('groups')
    .insert({
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      invite_code: inviteCode,
      created_by: profileId,
    })
    .select()
    .single();

  if (error) throw error;

  // Add creator as owner
  await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: profileId,
    role: 'owner',
  });

  // Log activity
  await logGroupActivity(group.id, profileId, 'created_group', 'group', group.id, {
    group_name: group.name,
  });

  return {
    ...group,
    member_count: 1,
    topic_count: 0,
  };
}

export async function joinGroup(inviteCode: string, userEmail: string, userName?: string, avatarUrl?: string): Promise<void> {
  const profileId = await ensureProfileExists(userEmail, userName, avatarUrl);

  // Get group by invite code
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (groupError || !group) throw new Error('Invalid invite code');

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', group.id)
    .eq('user_id', profileId)
    .single();

  if (existingMember) throw new Error('Already a member of this group');

  // Join group
  const { error } = await supabase.from('group_members').insert({
    group_id: group.id,
    user_id: profileId,
    role: 'member',
  });

  if (error) throw error;

  // Log activity
  await logGroupActivity(group.id, profileId, 'joined_group', 'member', profileId, {
    group_name: group.name,
  });
}

export async function getGroupByInviteCode(inviteCode: string): Promise<Group | null> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error) return null;

  // Get member count
  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', data.id);

  return {
    ...data,
    member_count: count || 0,
    topic_count: 0,
  };
}

export async function getGroupDetails(groupId: string): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error) throw error;

  // Get member count and topic count
  const { count: memberCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);

  const { count: topicCount } = await supabase
    .from('shared_topics')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);

  return {
    ...data,
    member_count: memberCount || 0,
    topic_count: topicCount || 0,
  };
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      *,
      profiles (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) throw error;

  return data?.map((member: any) => ({
    ...member,
    user: member.profiles,
  })) || [];
}

export async function getGroupTopics(groupId: string): Promise<SharedTopic[]> {
  const { data, error } = await supabase
    .from('shared_topics')
    .select(`
      *,
      created_by_user:profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data?.map((topic: any) => ({
    ...topic,
    created_by_user: topic.created_by_user,
  })) || [];
}

export async function createSharedTopic(data: {
  group_id: string;
  title: string;
  content?: string;
  category?: string;
  parent_id?: string;
}): Promise<SharedTopic> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: topic, error } = await supabase
    .from('shared_topics')
    .insert({
      group_id: data.group_id,
      title: data.title,
      content: data.content,
      category: data.category,
      parent_id: data.parent_id,
      created_by: user.id,
    })
    .select(`
      *,
      created_by_user:profiles (
        id,
        full_name,
        email
      )
    `)
    .single();

  if (error) throw error;

  // Log activity
  await logGroupActivity(data.group_id, user.id, 'created_topic', 'topic', topic.id, {
    topic_title: data.title,
    category: data.category,
  });

  return {
    ...topic,
    created_by_user: topic.created_by_user,
  };
}

export async function updateSharedTopic(
  topicId: string,
  data: { title?: string; content?: string; category?: string }
): Promise<SharedTopic> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: topic, error } = await supabase
    .from('shared_topics')
    .update(data)
    .eq('id', topicId)
    .select(`
      *,
      created_by_user:profiles (
        id,
        full_name,
        email
      )
    `)
    .single();

  if (error) throw error;

  // Log activity
  await logGroupActivity(topic.group_id, user.id, 'updated_topic', 'topic', topicId, {
    topic_title: topic.title,
  });

  return {
    ...topic,
    created_by_user: topic.created_by_user,
  };
}

export async function deleteSharedTopic(topicId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get topic details before deletion
  const { data: topic } = await supabase
    .from('shared_topics')
    .select('group_id, title')
    .eq('id', topicId)
    .single();

  const { error } = await supabase
    .from('shared_topics')
    .delete()
    .eq('id', topicId);

  if (error) throw error;

  // Log activity
  if (topic) {
    await logGroupActivity(topic.group_id, user.id, 'deleted_topic', 'topic', topicId, {
      topic_title: topic.title,
    });
  }
}

export async function getGroupActivity(groupId: string, limit = 20): Promise<GroupActivity[]> {
  const { data, error } = await supabase
    .from('group_activity')
    .select(`
      *,
      user:profiles (
        id,
        full_name,
        email
      )
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data?.map((activity: any) => ({
    ...activity,
    user: activity.user,
  })) || [];
}

export async function logGroupActivity(
  groupId: string,
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: any
): Promise<void> {
  await supabase.from('group_activity').insert({
    group_id: groupId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}

export async function leaveGroup(groupId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) throw error;

  // Log activity
  await logGroupActivity(groupId, user.id, 'left_group', 'member', user.id);
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) throw error;

  // Log activity
  await logGroupActivity(groupId, user.id, 'removed_member', 'member', userId);
}

export async function deleteGroup(groupId: string, userEmail: string): Promise<void> {
  // Get user profile to check ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (!profile) throw new Error('User profile not found');

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .eq('created_by', profile.id);

  if (error) throw error;
}
