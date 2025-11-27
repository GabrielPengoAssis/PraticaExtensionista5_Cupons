export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      associado: {
        Row: {
          bai_associado: string
          cel_associado: string
          cep_associado: string
          cid_associado: string
          cpf_associado: number
          dta_associado: string
          email_associado: string
          end_associado: string
          nom_associado: string
          sen_associado: string
          uf_associado: string
          user_id: string | null
        }
        Insert: {
          bai_associado: string
          cel_associado: string
          cep_associado: string
          cid_associado: string
          cpf_associado: number
          dta_associado: string
          email_associado: string
          end_associado: string
          nom_associado: string
          sen_associado: string
          uf_associado: string
          user_id?: string | null
        }
        Update: {
          bai_associado?: string
          cel_associado?: string
          cep_associado?: string
          cid_associado?: string
          cpf_associado?: number
          dta_associado?: string
          email_associado?: string
          end_associado?: string
          nom_associado?: string
          sen_associado?: string
          uf_associado?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categoria: {
        Row: {
          id_categoria: number
          nom_categoria: string
        }
        Insert: {
          id_categoria?: number
          nom_categoria: string
        }
        Update: {
          id_categoria?: number
          nom_categoria?: string
        }
        Relationships: []
      }
      comercio: {
        Row: {
          bai_comercio: string
          cep_comercio: string
          cid_comercio: string
          cnpj_comercio: number
          con_comercio: string
          email_comercio: string
          end_comercio: string
          id_categoria: number
          nom_fantasia_comercio: string
          raz_social_comercio: string
          sen_comercio: string
          uf_comercio: string
          user_id: string | null
        }
        Insert: {
          bai_comercio: string
          cep_comercio: string
          cid_comercio: string
          cnpj_comercio: number
          con_comercio: string
          email_comercio: string
          end_comercio: string
          id_categoria: number
          nom_fantasia_comercio: string
          raz_social_comercio: string
          sen_comercio: string
          uf_comercio: string
          user_id?: string | null
        }
        Update: {
          bai_comercio?: string
          cep_comercio?: string
          cid_comercio?: string
          cnpj_comercio?: number
          con_comercio?: string
          email_comercio?: string
          end_comercio?: string
          id_categoria?: number
          nom_fantasia_comercio?: string
          raz_social_comercio?: string
          sen_comercio?: string
          uf_comercio?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comercio_id_categoria_fkey"
            columns: ["id_categoria"]
            isOneToOne: false
            referencedRelation: "categoria"
            referencedColumns: ["id_categoria"]
          },
        ]
      }
      cupom: {
        Row: {
          cnpj_comercio: number
          dta_emissao_cupom: string
          dta_inicio_cupom: string
          dta_termino_cupom: string
          num_cupom: string
          per_desc_cupom: number
          tit_cupom: string
        }
        Insert: {
          cnpj_comercio: number
          dta_emissao_cupom: string
          dta_inicio_cupom: string
          dta_termino_cupom: string
          num_cupom: string
          per_desc_cupom: number
          tit_cupom: string
        }
        Update: {
          cnpj_comercio?: number
          dta_emissao_cupom?: string
          dta_inicio_cupom?: string
          dta_termino_cupom?: string
          num_cupom?: string
          per_desc_cupom?: number
          tit_cupom?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupom_cnpj_comercio_fkey"
            columns: ["cnpj_comercio"]
            isOneToOne: false
            referencedRelation: "comercio"
            referencedColumns: ["cnpj_comercio"]
          },
        ]
      }
      cupom_associado: {
        Row: {
          cpf_associado: number
          dta_cupom_associado: string
          dta_uso_cupom_associado: string | null
          id_cupom_associado: number
          num_cupom: string
        }
        Insert: {
          cpf_associado: number
          dta_cupom_associado: string
          dta_uso_cupom_associado?: string | null
          id_cupom_associado?: number
          num_cupom: string
        }
        Update: {
          cpf_associado?: number
          dta_cupom_associado?: string
          dta_uso_cupom_associado?: string | null
          id_cupom_associado?: number
          num_cupom?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupom_associado_cpf_associado_fkey"
            columns: ["cpf_associado"]
            isOneToOne: false
            referencedRelation: "associado"
            referencedColumns: ["cpf_associado"]
          },
          {
            foreignKeyName: "cupom_associado_num_cupom_fkey"
            columns: ["num_cupom"]
            isOneToOne: true
            referencedRelation: "cupom"
            referencedColumns: ["num_cupom"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cupom_pertence_ao_comercio: {
        Args: { cupom_cnpj: number; usuario_id: string }
        Returns: boolean
      }
      is_associado: { Args: { usuario_id: string }; Returns: boolean }
      is_comerciante: { Args: { usuario_id: string }; Returns: boolean }
      pode_ver_cupom: {
        Args: { cupom_num: string; usuario_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
