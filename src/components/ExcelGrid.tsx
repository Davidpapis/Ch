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
  Edit, 
  Check, 
  HelpCircle,
  Copy,
  LayoutDashboard,
  Camera,
  X,
  Percent,
  Settings2,
  Euro,
  PlusCircle,
  Sparkles,
  Calculator,
  Building2,
  User,
  Calendar,
  Quote,
  Info,
  Briefcase,
  Eye,
  Truck
} from 'lucide-react';
import { BudgetSection, BudgetItem, Supplier, BudgetMetadata } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ExcelGridProps {
  sections: BudgetSection[];
  onUpdateSections: (sections: BudgetSection[]) => void;
  onOpenImporterForSection: (sectionId: string) => void;
  suppliers?: Supplier[];
  metadata: BudgetMetadata;
  onUpdateMetadata: (metadata: BudgetMetadata) => void;
}

export function ExcelGrid({ 
  sections, 
  onUpdateSections, 
  onOpenImporterForSection, 
  suppliers,
  metadata,
  onUpdateMetadata
}: ExcelGridProps) {
  // Store expanded state for sections by ID
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((sec, idx) => {
      initial[sec.id] = idx < 2;
    });
    return initial;
  });

  // Track image selector popup state
  const [imageSelectorItem, setImageSelectorItem] = useState<{ sectionId: string; itemId: string; currentUrl?: string } | null>(null);

  // Track lightbox image URL preview
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // Track logistics editor details modal state
  const [logisticsModalItem, setLogisticsModalItem] = useState<{
    sectionId: string;
    itemId: string;
    description: string;
    deliveryDate: string;
    trackingNumber: string;
    carrierName: string;
    logisticsNotes: string;
  } | null>(null);

  // Track which section header is being edited
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [tempSectionName, setTempSectionName] = useState('');
  const [showMetadataForm, setShowMetadataForm] = useState(false);

  // Metadata update helpers
  const updateMetadataField = <K extends keyof BudgetMetadata>(field: K, value: BudgetMetadata[K]) => {
    onUpdateMetadata({
      ...metadata,
      [field]: value
    });
  };

  const handleAddCustomAdjustment = () => {
    const newAdj = {
      id: `adj-${Date.now()}-${Math.floor(Math.random() * 1050)}`,
      label: 'Concepto Personalizado',
      amount: 0
    };
    const currentAdjs = metadata.customAdjustments || [];
    updateMetadataField('customAdjustments', [...currentAdjs, newAdj]);
  };

  const handleUpdateCustomAdjustment = (id: string, label: string, amount: number) => {
    const currentAdjs = metadata.customAdjustments || [];
    const updated = currentAdjs.map(adj => 
      adj.id === id ? { ...adj, label, amount } : adj
    );
    updateMetadataField('customAdjustments', updated);
  };

  const handleRemoveCustomAdjustment = (id: string) => {
    const currentAdjs = metadata.customAdjustments || [];
    const updated = currentAdjs.filter(adj => adj.id !== id);
    updateMetadataField('customAdjustments', updated);
  };

  // Real-time calculations for ExcelGrid top panel
  const calculateExcelTotals = () => {
    let subtotalSale = 0;
    let subtotalCost = 0;

    sections.forEach(sec => {
      sec.items.forEach(it => {
        const qty = it.quantity || 0;
        subtotalCost += (it.cost || 0) * qty;
        subtotalSale += (it.price || 0) * qty;
      });
    });

    const vatRate = metadata.vatRate || 21;
    const vatFactor = 1 + vatRate / 100;

    const discountType = metadata.discountType || 'percent';
    const discountValue = metadata.discountValue !== undefined ? metadata.discountValue : (metadata.discountPercent || 0);

    let discountVal = 0; // Contains IVA
    if (discountType === 'percent') {
      discountVal = subtotalSale * (discountValue / 100);
    } else {
      discountVal = discountValue;
    }

    const adminExp = metadata.adminExpenses || 0;
    const adminExpensesType = metadata.adminExpensesType || 'amount';
    let adminExpBase = 0; // Excludes IVA

    if (adminExpensesType === 'percent') {
      adminExpBase = (subtotalSale / vatFactor) * (adminExp / 100);
    } else {
      adminExpBase = adminExp;
    }

    const adminExpWithIva = adminExpBase * vatFactor;
    const customAdjustments = metadata.customAdjustments || [];
    const customAdjustmentsSum = customAdjustments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totalVenta = subtotalSale - discountVal + adminExpWithIva + customAdjustmentsSum;
    const totalInversion = subtotalCost;
    const beneficioReal = totalVenta - totalInversion;
    const beneficioMargin = totalVenta > 0 ? (beneficioReal / totalVenta) * 100 : 0;

    return {
      subtotalSale,
      subtotalCost,
      discountType,
      discountValue,
      discountVal,
      adminExp,
      adminExpensesType,
      adminExpBase,
      adminExpWithIva,
      customAdjustments,
      customAdjustmentsSum,
      totalVenta,
      totalInversion,
      beneficioReal,
      beneficioMargin
    };
  };

  const {
    discountType,
    discountValue,
    discountVal,
    adminExp,
    adminExpensesType,
    adminExpBase,
    adminExpWithIva,
    customAdjustments,
    totalVenta,
    totalInversion,
    beneficioReal,
    beneficioMargin
  } = calculateExcelTotals();

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
      quantity: 1,
      distributor: '',
      availability: 'disponible'
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
    const sectionNames = ['Otros', 'Cocina', 'Baño', 'Salón Principal', 'Comedor', 'Dormitorio Principal', 'Dormitorio Infantil', 'Recibidor', 'Terraza', 'Estudio', 'Instalaciones', 'Demoliciones'];
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
          quantity: 1,
          distributor: '',
          availability: 'disponible'
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
    return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print pb-2 border-b border-brand-sand-dark">
        <div>
          <h2 className="text-xl font-bold text-brand-navy tracking-tight font-display flex items-center gap-2">
            <span>Hoja de Trabajo y Planificación de Costes</span>
            <span className="text-[10px] font-bold py-0.5 px-2 bg-brand-sand text-brand-olive rounded-md border border-brand-sand-dark uppercase tracking-wider font-mono">
              Autoguardado Local
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modifica las celdas directamente. Costes, beneficios e impuestos se recalculan al instante.
          </p>
        </div>
      </div>

      {/* COLLAPSIBLE CLIENT & PROPOSAL METADATA CONFIGURATION PANEL */}
      <div className="bg-[#FAF7F2] border border-brand-sand-dark rounded-2xl p-5 no-print shadow-xs space-y-4">
        <button
          onClick={() => setShowMetadataForm(!showMetadataForm)}
          className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-brand-terracotta" />
            <div>
              <h3 className="font-serif font-bold text-base text-brand-navy">
                Datos del Cliente y Propuesta Editorial
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Edita la información del cliente, las fechas de validez, el IVA, la memoria creativa y las notas de pago.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-brand-sand-dark px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-navy shadow-3xs hover:bg-brand-sand transition">
            <span>{showMetadataForm ? 'Ocultar Datos' : 'Editar Datos'}</span>
            {showMetadataForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMetadataForm && (
          <div className="pt-4 border-t border-brand-sand-dark/60 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Column 1: Studio Emisor */}
            <div className="space-y-4 bg-white p-4 rounded-xl border border-brand-sand-dark/60">
              <h4 className="text-xs font-bold font-mono tracking-wider text-brand-terracotta uppercase border-b border-brand-sand-dark pb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-olive" />
                Estudio Emisor (Decoración)
              </h4>
              
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nombre del Estudio:</label>
                <input
                  type="text"
                  value={metadata.companyName || ''}
                  onChange={e => updateMetadataField('companyName', e.target.value)}
                  className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">CIF / NIF:</label>
                  <input
                    type="text"
                    value={metadata.companyNif || ''}
                    onChange={e => updateMetadataField('companyNif', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Teléfono:</label>
                  <input
                    type="text"
                    value={metadata.companyPhone || ''}
                    onChange={e => updateMetadataField('companyPhone', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dirección Social:</label>
                <input
                  type="text"
                  value={metadata.companyAddress || ''}
                  onChange={e => updateMetadataField('companyAddress', e.target.value)}
                  className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                />
              </div>
            </div>

            {/* Column 2: Datos del Cliente */}
            <div className="space-y-4 bg-white p-4 rounded-xl border border-brand-sand-dark/60">
              <h4 className="text-xs font-bold font-mono tracking-wider text-brand-terracotta uppercase border-b border-brand-sand-dark pb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-olive" />
                Datos del Cliente Receptor
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nombre del Cliente:</label>
                  <input
                    type="text"
                    value={metadata.clientName || ''}
                    onChange={e => updateMetadataField('clientName', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">DNI/NIE/CIF:</label>
                  <input
                    type="text"
                    value={metadata.clientDni || ''}
                    onChange={e => updateMetadataField('clientDni', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-mono font-semibold"
                    placeholder="Ej. 12345678Z"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Teléfono Cliente:</label>
                  <input
                    type="text"
                    value={metadata.clientPhone || ''}
                    onChange={e => updateMetadataField('clientPhone', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email Cliente:</label>
                  <input
                    type="text"
                    value={metadata.clientEmail || ''}
                    onChange={e => updateMetadataField('clientEmail', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Ubicación Obra / Dirección:</label>
                <input
                  type="text"
                  value={metadata.clientAddress || ''}
                  onChange={e => updateMetadataField('clientAddress', e.target.value)}
                  className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                />
              </div>
            </div>

            {/* Column 3: Datos del Documento e Impuestos */}
            <div className="space-y-4 bg-white p-4 rounded-xl border border-brand-sand-dark/60">
              <h4 className="text-xs font-bold font-mono tracking-wider text-brand-terracotta uppercase border-b border-brand-sand-dark pb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-olive" />
                Datos del Documento
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Proyecto / Obra:</label>
                  <input
                    type="text"
                    value={metadata.projectName || ''}
                    onChange={e => updateMetadataField('projectName', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nº Presupuesto:</label>
                  <input
                    type="text"
                    value={metadata.budgetNumber || ''}
                    onChange={e => updateMetadataField('budgetNumber', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Fecha Emisión:</label>
                  <input
                    type="date"
                    value={metadata.budgetDate || ''}
                    onChange={e => updateMetadataField('budgetDate', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Validez hasta:</label>
                  <input
                    type="date"
                    value={metadata.validUntil || ''}
                    onChange={e => updateMetadataField('validUntil', e.target.value)}
                    className="w-full bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-4 border-t border-brand-sand-dark mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-navy select-none">
                  <input
                    type="checkbox"
                    checked={!!metadata.includeVat}
                    onChange={e => updateMetadataField('includeVat', e.target.checked)}
                    className="rounded bg-[#FCFAF8] border-brand-sand-dark text-brand-terracotta focus:ring-brand-terracotta"
                  />
                  Calcular IVA en el total
                </label>

                {metadata.includeVat && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Tasa IVA:</span>
                    <select
                      value={metadata.vatRate}
                      onChange={e => updateMetadataField('vatRate', parseInt(e.target.value))}
                      className="bg-[#FCFAF8] border border-brand-sand-dark rounded-lg px-2 py-1 text-xs font-bold text-brand-navy outline-none focus:border-brand-terracotta"
                    >
                      <option value={21}>21% General</option>
                      <option value={10}>10% Reducido</option>
                      <option value={4}>4% Super</option>
                      <option value={0}>0% Exento</option>
                    </select>
                  </div>
                )}
              </div>


            </div>

            {/* Row 2: Final valuation and Notes */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-brand-sand-dark/60 pt-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-brand-terracotta uppercase tracking-wider flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5" />
                  Valoración Final & Memoria Conceptual del Proyecto (Estilo Editorial)
                </label>
                <textarea
                  rows={3}
                  value={metadata.valoracionFinal || ''}
                  onChange={e => updateMetadataField('valoracionFinal', e.target.value)}
                  placeholder="Escribe la valoración y memoria conceptual del proyecto. Este bloque aparecerá en tipografía serif de alta gama en la cabecera de la propuesta del cliente..."
                  className="w-full bg-[#FCFAF8] border border-[#EFEAE2] rounded-xl px-3 py-2 text-xs text-[#1e293b] outline-none focus:border-brand-terracotta transition resize-y font-serif italic"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-brand-olive uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Condiciones de Pago & Notas Legales
                </label>
                <textarea
                  rows={3}
                  value={metadata.notes || ''}
                  onChange={e => updateMetadataField('notes', e.target.value)}
                  placeholder="Escribe los términos y condiciones de pago, validez de presupuestos, plazos de entrega, etc..."
                  className="w-full bg-[#FCFAF8] border border-[#E1DCD3] rounded-xl px-3 py-2 text-xs text-[#1e293b] outline-none focus:border-brand-terracotta transition resize-y font-sans"
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* AJUSTES DEL PRESUPUESTO — Descuento, Gastos de Gestión, Campos Personalizados y Métricas */}
      <div className="bg-white rounded-2xl border border-brand-sand-dark shadow-xs overflow-hidden no-print">
        {/* Header */}
        <div className="py-4 px-5 flex items-center justify-between bg-[#FAF8F5]/80 border-b border-brand-sand/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-terracotta/10 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-brand-terracotta" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-brand-navy text-lg leading-tight">
                Ajustes del Presupuesto
              </h3>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-semibold">
                Descuento · Gastos de Gestión · Conceptos Personalizados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Total Venta</span>
              <span className="text-lg font-bold font-display text-brand-navy">{formatEuro(totalVenta)}</span>
            </div>
            <div className="w-px h-10 bg-brand-sand-dark/60"></div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Beneficio</span>
              <span className={`text-lg font-bold font-display ${beneficioReal >= 0 ? 'text-brand-olive' : 'text-brand-terracotta'}`}>
                {formatEuro(beneficioReal)}
              </span>
              <span className="text-[10px] font-mono text-slate-400 ml-1">({beneficioMargin.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Discount field */}
            <div className="space-y-1.5 bg-[#FAF7F2] p-3.5 rounded-xl border border-brand-sand-dark/60">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Descuento Comercial
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={discountValue || ''}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      updateMetadataField('discountValue', isNaN(val) ? 0 : val);
                    }}
                    placeholder="Ej. 10"
                    className="w-full bg-white border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold font-mono">
                    {discountType === 'percent' ? '%' : '€'}
                  </span>
                </div>
                <div className="flex bg-white border border-brand-sand-dark rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      updateMetadataField('discountType', 'percent');
                      updateMetadataField('discountPercent', discountValue || 0);
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${discountType === 'percent' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMetadataField('discountType', 'amount')}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${discountType === 'amount' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    €
                  </button>
                </div>
              </div>
              {discountVal > 0 && (
                <p className="text-[10px] text-brand-terracotta font-semibold mt-1">
                  Descuento aplicado: -{formatEuro(discountVal)}
                </p>
              )}
            </div>

            {/* Admin Expenses field */}
            <div className="space-y-1.5 bg-[#FAF7F2] p-3.5 rounded-xl border border-brand-sand-dark/60">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gastos de Gestión Administrativa
              </label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={adminExp || ''}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      updateMetadataField('adminExpenses', isNaN(val) ? 0 : val);
                    }}
                    placeholder="Ej. 150"
                    className="w-full bg-white border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-semibold"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold font-mono">
                    {adminExpensesType === 'percent' ? '%' : '€'}
                  </span>
                </div>
                <div className="flex bg-white border border-brand-sand-dark rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      updateMetadataField('adminExpensesType', 'percent');
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${adminExpensesType === 'percent' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateMetadataField('adminExpensesType', 'amount');
                    }}
                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${adminExpensesType === 'amount' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    €
                  </button>
                </div>
              </div>
              {adminExp > 0 ? (
                <p className="text-[10px] text-brand-olive font-semibold mt-1">
                  Gastos (con IVA): +{formatEuro(adminExpWithIva)}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-1 leading-normal italic">
                  Honorarios de gestión, tramitación u otros recargos (sin IVA).
                </p>
              )}
            </div>

            {/* Live Metrics Summary */}
            <div className="space-y-2 bg-[#FAF7F2] p-3.5 rounded-xl border border-brand-sand-dark/60">
              <label className="block text-[11px] font-bold text-brand-terracotta uppercase tracking-wider">
                Resumen en Directo
              </label>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Inversión (Coste)</span>
                  <span className="font-mono font-semibold text-brand-navy">{formatEuro(totalInversion)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Venta (PVP)</span>
                  <span className="font-mono font-bold text-brand-navy">{formatEuro(totalVenta)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-1 border-t border-brand-sand-dark/40">
                  <span className="font-bold text-brand-terracotta">Beneficio Real</span>
                  <span className={`font-mono font-extrabold ${beneficioReal >= 0 ? 'text-brand-olive' : 'text-brand-terracotta'}`}>
                    {formatEuro(beneficioReal)} <span className="text-[10px] font-semibold text-slate-400">({beneficioMargin.toFixed(1)}%)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Custom Fields */}
          <div className="space-y-3 pt-2 border-t border-brand-sand-dark/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-brand-olive" />
                Campos y Conceptos Personalizados (+/-)
              </span>
              <button
                type="button"
                onClick={handleAddCustomAdjustment}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-terracotta hover:text-brand-terracotta/80 font-mono tracking-wider uppercase transition bg-[#FAF7F2] border border-brand-sand-dark rounded-lg py-1 px-2.5 shadow-2xs hover:shadow-xs cursor-pointer"
              >
                + Añadir Campo
              </button>
            </div>

            {(!customAdjustments || customAdjustments.length === 0) ? (
              <div className="bg-[#FAF7F2]/50 border border-dashed border-brand-sand-dark rounded-xl p-3 text-center text-xs text-slate-400 italic">
                Sin campos adicionales. Puedes añadir costes o pluses en euros.
              </div>
            ) : (
              <div className="space-y-2 max-h-[10rem] overflow-y-auto pr-1">
                {customAdjustments.map((adj) => (
                  <div key={adj.id} className="flex items-center gap-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-brand-sand-dark/60 animate-fadeIn">
                    <input
                      type="text"
                      value={adj.label}
                      onChange={e => handleUpdateCustomAdjustment(adj.id, e.target.value, adj.amount)}
                      placeholder="Concepto (ej. Plus por Transporte)"
                      className="flex-grow bg-white border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta font-semibold"
                    />
                    <div className="relative w-36">
                      <input
                        type="number"
                        step="any"
                        value={adj.amount || ''}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          handleUpdateCustomAdjustment(adj.id, adj.label, isNaN(val) ? 0 : val);
                        }}
                        placeholder="Importe €"
                        className="w-full bg-white border border-brand-sand-dark rounded-lg pl-3 pr-8 py-1.5 text-xs text-brand-navy outline-none focus:border-brand-terracotta font-mono font-semibold"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-bold font-mono">€</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomAdjustment(adj.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Eliminar campo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((sec) => {
          const isExpanded = !!expandedSections[sec.id];
          const { costTotal, priceTotal, profitTotal, profitPercent } = getSectionSubtotals(sec);
          const isEditing = editingSectionId === sec.id;

          return (
            <div 
              key={sec.id} 
              className="bg-white rounded-2xl border border-brand-sand-dark shadow-xs overflow-hidden transition-all hover:shadow-sm"
            >
              {/* Section Accordion Header */}
              <div 
                className={`py-4 px-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none bg-[#FAF8F5]/80 border-b border-brand-sand/60 hover:bg-[#FAF8F5] transition`}
                onClick={() => toggleSection(sec.id)}
              >
                {/* Lefthand: Name & Edit Actions */}
                <div className="flex items-center gap-3 min-w-[260px]" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => toggleSection(sec.id)}
                    className="p-1 rounded-md text-brand-olive-light hover:bg-brand-sand hover:text-brand-olive transition"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>

                  <div className="relative flex items-center gap-2 group">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-brand-sand-dark shadow-inner">
                        <input
                          type="text"
                          value={tempSectionName}
                          onChange={e => setTempSectionName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveSectionName(sec.id);
                            if (e.key === 'Escape') setEditingSectionId(null);
                          }}
                          className="font-serif font-bold text-brand-navy text-lg focus:outline-none px-1 py-0.5 bg-transparent min-w-[120px] max-w-[200px]"
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
                          className="font-serif font-bold text-brand-navy text-lg hover:text-brand-terracotta cursor-pointer transition select-all leading-tight"
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
                  <span className="text-[10px] text-brand-olive-light font-bold font-mono bg-brand-sand px-2 py-0.5 rounded-full uppercase">
                    {sec.items.length} {sec.items.length === 1 ? 'artículo' : 'artículos'}
                  </span>
                </div>

                {/* Quantitative overview on header */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">PVP (Venta):</span>
                    <span className="text-brand-navy font-bold text-sm">{formatEuro(priceTotal)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-brand-sand-dark pl-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Inversión (Coste):</span>
                    <span className="text-slate-600 font-semibold">{formatEuro(costTotal)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-brand-sand-dark pl-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Beneficio:</span>
                    <span className={`font-bold ${profitTotal >= 0 ? 'text-brand-olive' : 'text-brand-terracotta'}`}>
                      {formatEuro(profitTotal)} ({profitPercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Actions per Section */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenImporterForSection(sec.id)}
                    className="inline-flex items-center gap-1 text-[11px] py-1 px-3 rounded-lg border border-brand-terracotta/20 bg-brand-terracotta/5 text-brand-terracotta hover:bg-brand-terracotta/10 transition font-semibold"
                    title="Importar pegando desde Excel para este ambiente"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Pegar Excel
                  </button>
                  <button
                    onClick={() => addItemToSection(sec.id)}
                    className="p-1.5 text-brand-olive hover:bg-brand-sand rounded-lg border border-transparent hover:border-brand-sand-dark transition"
                    title="Añadir artículo manual"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSection(sec.id)}
                    className="p-1.5 text-brand-terracotta hover:bg-rose-50 rounded-lg transition"
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
                      <table className="w-full text-left border-collapse table-fixed min-w-[1250px]">
                        <thead>
                          <tr className="bg-brand-sand-light text-slate-400 text-[10px] font-bold tracking-wider uppercase border-b border-brand-sand-dark font-mono">
                            <th className="py-2.5 px-3 w-[40px] text-center">Nº</th>
                            <th className="py-2.5 px-3 w-[80px] text-center">Foto</th>
                            <th className="py-2.5 px-3 w-[23%] text-left">Descripción del Artículo / Material</th>
                            <th className="py-2.5 px-3 w-[110px] text-left">Referencia</th>
                            <th className="py-2.5 px-3 w-[13%] text-left">Distribuidor</th>
                            <th className="py-2.5 px-3 w-[120px] text-center">Disponibilidad</th>
                            <th className="py-2.5 px-3 w-[60px] text-right">Cant.</th>
                            <th className="py-2.5 px-3 w-[100px] text-right">Coste U. (€)</th>
                            <th className="py-2.5 px-3 w-[100px] text-right bg-slate-50/50">Coste T. (€)</th>
                            <th className="py-2.5 px-3 w-[100px] text-right">PVP U. (€)</th>
                            <th className="py-2.5 px-3 w-[100px] text-right bg-brand-sand-light/50">PVP T. (€)</th>
                            <th className="py-2.5 px-3 w-[90px] text-right">Beneficio (€)</th>
                            <th className="py-2.5 px-2 w-[40px] text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sec.items.length === 0 ? (
                            <tr>
                              <td colSpan={13} className="py-8 text-center text-slate-400 text-sm font-serif">
                                No hay artículos en esta sección. Haz clic en{' '}
                                <button 
                                  onClick={() => addItemToSection(sec.id)}
                                  className="text-brand-terracotta hover:underline font-bold cursor-pointer"
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
                                  className="group hover:bg-brand-sand/10 transition-colors"
                                >
                                  {/* Row # */}
                                  <td className="py-2 px-1 text-center font-mono text-[10px] text-slate-400 select-none">
                                    {index + 1}
                                  </td>

                                  {/* Foto Column */}
                                  <td className="py-2 px-2 text-center">
                                    <div className="flex items-center justify-center">
                                      {item.imageUrl ? (
                                        <div 
                                          className="relative group/img w-10 h-10 rounded-lg overflow-hidden border border-brand-sand-dark flex items-center justify-center bg-brand-sand/20"
                                        >
                                          <img src={item.imageUrl} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/55 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1 transition-opacity duration-200">
                                            <button
                                              onClick={() => setLightboxImageUrl(item.imageUrl || null)}
                                              className="p-1 bg-white/20 hover:bg-white/40 text-white rounded transition hover:scale-110 cursor-pointer"
                                              title="Ver grande"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => setImageSelectorItem({ sectionId: sec.id, itemId: item.id, currentUrl: item.imageUrl })}
                                              className="p-1 bg-white/20 hover:bg-white/40 text-white rounded transition hover:scale-110 cursor-pointer"
                                              title="Cambiar fotografía"
                                            >
                                              <Camera className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button 
                                          onClick={() => setImageSelectorItem({ sectionId: sec.id, itemId: item.id })}
                                          className="w-10 h-10 rounded-lg border border-dashed border-slate-350 hover:border-brand-terracotta text-slate-400 hover:text-brand-terracotta flex items-center justify-center bg-brand-sand-light/35 transition cursor-pointer"
                                          title="Añadir fotografía"
                                        >
                                          <Camera className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>

                                  {/* Description (Text Area/Input) */}
                                  <td className="py-2 px-2 text-sm">
                                    <input
                                      type="text"
                                      placeholder="P. ej., Sofá lino, Mesa roble, Focos empotrables..."
                                      value={item.description}
                                      onChange={e => updateItemField(sec.id, item.id, 'description', e.target.value)}
                                      className="w-full bg-transparent border border-transparent focus:border-brand-terracotta hover:border-brand-sand-dark focus:bg-white px-2 py-1.5 rounded text-brand-navy font-semibold transition duration-100 placeholder:text-slate-300 placeholder:font-normal focus:outline-none"
                                    />
                                  </td>

                                  {/* Technical Reference Code */}
                                  <td className="py-2 px-2 text-sm">
                                    <input
                                      type="text"
                                      placeholder="REF-0000"
                                      value={item.reference || ''}
                                      onChange={e => updateItemField(sec.id, item.id, 'reference', e.target.value)}
                                      className="w-full bg-transparent border border-transparent focus:border-brand-terracotta hover:border-brand-sand-dark focus:bg-white px-2 py-1.5 rounded text-slate-700 font-mono text-[11px] transition duration-100 placeholder:text-slate-300 focus:outline-none"
                                    />
                                  </td>

                                  {/* Distributor */}
                                  <td className="py-2 px-2 text-sm">
                                    <input
                                      type="text"
                                      list="suppliers-datalist"
                                      placeholder="P. ej., Zara Home, Flos..."
                                      value={item.distributor || ''}
                                      onChange={e => updateItemField(sec.id, item.id, 'distributor', e.target.value)}
                                      className="w-full bg-transparent border border-transparent focus:border-brand-terracotta hover:border-brand-sand-dark focus:bg-white px-2 py-1.5 rounded text-slate-700 transition duration-100 placeholder:text-slate-300 focus:outline-none"
                                    />
                                  </td>

                                  {/* Availability Selector (Colored Badges - no entregado) */}
                                  <td className="py-2 px-2 text-center text-xs">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <select
                                        value={item.availability || 'disponible'}
                                        onChange={e => {
                                          const val = e.target.value as BudgetItem['availability'];
                                          updateItemField(sec.id, item.id, 'availability', val);
                                          // Auto-trigger details modal if marking as pedido/retrasado and no deliveryDate is set
                                          if ((val === 'pedido' || val === 'retrasado') && !item.deliveryDate) {
                                            setLogisticsModalItem({
                                              sectionId: sec.id,
                                              itemId: item.id,
                                              description: item.description,
                                              deliveryDate: item.deliveryDate || '',
                                              trackingNumber: item.trackingNumber || '',
                                              carrierName: item.carrierName || '',
                                              logisticsNotes: item.logisticsNotes || ''
                                            });
                                          }
                                        }}
                                        className={`block text-center py-1 px-1.5 border border-brand-sand-dark/65 rounded-lg font-bold uppercase font-mono tracking-wide text-[10px] cursor-pointer focus:outline-none transition-all duration-150 ${
                                          item.availability === 'disponible' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60' 
                                            : item.availability === 'pedido'
                                            ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100/60'
                                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/60'
                                        }`}
                                      >
                                        <option value="disponible">Disponible</option>
                                        <option value="pedido">Pedido</option>
                                        <option value="retrasado">Retrasado</option>
                                      </select>

                                      {(item.availability === 'pedido' || item.availability === 'retrasado') && (
                                        <button
                                          type="button"
                                          onClick={() => setLogisticsModalItem({
                                            sectionId: sec.id,
                                            itemId: item.id,
                                            description: item.description,
                                            deliveryDate: item.deliveryDate || '',
                                            trackingNumber: item.trackingNumber || '',
                                            carrierName: item.carrierName || '',
                                            logisticsNotes: item.logisticsNotes || ''
                                          })}
                                          className={`p-1.5 rounded-lg border transition duration-150 shrink-0 cursor-pointer ${
                                            item.deliveryDate 
                                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60' 
                                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-brand-terracotta hover:border-brand-terracotta/40'
                                          }`}
                                          title="Detalles de logística, transportista y seguimiento"
                                        >
                                          <Truck className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
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
                                      className="w-full text-right bg-transparent border border-transparent focus:border-brand-terracotta hover:border-brand-sand-dark focus:bg-white px-2 py-1.5 rounded font-mono font-medium focus:outline-none"
                                    />
                                  </td>

                                  {/* Investment cost unit */}
                                  {/* Cost unit input */}
                                  <td className="py-2 px-2 text-xs text-right">
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
                                        className="w-full text-right bg-transparent border border-transparent focus:border-brand-terracotta hover:border-brand-sand-dark focus:bg-white pl-2 pr-2 py-1.5 rounded font-mono font-medium text-xs focus:outline-none"
                                      />
                                    </div>
                                  </td>

                                  {/* Total investment (Calculated read-only) */}
                                  <td className="py-2 px-3 text-xs text-right font-mono text-slate-500 bg-slate-50/40 font-medium whitespace-nowrap">
                                    {formatEuro(itemInvestmentCost)}
                                  </td>

                                  {/* Sale price unit */}
                                  <td className="py-2 px-2 text-xs text-right">
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
                                        className="w-full text-right bg-transparent border border-transparent focus:border-brand-terracotta hover:border-brand-sand-dark focus:bg-white pl-2 pr-2 py-1.5 rounded font-mono text-brand-navy font-bold text-xs focus:outline-none"
                                      />
                                    </div>
                                  </td>

                                  {/* Total sale price (Calculated read-only) */}
                                  <td className="py-2 px-3 text-xs text-right font-mono text-brand-navy bg-brand-sand/10 font-bold whitespace-nowrap">
                                    {formatEuro(itemRevenue)}
                                  </td>

                                  {/* Profit column (Calculated read-only) */}
                                  <td className="py-2 px-3 text-xs text-right font-mono whitespace-nowrap">
                                    <div className={`font-semibold ${itemProfit >= 0 ? 'text-brand-olive' : 'text-brand-terracotta'}`}>
                                      {formatEuro(itemProfit)}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {itemProfitMargin >= 0 ? `+${itemProfitMargin.toFixed(0)}% mrg` : `${itemProfitMargin.toFixed(0)}%`}
                                    </div>
                                  </td>

                                  {/* Remove row */}
                                  <td className="py-2 px-2 text-center">
                                    <button
                                      onClick={() => deleteItemFromSection(sec.id, item.id)}
                                      className="p-1 text-slate-300 hover:text-brand-terracotta hover:bg-rose-50 rounded-md opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
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
                    <div className="p-3 bg-brand-sand-light/50 border-t border-brand-sand/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addItemToSection(sec.id)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-brand-sand-dark bg-white hover:bg-brand-sand text-brand-navy font-semibold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Añadir Artículo
                        </button>
                        <button
                          onClick={() => onOpenImporterForSection(sec.id)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-transparent bg-brand-terracotta/5 hover:bg-brand-terracotta/10 text-brand-terracotta font-semibold transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Importar de Excel
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-80 select-none text-[11px] text-brand-olive font-medium">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Consejo: Usa <b>Tab</b> para desplazarte rápido. Define el distribuidor y disponibilidad para alimentar el cuadro logístico.</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Botón Añadir Sección Nueva al final */}
      <div className="flex justify-center pt-6 pb-12 no-print">
        <button
          onClick={addNewSection}
          className="inline-flex items-center gap-2.5 py-3 px-8 rounded-xl text-sm font-bold text-white bg-brand-olive hover:bg-brand-olive-dark active:scale-97 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-102"
        >
          <FolderPlus className="w-5 h-5" />
          Añadir Sección (Ambiente)
        </button>
      </div>

      {/* Lightbox Modal Preview */}
      <AnimatePresence>
        {lightboxImageUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImageUrl(null)}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out no-print"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={lightboxImageUrl} 
                className="max-w-full max-h-[80vh] object-contain rounded-xl select-none" 
                alt="Vista ampliada"
              />
              <button 
                onClick={() => setLightboxImageUrl(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition shadow-md border border-white/10 cursor-pointer"
                title="Cerrar vista grande"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📦 High-End Logistics Details Drawer Modal (no-print) */}
      <AnimatePresence>
        {logisticsModalItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4 no-print"
            onClick={() => setLogisticsModalItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#FCFAF8] border border-brand-sand-dark rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-brand-sand/40 border-b border-brand-sand-dark px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-sand rounded-lg text-brand-terracotta">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-brand-navy text-sm">
                      Logística y Seguimiento
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Detalles de envío para uso interno
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLogisticsModalItem(null)}
                  className="text-slate-400 hover:text-brand-navy p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 space-y-4">
                <div className="bg-brand-sand/15 p-3 rounded-xl border border-brand-sand-dark text-xs space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Artículo seleccionado</span>
                  <span className="font-serif font-bold text-brand-navy block leading-snug">{logisticsModalItem.description}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Carrier Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Transportista / Agencia</label>
                    <input
                      type="text"
                      placeholder="Ej. SEUR, DHL, Correos..."
                      value={logisticsModalItem.carrierName}
                      onChange={e => setLogisticsModalItem(prev => prev ? { ...prev, carrierName: e.target.value } : null)}
                      className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition"
                    />
                  </div>

                  {/* Tracking Number */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nº Seguimiento / Expedición</label>
                    <input
                      type="text"
                      placeholder="Ej. 123456789X"
                      value={logisticsModalItem.trackingNumber}
                      onChange={e => setLogisticsModalItem(prev => prev ? { ...prev, trackingNumber: e.target.value } : null)}
                      className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-terracotta font-mono transition"
                    />
                  </div>
                </div>

                {/* Estimated Delivery Date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha Estimada de Entrega</label>
                  <input
                    type="date"
                    value={logisticsModalItem.deliveryDate}
                    onChange={e => setLogisticsModalItem(prev => prev ? { ...prev, deliveryDate: e.target.value } : null)}
                    className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-terracotta font-mono transition"
                  />
                </div>

                {/* Logistics Call Log / Annotations */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Notas de Seguimiento e Incidencias</label>
                  <textarea
                    rows={3}
                    placeholder="Registra incidencias, llamadas al transportista o estado del retraso (ej. Retrasado en aduana)..."
                    value={logisticsModalItem.logisticsNotes}
                    onChange={e => setLogisticsModalItem(prev => prev ? { ...prev, logisticsNotes: e.target.value } : null)}
                    className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition font-sans"
                  />
                </div>

                {/* Quick actions & submit */}
                <div className="pt-4 border-t border-brand-sand/55 flex flex-col sm:flex-row justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      // Mark as disponible/recibido
                      updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'availability', 'disponible');
                      updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'carrierName', logisticsModalItem.carrierName || undefined);
                      updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'trackingNumber', logisticsModalItem.trackingNumber || undefined);
                      updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'deliveryDate', logisticsModalItem.deliveryDate || undefined);
                      updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'logisticsNotes', logisticsModalItem.logisticsNotes || undefined);
                      setLogisticsModalItem(null);
                    }}
                    className="py-2 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition duration-150 cursor-pointer text-center"
                  >
                    Marcar como Recibido
                  </button>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setLogisticsModalItem(null)}
                      className="py-2 px-4 rounded-xl text-xs font-bold text-brand-navy border border-brand-sand-dark hover:bg-brand-sand transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Save changes
                        updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'carrierName', logisticsModalItem.carrierName || undefined);
                        updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'trackingNumber', logisticsModalItem.trackingNumber || undefined);
                        updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'deliveryDate', logisticsModalItem.deliveryDate || undefined);
                        updateItemField(logisticsModalItem.sectionId, logisticsModalItem.itemId, 'logisticsNotes', logisticsModalItem.logisticsNotes || undefined);
                        setLogisticsModalItem(null);
                      }}
                      className="py-2 px-5 rounded-xl text-xs font-bold text-white bg-brand-terracotta hover:bg-brand-terracotta-dark shadow-xs transition cursor-pointer"
                    >
                      Guardar Detalles
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Elegant Image Selector/Upload Dialog Modal (no-print) */}
      {imageSelectorItem && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-[#FCFAF8] border border-brand-sand-dark rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-slideUp">
            
            {/* Header */}
            <div className="bg-brand-sand/40 border-b border-brand-sand-dark px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-brand-navy text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-terracotta" />
                Configurar Imagen del Artículo
              </h3>
              <button
                onClick={() => setImageSelectorItem(null)}
                className="text-slate-400 hover:text-brand-navy transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Current Image Preview */}
              {imageSelectorItem.currentUrl && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Imagen Actual</label>
                  <div className="relative h-40 rounded-xl overflow-hidden border border-brand-sand-dark bg-brand-sand/10 flex items-center justify-center">
                    <img src={imageSelectorItem.currentUrl} className="w-full h-full object-contain" />
                    <button
                      onClick={() => {
                        updateItemField(imageSelectorItem.sectionId, imageSelectorItem.itemId, 'imageUrl', undefined);
                        setImageSelectorItem(prev => prev ? { ...prev, currentUrl: undefined } : null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-50 text-brand-terracotta rounded-lg hover:bg-rose-100 transition shadow-xs"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* 1. Paste Link option */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Enlace de Imagen (URL)</label>
                <input
                  type="text"
                  placeholder="Pega la URL de la imagen (p. ej., Unsplash, Pinterest...)"
                  value={imageSelectorItem.currentUrl || ''}
                  onChange={e => {
                    const url = e.target.value;
                    updateItemField(imageSelectorItem.sectionId, imageSelectorItem.itemId, 'imageUrl', url || undefined);
                    setImageSelectorItem(prev => prev ? { ...prev, currentUrl: url || undefined } : null);
                  }}
                  className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy outline-none focus:border-brand-terracotta transition"
                />
              </div>

              {/* 2. Upload file option */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Cargar desde Archivo Local</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-brand-sand-dark border-dashed rounded-xl cursor-pointer bg-white hover:bg-brand-sand-light/20 transition">
                    <div className="flex flex-col items-center justify-center pt-3 pb-3">
                      <Plus className="w-5 h-5 text-slate-400 mb-1" />
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Seleccionar Foto Local</p>
                      <p className="text-[9px] text-slate-400 font-mono">PNG, JPG o WEBP (Codificación Base64)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            updateItemField(imageSelectorItem.sectionId, imageSelectorItem.itemId, 'imageUrl', base64);
                            setImageSelectorItem(prev => prev ? { ...prev, currentUrl: base64 } : null);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 3. High-End Curated Samples */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Prescribir Imagen del Catálogo CH</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Sofá Lino', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Mesa Roble', url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Lámpara', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Encimera Mármol', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Cocina Diseño', url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Baño Lujo', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80' }
                  ].map(sample => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => {
                        updateItemField(imageSelectorItem.sectionId, imageSelectorItem.itemId, 'imageUrl', sample.url);
                        setImageSelectorItem(prev => prev ? { ...prev, currentUrl: sample.url } : null);
                      }}
                      className="group border border-brand-sand-dark rounded-lg overflow-hidden h-12 relative flex items-center justify-center transition hover:border-brand-terracotta cursor-pointer"
                    >
                      <img src={sample.url} className="w-full h-full object-cover transition duration-150 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[8px] text-white font-bold font-sans text-center uppercase tracking-wide px-1 leading-none">{sample.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer actions */}
              <div className="pt-4 border-t border-brand-sand/55 flex justify-end">
                <button
                  onClick={() => setImageSelectorItem(null)}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navy-light shadow-xs transition duration-200 cursor-pointer"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Datalist Suggestion Feed for Suppliers Autocomplete */}
      {suppliers && suppliers.length > 0 && (
        <datalist id="suppliers-datalist">
          {suppliers.map(s => (
            <option key={s.id} value={s.name} />
          ))}
        </datalist>
      )}

    </div>
  );
}
