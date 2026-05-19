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
  ArrowRight, 
  Check, 
  X, 
  AlertCircle,
  Play,
  FileCheck2
} from 'lucide-react';
import { BudgetSection, BudgetItem } from '../types';

interface ExcelImporterProps {
  sections: BudgetSection[];
  onUpdateSections: (sections: BudgetSection[]) => void;
  targetSectionId: string | null;
  onClose: () => void;
}

export function ExcelImporter({ sections, onUpdateSections, targetSectionId, onClose }: ExcelImporterProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload' | 'export'>('paste');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(targetSectionId || (sections[0]?.id || ''));
  const [pasteContent, setPasteContent] = useState('');
  const [parsedItems, setParsedItems] = useState<Omit<BudgetItem, 'id'>[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column mapping state
  const [colMapping, setColMapping] = useState({
    desc: 0,
    cost: 1,
    price: 2,
    qty: 3
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
      const list: Omit<BudgetItem, 'id'>[] = [];

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
        // Col indices: description, cost, sale price, quantity
        const descVal = cells[colMapping.desc] || '';
        if (!descVal) continue; // Skip strictly empty rows

        // Clean currency strings: replace dots (thousands) and replace comma with dot (decimal), remove € space
        const cleanNumber = (str: string): number => {
          if (!str) return 0;
          let clean = str.replace(/[\s€]/g, '');
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

        list.push({
          description: descVal,
          cost: costVal,
          price: priceVal,
          quantity: qtyVal
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

  // Perform actual import to target section
  const executeImport = () => {
    if (parsedItems.length === 0) return;

    const itemsToInsert: BudgetItem[] = parsedItems.map(p => ({
      ...p,
      id: `item-${Date.now()}-${Math.floor(Math.random() * 100000)}`
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
    csvContent += 'Sección;Descripción del Artículo;Inversión Unitario (Coste);Precio Venta Unitario (PVP);Cantidad;Inversión Total;Venta Total (PVP);Beneficio Neto;Porcentaje Margen\r\n';

    sections.forEach(sec => {
      sec.items.forEach(it => {
        const invTotal = it.cost * it.quantity;
        const sellTotal = it.price * it.quantity;
        const profit = sellTotal - invTotal;
        const margin = it.price > 0 ? (profit / sellTotal) * 100 : 0;

        // Escape double quotes and semicolons in description
        const escapedDesc = it.description.replace(/"/g, '""');
        const escapedSec = sec.name.replace(/"/g, '""');

        csvContent += `"${escapedSec}";"${escapedDesc}";${it.cost.toFixed(2).replace('.', ',')};${it.price.toFixed(2).replace('.', ',')};${it.quantity.toString().replace('.', ',')};${invTotal.toFixed(2).replace('.', ',')};${sellTotal.toFixed(2).replace('.', ',')};${profit.toFixed(2).replace('.', ',')};${margin.toFixed(1).replace('.', ',')}%\r\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Presupuesto_Completo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download simple templates/CSVs
  const downloadTemplateCSV = (): void => {
    let csv = '\uFEFF';
    csv += 'Descripción;Coste Unitario de Inversión;Precio Venta Cliente;Cantidad\r\n';
    csv += 'Sofá rústico 3 plazas;350,00;680,00;1\r\n';
    csv += 'Lámparas de techo halógenas;15,50;29,90;4\r\n';
    csv += 'Mano de obra fontanería;120,00;200,00;1\r\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_presupuesto.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="py-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-display">Asistente de Importación Excel / CSV</h3>
              <p className="text-xs text-slate-500">Carga filas de manera masiva copiándolas de tu hoja de cálculo o importando un CSV</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 py-2 border-b border-slate-100 flex gap-4 text-sm font-semibold select-none">
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-2 px-1 border-b-2 transition ${activeTab === 'paste' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            1. Pegar columnas de Excel o Sheets
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-1 border-b-2 transition ${activeTab === 'upload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            2. Arrastrar archivo CSV
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 transition ${activeTab === 'export' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            3. Exportar Presupuesto completo
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          
          {/* Section Selector */}
          {activeTab !== 'export' && (
            <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold font-mono text-slate-500 uppercase tracking-wide">
                  Ambiente o Sección destino:
                </label>
                <span className="text-sm font-semibold text-slate-800">
                  Selecciona a qué cuarto o sección se agregarán los artículos importados.
                </span>
              </div>
              <select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-600 shadow-xs"
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
                  <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Clipboard className="w-4 h-4 text-slate-400" />
                    Pega tus datos aquí (copia la tabla desde Excel y pégala aquí):
                  </label>
                  <textarea
                    rows={6}
                    value={pasteContent}
                    onChange={e => setPasteContent(e.target.value)}
                    placeholder={`Por ejemplo:
Grifo de Baño\t50\t99,90\t2
Sofá Chaise\t450\t890,00\t1
Lámpara techo\t12\t25,00\t4`}
                    className="w-full text-sm font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:shadow-inner"
                  />
                </div>

                {/* Column Mapping Configurations */}
                <div className="p-4 bg-slate-100/60 border border-slate-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 font-mono tracking-wider uppercase">
                    Configurar Orden de Columnas
                  </h4>
                  <p className="text-xs text-slate-500">
                    Define en qué columna de tu Excel está cada dato (0 es la primera columna, 1 es la segunda, etc.)
                  </p>

                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-600">Descripción:</span>
                      <select
                        value={colMapping.desc}
                        onChange={e => setColMapping(prev => ({ ...prev, desc: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-600 font-mono"
                      >
                        {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-600">Inversión (Coste):</span>
                      <select
                        value={colMapping.cost}
                        onChange={e => setColMapping(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-600 font-mono"
                      >
                        {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-600">Precio Venta (PVP):</span>
                      <select
                        value={colMapping.price}
                        onChange={e => setColMapping(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-600 font-mono"
                      >
                        {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>Col {v}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-600">Cantidad:</span>
                      <select
                        value={colMapping.qty}
                        onChange={e => setColMapping(prev => ({ ...prev, qty: parseInt(e.target.value) }))}
                        className="bg-white border rounded px-1.5 py-1 text-xs outline-none focus:border-blue-600 font-mono"
                      >
                        {[0, 1, 2, 3, 4, 5].map(v => <option key={v} value={v}>Col {v}</option>)}
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
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar plantilla CSV ejemplo
                </button>

                <button
                  type="button"
                  disabled={!pasteContent.trim()}
                  onClick={handleParsePaste}
                  className="inline-flex items-center gap-2 py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-97 text-sm font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Procesar / Vista Previa
                </button>
              </div>

              {/* Error messages */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Parsing results table preview */}
              {parsedItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
                      Vista previa de filas procesadas ({parsedItems.length})
                    </h4>
                    <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5">
                      Confirmación requerida
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-[180px] border border-slate-200 rounded-xl">
                    <table className="w-full text-left border-collapse table-fixed min-w-[500px] text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="py-2 px-3 w-[50%]">Descripción parsed</th>
                          <th className="py-2 px-3 text-right">Inversión (Coste)</th>
                          <th className="py-2 px-3 text-right">Venta (PVP)</th>
                          <th className="py-2 px-3 text-right">Cant.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedItems.map((item, id) => (
                          <tr key={id} className="hover:bg-slate-50/50">
                            <td className="py-1.5 px-3 font-medium text-slate-900 truncate">{item.description}</td>
                            <td className="py-1.5 px-3 text-right font-mono text-slate-600">{item.cost.toFixed(2)} €</td>
                            <td className="py-1.5 px-3 text-right font-mono text-emerald-700 font-semibold">{item.price.toFixed(2)} €</td>
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
                      className="py-1.5 px-3 text-xs border rounded-lg text-slate-500 hover:bg-slate-50 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={executeImport}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white rounded-xl shadow-md transition"
                    >
                      <Check className="w-4 h-4" />
                      Importar {parsedItems.length} artículo(s) ahora
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
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition ${isDragging ? 'border-blue-600 bg-blue-50/20' : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/10'}`}
              >
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-800 text-base">Arrastra tu archivo CSV aquí</h4>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">
                  Soporta archivos de texto delimitados por comas o punto y coma (.csv, .txt) exportados desde Excel o Google Sheets.
                </p>
                <span className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition inline-flex items-center gap-1">
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

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Instrucciones de formato:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                  <li>El archivo CSV debe tener preferiblemente columnas en orden: <b>Descripción, Coste, Precio Venta y Cantidad</b>.</li>
                  <li>Al arrastrar el archivo, se cargará automáticamente en la sección de revisión para organizar las columnas antes de agregarlas.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: EXPORT FULL BUDGET */}
          {activeTab === 'export' && (
            <div className="space-y-6 text-center py-4">
              <div className="max-w-md mx-auto space-y-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full inline-block">
                  <FileCheck2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg font-display">Descargar Presupuesto Completo</h4>
                  <p className="text-slate-500 text-sm mt-1">
                    Crea un archivo CSV compatible con la configuración española de Excel (usa punto y coma como delimitador `;` y comas `,` para los decimales).
                  </p>
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-600 font-mono space-y-2">
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Áreas exportadas:</span>
                    <span className="font-bold">{sections.length} áreas</span>
                  </div>
                  <div className="flex justify-between border-b pb-1.5">
                    <span>Artículos totales:</span>
                    <span className="font-bold">{sections.reduce((ac, s) => ac + s.items.length, 0)} artículos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Presupuesto total (PVP):</span>
                    <span className="font-bold text-slate-900">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                        sections.reduce((ac, s) => ac + s.items.reduce((acc, it) => acc + (it.price * it.quantity), 0), 0)
                      )}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-97 text-sm font-semibold text-white shadow-lg transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Datos a CSV para Excel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer info message */}
        {successMessage && !errorMessage && (
          <div className="mx-6 mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="py-3 px-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs text-slate-500 font-semibold">
          <span>Sugerencia: Puedes usar esta función para rellenar de golpe cocinas enteras o suministros de fontanería.</span>
        </div>
      </div>
    </div>
  );
}
