export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          sku: string;
          price: number;
          stock: number;
          image_url: string | null;
          category: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      cash_registers: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cash_registers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['cash_registers']['Insert']>;
      };
      shifts: {
        Row: {
          id: string;
          cashier_id: string;
          cash_register_id: string;
          start_time: string;
          end_time: string | null;
          initial_cash: number;
          final_cash: number | null;
          total_sales: number;
          cash_sales: number;
          card_sales: number;
          discrepancy: number;
          notes: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shifts']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['shifts']['Insert']>;
      };
      sales: {
        Row: {
          id: string;
          shift_id: string | null;
          cashier_id: string;
          cash_register_id: string;
          sale_number: string;
          subtotal: number;
          discount_percent: number;
          discount_amount: number;
          tax_percent: number;
          tax_amount: number;
          total: number;
          payment_method: string;
          status: string;
          is_synced: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sales']['Insert']>;
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sale_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['sale_items']['Insert']>;
      };
    };
  };
}

export type Product = Database['public']['Tables']['products']['Row'];
export type CashRegister = Database['public']['Tables']['cash_registers']['Row'];
export type Shift = Database['public']['Tables']['shifts']['Row'];
export type Sale = Database['public']['Tables']['sales']['Row'];
export type SaleItem = Database['public']['Tables']['sale_items']['Row'];
