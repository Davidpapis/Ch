/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Trash2, 
  RotateCcw, 
  Plus, 
  ChevronRight, 
  Info,
  Building,
  Check,
  AlertCircle,
  TrendingUp,
  Coins
} from 'lucide-react';
import { BudgetSection, BudgetMetadata } from './types';
import { INITIAL_SECTIONS, INITIAL_METADATA } from './initialData';
import { MetricCards } from './components/MetricCards';
import { ExcelGrid } from './components/ExcelGrid';
import { ExcelImporter } from './components/ExcelImporter';
import { ClientBudgetView } from './components/ClientBudgetView';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Application Mode: 'editor' (raw xls sheet setup) or 'client_budget' (gorgeous printable proposal PDF)
  const [appMode, setAppMode] = useState<'editor' | 'client_budget'>('editor');

  // Excel sections dataset
  const [sections, setSections] = useState<BudgetSection[]>(() => {
    const saved = localStorage.getItem('budget_sections');
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  // Client and billing metadata
  const [metadata, setMetadata] = useState<BudgetMetadata>(() => {
    const saved = localStorage.getItem('budget_metadata');
    return saved ? JSON.parse(saved) : INITIAL_METADATA;
  });

  // Importer state
  const [importerOpen, setImporterOpen] = useState(false);
  const [importerTargetSecId, setImporterTargetSecId] = useState<string | null>(null);

  // Auto-backup to local storage on every state transition
  useEffect(() => {
    localStorage.setItem('budget_sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('budget_metadata', JSON.stringify(metadata));
  }, [metadata]);

  // Calculations for KPI Cards
  const getTotals = () => {
    let totalInvestment = 0; // Purchase Cost Total
    let totalBudget = 0;     // Sales PVP Total
    
    sections.forEach(sec => {
      sec.items.forEach(it => {
        totalInvestment += (it.cost || 0) * (it.quantity || 0);
        totalBudget += (it.price || 0) * (it.quantity || 0);
      });
    });

    const totalProfit = totalBudget - totalInvestment;
    return { totalInvestment, totalBudget, totalProfit };
  };

  const { totalInvestment, totalBudget, totalProfit } = getTotals();

  // Reset to initial beautiful mock data
  const handleResetToDemo = () => {
    if (confirm('¿Deseas restablecer los datos de demostración en el presupuesto? Esto sobreescribirá tus celdas actuales.')) {
      setSections(INITIAL_SECTIONS);
      setMetadata(INITIAL_METADATA);
    }
  };

  // Clear all data to start fresh
  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que deseas vaciar toda la hoja? Se eliminarán todos los artículos y ambientes para empezar de cero.')) {
      const emptySections: BudgetSection[] = [
        {
          id: 'sec-banos',
          name: 'Baños',
          items: []
        },
        {
          id: 'sec-cocina',
          name: 'Cocina',
          items: []
        },
        {
          id: 'sec-salon',
          name: 'Salón',
          items: []
        }
      ];
      setSections(emptySections);
      
      const resetMeta = {
        ...INITIAL_METADATA,
        projectName: 'Nuevo Proyecto de Reforma',
        clientName: 'Cliente Nuevo',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        budgetNumber: `REF-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`
      };
      setMetadata(resetMeta);
    }
  };

  // Triggering import assistant specific to a category
  const openImporterForSectionId = (secId: string) => {
    setImporterTargetSecId(secId);
    setImporterOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 md:p-8 flex flex-col font-sans selection:bg-emerald-600 selection:text-white print:p-0">
      
      {/* PROFESSIONAL APPLICATION MAIN HEADER (no-print) */}
      <header className="no-print max-w-7xl mx-auto w-full mb-6 border border-slate-200 bg-white/95 backdrop-blur-md rounded-xl py-3 px-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight font-display">
              Presupuestos Master Pro <span className="font-normal text-slate-400">| Panel de Control</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Gestión de Reformas v2.4
            </p>
          </div>
        </div>

        {/* View Toggle (Editor spreadsheet vs Client document) */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100/80 rounded-lg flex gap-1 border border-slate-200/50">
            <button
              onClick={() => setAppMode('editor')}
              className={`inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${appMode === 'editor' ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/40 font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Vista Excel (Editor de Costes)
            </button>
            <button
              onClick={() => setAppMode('client_budget')}
              className={`inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-md text-xs font-semibold cursor-pointer transition-all duration-200 ${appMode === 'client_budget' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-850'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              Presupuesto Cliente
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Demonstration controls */}
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={handleResetToDemo}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-xl transition"
              title="Cargar ejemplo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearAll}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition"
              title="Vaciar todo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAMEWORK STAGE */}
      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        
        {/* KPI CARDS (Only show in workspace edit mode) */}
        {appMode === 'editor' && (
          <MetricCards 
            totalInvestment={totalInvestment}
            totalBudget={totalBudget}
            totalProfit={totalProfit}
          />
        )}

        {/* VIEW CONTROLLER */}
        <div className="flex-1">
          {appMode === 'editor' ? (
            <ExcelGrid 
              sections={sections}
              onUpdateSections={setSections}
              onOpenImporterForSection={openImporterForSectionId}
            />
          ) : (
            <ClientBudgetView 
              sections={sections}
              metadata={metadata}
              onUpdateMetadata={setMetadata}
              onBackToEditor={() => setAppMode('editor')}
            />
          )}
        </div>
      </main>

      {/* FOOTER CRUNCH */}
      <footer className="no-print max-w-7xl mx-auto w-full mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 mb-4 select-none">
        <p>
          &copy; {new Date().getFullYear()} PresuExcel. Guardado Localmente en tu Navegador.
        </p>
        <div className="flex gap-4">
          <a href="#" onClick={(e) => { e.preventDefault(); setAppMode('editor'); }} className="hover:underline">Hoja de Trabajo Excel</a>
          <span>&middot;</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setAppMode('client_budget'); }} className="hover:underline">Presupuesto para Cliente</a>
        </div>
      </footer>

      {/* DIALOG POPUP FOR BULK EXCEL CLIPBOARD IMPORTER */}
      {importerOpen && (
        <ExcelImporter 
          sections={sections}
          onUpdateSections={setSections}
          targetSectionId={importerTargetSecId}
          onClose={() => {
            setImporterOpen(false);
            setImporterTargetSecId(null);
          }}
        />
      )}
    </div>
  );
}
