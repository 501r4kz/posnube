import { useState, useEffect } from 'react';
import { Search, Menu, RefreshCw, Minus, Plus, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/database';
import type { CartItem } from '../types/pos';

interface POSRegisterProps {
  onNavigate: (view: string) => void;
  isOffline: boolean;
}

export default function POSRegister({ onNavigate, isOffline }: POSRegisterProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cashRegister, setCashRegister] = useState<string>('RF-004');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxPercent = 13;
  const taxAmount = (subtotal - discountAmount) * (taxPercent / 100);
  const total = subtotal - discountAmount + taxAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const saleNumber = `SALE-${Date.now()}`;

      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          cashier_id: user!.id,
          cash_register_id: cashRegister,
          sale_number: saleNumber,
          subtotal,
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          tax_percent: taxPercent,
          tax_amount: taxAmount,
          total,
          payment_method: 'cash',
          status: 'completed',
          is_synced: !isOffline
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      setCart([]);
      setDiscountPercent(0);
      alert('Venta completada exitosamente');
    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar la venta');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {isOffline && (
        <div className="bg-orange-500 text-white px-4 py-2 text-center font-semibold">
          ATENCIÓN: OPERANDO EN MODO OFFLINE
        </div>
      )}

      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="p-2 hover:bg-blue-700 rounded">
              <Menu size={24} />
            </button>
            <div className="absolute left-0 top-full mt-2 bg-white text-gray-800 rounded-lg shadow-xl hidden group-hover:block z-50 min-w-[200px]">
              <button
                onClick={() => onNavigate('admin')}
                className="block w-full text-left px-4 py-3 hover:bg-gray-100"
              >
                Panel Administrativo
              </button>
              <button
                onClick={() => onNavigate('close-shift')}
                className="block w-full text-left px-4 py-3 hover:bg-gray-100"
              >
                Cerrar Turno
              </button>
            </div>
          </div>
          <h1 className="text-xl font-semibold">
            REGISTRO DE VENTA - CAJERO: {user?.email?.split('@')[0].toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded ${isOffline ? 'bg-orange-600' : 'bg-green-600'}`}>
            {isOffline ? 'MODO LOCAL (Desconectado)' : 'EN LÍNEA (Sincronizado)'}
          </div>
          <button onClick={loadProducts} className="p-2 hover:bg-blue-700 rounded">
            <RefreshCw size={20} />
          </button>
          <span className="font-semibold">{cashRegister}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Busca em producto (or SKU o nombre)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <ShoppingCart className="text-gray-400" size={48} />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 truncate">{product.name}</h3>
                  <p className="text-blue-600 font-bold text-lg">${product.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">STOCK: {product.stock}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-96 bg-white shadow-2xl flex flex-col">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-bold">CARRITO ACTUAL</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.map(item => (
              <div key={item.product.id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold">{item.product.name}</span>
                  <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Precio unitario</span>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Minus size={16} className="mx-auto" />
                    </button>
                    <span className="w-12 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Plus size={16} className="mx-auto" />
                    </button>
                    <span className="ml-2">${item.product.price.toFixed(2)}</span>
                    <span className="ml-2 font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-6 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">DESCUENTO (%)</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full px-4 py-2 border rounded-lg"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>DESCUENTO</span>
                <span className="font-semibold">${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (13%)</span>
                <span className="font-semibold">${taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between text-xl font-bold pt-3 border-t">
              <span>TOTAL A PAGAR:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                COBRAR ($)
              </button>
              <button
                onClick={() => setCart([])}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-semibold"
              >
                CANCELAR
              </button>
            </div>

            <button
              onClick={() => onNavigate('close-shift')}
              className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              VENTAS PENDIENTES (0)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
