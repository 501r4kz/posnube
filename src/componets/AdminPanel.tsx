import { useState, useEffect } from 'react';
import { Menu, Search, Cloud, CloudOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types/database';

interface AdminPanelProps {
  onNavigate: (view: string) => void;
}

interface SalesData {
  date: string;
  cash: number;
  card: number;
}

export default function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('total, payment_method, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('status', 'completed');

      if (salesError) throw salesError;

      const total = sales?.reduce((sum, s) => sum + s.total, 0) || 0;
      setTotalSales(total);
      setTotalTransactions(sales?.length || 0);

      const salesByDate: { [key: string]: SalesData } = {};
      sales?.forEach(sale => {
        const date = new Date(sale.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        if (!salesByDate[date]) {
          salesByDate[date] = { date, cash: 0, card: 0 };
        }
        if (sale.payment_method === 'cash') {
          salesByDate[date].cash += sale.total;
        } else {
          salesByDate[date].card += sale.total;
        }
      });

      setSalesData(Object.values(salesByDate));

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('stock', { ascending: true })
        .limit(4);

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxSales = Math.max(...salesData.map(d => d.cash + d.card), 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('pos')} className="p-2 hover:bg-blue-700 rounded">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold">PANEL ADMINISTRATIVO:</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-300" size={20} />
            <input
              type="text"
              placeholder="Busca en producto (or SKU)"
              className="pl-10 pr-4 py-2 rounded-lg text-gray-800 w-80"
            />
          </div>
          <div className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded">
            <Cloud size={20} />
            <span className="font-semibold">CONEXIÓN GLOBAL: ESTABLE</span>
          </div>
          <button
            onClick={signOut}
            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded font-semibold"
          >
            ADMIN
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">REPORTE CONSOLI CONSOLIDADO (GLOBAL)</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">VENTAS TOTALES CONSOLIDADAS (Últimos 30 días)</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-800"></div>
                    <span className="text-sm">Efectivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-400"></div>
                    <span className="text-sm">Tarjeta</span>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-48">
                  {salesData.slice(-30).map((data, i) => {
                    const totalHeight = ((data.cash + data.card) / maxSales) * 100;
                    const cashHeight = (data.cash / (data.cash + data.card)) * totalHeight;
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end items-center">
                        <div className="w-full relative" style={{ height: `${totalHeight}%` }}>
                          <div
                            className="w-full bg-blue-800 absolute bottom-0"
                            style={{ height: `${cashHeight}%` }}
                          ></div>
                          <div
                            className="w-full bg-blue-400 absolute"
                            style={{ bottom: `${cashHeight}%`, height: `${totalHeight - cashHeight}%` }}
                          ></div>
                        </div>
                        <span className="text-xs mt-1 transform -rotate-45 origin-top-left">
                          {data.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-center mt-4 text-gray-600">Método para todas sucursales</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold">INVENTARIO GLOBAL DE PRODUCTOS (RF-002)</h3>
                <Cloud size={20} className="text-blue-600" />
              </div>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm">PRODUCTO</th>
                      <th className="px-4 py-2 text-left text-sm">SKU <Cloud size={14} className="inline" /></th>
                      <th className="px-4 py-2 text-left text-sm">STOCK GLOBAL</th>
                      <th className="px-4 py-2 text-left text-sm">PRECIO PROM.</th>
                      <th className="px-4 py-2 text-left text-sm">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-t">
                        <td className="px-4 py-2 text-sm">Producto {product.name.charAt(0)}:</td>
                        <td className="px-4 py-2 text-sm">{product.sku}</td>
                        <td className={`px-4 py-2 text-sm ${product.stock < 0 ? 'text-red-600' : product.stock < 20 ? 'text-orange-600' : ''}`}>
                          {product.stock}
                        </td>
                        <td className="px-4 py-2 text-sm">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <Cloud size={16} className="text-blue-600" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-blue-50 p-3 rounded">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                  <Cloud size={16} className="text-blue-600" />
                  <span>LEYENDA:</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500"></div>
                    <span>Seguro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500"></div>
                    <span>Amber bajo ({'<'}10)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600"></div>
                    <span>Negativo (VENTA EN NEGATIVO)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">TOTAL VENTAS GLOBALES:</h3>
              <div className="text-4xl font-bold text-blue-600">${totalSales.toFixed(2)}</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">CANTIDAD TRANSACCIONES:</h3>
              <div className="text-4xl font-bold text-blue-600">{totalTransactions.toLocaleString()}</div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-sm font-semibold mb-2">ALERTAS DE STOCK CRÍTICO (TODAS SUCURSALES)</h3>
              <div className="text-sm space-y-1 mt-2">
                {products.filter(p => p.stock < 10).map(p => (
                  <div key={p.id} className="text-red-600">
                    Bolea roja (SKU {p.sku}): Stock {p.stock} en sucursal Central (RF-002)
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Última actualización reporte consolidado: {new Date().toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    </div>
  );
}
