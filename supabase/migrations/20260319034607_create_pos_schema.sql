/*
  # Sistema POS - Esquema de Base de Datos

  1. Nuevas Tablas
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, nombre del producto)
      - `sku` (text, código SKU único)
      - `price` (decimal, precio unitario)
      - `stock` (integer, cantidad en inventario)
      - `image_url` (text, URL de la imagen)
      - `category` (text, categoría del producto)
      - `created_at` (timestamp)
      
    - `cash_registers`
      - `id` (uuid, primary key)
      - `name` (text, nombre de la caja)
      - `location` (text, ubicación)
      - `is_active` (boolean, estado activo)
      - `created_at` (timestamp)
      
    - `shifts`
      - `id` (uuid, primary key)
      - `cashier_id` (uuid, foreign key a auth.users)
      - `cash_register_id` (uuid, foreign key a cash_registers)
      - `start_time` (timestamp, hora de inicio)
      - `end_time` (timestamp, hora de cierre)
      - `initial_cash` (decimal, efectivo inicial)
      - `final_cash` (decimal, efectivo final)
      - `total_sales` (decimal, total de ventas)
      - `cash_sales` (decimal, ventas en efectivo)
      - `card_sales` (decimal, ventas con tarjeta)
      - `discrepancy` (decimal, diferencia en caja)
      - `notes` (text, observaciones)
      - `status` (text, estado: open/closed)
      - `created_at` (timestamp)
      
    - `sales`
      - `id` (uuid, primary key)
      - `shift_id` (uuid, foreign key a shifts)
      - `cashier_id` (uuid, foreign key a auth.users)
      - `cash_register_id` (uuid, foreign key a cash_registers)
      - `sale_number` (text, número de venta)
      - `subtotal` (decimal, subtotal)
      - `discount_percent` (decimal, porcentaje de descuento)
      - `discount_amount` (decimal, monto de descuento)
      - `tax_percent` (decimal, porcentaje de IVA)
      - `tax_amount` (decimal, monto de IVA)
      - `total` (decimal, total a pagar)
      - `payment_method` (text, método de pago)
      - `status` (text, estado: pending/completed/cancelled)
      - `is_synced` (boolean, sincronizado con servidor)
      - `created_at` (timestamp)
      
    - `sale_items`
      - `id` (uuid, primary key)
      - `sale_id` (uuid, foreign key a sales)
      - `product_id` (uuid, foreign key a products)
      - `quantity` (integer, cantidad)
      - `unit_price` (decimal, precio unitario)
      - `total_price` (decimal, precio total)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados según su rol
*/

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de cajas registradoras
CREATE TABLE IF NOT EXISTS cash_registers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de turnos
CREATE TABLE IF NOT EXISTS shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cashier_id uuid REFERENCES auth.users(id) NOT NULL,
  cash_register_id uuid REFERENCES cash_registers(id) NOT NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  initial_cash decimal(10,2) DEFAULT 0,
  final_cash decimal(10,2),
  total_sales decimal(10,2) DEFAULT 0,
  cash_sales decimal(10,2) DEFAULT 0,
  card_sales decimal(10,2) DEFAULT 0,
  discrepancy decimal(10,2) DEFAULT 0,
  notes text,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id uuid REFERENCES shifts(id),
  cashier_id uuid REFERENCES auth.users(id) NOT NULL,
  cash_register_id uuid REFERENCES cash_registers(id) NOT NULL,
  sale_number text NOT NULL,
  subtotal decimal(10,2) DEFAULT 0,
  discount_percent decimal(5,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  tax_percent decimal(5,2) DEFAULT 13,
  tax_amount decimal(10,2) DEFAULT 0,
  total decimal(10,2) DEFAULT 0,
  payment_method text DEFAULT 'cash',
  status text DEFAULT 'pending',
  is_synced boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de items de venta
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas para productos
CREATE POLICY "Usuarios autenticados pueden ver productos"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar productos"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar productos"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para cajas registradoras
CREATE POLICY "Usuarios autenticados pueden ver cajas"
  ON cash_registers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios autenticados pueden crear cajas"
  ON cash_registers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar cajas"
  ON cash_registers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para turnos
CREATE POLICY "Cajeros pueden ver sus turnos"
  ON shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Cajeros pueden crear turnos"
  ON shifts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = cashier_id);

CREATE POLICY "Cajeros pueden actualizar sus turnos"
  ON shifts FOR UPDATE
  TO authenticated
  USING (auth.uid() = cashier_id)
  WITH CHECK (auth.uid() = cashier_id);

-- Políticas para ventas
CREATE POLICY "Usuarios pueden ver ventas"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Cajeros pueden crear ventas"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = cashier_id);

CREATE POLICY "Cajeros pueden actualizar sus ventas"
  ON sales FOR UPDATE
  TO authenticated
  USING (auth.uid() = cashier_id)
  WITH CHECK (auth.uid() = cashier_id);

-- Políticas para items de venta
CREATE POLICY "Usuarios pueden ver items de venta"
  ON sale_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuarios pueden crear items de venta"
  ON sale_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insertar datos de ejemplo para productos
INSERT INTO products (name, sku, price, stock, category) VALUES
  ('Combo Salad', 'SKU-001', 12.50, 45, 'Combos'),
  ('Punato Base', 'SKU-002', 8.00, 12, 'Burgers'),
  ('Camina Tira', 'SKU-003', 7.00, 15, 'Entrees'),
  ('Donado Donota', 'SKU-004', 12.00, 15, 'Pasta'),
  ('Camina Mes', 'SKU-005', 7.00, 24, 'Breakfast'),
  ('Campla de Princa', 'SKU-006', 12.00, 45, 'Chicken'),
  ('Pimslo de Cato', 'SKU-007', 8.00, 15, 'Sides'),
  ('Rave Cake', 'SKU-008', 6.00, 12, 'Desserts'),
  ('Marick', 'SKU-009', 7.00, 15, 'Desserts'),
  ('Callo de Torratto', 'SKU-010', 7.00, 10, 'Breakfast'),
  ('Halife Sit Meelo', 'SKU-011', 8.00, 15, 'Sides'),
  ('Cancha Chacofi', 'SKU-012', 2.00, 15, 'Appetizers'),
  ('Satado en Leilo', 'SKU-013', 4.00, 5, 'Sandwiches'),
  ('Venta en Tratto', 'SKU-014', 2.00, 0, 'Beverages'),
  ('Balon de Parta', 'SKU-015', 1.00, 5, 'Desserts')
ON CONFLICT (sku) DO NOTHING;

-- Insertar una caja registradora de ejemplo
INSERT INTO cash_registers (name, location, is_active) VALUES
  ('Caja Principal', 'RF-004', true)
ON CONFLICT DO NOTHING;
