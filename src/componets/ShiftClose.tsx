import { useState, useEffect } from 'react';
import { Menu, Minus, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ShiftCloseProps {
  onNavigate: (view: string) => void;
}

export default function ShiftClose({ onNavigate }: ShiftCloseProps) {
  const { user, signOut } = useAuth();
  const [cashSales, setCashSales] = useState(450.25);
  const [cardSales, setCardSales] = useState(210.00);
  const [initialCash, setInitialCash] = useState(100.00);
  const [countedCash, setCountedCash] = useState(0);
  const [voucherAmount, setVoucherAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShiftData();
  }, []);

  const loadShiftData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: sales, error } = await supabase
        .from('sales')
        .select('total, payment_method')
        .eq('cashier_id', user!.id)
        .gte('created_at', today.toISOString())
        .eq('status', 'completed');

      if (error) throw error;

      const cash = sales?.filter(s => s.payment_method === 'cash')
        .reduce((sum, s) => sum + s.total, 0) || 0;
      const card = sales?.filter(s => s.payment_method === 'card')
        .reduce((sum, s) => sum + s.total, 0) || 0;

      setCashSales(cash);
      setCardSales(card);
    } catch (error) {
      console.error('Error loading shift data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = cashSales + cardSales;
  const expectedCash = initialCash + cashSales;
  const totalCounted = countedCash + voucherAmount;
  const discrepancy = totalCounted - expectedCash;

  const handleCloseShift = async () => {
    if (discrepancy > 0 && !notes.trim()) {
      alert('Se requiere una observación justificativa cuando hay diferencia positiva');
      return;
    }

    try {
      const { error } = await supabase
        .from('shifts')
        .insert({
          cashier_id: user!.id,
          cash_register_id: 'RF-003',
          initial_cash: initialCash,
          final_cash: totalCounted,
          total_sales: totalSales,
          cash_sales: cashSales,
          card_sales: cardSales,
          discrepancy: discrepancy,
          notes: notes,
          status: 'closed',
          end_time: new Date().toISOString()
        });

      if (error) throw error;

      alert('Turno cerrado exitosamente');
      onNavigate('pos');
    } catch (error) {
      console.error('Error closing shift:', error);
      alert('Error al cerrar el turno');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('pos')} className="p-2 hover:bg-blue-700 rounded">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold">
            CIERRE DE TURNO - CAJERO: {user?.email?.split('@')[0].toUpperCase()} (RF-003)
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 border-b pb-3">RESUMEN DE VENTAS (SISTEMA)</h2>

            <div className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="font-medium">Ventas Efectivo:</span>
                <span className="text-blue-600 font-bold text-xl">${cashSales.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="font-medium">Ventas Tarjeta:</span>
                <span className="text-blue-600 font-bold text-xl">${cardSales.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-t pt-3">
                <span className="font-medium">Total Ventas:</span>
                <span className="text-blue-600 font-bold text-xl">${totalSales.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 mt-6 border-t pt-3">
                <span className="font-medium">Monto Inicial de Caja:</span>
                <span className="text-blue-600 font-bold text-xl">${initialCash.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 border-t pt-3 mt-6">
                <span className="font-semibold text-lg">TOTAL ESPERADO EN CAJA:</span>
                <span className="text-blue-700 font-bold text-2xl">${expectedCash.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 border-b pb-3">INGRESO FÍSICO (RF-003)</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Efectivo Contado ($)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl">$</span>
                  <input
                    type="number"
                    value={countedCash}
                    onChange={(e) => setCountedCash(Number(e.target.value))}
                    className="flex-1 px-4 py-3 border rounded-lg text-lg"
                    step="0.01"
                  />
                  <button
                    onClick={() => setCountedCash(Math.max(0, countedCash - 10))}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Minus size={20} />
                  </button>
                  <button
                    onClick={() => setCountedCash(countedCash + 10)}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tarjeta Voucher ($)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl">$</span>
                  <input
                    type="number"
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(Number(e.target.value))}
                    className="flex-1 px-4 py-3 border rounded-lg text-lg"
                    step="0.01"
                  />
                  <button
                    onClick={() => setVoucherAmount(Math.max(0, voucherAmount - 10))}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Minus size={20} />
                  </button>
                  <button
                    onClick={() => setVoucherAmount(voucherAmount + 10)}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-900 text-white rounded-lg p-6 mt-6">
                <div className="text-6xl font-bold text-center">
                  ${totalCounted.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 border-b pb-3">AUDITORÍA (RF-003)</h2>

            <div className="mb-6">
              <div className={`text-3xl font-bold mb-2 ${discrepancy >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                DIFERENCIA: {discrepancy >= 0 ? '+' : ''}${discrepancy.toFixed(2)}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                OBSERVACIÓN JUSTIFICATIVA
                {discrepancy > 0 && <span className="text-red-600"> (Si diferencia {'>'} 0)</span>}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observacion..."
                className={`w-full px-4 py-3 border rounded-lg ${discrepancy > 0 ? 'bg-red-50 border-red-300' : ''}`}
                rows={6}
              />
              {discrepancy > 0 && (
                <p className="text-red-600 text-sm mt-1">(OBLIGATORIO)</p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCloseShift}
                disabled={discrepancy > 0 && !notes.trim()}
                className="w-full bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                CONFIRMAR CIERRE Y ENVIAR
              </button>

              <button
                onClick={signOut}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                CERRAR SESIÓN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
