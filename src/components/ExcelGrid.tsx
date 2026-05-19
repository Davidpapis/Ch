/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  FolderPlus, 
  Sparkles, 
  Eye, 
  DollarSign, 
  HelpCircle,
  Copy,
  Edit,
  Check,
  Percent
} from 'lucide-react';
import { BudgetSection, BudgetItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ExcelGridProps {
  sections: BudgetSection[];
  onUpdateSections: (sections: BudgetSection[]) => void;
  onOpenImporterForSection: (sectionId: string) => void;
}

export function ExcelGrid({ sections, onUpdateSections, onOpenImporterForSection }: ExcelGridProps) {
  // Store expanded state for sections by ID
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    // Expand first two sections by default
    const initial: Record<string, boolean> = {};
    sections.forEach((sec, idx) => {
      initial[sec.id] = idx < 2;
    });
    return initial;
  });

  // Track which section header is being edited
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [tempSectionName, setTempSectionName] = useState('');

  // Save changes to sections name
  const saveSectionName = (sectionId: string) => {
    if (!tempSectionName.trim()) {
      setEditingSectionId(null);
      return;
    }
    const updated = sections.map(s => 
      s.id === sectionId ? { ...s, name: tempSectionName.trim() } : s
    );
    onUpdateSections(updated);
    setEditingSectionId(null);
  };

  // Add row/item to a section
  const addItemToSection = (sectionId: string) => {
    const defaultItem: BudgetItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      description: '',
      cost: 0,
      price: 0,
      quantity: 1
    };

    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: [...sec.items, defaultItem]
        };
      }
      return sec;
    });
    onUpdateSections(updated);

    // Auto-expand if collapsed
    setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
  };

  // Delete row/item from a section
  const deleteItemFromSection = (sectionId: string, itemId: string) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: sec.items.filter(item => item.id !== itemId)
        };
      }
      return sec;
    });
    onUpdateSections(updated);
  };

  // Update item field (inline update)
  const updateItemField = <K extends keyof BudgetItem>(
    sectionId: string,
    itemId: string,
    field: K,
    value: BudgetItem[K]
  ) => {
    const updated = sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: sec.items.map(item => {
            if (item.id === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          })
        };
      }
      return sec;
    });
    onUpdateSections(updated);
  };

  // Toggle expand/collapse
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Add a brand-new section
  const addNewSection = () => {
    const sectionNames = ['Otros', 'Cocina', 'Baño', 'Salón', 'Comedor', 'Dormitorio Principal', 'Dormitorio Infantil', 'Pasillo', 'Terraza', 'Jardín', 'Instalaciones', 'Demoliciones'];
    // Find a unique name
    let chosenName = 'Nueva Sección';
    for (const name of sectionNames) {
      if (!sections.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        chosenName = name;
        break;
      }
    }
    if (sections.some(s => s.name === chosenName)) {
      chosenName = `${chosenName} ${sections.length + 1}`;
    }

    const newSec: BudgetSection = {
      id: `sec-${Date.now()}`,
      name: chosenName,
      items: [
        {
          id: `item-${Date.now()}-1`,
          description: 'Artículo de muestra',
          cost: 0,
          price: 0,
          quantity: 1
        }
      ]
    };

    onUpdateSections([...sections, newSec]);
    setExpandedSections(prev => ({ ...prev, [newSec.id]: true }));
    setEditingSectionId(newSec.id);
    setTempSectionName(chosenName);
  };

  // Delete entire section
  const deleteSection = (sectionId: string) => {
    if (sections.length <= 1) {
      alert('Debes mantener al menos una sección en tu presupuesto.');
      return;
    }
    if (confirm('¿Estás seguro de que deseas eliminar esta sección entera con todos sus artículos?')) {
      onUpdateSections(sections.filter(s => s.id !== sectionId));
    }
  };

  // Double Click / Click edit handler for section titles
  const startEditingSection = (sec: BudgetSection) => {
    setEditingSectionId(sec.id);
    setTempSectionName(sec.name);
  };

  // Helper formatting values in Euro
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  // Section Subtotals Helper
  const getSectionSubtotals = (sec: BudgetSection) => {
    let costTotal = 0;
    let priceTotal = 0;
    sec.items.forEach(it => {
      costTotal += (it.cost || 0) * (it.quantity || 0);
      priceTotal += (it.price || 0) * (it.quantity || 0);
    });
    const profitTotal = priceTotal - costTotal;
    const profitPercent = priceTotal > 0 ? (profitTotal / priceTotal) * 100 : 0;
    return { costTotal, priceTotal, profitTotal, profitPercent };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <span>Hoja de Trabajo y Planificación (Excel)</span>
            <span className="text-xs font-normal py-0.5 px-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-md">
              Autoguardado Local
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Modifica las celdas directamente. Los cálculos se actualizan de manera instantánea.
          </p>
        </div>

        <button
          onClick={addNewSection}
          className="inline-flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-97 shadow-xs tracking-tight transition cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          Añadir Sección (Ambiente)
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((sec, secIdx) => {
          const isExpanded = !!expandedSections[sec.id];
          const { costTotal, priceTotal, profitTotal, profitPercent } = getSectionSubtotals(sec);
          const isEditing = editingSectionId === sec.id;

          return (
            <div 
              key={sec.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:shadow-sm"
            >
              {/* Section Accordion Header */}
              <div 
                className={`py-4 px-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-slate-50/70 border-b border-slate-100 hover:bg-slate-50 transition`}
                onClick={() => toggleSection(sec.id)}
              >
                {/* Lefthand: Name & Edit Actions */}
                <div className="flex items-center gap-3 min-w-[240px]" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => toggleSection(sec.id)}
                    className="p-1 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  <div className="relative flex items-center gap-2 group">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-300 shadow-inner">
                        <input
                          type="text"
                          value={tempSectionName}
                          onChange={e => setTempSectionName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveSectionName(sec.id);
                            if (e.key === 'Escape') setEditingSectionId(null);
                          }}
                          className="font-display font-bold text-slate-800 text-base md:text-lg focus:outline-none px-1 py-0.5 bg-transparent min-w-[120px] max-w-[200px]"
                          autoFocus
                        />
                        <button
                          onClick={() => saveSectionName(sec.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                          title="Guardar nombre"
                        >
                          <Check className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span 
                          onDoubleClick={() => startEditingSection(sec)}
                          className="font-display font-bold text-slate-800 text-lg hover:text-emerald-600 cursor-pointer transition select-all"
                          title="Doble clic para renombrar"
                        >
                          {sec.name}
                        </span>
                        <button
                          onClick={() => startEditingSection(sec)}
                          className="p-1 rounded text-slate-400 hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition duration-150"
                          title="Renombrar sección"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    ({sec.items.length} {sec.items.length === 1 ? 'artículo' : 'artículos'})
                  </span>
                </div>

                {/* Quantitative overview on header */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 font-normal">PVP (Venta):</span>
                    <span className="text-slate-900 font-semibold">{formatEuro(priceTotal)}</span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-4 md:border-l md:pl-4">
                    <span className="text-xs text-slate-400 font-normal">Inversión (Coste):</span>
                    <span className="text-slate-600">{formatEuro(costTotal)}</span>
                  </div>
                  <div className="flex items-center gap-1 border-l border-slate-200 pl-4 md:border-l md:pl-4">
                    <span className="text-xs text-slate-400 font-normal">Beneficio:</span>
                    <span className={`font-semibold ${profitTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatEuro(profitTotal)} ({profitPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Actions per Section */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenImporterForSection(sec.id)}
                    className="inline-flex items-center gap-1 text-xs py-1 px-2.5 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 transition"
                    title="Importar pegando desde Excel para este ambiente"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Pegar Excel
                  </button>
                  <button
                    onClick={() => addItemToSection(sec.id)}
                    className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition"
                    title="Añadir artículo manual"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSection(sec.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Eliminar esta sección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Spreadsheat Cells Loop */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                        <thead>
                          <tr className="bg-slate-100/30 text-slate-400 text-xs font-semibold tracking-wider uppercase border-b border-slate-200 font-mono">
                            <th className="py-2 px-3 w-[45px] text-center">Nº</th>
                            <th className="py-2 px-3 w-[40%] text-left">Descripción del Artículo / Material</th>
                            <th className="py-2 px-3 w-[100px] text-right">Cant.</th>
                            <th className="py-2 px-3 w-[125px] text-right">Inv. Unit (Coste)</th>
                            <th className="py-2 px-3 w-[130px] text-right bg-slate-50/50">Inv. Total</th>
                            <th className="py-2 px-3 w-[125px] text-right">PVP Unit (Venta)</th>
                            <th className="py-2 px-3 w-[130px] text-right bg-emerald-50/20">PVP Total</th>
                            <th className="py-2 px-3 w-[110px] text-right">Beneficio</th>
                            <th className="py-2 px-2 w-[45px] text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sec.items.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-8 text-center text-slate-400 text-sm">
                                No hay artículos en esta sección. Haz clic en{' '}
                                <button 
                                  onClick={() => addItemToSection(sec.id)}
                                  className="text-emerald-600 hover:underline font-medium cursor-pointer"
                                >
                                  Añadir artículo
                                </button>{' '}
                                o pega datos desde Excel.
                              </td>
                            </tr>
                          ) : (
                            sec.items.map((item, index) => {
                              const itemInvestmentCost = (item.cost || 0) * (item.quantity ?? 1);
                              const itemRevenue = (item.price || 0) * (item.quantity ?? 1);
                              const itemProfit = itemRevenue - itemInvestmentCost;
                              const itemProfitMargin = item.price > 0 ? ((item.price - item.cost) / item.price) * 100 : 0;

                              return (
                                <tr 
                                  key={item.id} 
                                  className="group hover:bg-slate-50/70 transition-colors"
                                >
                                  {/* Row # */}
                                  <td className="py-2 px-1 text-center font-mono text-xs text-slate-400 select-none">
                                    {index + 1}
                                  </td>

                                  {/* Description (Text Area/Input) */}
                                  <td className="py-2 px-2 text-sm">
                                    <input
                                      type="text"
                                      placeholder="P. ej., Grifo monomando cromo, Sofá, Pintura blanca..."
                                      value={item.description}
                                      onChange={e => updateItemField(sec.id, item.id, 'description', e.target.value)}
                                      className="w-full bg-transparent border border-transparent focus:border-emerald-500 hover:border-slate-200 focus:bg-white px-2 py-1 rounded text-slate-800 transition duration-100 font-medium placeholder:text-slate-300 placeholder:font-normal focus:outline-none"
                                    />
                                  </td>

                                  {/* Quantity */}
                                  <td className="py-2 px-2 text-sm text-right">
                                    <input
                                      type="number"
                                      min="0"
                                      step="any"
                                      value={item.quantity === 0 ? '' : item.quantity}
                                      onChange={e => {
                                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                        updateItemField(sec.id, item.id, 'quantity', isNaN(val) ? 0 : val);
                                      }}
                                      className="w-full text-right bg-transparent border border-transparent focus:border-emerald-500 hover:border-slate-200 focus:bg-white px-2 py-1 rounded font-mono font-medium focus:outline-none"
                                    />
                                  </td>

                                  {/* Investment cost unit */}
                                  <td className="py-2 px-2 text-sm text-right">
                                    <div className="relative flex items-center justify-end">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.cost === 0 ? '' : item.cost}
                                        onChange={e => {
                                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                          updateItemField(sec.id, item.id, 'cost', isNaN(val) ? 0 : val);
                                        }}
                                        className="w-full text-right bg-transparent border border-transparent focus:border-emerald-500 hover:border-slate-200 focus:bg-white pl-2 pr-6 py-1 rounded font-mono font-medium focus:outline-none"
                                      />
                                      <span className="absolute right-2 text-slate-400 pointer-events-none text-xs font-mono">€</span>
                                    </div>
                                  </td>

                                  {/* Total investment (Calculated read-only) */}
                                  <td className="py-2 px-3 text-sm text-right font-mono text-slate-600 bg-slate-50/40 font-medium whitespace-nowrap">
                                    {formatEuro(itemInvestmentCost)}
                                  </td>

                                  {/* Sale price unit */}
                                  <td className="py-2 px-2 text-sm text-right">
                                    <div className="relative flex items-center justify-end">
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.price === 0 ? '' : item.price}
                                        onChange={e => {
                                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                          updateItemField(sec.id, item.id, 'price', isNaN(val) ? 0 : val);
                                        }}
                                        className="w-full text-right bg-transparent border border-transparent focus:border-emerald-500 hover:border-slate-200 focus:bg-white pl-2 pr-6 py-1 rounded font-mono border-emerald-500/20 text-slate-900 font-semibold focus:outline-none"
                                      />
                                      <span className="absolute right-2 text-slate-400 pointer-events-none text-xs font-mono">€</span>
                                    </div>
                                  </td>

                                  {/* Total sale price (Calculated read-only) */}
                                  <td className="py-2 px-3 text-sm text-right font-mono text-slate-950 bg-emerald-50/10 font-bold whitespace-nowrap">
                                    {formatEuro(itemRevenue)}
                                  </td>

                                  {/* Profit column (Calculated read-only) */}
                                  <td className="py-2 px-3 text-sm text-right font-mono whitespace-nowrap">
                                    <div className={`font-semibold ${itemProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                                      {formatEuro(itemProfit)}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {itemProfitMargin >= 0 ? `+${itemProfitMargin.toFixed(0)}% mrg` : `${itemProfitMargin.toFixed(0)}%`}
                                    </div>
                                  </td>

                                  {/* Remove row */}
                                  <td className="py-2 px-2 text-center">
                                    <button
                                      onClick={() => deleteItemFromSection(sec.id, item.id)}
                                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md opacity-0 group-hover:opacity-100 transition duration-150"
                                      title="Eliminar fila"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Section foot controls */}
                    <div className="p-3 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addItemToSection(sec.id)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Añadir Artículo
                        </button>
                        <button
                          onClick={() => onOpenImporterForSection(sec.id)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-transparent bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-semibold transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Importar de Excel
                        </button>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 select-none">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Consejo: Usa la tecla <b>Tab</b> para saltar rápido de celda a celda. Coste 0 indica que no requiere inversión.</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
