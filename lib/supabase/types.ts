export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nickname: string
          avatar_url: string | null
          bio: string | null
          interest_tags: string[]
          created_at: string
        }
        Insert: {
          id: string
          email?: string
          nickname: string
          avatar_url?: string | null
          bio?: string | null
          interest_tags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string
          avatar_url?: string | null
          bio?: string | null
          interest_tags?: string[]
          created_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: { id: number; name: string }
        Insert: { id?: number; name: string }
        Update: { id?: number; name?: string }
        Relationships: []
      }
      item_posts: {
        Row: {
          id: number
          author_id: string
          title: string
          description: string
          category: string
          condition: string
          status: 'posting' | 'chat_closed' | 'in_progress' | 'completed'
          chat_count: number
          max_chat: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          author_id: string
          title: string
          description: string
          category: string
          condition: string
          status?: 'posting' | 'chat_closed' | 'in_progress' | 'completed'
          chat_count?: number
          max_chat?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          author_id?: string
          title?: string
          description?: string
          category?: string
          condition?: string
          status?: 'posting' | 'chat_closed' | 'in_progress' | 'completed'
          chat_count?: number
          max_chat?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'item_posts_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      item_post_tags: {
        Row: { post_id: number; tag_id: number; tag_type: 'have' | 'want' }
        Insert: { post_id: number; tag_id: number; tag_type: 'have' | 'want' }
        Update: { post_id?: number; tag_id?: number; tag_type?: 'have' | 'want' }
        Relationships: [
          {
            foreignKeyName: 'item_post_tags_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'item_posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'item_post_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          }
        ]
      }
      post_images: {
        Row: {
          id: number
          post_id: number
          url: string
          display_order: number
        }
        Insert: {
          id?: number
          post_id: number
          url: string
          display_order?: number
        }
        Update: {
          id?: number
          post_id?: number
          url?: string
          display_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'post_images_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'item_posts'
            referencedColumns: ['id']
          }
        ]
      }
      chat_rooms: {
        Row: {
          id: number
          post_id: number
          requester_id: string
          owner_id: string
          status: 'active' | 'agreed' | 'ended'
          created_at: string
        }
        Insert: {
          id?: number
          post_id: number
          requester_id: string
          owner_id: string
          status?: 'active' | 'agreed' | 'ended'
          created_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          requester_id?: string
          owner_id?: string
          status?: 'active' | 'agreed' | 'ended'
        }
        Relationships: [
          {
            foreignKeyName: 'chat_rooms_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'item_posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_rooms_requester_id_fkey'
            columns: ['requester_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_rooms_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      chat_messages: {
        Row: {
          id: number
          room_id: number
          sender_id: string
          content: string
          type: 'text' | 'image' | 'system'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          room_id: number
          sender_id: string
          content: string
          type?: 'text' | 'image' | 'system'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          room_id?: number
          sender_id?: string
          content?: string
          type?: 'text' | 'image' | 'system'
          is_read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'chat_messages_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'chat_rooms'
            referencedColumns: ['id']
          }
        ]
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          post_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          post_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'favorites_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'item_posts'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          type: 'chat' | 'like' | 'trade' | 'system'
          title: string
          message: string
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          type: 'chat' | 'like' | 'trade' | 'system'
          title: string
          message: string
          is_read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          type?: 'chat' | 'like' | 'trade' | 'system'
          title?: string
          message?: string
          is_read?: boolean
          link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reports: {
        Row: {
          id: number
          reporter_id: string
          target_type: 'post' | 'user' | 'chat'
          target_id: string
          reason: string
          detail: string | null
          created_at: string
        }
        Insert: {
          id?: number
          reporter_id: string
          target_type: 'post' | 'user' | 'chat'
          target_id: string
          reason: string
          detail?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          reporter_id?: string
          target_type?: 'post' | 'user' | 'chat'
          target_id?: string
          reason?: string
          detail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey'
            columns: ['reporter_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      create_chat_room: {
        Args: { p_post_id: number; p_requester_id: string }
        Returns: number
      }
      decrement_chat_count: {
        Args: { p_post_id: number }
        Returns: void
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ItemPost = Database['public']['Tables']['item_posts']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type PostImage = Database['public']['Tables']['post_images']['Row']
