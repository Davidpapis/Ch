/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Printer, 
  Copy, 
  Check, 
  ArrowLeft, 
  FileText, 
  Building2, 
  User, 
  Calendar,
  AlertCircle,
  Info,
  Sparkles,
  Quote,
  Briefcase
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
  const [showImages, setShowImages] = useState(true);
  const [isEditingConcept, setIsEditingConcept] = useState(false);
  const [tempConcept, setTempConcept] = useState(metadata.valoracionFinal || '');

  /**
   * SAFARI / WEBKIT PRINT FIX — JavaScript DOM Swap
   * -----------------------------------------------
   * CSS `break-inside: avoid` is ignored by Safari and Chrome when cards are
   * descendants of flex / grid containers (a long-standing browser engine bug).
   * The ONLY reliable cross-browser fix is to render cards as <tr> elements
   * inside a <table>, because table rows are the single layout primitive that
   * ALL browsers have always respected for page-break-inside: avoid.
   *
   * Strategy:
   *   beforeprint → hide each .lookbook-grid, insert a sibling <table> where
   *                 every <tr> contains 2 card clones side by side.
   *   afterprint  → remove the tables, un-hide the original grids.
   */
  useEffect(() => {
    const PRINT_TABLE_CLASS = 'lookbook-print-table';

    const buildPrintTable = (grid: Element): HTMLTableElement => {
      const table = document.createElement('table');
      table.className = PRINT_TABLE_CLASS;
      table.setAttribute('style', [
        'width:100%',
        'border-collapse:separate',
        'border-spacing:0 16px',
        'table-layout:fixed',
      ].join(';'));

      const cards = Array.from(grid.children) as HTMLElement[];
      let row: HTMLTableRowElement | null = null;

      cards.forEach((card, index) => {
        // Start a new row every 2 cards
        if (index % 2 === 0) {
          row = document.createElement('tr');
          // This is the magic: <tr> page-break-inside: avoid works in ALL browsers
          row.setAttribute('style', [
            'page-break-inside:avoid',
            'break-inside:avoid',
            '-webkit-column-break-inside:avoid',
          ].join(';'));
          table.appendChild(row);
        }

        const td = document.createElement('td');
        td.setAttribute('style', [
          'width:50%',
          'vertical-align:top',
          'padding:0 8px 0 0',
          'box-sizing:border-box',
        ].join(';'));

        // Deep clone preserves all inline styles and classes
        td.appendChild(card.cloneNode(true));
        row!.appendChild(td);

        // Odd card at the end of the list — add an empty sibling cell
        if (index % 2 === 0 && index === cards.length - 1) {
          const empty = document.createElement('td');
          empty.setAttribute('style', 'width:50%;');
          row!.appendChild(empty);
        }
      });

      return table;
    };

    const handleBeforePrint = () => {
      document.querySelectorAll('.lookbook-grid').forEach((grid) => {
        const el = grid as HTMLElement;
        // Mark as hidden (do not use display:none — it removes from layout tree)
        el.dataset.printHidden = '1';
        el.style.visibility = 'hidden';
        el.style.position = 'absolute';
        el.style.height = '0';
        el.style.overflow = 'hidden';

        const table = buildPrintTable(grid);
        // Insert the print table right after the original grid in the DOM
        if (el.nextSibling) {
          el.parentNode!.insertBefore(table, el.nextSibling);
        } else {
          el.parentNode!.appendChild(table);
        }
      });
    };

    const handleAfterPrint = () => {
      // Remove all injected print tables
      document.querySelectorAll('.' + PRINT_TABLE_CLASS).forEach((t) => t.remove());
      // Restore original grids
      document.querySelectorAll('.lookbook-grid').forEach((grid) => {
        const el = grid as HTMLElement;
        if (el.dataset.printHidden) {
          el.style.visibility = '';
          el.style.position = '';
          el.style.height = '';
          el.style.overflow = '';
          delete el.dataset.printHidden;
        }
      });
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  // Formatting helpers
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0; // Sum of all sections (already includes IVA)
    const sectionTotals: Record<string, number> = {};

    sections.forEach(sec => {
      let secSum = 0;
      sec.items.forEach(it => {
        secSum += (it.price || 0) * (it.quantity || 1);
      });
      subtotal += secSum;
      sectionTotals[sec.id] = secSum;
    });

    const vatRate = metadata.vatRate !== undefined ? metadata.vatRate : 21;
    const vatFactor = 1 + vatRate / 100;

    const subtotalSinIva = subtotal / vatFactor;

    const discountType = metadata.discountType || 'percent';
    const discountValue = metadata.discountValue !== undefined ? metadata.discountValue : (metadata.discountPercent || 0);

    let discountVal = 0; // Commercial discount with IVA
    if (discountType === 'percent') {
      discountVal = subtotal * (discountValue / 100);
    } else {
      discountVal = discountValue;
    }
    const discountValSinIva = discountVal / vatFactor;

    const adminExp = metadata.adminExpenses || 0;
    const adminExpensesType = metadata.adminExpensesType || 'amount';
    let adminExpBase = 0; // Excludes IVA

    if (adminExpensesType === 'percent') {
      adminExpBase = subtotalSinIva * (adminExp / 100);
    } else {
      adminExpBase = adminExp;
    }

    const adminExpWithIva = adminExpBase * vatFactor;
    const customAdjustments = metadata.customAdjustments || [];
    const customAdjustmentsSum = customAdjustments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const customAdjustmentsSumSinIva = customAdjustmentsSum / vatFactor;

    // Base Imponible = Total sin IVA de todo lo que se ha hecho
    const taxableBase = subtotalSinIva - discountValSinIva + adminExpBase + customAdjustmentsSumSinIva;

    const vatAmount = taxableBase * (vatRate / 100);
    const totalWithVat = taxableBase + vatAmount;

    return { 
      subtotal, 
      subtotalSinIva,
      sectionTotals, 
      discountType,
      discountValue,
      discountVal, 
      discountValSinIva,
      adminExp, 
      adminExpensesType,
      adminExpBase,
      adminExpWithIva,
      customAdjustments,
      customAdjustmentsSum,
      taxableBase, 
      vatAmount, 
      totalWithVat,
      vatRate,
      vatFactor
    };
  };

  const { 
    subtotal, 
    subtotalSinIva,
    sectionTotals, 
    discountType,
    discountValue,
    discountVal, 
    discountValSinIva,
    adminExp, 
    adminExpensesType,
    adminExpBase,
    adminExpWithIva,
    customAdjustments,
    customAdjustmentsSum,
    taxableBase, 
    vatAmount, 
    totalWithVat,
    vatRate,
    vatFactor
  } = calculateTotals();

  // Print function — window.print() triggers beforeprint synchronously before the dialog opens
  const handlePrint = () => {
    window.print();
  };

  // Text formatting generator for copying to email or Whatsapp
  const handleCopyToClipboard = () => {
    let txt = `PROSPECTO COMERCIAL DE INTERIORISMO\n`;
    txt += `ESTUDIO: ${metadata.companyName}\n`;
    txt += `PROYECTO: ${metadata.projectName}\n`;
    txt += `Nº Presupuesto: ${metadata.budgetNumber} | Fecha: ${metadata.budgetDate}\n`;
    txt += `Validez hasta: ${metadata.validUntil}\n`;
    txt += `==========================================\n\n`;
    txt += `CLIENTE: ${metadata.clientName}\n`;
    if (metadata.clientDni) {
      txt += `DNI/NIE/CIF: ${metadata.clientDni}\n`;
    }
    txt += `DIRECCIÓN DE OBRA: ${metadata.clientAddress}\n\n`;

    if (metadata.valoracionFinal) {
      txt += `MEMORIA DE DISEÑO:\n"${metadata.valoracionFinal}"\n\n`;
    }

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

    txt += `DESGLOSE POR SECCIONES:\n`;
    sections.forEach(sec => {
      const secSum = sectionTotals[sec.id] || 0;
      if (secSum === 0) return;
      txt += `- ${sec.name}: ${formatEuro(secSum)}\n`;
    });
    txt += `\n`;

    txt += `==========================================\n`;
    txt += `SUMA DE TODAS LAS SECCIONES:\n`;
    txt += `- Con IVA: ${formatEuro(subtotal)}\n`;
    txt += `- Sin IVA: ${formatEuro(subtotalSinIva)}\n`;
    
    if (discountVal > 0) {
      txt += `DESCUENTO COMERCIAL ${discountType === 'percent' ? `(${discountValue}%)` : ''}:\n`;
      txt += `- Con IVA: -${formatEuro(discountVal)}\n`;
      txt += `- Sin IVA: -${formatEuro(discountValSinIva)}\n`;
    }

    if (adminExp > 0) {
      txt += `GASTOS DE TRAMITACIÓN ${adminExpensesType === 'percent' ? `(${adminExp}%)` : ''}:\n`;
      txt += `- Sin IVA (Base): +${formatEuro(adminExpBase)}\n`;
      txt += `- Con IVA (+${vatRate}%): +${formatEuro(adminExpWithIva)}\n`;
    }

    customAdjustments.forEach(adj => {
      if (adj.amount) {
        txt += `${adj.label.toUpperCase()}: ${adj.amount < 0 ? '' : '+'}${formatEuro(adj.amount)}\n`;
      }
    });

    txt += `------------------------------------------\n`;
    txt += `BASE IMPONIBLE (Total sin IVA): ${formatEuro(taxableBase)}\n`;
    txt += `IVA (${vatRate}%): ${formatEuro(vatAmount)}\n`;
    txt += `TOTAL ESTIMADO (IVA Incluido): ${formatEuro(totalWithVat)}\n`;
    txt += `\nTérminos y Condiciones:\n${metadata.notes || 'Los plazos de entrega y condiciones particulares de pago se detallarán bajo firma de contrato ejecutivo. Precios válidos según la validez estipulada en cabecera.'}\n`;

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-sand-dark pb-4 no-print">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <button
              onClick={onBackToEditor}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-navy hover:text-brand-terracotta hover:bg-brand-sand/60 py-1.5 px-3 rounded-lg transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Volver a la Hoja de Trabajo (Excel)
            </button>

            <div className="flex bg-brand-sand-dark/60 p-1 rounded-xl border border-brand-sand-dark no-print w-fit">
              <button 
                onClick={() => setShowImages(false)} 
                className={`py-1 px-2.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all duration-200 ${!showImages ? 'bg-white text-brand-navy shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Formato Técnico
              </button>
              <button 
                onClick={() => setShowImages(true)} 
                className={`py-1 px-2.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all duration-200 ${showImages ? 'bg-brand-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Formato Editorial (Fotos)
              </button>
            </div>
          </div>
          
          <h2 className="text-xl font-bold font-display text-brand-navy flex items-center gap-2 mt-1">
            <Sparkles className="w-5 h-5 text-brand-terracotta" />
            Presupuesto Comercial Editorial
          </h2>
          <p className="text-xs text-slate-500">
            Diseño premium optimizado para el cliente. Los costes, distribuidores e información logística están 100% protegidos.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={handleCopyToClipboard}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold border border-brand-sand-dark bg-white hover:bg-brand-sand active:scale-97 text-brand-navy transition duration-200 cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-brand-olive" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar Texto
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 py-2 px-5 rounded-xl text-xs font-bold text-white bg-brand-terracotta hover:bg-brand-terracotta-dark active:scale-97 shadow-xs hover:shadow-md transition duration-200 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* PRINT-READY CLIENT PROPOSAL CARD */}
      <div className="bg-[#FCFAF8] border border-[#EFEAE2] rounded-3xl shadow-xl p-8 sm:p-14 md:max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:bg-white animate-fadeIn">
        
        {/* Quote Centered Luxury Header */}
        <div className="flex flex-col items-center text-center border-b border-brand-sand-dark pb-8">
          <img 
            src="/logo-110.png" 
            alt="Cristina Herrera Decoración" 
            className="h-16 md:h-20 w-auto object-contain mb-4"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center text-white font-serif font-bold text-xl shadow-xs tracking-widest mb-2';
                fallback.innerText = 'CH';
                parent.appendChild(fallback);
              }
            }}
          />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-brand-navy tracking-wide">
            Propuesta de Interiorismo & Decoración
          </h1>
          <div className="flex items-center justify-center gap-3 my-2.5">
            <div className="h-[1px] bg-brand-sand-dark w-12"></div>
            <Sparkles className="w-3.5 h-3.5 text-brand-terracotta" />
            <div className="h-[1px] bg-brand-sand-dark w-12"></div>
          </div>
          <p className="text-[10px] text-brand-olive uppercase font-mono tracking-widest font-semibold">
            {metadata.companyName || 'Cristina Herrera Decoración'}
          </p>
        </div>

        {/* Emisor / Metadata Split Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-brand-sand-dark">
          
          {/* Company details */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold font-mono tracking-widest text-brand-terracotta uppercase block">
              Estudio Creativo Emisor
            </span>
            <h3 className="font-serif font-bold text-base text-brand-navy">
              {metadata.companyName}
            </h3>
            <div className="text-xs text-slate-500 font-sans space-y-0.5 leading-relaxed">
              <p>NIF: <span className="font-medium text-brand-charcoal">{metadata.companyNif}</span></p>
              <p className="italic">{metadata.companyAddress}</p>
              <p>Email: <span className="text-brand-navy-light">{metadata.companyEmail || 'estudio@cristinaherrera.com'}</span></p>
              <p>Tlf: <span className="font-medium text-brand-charcoal">{metadata.companyPhone}</span></p>
            </div>
          </div>

          {/* Document metadata parameters */}
          <div className="flex flex-col md:items-end justify-between space-y-4 text-left md:text-right">
            <div className="bg-[#FAF7F2] border border-brand-sand-dark/60 py-2 px-5 rounded-2xl inline-block print:bg-white print:border-brand-sand-dark">
              <span className="text-[9px] uppercase font-bold font-mono text-brand-olive block tracking-widest leading-none mb-1">
                Referencia Propuesta
              </span>
              <span className="font-mono font-bold text-sm block text-brand-navy-dark leading-none">
                {metadata.budgetNumber}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-mono space-y-1">
              <div>
                <span className="text-slate-400">Fecha Propuesta:</span>{' '}
                <span className="text-brand-navy font-semibold">{metadata.budgetDate}</span>
              </div>
              <div>
                <span className="text-slate-400">Oferta Válida Hasta:</span>{' '}
                <span className="text-brand-navy font-semibold">{metadata.validUntil}</span>
              </div>
              <div>
                <span className="text-slate-400">Proyecto Residencial:</span>{' '}
                <span className="text-brand-terracotta font-bold font-serif block text-sm leading-tight mt-0.5">
                  {metadata.projectName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client details card with premium styling */}
        <div className="mt-8 bg-[#FAF7F2]/60 border border-[#EFEAE2] p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden avoid-page-break print:bg-white print:border-brand-sand-dark">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-sand-dark via-brand-terracotta to-brand-sand-dark"></div>
          <div>
            <span className="text-[9px] font-bold font-mono tracking-widest text-brand-terracotta uppercase block mb-1">
              Cliente Destinatario
            </span>
            <p className="font-serif font-bold text-base text-brand-navy">{metadata.clientName}</p>
            <div className="text-xs text-slate-500 mt-2 space-y-0.5 font-sans">
              <p>DNI/NIE/CIF: <span className="text-brand-charcoal font-semibold font-mono">{metadata.clientDni || '—'}</span></p>
              <p>Contacto: <span className="text-brand-charcoal font-medium">{metadata.clientPhone || '—'}</span></p>
              <p>E-mail: <span className="text-brand-charcoal font-medium">{metadata.clientEmail || '—'}</span></p>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-bold font-mono tracking-widest text-brand-olive uppercase block mb-1">
                Lugar de Ejecución / Dirección
              </span>
              <p className="text-brand-navy text-xs font-semibold leading-relaxed">
                {metadata.clientAddress || 'Dirección de obra a detallar en fase de contrato.'}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-serif italic mt-2">
              Fase de estudio y prescripción de materiales seleccionados.
            </p>
          </div>
        </div>

        {/* EDITORIAL BLOCK: VALORACIÓN FINAL (Memoria de Diseño) */}
        <div className={`my-10 p-8 bg-[#FAF6F0] border border-[#EFEAE2] rounded-2xl relative overflow-hidden avoid-page-break group ${!metadata.valoracionFinal ? 'print:hidden' : ''}`}>
          <Quote className="absolute -top-3 -left-3 w-16 h-16 text-[#EFEAE2]/40 transform -scale-x-100 select-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-[9px] font-mono font-bold tracking-widest text-brand-terracotta uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-terracotta animate-pulse"></span>
                Memoria de Diseño & Concepto Creativo
              </h4>
              {!isEditingConcept && (
                <button
                  onClick={() => {
                    setTempConcept(metadata.valoracionFinal || '');
                    setIsEditingConcept(true);
                  }}
                  className="text-xs text-brand-terracotta hover:text-brand-terracotta/80 font-mono font-bold tracking-wider uppercase transition border border-transparent hover:border-brand-terracotta/20 rounded-lg px-2.5 py-1 bg-white shadow-xs print:hidden cursor-pointer"
                >
                  Editar Concepto
                </button>
              )}
            </div>

            {isEditingConcept ? (
              <div className="space-y-3 pt-2">
                <textarea
                  rows={6}
                  value={tempConcept}
                  onChange={(e) => setTempConcept(e.target.value)}
                  placeholder="Escribe la memoria de diseño y concepto creativo de esta propuesta..."
                  className="w-full bg-white border border-[#EFEAE2] rounded-xl px-4 py-3 text-brand-navy outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition font-serif italic text-base leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingConcept(false)}
                    className="px-4 py-1.5 border border-slate-200 text-slate-500 rounded-xl text-xs font-mono tracking-wider uppercase bg-white hover:bg-slate-55 font-bold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      onUpdateMetadata({
                        ...metadata,
                        valoracionFinal: tempConcept
                      });
                      setIsEditingConcept(false);
                    }}
                    className="px-4 py-1.5 bg-brand-terracotta text-white rounded-xl text-xs font-mono tracking-wider uppercase font-bold hover:bg-brand-terracotta/90 transition shadow-xs cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-serif italic text-brand-navy text-base md:text-lg leading-relaxed text-justify whitespace-pre-wrap mt-2">
                {metadata.valoracionFinal || 'No se ha definido una memoria de diseño o concepto creativo para este presupuesto. Haz clic en "Editar Concepto" para escribir una.'}
              </p>
            )}
          </div>
        </div>

        {/* CLIENT BUDGET ITEM TABLES */}
        <div className="mt-10 space-y-12">
          {sections.map(sec => {
            if (sec.items.length === 0) return null;

            return (
              <div key={sec.id} className="space-y-4">
                {/* Elegant serif room layout header */}
                <div className="flex items-baseline justify-between border-b border-brand-sand-dark pb-2 avoid-page-break-after">
                  <h3 className="font-serif font-bold text-xl md:text-2xl text-brand-navy tracking-wide flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-terracotta shrink-0" />
                    {sec.name}
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-olive font-semibold">
                    {sec.items.length} {sec.items.length === 1 ? 'Concepto' : 'Conceptos'}
                  </span>
                </div>

                {/* Table or Lookbook details with absolute client privacy */}
                {showImages ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lookbook-grid">
                    {sec.items.map(it => {
                      const totalLine = (it.price || 0) * (it.quantity || 1);
                      const hasImage = !!it.imageUrl;
                      return (
                        <div key={it.id} className="avoid-page-break h-full flex flex-col">
                          <div 
                            className={`bg-white rounded-2xl border border-[#EFEAE2] overflow-hidden flex ${hasImage ? 'flex-col sm:flex-row' : 'flex-col p-4 sm:p-5'} h-full min-h-[10rem] hover:border-brand-terracotta/40 hover:shadow-sm transition-all duration-300`}
                          >
                            {/* Left [40%] Image Area */}
                            {hasImage && (
                              <div className="w-full sm:w-[40%] bg-brand-sand/20 flex-shrink-0 relative min-h-[8rem] sm:min-h-full">
                                <img
                                  src={it.imageUrl}
                                  alt={it.description}
                                  className="w-full h-full object-cover rounded-t-2xl sm:rounded-r-none sm:rounded-l-2xl absolute inset-0"
                                />
                              </div>
                            )}

                            {/* Information Area */}
                            <div className={`flex flex-col justify-between flex-grow ${hasImage ? 'p-4 sm:p-5' : ''}`}>
                              <div>
                                {/* Estancia room badge & quantity */}
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="px-2 py-0.5 rounded-md text-[9px] uppercase font-mono tracking-widest bg-brand-sand text-brand-navy font-bold">
                                    {sec.name}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-brand-sand-dark/40 text-brand-navy font-mono">
                                    {it.quantity} {it.quantity === 1 ? 'Ud.' : 'Uds.'}
                                  </span>
                                </div>

                                {/* Product title */}
                                <h4 className={`font-serif font-bold text-brand-navy text-sm md:text-base leading-relaxed ${hasImage ? 'line-clamp-3' : ''}`}>
                                  {it.description || 'Artículo sin descripción especificada'}
                                </h4>
                              </div>

                              {/* Price lines */}
                              <div className="mt-4 pt-3 border-t border-brand-sand-dark/50 flex flex-col justify-end space-y-1 font-mono text-xs">
                                <div className="flex justify-between text-[10px] text-slate-500">
                                  <span>P.V.P. Unitario</span>
                                  <span>{formatEuro(it.price)}</span>
                                </div>
                                <div className="flex justify-between items-baseline font-bold text-brand-navy pt-0.5">
                                  <span>Importe</span>
                                  <span className="text-sm font-semibold font-display text-brand-terracotta">{formatEuro(totalLine)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-brand-sand-dark text-brand-olive font-semibold tracking-wider text-[11px] uppercase font-mono">
                          <th className="py-3 text-left w-[60%]">Descripción Concepto / Mobiliario / Material</th>
                          <th className="py-3 text-right w-[80px]">Cant.</th>
                          <th className="py-3 text-right w-[120px]">P.V.P. Unit.</th>
                          <th className="py-3 text-right w-[130px]">Importe Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-sand-dark/50 font-medium text-brand-charcoal">
                        {sec.items.map(it => {
                          const totalLine = (it.price || 0) * (it.quantity || 1);
                          return (
                            <tr key={it.id} className="hover:bg-brand-sand/20 transition-colors duration-150 avoid-page-break">
                              <td className="py-3.5 pr-4 text-brand-navy font-sans text-sm font-medium leading-relaxed">
                                {it.description || 'Artículo sin descripción especificada'}
                              </td>
                              <td className="py-3.5 text-right font-mono text-xs text-slate-500 font-normal">
                                {it.quantity}
                              </td>
                              <td className="py-3.5 text-right font-mono text-xs text-slate-500 font-normal">
                                {formatEuro(it.price)}
                              </td>
                              <td className="py-3.5 text-right font-display text-sm text-brand-navy font-semibold">
                                {formatEuro(totalLine)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Budget totals footer */}
        <div className="mt-14 pt-8 border-t border-brand-sand-dark space-y-8 avoid-page-break">
          
          {/* General Terms and payment conditions - Full Width */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold font-mono tracking-widest text-brand-terracotta uppercase flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-brand-olive shrink-0" />
              Términos Generales & Condiciones de Pago
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-serif whitespace-pre-wrap pl-5 italic">
              {metadata.notes || 'Los plazos de entrega y condiciones particulares de pago se detallarán bajo firma de contrato ejecutivo. Precios válidos según la validez estipulada en cabecera.'}
            </p>
          </div>

          {/* New Full Width Economic Summary & Breakdown */}
          <div className="space-y-6">
            {/* Sections sum breakdown list - Full Width */}
            <div className="bg-[#FAF7F2]/50 p-6 rounded-2xl border border-brand-sand-dark/60 space-y-4 print:bg-white">
              <span className="text-[10px] font-bold text-brand-olive uppercase block tracking-widest font-mono border-b border-brand-sand-dark/40 pb-2">
                Desglose Detallado por Secciones (IVA Incluido)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-sans text-xs">
                {sections.map(sec => {
                  const secSum = sectionTotals[sec.id] || 0;
                  if (secSum === 0) return null;
                  return (
                    <div key={sec.id} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-brand-sand-dark/30 shadow-2xs">
                      <span className="font-medium text-slate-700 truncate pr-2">{sec.name}</span>
                      <span className="font-mono font-bold text-brand-navy shrink-0">{formatEuro(secSum)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Premium Commercial Invoice Totals Table - Full Width */}
            <div className="bg-[#FAF7F2] p-8 rounded-2xl border border-brand-sand-dark space-y-4 print:bg-white print:border-brand-sand-dark animate-fadeIn">
              
              <div className="border-b border-brand-sand-dark/50 pb-4">
                <span className="text-[10px] font-bold text-brand-olive uppercase block tracking-widest font-mono">
                  Resumen y Liquidación de Presupuesto
                </span>
              </div>

              {/* Grid / List of key financial metrics */}
              <div className="space-y-3 font-sans text-xs">
                
                {/* 1. Sum of all sections */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-1 text-slate-700">
                  <span className="font-medium">Suma de todas las Secciones</span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px]">
                    <span className="bg-brand-sand/40 px-2 py-0.5 rounded text-slate-600">
                      Sin IVA: <span className="font-bold text-brand-navy">{formatEuro(subtotalSinIva)}</span>
                    </span>
                    <span className="bg-brand-sand-dark/40 px-2 py-0.5 rounded text-slate-800">
                      Con IVA (21%): <span className="font-bold text-brand-navy">{formatEuro(subtotal)}</span>
                    </span>
                  </div>
                </div>

                {/* 2. Commercial Discount */}
                {discountVal > 0 && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-1 border-t border-brand-sand-dark/30 pt-2 text-slate-700">
                    <span className="font-medium">
                      Descuento Comercial {discountType === 'percent' ? `(${discountValue}%)` : ''}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px]">
                      <span className="bg-red-50/60 px-2 py-0.5 rounded text-red-700">
                        Sin IVA: <span className="font-bold">-{formatEuro(discountValSinIva)}</span>
                      </span>
                      <span className="bg-red-100/60 px-2 py-0.5 rounded text-red-800">
                        Con IVA: <span className="font-bold">-{formatEuro(discountVal)}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. Administrative Expenses */}
                {adminExp > 0 && (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-1 border-t border-brand-sand-dark/30 pt-2 text-slate-700">
                    <span className="font-medium">
                      Gastos de Tramitación y Gestión {adminExpensesType === 'percent' ? `(${adminExp}%)` : ''}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px]">
                      <span className="bg-brand-sand/40 px-2 py-0.5 rounded text-brand-navy">
                        Base (Sin IVA): <span className="font-bold">+{formatEuro(adminExpBase)}</span>
                      </span>
                      <span className="bg-brand-sand-dark/40 px-2 py-0.5 rounded text-brand-navy">
                        Con IVA (+{vatRate}%): <span className="font-bold">+{formatEuro(adminExpWithIva)}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Custom adjustments */}
                {customAdjustments && customAdjustments.map((adj) => {
                  if (!adj.amount) return null;
                  const isNegative = adj.amount < 0;
                  const adjSinIva = adj.amount / vatFactor;
                  return (
                    <div key={adj.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-1 border-t border-brand-sand-dark/30 pt-2 text-slate-700 animate-fadeIn">
                      <span className="font-medium">{adj.label || 'Concepto Personalizado'}</span>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded ${isNegative ? 'bg-red-50/60 text-red-700' : 'bg-brand-sand/40 text-brand-navy'}`}>
                          Sin IVA: <span className="font-bold">{isNegative ? '-' : '+'}{formatEuro(Math.abs(adjSinIva))}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded ${isNegative ? 'bg-red-100/60 text-red-800' : 'bg-brand-sand-dark/40 text-brand-navy'}`}>
                          Con IVA: <span className="font-bold">{isNegative ? '-' : '+'}{formatEuro(Math.abs(adj.amount))}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 5. Taxable Base */}
                <div className="flex justify-between items-center border-t border-brand-sand-dark/50 pt-3 mt-3">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Base Imponible</span>
                  <span className="font-mono font-bold text-sm text-brand-navy bg-white py-1 px-3 rounded-lg border border-brand-sand-dark/30 shadow-2xs">
                    {formatEuro(taxableBase)}
                  </span>
                </div>

                {/* 6. Taxes (IVA 21%) */}
                {metadata.includeVat ? (
                  <>
                    <div className="flex justify-between items-center border-b border-[#FAF7F2] pb-3">
                      <span className="font-semibold text-slate-500">IVA Aplicable ({vatRate}%)</span>
                      <span className="font-mono font-bold text-brand-navy">{formatEuro(vatAmount)}</span>
                    </div>

                    {/* 7. Total Estimado */}
                    <div className="flex justify-between items-baseline pt-4 border-t border-brand-sand-dark/30">
                      <span className="font-serif font-bold text-sm text-brand-navy tracking-wide">TOTAL ESTIMADO</span>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl text-brand-terracotta font-bold font-display leading-none">
                          {formatEuro(totalWithVat)}
                        </span>
                        <span className="text-[10px] text-slate-400 block italic font-normal mt-1">
                          *Impuestos incluidos en esta cotización
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Total Estimado (Without VAT) */}
                    <div className="flex justify-between items-baseline border-t border-brand-sand-dark pt-4">
                      <span className="font-serif font-bold text-sm text-brand-navy tracking-wide">TOTAL NETO ESTIMADO</span>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl text-brand-terracotta font-bold font-display leading-none">
                          {formatEuro(taxableBase)}
                        </span>
                        <span className="text-[10px] text-slate-400 block italic font-normal mt-1">
                          *Cotización neta exenta de IVA aplicable
                        </span>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Signature Box */}
        <div className="mt-14 pt-10 border-t border-brand-sand-dark grid grid-cols-2 gap-12 text-center text-xs text-slate-400 avoid-page-break">
          <div className="space-y-14">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Conformidad y Aceptación Cliente</p>
            <div className="border-b border-brand-sand-dark/60 mx-auto w-44"></div>
            <div>
              <p className="font-serif text-sm font-bold text-brand-navy">{metadata.clientName}</p>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                DNI/NIE/CIF: {metadata.clientDni || '___________________'}
              </p>
            </div>
          </div>
          <div className="space-y-14">
            <p className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Dirección Facultativa del Estudio</p>
            <div className="border-b border-brand-sand-dark/60 mx-auto w-44"></div>
            <div>
              <p className="font-serif text-sm font-bold text-brand-navy">{metadata.companyName}</p>
              {metadata.companyNif && (
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">NIF: {metadata.companyNif}</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Luxury PDF printing tip block */}
      <div className="no-print p-5 bg-brand-sand/50 border border-brand-sand-dark rounded-2xl flex items-start gap-3 max-w-lg mx-auto text-[11px] text-brand-navy">
        <AlertCircle className="w-4 h-4 text-brand-terracotta shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-600">
          <span className="font-bold text-brand-navy block">💡 Consejos del Estudio para Guardar o Imprimir en PDF:</span>
          <p>
            Para obtener un catálogo en PDF impecable de alta gama:
          </p>
          <ul className="list-disc pl-4 mt-1 space-y-0.5">
            <li>Seleccione el destino de impresión como <b>"Guardar como PDF"</b>.</li>
            <li>En los ajustes avanzados, marque obligatoriamente la casilla de <b>"Gráficos de fondo"</b> para renderizar los colores Lino, Arena y Terracota.</li>
            <li>Desmarque <b>"Cabeceras y pies de página"</b> para evitar textos por defecto del navegador en los márgenes de página.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
