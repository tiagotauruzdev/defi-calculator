export interface Database {
  public: {
    Tables: {
      configurations: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          key: string
          value: string
          description: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          key: string
          value: string
          description?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          key?: string
          value?: string
          description?: string | null
        }
      }
      admins: {
        Row: {
          id: number
          created_at: string
          email: string
          password_hash: string
          last_login: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          email: string
          password_hash: string
          last_login?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          email?: string
          password_hash?: string
          last_login?: string | null
        }
      }
      calculation_history: {
        Row: {
          id: number
          created_at: string
          calculation_type: string
          input_values: Record<string, any>
          result: Record<string, any>
          user_id: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          calculation_type: string
          input_values: Record<string, any>
          result: Record<string, any>
          user_id?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          calculation_type?: string
          input_values?: Record<string, any>
          result?: Record<string, any>
          user_id?: string | null
        }
      }
    }
  }
}
