/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  AlertCircle, 
  Check, 
  Clock, 
  Truck, 
  ShoppingBag,
  ArrowLeft,
  PieChart,
  BarChart3
} from 'lucide-react';
import { BudgetSection, BudgetMetadata, BudgetItem } from '../types';

interface DashboardPanelProps {
  sections: BudgetSection[];
  metadata: BudgetMetadata;
  onUpdateSections: (sections: BudgetSection[]) => void;
  onClose: () => void;
}

export function DashboardPanel({ sections, metadata, onUpdateSections, onClose }: DashboardPanelProps) {
  const [filterAvailability, setFilterAvailability] = useState<'todos' | 'pedido' | 'retrasado'>('todos');

  // Helpers
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  // Calculations
  const getTotals = () => {
    let totalCost = 0;
    let totalPVP = 0;
    let pendingCount = 0;
    const pendingItemsList: { sectionId: string; sectionName: string; item: BudgetItem }[] = [];

    sections.forEach(sec => {
      sec.items.forEach(it => {
        const qty = it.quantity || 0;
        totalCost += (it.cost || 0) * qty;
        totalPVP += (it.price || 0) * qty;
        
        if (it.availability === 'pedido' || it.availability === 'retrasado') {
          pendingCount += qty;
          pendingItemsList.push({
            sectionId: sec.id,
            sectionName: sec.name,
            item: it
          });
        }
      });
    });

    const totalProfit = totalPVP - totalCost;
    const profitMargin = totalPVP > 0 ? (totalProfit / totalPVP) * 100 : 0;

    // VAT Calculations (prices already include IVA, so we extract it)
    const vatRate = metadata.vatRate !== undefined ? metadata.vatRate : 21;
    const vatFactor = 1 + vatRate / 100;
    const totalPVPSinIva = totalPVP / vatFactor;
    const totalCostSinIva = totalCost / vatFactor;
    const vatRepercutido = totalPVP - totalPVPSinIva; // client pays
    const vatSoportado = totalCost - totalCostSinIva; // decorator pays to distributors
    const vatNeto = vatRepercutido - vatSoportado;       // net to settle with Hacienda

    return {
      totalCost,
      totalPVP,
      totalProfit,
      profitMargin,
      pendingCount,
      pendingItemsList,
      vatRepercutido,
      vatSoportado,
      vatNeto
    };
  };

  const {
    totalCost,
    totalPVP,
    totalProfit,
    profitMargin,
    pendingCount,
    pendingItemsList,
    vatRepercutido,
    vatSoportado,
    vatNeto
  } = getTotals();

  // Quick action to change item status directly from dashboard!
  const handleUpdateItemStatus = (sectionId: string, itemId: string, status: BudgetItem['availability']) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: sec.items.map(it => {
            if (it.id === itemId) {
              return { ...it, availability: status };
            }
            return it;
          })
        };
      }
      return sec;
    });
    onUpdateSections(updated);
  };

  // Filtered pending items
  const filteredPendingItems = pendingItemsList.filter(entry => {
    if (filterAvailability === 'todos') return true;
    return entry.item.availability === filterAvailability;
  });

  // Calculate Section Subtotals for Charts
  const sectionSubtotals = sections.map(sec => {
    let cost = 0;
    let pvp = 0;
    sec.items.forEach(it => {
      cost += (it.cost || 0) * (it.quantity || 0);
      pvp += (it.price || 0) * (it.quantity || 0);
    });
    const profit = pvp - cost;
    const margin = pvp > 0 ? (profit / pvp) * 100 : 0;
    return {
      id: sec.id,
      name: sec.name,
      cost,
      pvp,
      profit,
      margin
    };
  }).filter(sec => sec.pvp > 0);

  // Availability Status distribution
  const getAvailabilityStats = () => {
    let disponible = 0;
    let pedido = 0;
    let retrasado = 0;
    let totalItems = 0;

    sections.forEach(sec => {
      sec.items.forEach(it => {
        totalItems += it.quantity;
        if (it.availability === 'disponible') disponible += it.quantity;
        else if (it.availability === 'pedido') pedido += it.quantity;
        else if (it.availability === 'retrasado') retrasado += it.quantity;
      });
    });

    return { disponible, pedido, retrasado, totalItems };
  };

  const stats = getAvailabilityStats();

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation and Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-olive hover:text-brand-terracotta hover:bg-brand-sand py-1.5 px-3 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Editor de Presupuestos
          </button>
          
          <h2 className="text-2xl font-bold font-serif text-brand-navy flex items-center gap-2 mt-1">
            <BarChart3 className="w-6 h-6 text-brand-terracotta" />
            Cuadro de Mando del Decorador
          </h2>
          <p className="text-sm text-slate-500">
            Análisis financiero completo y estado logístico del proyecto <b>{metadata.projectName}</b>.
          </p>
        </div>

        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-brand-olive hover:bg-brand-olive-dark active:scale-97 shadow-md transition cursor-pointer"
        >
          Editar Hojas de Costes
        </button>
      </div>

      {/* RENDER STUNNING MEDITERRANEAN CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Expected profit card */}
        <div className="bg-white rounded-2xl border border-brand-sand-dark p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Beneficio Previsto</span>
              <h3 className="text-2xl font-extrabold text-brand-olive-dark font-display">
                {formatEuro(totalProfit)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-brand-sand text-brand-olive-light">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Margen de Ganancia:</span>
            <span className="font-bold text-brand-olive bg-brand-sand py-0.5 px-2 rounded-md">
              {profitMargin.toFixed(1)}%
            </span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-brand-olive/3 rounded-full translate-x-8 translate-y-8 -z-1"></div>
        </div>

        {/* Investment and Revenue summary */}
        <div className="bg-white rounded-2xl border border-brand-sand-dark p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Venta vs Coste</span>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-brand-navy">
                  Venta: {formatEuro(totalPVP)}
                </span>
                <span className="text-xs text-slate-500">
                  Coste: {formatEuro(totalCost)}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-brand-sand text-brand-navy-light">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Inversión del Decorador:</span>
            <span className="font-semibold text-slate-700">
              {((totalCost / (totalPVP || 1)) * 100).toFixed(0)}% del total
            </span>
          </div>
        </div>

        {/* VAT Settlement calculation card */}
        <div className="bg-white rounded-2xl border border-brand-sand-dark p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Saldos de IVA a Pagar</span>
              <h3 className="text-2xl font-extrabold text-brand-terracotta font-display">
                {formatEuro(vatNeto)}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-brand-sand text-brand-terracotta">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500 leading-none">
            <div className="flex justify-between">
              <span>IVA Repercutido (Cliente):</span>
              <span className="font-semibold text-slate-700">{formatEuro(vatRepercutido)}</span>
            </div>
            <div className="flex justify-between mt-0.5">
              <span>IVA Soportado (Compras):</span>
              <span className="font-semibold text-slate-600">-{formatEuro(vatSoportado)}</span>
            </div>
          </div>
        </div>

        {/* Pending Deliveries KPI */}
        <div className="bg-white rounded-2xl border border-brand-sand-dark p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">Materiales Pendientes</span>
              <h3 className="text-2xl font-extrabold text-amber-600 font-display">
                {pendingCount} uds.
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${pendingCount > 0 ? 'bg-amber-50 text-amber-600 animate-pulse-slow' : 'bg-brand-sand text-slate-400'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Estado de Compras:</span>
            <span className={`font-semibold ${pendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {pendingCount > 0 ? 'Pedidos en Curso' : 'Todo Recibido/Disponible'}
            </span>
          </div>
        </div>

      </div>

      {/* DOUBLE GRAPH PANEL - COST/PVP ANALYSIS AND LOGISTICS STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Comparative Chart per Ambient Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-brand-sand-dark p-6 shadow-xs">
          <h3 className="font-serif font-bold text-lg text-brand-navy mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-brand-terracotta" />
            Análisis Financiero por Ambiente
          </h3>

          {sectionSubtotals.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-serif">
              Añade artículos con precio y coste en el editor para visualizar los gráficos.
            </div>
          ) : (
            <div className="space-y-6">
              {sectionSubtotals.map(sec => {
                const maxVal = Math.max(...sectionSubtotals.map(s => Math.max(s.pvp, s.cost)));
                const costPercent = (sec.cost / maxVal) * 100;
                const pvpPercent = (sec.pvp / maxVal) * 100;
                
                return (
                  <div key={sec.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-brand-navy font-display text-sm">{sec.name}</span>
                      <span className="text-slate-500">
                        Beneficio: <b className="text-brand-olive-dark">{formatEuro(sec.profit)}</b> (Margen: {sec.margin.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="space-y-1 bg-brand-sand-light p-2.5 rounded-lg border border-slate-100">
                      {/* Cost Bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-mono w-14 text-right">Inversión:</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-400/80 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.max(costPercent, 2)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono w-16 text-right">{formatEuro(sec.cost)}</span>
                      </div>

                      {/* PVP Bar */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-mono w-14 text-right">Venta PVP:</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-terracotta rounded-full transition-all duration-500" 
                            style={{ width: `${Math.max(pvpPercent, 2)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-brand-navy font-mono w-16 text-right font-semibold">{formatEuro(sec.pvp)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Availability breakdown */}
        <div className="bg-white rounded-2xl border border-brand-sand-dark p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-brand-navy mb-5 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-olive" />
              Estado de Suministros
            </h3>

            {stats.totalItems === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm font-serif">
                Sin artículos definidos en el presupuesto.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visual stacked progress bar represent stats */}
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    className="bg-emerald-500 h-full hover:opacity-90 transition" 
                    style={{ width: `${(stats.disponible / stats.totalItems) * 100}%` }}
                    title={`Disponible: ${stats.disponible}`}
                  />
                  <div 
                    className="bg-sky-500 h-full hover:opacity-90 transition" 
                    style={{ width: `${(stats.pedido / stats.totalItems) * 100}%` }}
                    title={`Pedido: ${stats.pedido}`}
                  />
                  <div 
                    className="bg-brand-terracotta h-full hover:opacity-90 transition" 
                    style={{ width: `${(stats.retrasado / stats.totalItems) * 100}%` }}
                    title={`Retrasado: ${stats.retrasado}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-3">
                  <div className="flex items-center gap-2 p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono font-medium">DISPONIBLE</p>
                      <p className="font-bold text-slate-700">{stats.disponible} uds</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-sky-50/50 border border-sky-100 rounded-lg">
                    <span className="w-3 h-3 bg-sky-500 rounded-full shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono">PEDIDO</p>
                      <p className="font-bold text-slate-700">{stats.pedido} uds</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-rose-50/50 border border-rose-100 rounded-lg">
                    <span className="w-3 h-3 bg-brand-terracotta rounded-full shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-mono">RETRASADO</p>
                      <p className="font-bold text-brand-terracotta">{stats.retrasado} uds</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-xs text-slate-400 italic">
            * Haz el seguimiento logístico a la derecha del editor Excel o en la tabla inferior del dashboard.
          </div>
        </div>

      </div>

      {/* PENDING MATERIALS LIST AND LOGISTIC CONTROLS */}
      <div className="bg-white rounded-2xl border border-brand-sand-dark p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-brand-navy flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-terracotta" />
              Seguimiento de Suministros Pedidos / Retrasados
            </h3>
            <p className="text-xs text-slate-500">
              Visualiza y gestiona las compras activas de este proyecto de forma centralizada.
            </p>
          </div>

          {/* Tab filters */}
          <div className="p-1 bg-slate-100 rounded-lg flex gap-1 text-xs font-semibold select-none border border-slate-200">
            <button
              onClick={() => setFilterAvailability('todos')}
              className={`py-1 px-3 rounded-md transition ${filterAvailability === 'todos' ? 'bg-white text-brand-navy shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Todos ({pendingItemsList.length})
            </button>
            <button
              onClick={() => setFilterAvailability('pedido')}
              className={`py-1 px-3 rounded-md transition ${filterAvailability === 'pedido' ? 'bg-sky-500 text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Solo Pedidos ({pendingItemsList.filter(e => e.item.availability === 'pedido').length})
            </button>
            <button
              onClick={() => setFilterAvailability('retrasado')}
              className={`py-1 px-3 rounded-md transition ${filterAvailability === 'retrasado' ? 'bg-brand-terracotta text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Retrasados ({pendingItemsList.filter(e => e.item.availability === 'retrasado').length})
            </button>
          </div>
        </div>

        {filteredPendingItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-serif">
            <Check className="w-10 h-10 text-brand-olive mx-auto mb-3 opacity-60" />
            No hay productos pendientes que coincidan con este filtro. ¡Buen trabajo logístico!
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[350px]">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-brand-sand-light border-b border-brand-sand-dark text-slate-500 font-bold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-2.5 px-3">Ambiente</th>
                  <th className="py-2.5 px-3">Artículo / Producto</th>
                  <th className="py-2.5 px-3">Distribuidor</th>
                  <th className="py-2.5 px-3 text-right">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Coste Total</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-center">Acciones Logísticas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPendingItems.map(entry => {
                  const it = entry.item;
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-semibold text-brand-navy">{entry.sectionName}</td>
                      <td className="py-2 px-3 text-slate-800 font-medium">{it.description}</td>
                      <td className="py-2 px-3">
                        <span className="py-0.5 px-2 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                          {it.distributor || 'Por definir'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-medium">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-600">
                        {formatEuro(it.cost * it.quantity)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wide ${it.availability === 'pedido' ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-rose-50 text-brand-terracotta border border-rose-100'}`}>
                          {it.availability === 'pedido' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {it.availability}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleUpdateItemStatus(entry.sectionId, it.id, 'disponible')}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold py-1 px-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 hover:scale-102 rounded-lg transition"
                            title="Marcar como Disponible / Recibido"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Recibido / Disponible
                          </button>

                          {it.availability === 'pedido' && (
                            <button
                              onClick={() => handleUpdateItemStatus(entry.sectionId, it.id, 'retrasado')}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold py-1 px-2.5 bg-rose-50 text-brand-terracotta border border-rose-100 hover:bg-rose-100 hover:scale-102 rounded-lg transition"
                              title="Marcar como Pedido Retrasado"
                            >
                              <Truck className="w-3.5 h-3.5 text-brand-terracotta" />
                              Retrasado
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
