// lib/api/comments.ts
// Helper untuk membaca & menulis tabel document_comments dan document_notifications di Supabase

import { supabase } from '@/lib/supabase';

export type DocumentComment = {
  id: string;
  document_id: string;
  block_id: string | null;
  selected_text: string | null;
  comment_text: string;
  author_name: string;
  resolved: boolean;
  created_at: string;
};

export type DocumentNotification = {
  id: string;
  document_id: string;
  recipient_id: string;
  sender_name: string;
  message: string;
  read: boolean;
  created_at: string;
};

/**
 * Fetch all comments for a document
 */
export async function fetchComments(docId: string): Promise<DocumentComment[]> {
  const { data, error } = await supabase
    .from('document_comments')
    .select('*')
    .eq('document_id', docId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
  return data || [];
}

/**
 * Add a new comment to a document
 */
export async function addComment(
  docId: string,
  blockId: string | null,
  selectedText: string | null,
  commentText: string,
  authorName: string
): Promise<DocumentComment | null> {
  const { data, error } = await supabase
    .from('document_comments')
    .insert({
      document_id: docId,
      block_id: blockId,
      selected_text: selectedText,
      comment_text: commentText,
      author_name: authorName || 'Guest Co-Editor',
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error.message, 'Details:', error.details, 'Hint:', error.hint, 'Code:', error.code);
    return null;
  }
  return data;
}

/**
 * Resolve a comment (mark as resolved)
 */
export async function resolveComment(commentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('document_comments')
    .update({ resolved: true })
    .eq('id', commentId);

  if (error) {
    console.error('Error resolving comment:', error);
    return false;
  }
  return true;
}

/**
 * Fetch notifications for a user (document owner)
 */
export async function fetchNotifications(userId: string): Promise<DocumentNotification[]> {
  const { data, error } = await supabase
    .from('document_notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data || [];
}

/**
 * Check if a string is a valid UUID
 */
export const isValidUuid = (id?: string | null): boolean => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Create a new notification for a document owner
 */
export async function createNotification(
  docId: string,
  recipientId: string,
  senderName: string,
  message: string
): Promise<any> {
  if (!recipientId || !isValidUuid(recipientId)) {
    // Skip notification insert gracefully for non-UUID guest users
    return { success: false, reason: 'Recipient is not a registered user with valid UUID' };
  }

  const { error } = await supabase
    .from('document_notifications')
    .insert({
      document_id: docId,
      recipient_id: recipientId,
      sender_name: senderName || 'Guest Co-Editor',
      message: message,
    });

  if (error) {
    console.error('Error creating notification:', error.message, 'Details:', error.details, 'Hint:', error.hint, 'Code:', error.code);
    return null;
  }
  return { success: true };
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notifId: string): Promise<boolean> {
  const { error } = await supabase
    .from('document_notifications')
    .update({ read: true })
    .eq('id', notifId);

  if (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
  return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('document_notifications')
    .update({ read: true })
    .eq('recipient_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
  return true;
}
