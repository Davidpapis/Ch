/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Clipboard, 
  Check, 
  X, 
  AlertCircle,
  Play,
  FileCheck2,
  FolderPlus
} from 'lucide-react';
import { BudgetSection, BudgetItem } from '../types';

interface ExcelImporterProps {
  sections: BudgetSection[];
  onUpdateSections: (sections: BudgetSection[]) => void;
  targetSectionId: string | null;
  onClose: () => void;
}

interface ParsedImportItem {
  sectionName?: string;
  description: string;
  distributor: string;
  availability: BudgetItem['availability'];
  cost: number;
  price: number;
  quantity: number;
}

const formatEuro = (val: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
};

export function ExcelImporter({ sections, onUpdateSections, targetSectionId, onClose }: ExcelImporterProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'export'>('paste');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(targetSectionId || (sections[0]?.id || ''));
  const [pasteContent, setPasteContent] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedImportItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded Column mapping state supporting distributor, availability, and section auto-grouping
  const [colMapping, setColMapping] = useState({
    desc: 0,
    cost: 1,
    price: 2,
    qty: 3,
    distributor: 4,
    availability: -1, // -1 means ignore (defaults to 'disponible')
    section: -1       // -1 means ignore (imports to the selected single section)
  });

  const targetSection = sections.find(s => s.id === selectedSectionId) || sections[0];

  // Auto-detect & parse paste input
  const handleParsePaste = () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      if (!pasteContent.trim()) {
        setErrorMessage('Por favor, pega algún contenido primero.');
        return;
      }

      const lines = pasteContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      const list: ParsedImportItem[] = [];

      for (const line of lines) {
        // Excel copies cells with Tabs (\t)
        // CSV with semi-colon (;) or commas (,)
        let cells: string[] = [];
        if (line.includes('\t')) {
          cells = line.split('\t');
        } else if (line.includes(';')) {
          cells = line.split(';');
        } else {
          cells = line.split(',');
        }

        cells = cells.map(c => c.trim().replace(/^"(.*)"$/, '$1')); // remove quotes

        if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;

        // Try mapping or parsing:
        const descVal = cells[colMapping.desc] || '';
        if (!descVal || descVal.toLowerCase() === 'descripción' || descVal.toLowerCase() === 'producto' || descVal.toLowerCase() === 'articulo') {
          // Skip header rows
          continue;
        }

        // Clean currency strings: replace dots (thousands) and replace comma with dot (decimal), remove € space
        const cleanNumber = (str: string): number => {
          if (!str) return 0;
          let clean = str.replace(/[\s€$]/g, '');
          // If it has both dots and commas e.g. 1.250,50 -> 1250.50
          if (clean.includes('.') && clean.includes(',')) {
            clean = clean.replace(/\./g, '').replace(/,/g, '.');
          } else if (clean.includes(',')) {
            // e.g. 45,50 -> 45.50
            clean = clean.replace(/,/g, '.');
          }
          const num = parseFloat(clean);
          return isNaN(num) ? 0 : num;
        };

        const costVal = cleanNumber(cells[colMapping.cost] || '0');
        const priceVal = cleanNumber(cells[colMapping.price] || '0');
        
        let qtyVal = 1;
        const rawQty = cells[colMapping.qty];
        if (rawQty) {
          const parsedQty = parseFloat(rawQty.replace(/,/g, '.'));
          if (!isNaN(parsedQty)) qtyVal = parsedQty;
        }

        // Distributor
        const distributorVal = colMapping.distributor !== -1 ? (cells[colMapping.distributor] || '') : '';

        // Availability status parsing
        let availabilityVal: BudgetItem['availability'] = 'disponible';
        if (colMapping.availability !== -1) {
          const rawStatus = (cells[colMapping.availability] || '').toLowerCase().trim();
          if (rawStatus.includes('pedid') || rawStatus.includes('order')) availabilityVal = 'pedido';
          else if (rawStatus.includes('retr') || rawStatus.includes('delay')) availabilityVal = 'retrasado';
          else if (rawStatus.includes('entr') || rawStatus.includes('deliv')) availabilityVal = 'disponible';
        }

        // Section/Ambiente parsing
        const sectionVal = colMapping.section !== -1 ? (cells[colMapping.section] || '').trim() : undefined;

        list.push({
          sectionName: sectionVal,
          description: descVal,
          cost: costVal,
          price: priceVal,
          quantity: qtyVal,
          distributor: distributorVal,
          availability: availabilityVal
        });
      }

      if (list.length === 0) {
        setErrorMessage('No pudimos detectar artículos válidos. Revisa las columnas seleccionadas.');
      } else {
        setParsedItems(list);
        setSuccessMessage(`Se han detectado ${list.length} fila(s) listas para importar.`);
      }
    } catch (err: any) {
      setErrorMessage(`Error al procesar los datos: ${err.message || err}`);
    }
  };

  // Perform actual import to target section(s)
  const executeImport = () => {
    if (parsedItems.length === 0) return;

    let updatedSections = [...sections];

    // Check if we are doing smart multi-section import
    const hasSectionColumn = colMapping.section !== -1 && parsedItems.some(it => !!it.sectionName);

    if (hasSectionColumn) {
      // Group items by section
      parsedItems.forEach(parsed => {
        const secName = parsed.sectionName || 'Otros';
        
        // Find existing section case-insensitive
        let secIndex = updatedSections.findIndex(s => s.name.toLowerCase() === secName.toLowerCase());
        
        if (secIndex === -1) {
          // Create new section if it doesn't exist!
          const newSecId = `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          updatedSections.push({
            id: newSecId,
            name: secName,
            items: []
          });
          secIndex = updatedSections.length - 1;
        }

        const newItem: BudgetItem = {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
          description: parsed.description,
          cost: parsed.cost,
          price: parsed.price,
          quantity: parsed.quantity,
          distributor: parsed.distributor,
          availability: parsed.availability
        };

        updatedSections[secIndex].items.push(newItem);
      });

      onUpdateSections(updatedSections);
      setSuccessMessage(`¡Éxito! Se han importado ${parsedItems.length} artículos organizados automáticamente en ambientes.`);
    } else {
      // Import everything to the single selected section
      const itemsToInsert: BudgetItem[] = parsedItems.map(p => ({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        description: p.description,
        cost: p.cost,
        price: p.price,
        quantity: p.quantity,
        distributor: p.distributor,
        availability: p.availability
      }));

      const updated = sections.map(sec => {
        if (sec.id === selectedSectionId) {
          return {
            ...sec,
            items: [...sec.items, ...itemsToInsert]
          };
        }
        return sec;
      });

      onUpdateSections(updated);
      setSuccessMessage(`¡Éxito! Se han agregado ${itemsToInsert.length} artículos a "${targetSection?.name}".`);
    }

    setParsedItems([]);
    setPasteContent('');
    
    // Close modal after brief timeout
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // CSV file reading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readCSVFile(file);
  };

  const readCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPasteContent(text);
      setActiveTab('paste'); // Go to parse preview tab
    };
    reader.onerror = () => {
      setErrorMessage('Error al leer el archivo seleccionado.');
    };
    reader.readAsText(file);
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.txt'))) {
      readCSVFile(file);
    } else {
      setErrorMessage('Archivo no soportado. Sube un archivo de texto o CSV (.csv, .txt).');
    }
  };

  // Export entire budget as CSV
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM so Excel opens accents correctly in Spanish
    csvContent += 'Sección;Descripción del Artículo;Distribuidor;Estado;Inversión Unitario (Coste);Precio Venta Unitario (PVP);Cantidad;Inversión Total;Venta Total (PVP);Beneficio Neto;Porcentaje Margen\r\n';

    sections.forEach(sec => {
      sec.items.forEach(it => {
        const invTotal = it.cost * it.quantity;
        const sellTotal = it.price * it.quantity;
        const profit = sellTotal - invTotal;
        const margin = it.price > 0 ? (profit / sellTotal) * 100 : 0;

        // Escape double quotes and semicolons in description
        const escapedDesc = it.description.replace(/"/g, '""');
        const escapedSec = sec.name.replace(/"/g, '""');
        const escapedDist = (it.distributor || '').replace(/"/g, '""');

        csvContent += `"${escapedSec}";"${escapedDesc}";"${escapedDist}";"${it.availability}";${it.cost.toFixed(2).replace('.', ',')};${it.price.toFixed(2).replace('.', ',')};${it.quantity.toString().replace('.', ',')};${invTotal.toFixed(2).replace('.', ',')};${sellTotal.toFixed(2).replace('.', ',')};${profit.toFixed(2).replace('.', ',')};${margin.toFixed(1).replace('.', ',')}%\r\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Presupuesto_Cristina_Herrera_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download template
  const downloadTemplateCSV = (): void => {
    let csv = '\uFEFF';
    csv += 'Ambiente;Descripción;Distribuidor;Estado;Coste Unitario;Precio Venta;Cantidad\r\n';
    csv += 'Salón;Sofá de lino natural;Zara Home;disponible;650,00;1250,00;1\r\n';
    csv += 'Cocina;Grifo latón cepillado;Grohe;pedido;110,00;220,00;1\r\n';
    csv += 'Baño Suite;Lavabo de piedra natural;Porcelanosa;entregado;160,00;320,00;2\r\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_presupuesto_ch.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-brand-sand-dark shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="py-4 px-6 border-b border-brand-sand/60 flex items-center justify-between bg-brand-sand-light">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-sand border border-brand-sand-dark text-brand-olive rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy font-serif">Asistente de Importación Excel / CSV</h3>
              <p className="text-xs text-slate-500">Carga presupuestos completos copiados directamente desde tus hojas de cálculo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-brand-sand hover:text-brand-navy transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2 border-b border-brand-sand/40 flex gap-4 text-xs md:text-sm font-semibold select-none bg-white">
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-2 px-1 border-b-2 transition ${activeTab === 'paste' ? 'border-brand-terracotta text-brand-terracotta font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            1. Pegar celdas de Excel / Sheets
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 transition ${activeTab === 'upload' ? 'border-brand-terracotta text-brand-terracotta font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            2. Cargar archivo CSV / Texto
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 transition ${activeTab === 'export' ? 'border-brand-terracotta text-brand-terracotta font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            3. Exportar Presupuesto a CSV
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {/* Section Selector (only visible if "section" column is disabled) */}
          {activeTab !== 'export' && colMapping.section === -1 && (
            <div className="p-4 bg-brand-sand-light border border-brand-sand-dark rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="block text-[10px] font-bold font-mono text-brand-olive uppercase tracking-wide">
                  Ambiente o Sección destino:
                </label>
                <span className="text-xs text-slate-500">
                  Selecciona a qué cuarto o sección se agregarán los artículos importados.
                </span>
              </div>
              <select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="bg-white border border-brand-sand-dark rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-navy outline-none focus:border-brand-terracotta shadow-xs"
              >
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* TAB 1: PASTE FROM EXCEL */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-2">
                  <label className="block text-xs font-semibold text-brand-navy flex items-center gap-1.5 uppercase tracking-wide">
                    <Clipboard className="w-4 h-4 text-brand-olive" />
                    Pega tus datos aquí (copia la tabla completa de Excel y pégala abajo):
                  </label>
                  <textarea
                    rows={7}
                    value={pasteContent}
                    onChange={e => setPasteContent(e.target.value)}
                    placeholder={`Ejemplo con ambientes y distribuidores:
Salón\tSofá lino natural\tZara Home\tdisponible\t650,00\t1250,00\t1
Cocina\tEncimera porcelánica\tNeolith\tentregado\t1200,00\t2150,00\t1
Baño\tLavabo de piedra\tPorcelanosa\tpedido\t160,00\t320,00\t2`}
                    className="w-full text-xs font-mono p-3 bg-brand-sand-light border border-brand-sand-dark rounded-xl focus:outline-none focus:border-brand-terracotta focus:bg-white focus:shadow-inner"
                  />
                </div>

                {/* Column Mapping Configurations */}
                <div className="p-4 bg-brand-sand border border-brand-sand-dark rounded-xl space-y-3">
                  <h4 className="text-[10px] font-bold text-brand-navy font-mono tracking-wider uppercase flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    Mapeo de Columnas
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Indica en qué posición (de izquierda a derecha, empezando por la columna 0) está cada dato.
                  </p>

                  <div className="space-y-2.5 pt-1 text-xs">
                    
                    <div className="flex items-center justify-between gap-2 border-b border-brand-sand-dark pb-2">
                      <span className="font-semibold text-brand-navy flex items-center gap-1">
                        <FolderPlus className="w-3 h-3 text-brand-terracotta" />
                        Ambiente / Sección:
                      </span>
                      <select
                        value={colMapping.section}
                        onChange={e => setColMapping(prev => ({ ...prev, section: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1 px-0.5 outline-none focus:border-brand-terracotta font-mono text-[11px]"
                      >
                        <option value={-1}>Ignorar (Fijo)</option>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-600">Descripción / Producto:</span>
                      <select
                        value={colMapping.desc}
                        onChange={e => setColMapping(prev => ({ ...prev, desc: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1 px-0.5 outline-none focus:border-brand-terracotta font-mono text-[11px]"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-600">Distribuidor:</span>
                      <select
                        value={colMapping.distributor}
                        onChange={e => setColMapping(prev => ({ ...prev, distributor: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1 px-0.5 outline-none focus:border-brand-terracotta font-mono text-[11px]"
                      >
                        <option value={-1}>Ignorar (Vacio)</option>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-600">Disponibilidad / Estado:</span>
                      <select
                        value={colMapping.availability}
                        onChange={e => setColMapping(prev => ({ ...prev, availability: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1 px-0.5 outline-none focus:border-brand-terracotta font-mono text-[11px]"
                      >
                        <option value={-1}>Ignorar (Disponible)</option>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-600">Inversión (Coste):</span>
                      <select
                        value={colMapping.cost}
                        onChange={e => setColMapping(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1 px-0.5 outline-none focus:border-brand-terracotta font-mono text-[11px]"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-600">Precio Venta (PVP):</span>
                      <select
                        value={colMapping.price}
                        onChange={e => setColMapping(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1 px-0.5 outline-none focus:border-brand-terracotta font-mono text-[11px]"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-600">Cantidad:</span>
                      <select
                        value={colMapping.qty}
                        onChange={e => setColMapping(prev => ({ ...prev, qty: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1 px-0.5 outline-none focus:border-brand-terracotta font-mono text-[11px]"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parsing Action Buttons */}
              <div className="flex justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={downloadTemplateCSV}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-terracotta hover:text-brand-terracotta-dark font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar plantilla Excel ejemplo (.csv)
                </button>

                <button
                  type="button"
                  disabled={!pasteContent.trim()}
                  onClick={handleParsePaste}
                  className="inline-flex items-center gap-2 py-2 px-6 rounded-xl bg-brand-navy hover:bg-brand-navy-light active:scale-97 text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Procesar Datos / Vista Previa
                </button>
              </div>

              {/* Error messages */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Parsing results table preview */}
              {parsedItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold font-mono text-brand-olive uppercase tracking-wider">
                      Vista previa de filas procesadas ({parsedItems.length})
                    </h4>
                    {colMapping.section !== -1 ? (
                      <span className="text-[10px] text-brand-terracotta font-bold bg-brand-sand border border-brand-sand-dark rounded-md px-2 py-0.5 uppercase tracking-wide">
                        Importación por Ambientes Automática
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5 uppercase tracking-wide">
                        Importación a Sección: {targetSection?.name}
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto max-h-[190px] border border-brand-sand-dark rounded-xl">
                    <table className="w-full text-left border-collapse table-fixed min-w-[700px] text-xs">
                      <thead>
                        <tr className="bg-brand-sand-light border-b border-brand-sand-dark text-slate-500 font-bold">
                          {colMapping.section !== -1 && <th className="py-2 px-3 w-[15%]">Ambiente</th>}
                          <th className="py-2 px-3 w-[35%]">Descripción</th>
                          <th className="py-2 px-3 w-[15%]">Distribuidor</th>
                          <th className="py-2 px-3 text-center w-[80px]">Estado</th>
                          <th className="py-2 px-3 text-right w-[80px]">Coste (Inv)</th>
                          <th className="py-2 px-3 text-right w-[80px]">Venta (PVP)</th>
                          <th className="py-2 px-3 text-right w-[50px]">Cant.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedItems.map((item, id) => (
                          <tr key={id} className="hover:bg-brand-sand/10">
                            {colMapping.section !== -1 && <td className="py-1.5 px-3 font-semibold text-brand-navy">{item.sectionName || 'Otros'}</td>}
                            <td className="py-1.5 px-3 font-medium text-slate-800 truncate">{item.description}</td>
                            <td className="py-1.5 px-3 text-slate-500 font-mono text-[11px]">{item.distributor || '-'}</td>
                            <td className="py-1.5 px-3 text-center">
                              <span className={`py-0.5 px-1.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider ${
                                item.availability === 'disponible' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-sky-50 text-sky-700'
                              }`}>
                                {item.availability}
                              </span>
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-500">{item.cost.toFixed(2)} €</td>
                            <td className="py-1.5 px-3 text-right font-mono text-brand-navy font-semibold">{item.price.toFixed(2)} €</td>
                            <td className="py-1.5 px-3 text-right font-mono">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setParsedItems([])}
                      className="py-1.5 px-4 text-xs font-semibold border rounded-lg text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executeImport}
                      className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-olive hover:bg-brand-olive-dark text-xs font-bold text-white rounded-xl shadow-md transition cursor-pointer uppercase tracking-wider"
                    >
                      <Check className="w-4 h-4" />
                      Confirmar e Importar {parsedItems.length} Fila(s)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CSV UPLOAD DRAG DROP */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition ${isDragging ? 'border-brand-terracotta bg-brand-sand' : 'border-slate-300 hover:border-brand-olive hover:bg-brand-sand-light/30'}`}
              >
                <div className="p-3.5 bg-brand-sand text-brand-olive border border-brand-sand-dark rounded-full mb-3 shadow-xs">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="font-serif font-bold text-brand-navy text-base">Arrastra tu archivo CSV / Texto aquí</h4>
                <p className="text-slate-500 text-xs mt-1 max-w-sm">
                  Soporta archivos de texto delimitados por tabulaciones, comas o punto y coma exportados desde Microsoft Excel o Google Sheets.
                </p>
                <span className="mt-4 px-3.5 py-2 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 shadow-sm">
                  Buscar archivo local...
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.txt"
                  className="hidden"
                />
              </div>

              <div className="p-4 bg-brand-sand/50 border border-brand-sand-dark rounded-xl text-xs text-brand-olive-dark space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-brand-navy font-display uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-brand-terracotta" />
                  Instrucciones de formato recomendadas:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-650 leading-relaxed mt-1">
                  <li>El archivo puede incluir cabeceras. Las filas vacías se descartan automáticamente.</li>
                  <li>Puedes mapear una columna **"Ambiente"** para que el importador cree las estancias y separe los productos automáticamente de un solo golpe.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT FULL BUDGET */}
          {activeTab === 'export' && (
            <div className="space-y-6 text-center py-4">
              <div className="max-w-md mx-auto space-y-4">
                <div className="p-4 bg-brand-sand text-brand-olive border border-brand-sand-dark rounded-full inline-block shadow-xs">
                  <FileCheck2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-brand-navy text-lg">Descargar Copia de Respaldo (.csv)</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Crea un archivo CSV compatible con la configuración española de Excel (usa punto y coma `;` y comas `,` para los decimales) e incluye campos de distribuidor y disponibilidad.
                  </p>
                </div>
                
                <div className="p-4 bg-brand-sand-light border border-brand-sand-dark rounded-xl text-left text-xs text-slate-600 font-mono space-y-2">
                  <div className="flex justify-between border-b border-brand-sand pb-1.5">
                    <span>Áreas del proyecto:</span>
                    <span className="font-bold text-brand-navy">{sections.length} áreas</span>
                  </div>
                  <div className="flex justify-between border-b border-brand-sand pb-1.5">
                    <span>Artículos cargados:</span>
                    <span className="font-bold text-brand-navy">{sections.reduce((ac, s) => ac + s.items.length, 0)} artículos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PVP Total Venta:</span>
                    <span className="font-bold text-brand-terracotta">
                      {formatEuro(sections.reduce((ac, s) => ac + s.items.reduce((acc, it) => acc + (it.price * it.quantity), 0), 0))}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-brand-olive hover:bg-brand-olive-dark active:scale-97 text-sm font-semibold text-white shadow-lg transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Proyecto Completo a CSV
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info message */}
        {successMessage && !errorMessage && (
          <div className="mx-6 mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="py-3.5 px-6 bg-brand-sand-light border-t border-brand-sand-dark flex justify-end gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
          <span>Estudio Cristina Herrera Decoración &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
