/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  ArrowLeft, 
  Coins, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  AlertCircle,
  Hash,
  Info
} from 'lucide-react';
import { BudgetSection, BudgetMetadata } from '../types';

interface ClientBudgetViewProps {
  sections: BudgetSection[];
  metadata: BudgetMetadata;
  onUpdateMetadata: (metadata: BudgetMetadata) => void;
  onBackToEditor: () => void;
}

export function ClientBudgetView({ sections, metadata, onUpdateMetadata, onBackToEditor }: ClientBudgetViewProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  // Formatting helpers
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    sections.forEach(sec => {
      sec.items.forEach(it => {
        subtotal += (it.price || 0) * (it.quantity || 1);
      });
    });

    const vatAmount = subtotal * (metadata.vatRate / 100);
    const totalWithVat = metadata.includeVat ? subtotal + vatAmount : subtotal;

    return { subtotal, vatAmount, totalWithVat };
  };

  const { subtotal, vatAmount, totalWithVat } = calculateTotals();

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Text formatting generator for copying to email or Whatsapp
  const handleCopyToClipboard = () => {
    let txt = `PRESUPUESTO CLIENTE: ${metadata.projectName}\n`;
    txt += `Nº Presupuesto: ${metadata.budgetNumber} | Fecha: ${metadata.budgetDate}\n`;
    txt += `Validez hasta: ${metadata.validUntil}\n`;
    txt += `==========================================\n\n`;
    txt += `EMPRESA: ${metadata.companyName}\n`;
    txt += `CLIENTE: ${metadata.clientName}\n\n`;

    sections.forEach(sec => {
      if (sec.items.length === 0) return;
      txt += `🔹 ${sec.name.toUpperCase()}\n`;
      txt += `------------------------------------------\n`;
      sec.items.forEach((it, idx) => {
        const itemTotal = it.price * it.quantity;
        txt += `${idx + 1}. ${it.description} x ${it.quantity} ud(s) — Unit: ${formatEuro(it.price)} | Total: ${formatEuro(itemTotal)}\n`;
      });
      txt += `\n`;
    });

    txt += `==========================================\n`;
    txt += `SUBTOTAL: ${formatEuro(subtotal)}\n`;
    if (metadata.includeVat) {
      txt += `IVA (${metadata.vatRate}%): ${formatEuro(vatAmount)}\n`;
      txt += `TOTAL PRESUPUESTO (IVA Incluido): ${formatEuro(totalWithVat)}\n`;
    } else {
      txt += `TOTAL PRESUPUESTO: ${formatEuro(subtotal)}\n`;
    }
    txt += `\nCondiciones:\n${metadata.notes}\n`;

    navigator.clipboard.writeText(txt).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  };

  // Metadata input handlers
  const handleMetadataChange = <K extends keyof BudgetMetadata>(field: K, value: BudgetMetadata[K]) => {
    onUpdateMetadata({
      ...metadata,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Navigation and Print trigger (no-print) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4 no-print">
        <div>
          <button
            onClick={onBackToEditor}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 py-1.5 px-3 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a la Hoja de Trabajo (Excel)
          </button>
          
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2 mt-1">
            <FileText className="w-5 h-5 text-emerald-600" />
            Presupuesto Profesional Generado
          </h2>
          <p className="text-sm text-slate-500">
            Vista previa del presupuesto comercial para el cliente. Los importes de inversión y beneficios están ocultos.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`py-2 px-4 rounded-xl text-sm font-semibold border transition ${showConfig ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {showConfig ? 'Ocultar Datos Facturación' : 'Editar Datos Facturación'}
          </button>

          <button
            onClick={handleCopyToClipboard}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 active:scale-97 text-slate-700 transition"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Presupuesto Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar Texto
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-97 shadow-md transition"
          >
            <Printer className="w-4 h-4" />
            Imprimir o Guardar PDF
          </button>
        </div>
      </div>

      {/* Dynamic Billing Metadata Editor Form (no-print) */}
      {showConfig && (
        <div className="p-5 bg-slate-900 border border-slate-850 rounded-xl shadow-xl text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-5 no-print">
          
          {/* Company Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Tus Datos de Empresa (Emisor)
            </h4>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">Nombre Comercial o Empresa:</label>
              <input
                type="text"
                value={metadata.companyName}
                onChange={e => handleMetadataChange('companyName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400">NIF / CIF:</label>
                <input
                  type="text"
                  value={metadata.companyNif}
                  onChange={e => handleMetadataChange('companyNif', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400">Teléfono:</label>
                <input
                  type="text"
                  value={metadata.companyPhone}
                  onChange={e => handleMetadataChange('companyPhone', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Dirección Social:</label>
              <input
                type="text"
                value={metadata.companyAddress}
                onChange={e => handleMetadataChange('companyAddress', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
              />
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Datos del Cliente (Receptor)
            </h4>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400">Nombre del Cliente:</label>
              <input
                type="text"
                value={metadata.clientName}
                onChange={e => handleMetadataChange('clientName', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400">Teléfono Cliente:</label>
                <input
                  type="text"
                  value={metadata.clientPhone}
                  onChange={e => handleMetadataChange('clientPhone', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400">Correo Cliente:</label>
                <input
                  type="text"
                  value={metadata.clientEmail}
                  onChange={e => handleMetadataChange('clientEmail', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Ubicación Obra / Dirección:</label>
              <input
                type="text"
                value={metadata.clientAddress}
                onChange={e => handleMetadataChange('clientAddress', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
              />
            </div>
          </div>

          {/* Document configuration and VAT details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Fechas, Impuestos e ID
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400">Título Proyecto / Obra:</label>
                <input
                  type="text"
                  value={metadata.projectName}
                  onChange={e => handleMetadataChange('projectName', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400">Nº Presupuesto ID:</label>
                <input
                  type="text"
                  value={metadata.budgetNumber}
                  onChange={e => handleMetadataChange('budgetNumber', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400">Fecha Emisión:</label>
                <input
                  type="date"
                  value={metadata.budgetDate}
                  onChange={e => handleMetadataChange('budgetDate', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 px-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-400">Validez hasta:</label>
                <input
                  type="date"
                  value={metadata.validUntil}
                  onChange={e => handleMetadataChange('validUntil', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 px-1 text-sm font-medium text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={metadata.includeVat}
                  onChange={e => handleMetadataChange('includeVat', e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                Calcular IVA en el total
              </label>

              {metadata.includeVat && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium">% IVA:</span>
                  <select
                    value={metadata.vatRate}
                    onChange={e => handleMetadataChange('vatRate', parseInt(e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs font-bold text-white outline-none focus:border-emerald-500"
                  >
                    <option value={21}>21% General</option>
                    <option value={10}>10% Reducido</option>
                    <option value={4}>4% Superreducido</option>
                    <option value={0}>0% Sin IVA</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINT-READY CLIENT PROPOSAL CARD */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-lg p-8 sm:p-12 md:max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
        
        {/* Quote Header grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-300 pb-8">
          {/* Logo / Company Info */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-2 bg-emerald-600 rounded-xl text-white print:bg-emerald-600 print:text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight leading-none print:text-black">
                  {metadata.companyName || 'Presupuesto Comercial'}
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                Presupuestos de Reformas y Obras
              </p>
            </div>

            <div className="text-sm text-slate-500 font-serif leading-relaxed">
              <p className="font-semibold text-slate-700">{metadata.companyName}</p>
              <p className="text-xs">NIF: {metadata.companyNif}</p>
              <p className="text-xs">{metadata.companyAddress}</p>
              <p className="text-xs">E-mail: {metadata.companyEmail || 'obras@empresa.com'}</p>
              <p className="text-xs">Tlf: {metadata.companyPhone}</p>
            </div>
          </div>

          {/* Budget Registry Parameters */}
          <div className="flex flex-col justify-between items-start md:items-end text-left md:text-right space-y-4">
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 py-1.5 px-4 rounded-xl text-right inline-block print:bg-white print:border-slate-200">
              <span className="text-[10px] uppercase font-bold font-mono text-slate-400 block tracking-wider">
                Nº Control de Presupuesto
              </span>
              <span className="font-mono font-bold text-base block text-emerald-950 print:text-black">
                {metadata.budgetNumber}
              </span>
            </div>

            <div className="text-sm text-slate-600 font-mono leading-relaxed space-y-1">
              <div>
                <span className="text-slate-400 text-xs">Fecha Emisión:</span>{' '}
                <b className="text-slate-900">{metadata.budgetDate}</b>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Válido Hasta:</span>{' '}
                <b className="text-slate-900">{metadata.validUntil}</b>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Proyecto / Reforma:</span>{' '}
                <b className="text-slate-900 font-display block text-sm md:text-base leading-snug mt-1">
                  {metadata.projectName}
                </b>
              </div>
            </div>
          </div>
        </div>

        {/* Client details box */}
        <div className="mt-8 bg-slate-50/50 border border-slate-200 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 print:bg-white print:border-slate-300">
          <div>
            <h4 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase mb-2">
              Cliente Receptor:
            </h4>
            <p className="font-semibold text-slate-900 text-base">{metadata.clientName}</p>
            <p className="text-sm text-slate-500 mt-1">Contacto: {metadata.clientPhone}</p>
            <p className="text-sm text-slate-500">Email: {metadata.clientEmail}</p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase mb-2">
              Lugar de Ejecución de Trabajos:
            </h4>
            <p className="text-slate-700 text-sm font-medium leading-relaxed">
              {metadata.clientAddress || 'Misma dirección fiscal del emisor o a definir'}
            </p>
            <p className="text-xs text-slate-400 font-serif italic mt-2">
              Reforma residencial con materiales incluidos.
            </p>
          </div>
        </div>

        {/* Client budget item tables */}
        <div className="mt-10 space-y-8">
          {sections.map(sec => {
            if (sec.items.length === 0) return null;

            return (
              <div key={sec.id} className="space-y-2">
                <h3 className="font-display font-bold text-base text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                  <span>{sec.name}</span>
                  <span className="text-xs font-normal text-slate-400 italic">Materiales y trabajos seleccionados</span>
                </h3>

                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 text-xs font-medium uppercase font-mono py-1">
                      <th className="py-2 text-left w-[60%]">Descripción Detallada</th>
                      <th className="py-2 text-right w-[80px]">Cant.</th>
                      <th className="py-2 text-right w-[120px]">Imp. Unit.</th>
                      <th className="py-2 text-right w-[130px]">Importe Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {sec.items.map(it => {
                      const totalLine = (it.price || 0) * (it.quantity || 1);
                      return (
                        <tr key={it.id} className="hover:bg-slate-50/20">
                          <td className="py-2.5 text-slate-800 pr-4 leading-snug">{it.description || 'Artículo sin descripción'}</td>
                          <td className="py-2.5 text-right font-mono text-slate-600">{it.quantity}</td>
                          <td className="py-2.5 text-right font-mono text-slate-600">{formatEuro(it.price)}</td>
                          <td className="py-2.5 text-right font-mono text-slate-900 font-semibold">{formatEuro(totalLine)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Budget totals footer */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-3">
            <h4 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Términos Generales y Condiciones
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-serif whitespace-pre-wrap">
              {metadata.notes || 'No se han especificado cláusulas.'}
            </p>
          </div>

          <div className="md:col-span-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-3 font-mono print:bg-white print:border-slate-300">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Suma Base (Subtotal)</span>
              <span>{formatEuro(subtotal)}</span>
            </div>

            {metadata.includeVat ? (
              <>
                <div className="flex justify-between text-xs text-slate-500 border-b pb-2">
                  <span>Impuestos (IVA {metadata.vatRate}%)</span>
                  <span>{formatEuro(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-1 font-display">
                  <span>TOTAL ESTIMADO</span>
                  <span className="text-emerald-700 print:text-black">{formatEuro(totalWithVat)}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-right italic font-normal">
                  *IVA incluido en la cotización comercial
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-base font-bold text-slate-900 border-t pt-2 font-display">
                  <span>TOTAL NETO</span>
                  <span className="text-emerald-700 print:text-black">{formatEuro(subtotal)}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-right italic font-normal">
                  *Impuestos excluidos (Sujeto a IVA aplicable)
                </div>
              </>
            )}
          </div>
        </div>

        {/* Signature Box */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs text-slate-400">
          <div className="space-y-12">
            <p>Aceptado por el Cliente:</p>
            <div className="border-b border-slate-300 mx-auto w-40"></div>
            <p className="font-semibold text-slate-600">{metadata.clientName}</p>
          </div>
          <div className="space-y-12">
            <p>Emitido por la Empresa:</p>
            <div className="border-b border-slate-300 mx-auto w-40"></div>
            <p className="font-semibold text-slate-600">{metadata.companyName}</p>
          </div>
        </div>

      </div>

      <div className="no-print p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 max-w-lg mx-auto text-xs text-emerald-800">
        <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">💡 Consejos para la Impresión del Presupuesto Comercial:</span>
          <span className="text-[11px] text-slate-600 block mt-1">
            Al imprimir o guardar en su ordenador, configure el formato de destino en <b>"Guardar como PDF"</b>. Active la opción <b>"Esconder cabecera y pie de página"</b> y active el ajuste <b>"Imprimir colores de fondo"</b> si desea que destaque el diseño de manera idéntica.
          </span>
        </div>
      </div>

    </div>
  );
}
