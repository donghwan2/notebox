// Generated from the Supabase project schema.
// Regenerate with: supabase gen types typescript --project-id bcksoueakvqymycchvrp

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
      archive_items: {
        Row: {
          category_id: string | null;
          content: string;
          created_at: string;
          description: string;
          id: string;
          is_favorite: boolean;
          tags: string[];
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category_id?: string | null;
          content?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_favorite?: boolean;
          tags?: string[];
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category_id?: string | null;
          content?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_favorite?: boolean;
          tags?: string[];
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'archive_items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      categories: {
        Row: {
          created_at: string;
          icon: string;
          id: string;
          name: string;
          sort_order: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          icon?: string;
          id?: string;
          name: string;
          sort_order?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          icon?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ArchiveItemRow = Database['public']['Tables']['archive_items']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
