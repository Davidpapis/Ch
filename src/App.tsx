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
  LayoutDashboard,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { BudgetSection, BudgetMetadata, Supplier, Budget } from './types';
import { INITIAL_SECTIONS, INITIAL_METADATA, INITIAL_BUDGETS, INITIAL_SUPPLIERS } from './initialData';
import { MetricCards } from './components/MetricCards';
import { ExcelGrid } from './components/ExcelGrid';
import { ExcelImporter } from './components/ExcelImporter';
import { ClientBudgetView } from './components/ClientBudgetView';
import { DashboardPanel } from './components/DashboardPanel';
import { LandingPanel } from './components/LandingPanel';

export default function App() {
  // Application Mode: 'landing' (multi-budget welcome), 'editor' (spreadsheet), 'client_budget' (premium proposal), or 'dashboard' (analysis)
  const [appMode, setAppMode] = useState<'landing' | 'editor' | 'client_budget' | 'dashboard'>('landing');

  // Multi-project budgets list
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budget_catalog');
    let loaded: Budget[] = [];
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing budget_catalog", e);
        loaded = [...INITIAL_BUDGETS];
      }
    } else {
      loaded = [...INITIAL_BUDGETS];
    }
    
    // Auto-inject the imported Los Naranjos budget if not already in catalog
    const hasImported = loaded.some(b => b.id === 'budget-los-naranjos');
    if (!hasImported) {
      const importedBudget = INITIAL_BUDGETS.find(b => b.id === 'budget-los-naranjos');
      if (importedBudget) {
        loaded = [importedBudget, ...loaded]; // Put it first for direct visibility!
        localStorage.setItem('budget_catalog', JSON.stringify(loaded));
      }
    }
    return loaded;
  });

  // Selected Budget ID
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>(() => {
    const saved = localStorage.getItem('selected_budget_id');
    const viewedKey = 'naranjos_imported_viewed';
    const hasViewedImported = localStorage.getItem(viewedKey);
    
    if (!hasViewedImported) {
      localStorage.setItem(viewedKey, 'true');
      localStorage.setItem('selected_budget_id', 'budget-los-naranjos');
      return 'budget-los-naranjos';
    }
    
    if (saved && budgets.some(b => b.id === saved)) {
      return saved;
    }
    return budgets[0]?.id || 'budget-los-naranjos';
  });

  // Suppliers Directory
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('frequent_suppliers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing frequent_suppliers", e);
      }
    }
    return INITIAL_SUPPLIERS;
  });

  // Active workspace section items
  const [sections, setSections] = useState<BudgetSection[]>(() => {
    const active = budgets.find(b => b.id === selectedBudgetId) || budgets[0];
    return active ? active.sections : INITIAL_SECTIONS;
  });

  // Active client metadata
  const [metadata, setMetadata] = useState<BudgetMetadata>(() => {
    const active = budgets.find(b => b.id === selectedBudgetId) || budgets[0];
    return active ? active.metadata : INITIAL_METADATA;
  });

  // Importer state
  const [importerOpen, setImporterOpen] = useState(false);
  const [importerTargetSecId, setImporterTargetSecId] = useState<string | null>(null);

  // Sync loaded budget state when selectedBudgetId changes
  useEffect(() => {
    const active = budgets.find(b => b.id === selectedBudgetId);
    if (active) {
      setSections(active.sections);
      setMetadata(active.metadata);
    }
  }, [selectedBudgetId]);

  // Sync databases to localStorage
  useEffect(() => {
    localStorage.setItem('budget_catalog', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('selected_budget_id', selectedBudgetId);
  }, [selectedBudgetId]);

  useEffect(() => {
    localStorage.setItem('frequent_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  // Setters that propagate changes back to the active budget inside budgets catalog
  const handleUpdateSections = (newSections: BudgetSection[]) => {
    setSections(newSections);
    setBudgets(prev => prev.map(b => {
      if (b.id === selectedBudgetId) {
        return {
          ...b,
          sections: newSections,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }));
  };

  const handleUpdateMetadata = (newMetadata: BudgetMetadata) => {
    setMetadata(newMetadata);
    setBudgets(prev => prev.map(b => {
      if (b.id === selectedBudgetId) {
        return {
          ...b,
          metadata: newMetadata,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }));
  };

  // Calculations for KPI Cards
  const getTotals = () => {
    let totalInvestment = 0; // Purchase Cost Total (already containing IVA)
    let totalBudgetRaw = 0;   // Sales PVP Total before global adjustments (already containing IVA)
    
    sections.forEach(sec => {
      sec.items.forEach(it => {
        const qty = it.quantity || 0;
        totalInvestment += (it.cost || 0) * qty;
        totalBudgetRaw += (it.price || 0) * qty;
      });
    });

    const vatRate = metadata.vatRate || 21;
    const vatFactor = 1 + vatRate / 100;

    const discountType = metadata.discountType || 'percent';
    const discountValue = metadata.discountValue !== undefined ? metadata.discountValue : (metadata.discountPercent || 0);

    let discountVal = 0; // Contains IVA
    if (discountType === 'percent') {
      discountVal = totalBudgetRaw * (discountValue / 100);
    } else {
      discountVal = discountValue;
    }

    const adminExpValue = metadata.adminExpenses || 0;
    const adminExpensesType = metadata.adminExpensesType || 'amount';
    let adminExpBase = 0; // Excludes IVA

    if (adminExpensesType === 'percent') {
      // Applied to subtotal without IVA
      adminExpBase = (totalBudgetRaw / vatFactor) * (adminExpValue / 100);
    } else {
      adminExpBase = adminExpValue;
    }

    const adminExpWithIva = adminExpBase * vatFactor;
    const customAdjustments = metadata.customAdjustments || [];
    const customAdjustmentsSum = customAdjustments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // Total budget matches totalWithVat in proposal (contains IVA)
    const totalBudget = totalBudgetRaw - discountVal + adminExpWithIva + customAdjustmentsSum;
    const totalProfit = totalBudget - totalInvestment;

    return { totalInvestment, totalBudget, totalProfit };
  };

  const { totalInvestment, totalBudget, totalProfit } = getTotals();

  // Reset active budget to demo data
  const handleResetToDemo = () => {
    if (confirm('¿Deseas restablecer los datos de demostración en este presupuesto? Esto sobreescribirá tus celdas actuales con el ejemplo de Cristina Herrera Decoración.')) {
      handleUpdateSections(INITIAL_SECTIONS);
      handleUpdateMetadata(INITIAL_METADATA);
    }
  };

  // Clear all data to start fresh on active budget
  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que deseas vaciar toda la hoja de este proyecto? Se eliminarán todos los artículos y ambientes para empezar de cero.')) {
      const emptySections: BudgetSection[] = [
        {
          id: 'sec-salon-' + Date.now(),
          name: 'Salón',
          items: []
        },
        {
          id: 'sec-cocina-' + Date.now(),
          name: 'Cocina',
          items: []
        },
        {
          id: 'sec-banos-' + Date.now(),
          name: 'Baños',
          items: []
        }
      ];
      handleUpdateSections(emptySections);
      
      const resetMeta = {
        ...INITIAL_METADATA,
        projectName: 'Nuevo Proyecto de Reforma',
        clientName: 'Cliente Nuevo',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        budgetNumber: `CH-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
        valoracionFinal: ''
      };
      handleUpdateMetadata(resetMeta);
    }
  };

  // Triggering import assistant
  const openImporterForSectionId = (secId: string | null) => {
    setImporterTargetSecId(secId);
    setImporterOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] p-4 sm:p-6 md:p-8 flex flex-col font-sans selection:bg-brand-terracotta selection:text-white print:p-0">
      
      {/* PROFESSIONAL APPLICATION MAIN HEADER (no-print) */}
      <header className="no-print max-w-7xl mx-auto w-full mb-6 border border-brand-sand-dark bg-white/95 backdrop-blur-md rounded-2xl py-3 px-6 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-auto flex items-center justify-center">
            {/* Elegant luxury branding text or logo */}
            <img 
              src="/logo-110.png" 
              alt="Cristina Herrera" 
              className="h-9 w-auto object-contain cursor-pointer"
              onClick={() => setAppMode('landing')}
              onError={(e) => {
                // Fallback to elegant initials if image fails or path is wrong
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center text-white font-serif font-bold text-base shadow-sm tracking-widest cursor-pointer';
                  fallback.innerText = 'CH';
                  fallback.onclick = () => setAppMode('landing');
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          <div className="h-8 w-px bg-brand-sand-dark hidden sm:block"></div>
          <div>
            <h1 
              onClick={() => setAppMode('landing')}
              className="text-sm font-bold text-brand-navy tracking-wide font-display flex items-center gap-1.5 uppercase cursor-pointer hover:text-brand-terracotta transition duration-155"
            >
              Cristina Herrera <span className="font-normal text-slate-400">| Control de Presupuestos</span>
            </h1>
            <p className="text-[10px] text-brand-olive font-semibold tracking-wider font-mono uppercase">
              Estudio de Interiorismo & Diseño v3.0
            </p>
          </div>
        </div>

        {/* View Toggle (Landing Dashboard vs Editor spreadsheet vs Client document vs Dashboard analytics) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="p-1.5 bg-brand-sand-dark/60 rounded-xl flex gap-1 border border-brand-sand-dark">
            <button
              onClick={() => setAppMode('landing')}
              className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${appMode === 'landing' ? 'bg-brand-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Briefcase className="w-3.5 h-3.5 text-brand-terracotta" />
              Estudio / Proyectos
            </button>

            <button
              onClick={() => setAppMode('editor')}
              className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${appMode === 'editor' ? 'bg-white text-brand-navy shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-brand-olive" />
              Hoja de Trabajo
            </button>
            
            <button
              onClick={() => setAppMode('dashboard')}
              className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${appMode === 'dashboard' ? 'bg-brand-navy text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Métricas
            </button>

            <button
              onClick={() => setAppMode('client_budget')}
              className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 ${appMode === 'client_budget' ? 'bg-brand-terracotta text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-850'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              Propuesta Cliente
            </button>
          </div>

          <div className="h-6 w-px bg-brand-sand-dark hidden lg:block"></div>

          {/* Demonstration controls */}
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={handleResetToDemo}
              className="p-2 text-slate-400 hover:text-brand-olive hover:bg-white rounded-lg border border-transparent hover:border-brand-sand-dark transition"
              title="Restablecer plantilla CH Decoración"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearAll}
              className="p-2 text-slate-400 hover:text-brand-terracotta hover:bg-white rounded-lg border border-transparent hover:border-brand-sand-dark transition"
              title="Vaciar todo el presupuesto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* CORE FRAMEWORK STAGE */}
      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        
        {/* ACTIVE PROJECT INFO BANNER & KPI CARDS (Only show in workspace edit mode) */}
        {appMode === 'editor' && (
          <div className="space-y-4 mb-4 no-print">
            <div className="bg-[#FCFAF8] border border-brand-sand-dark/80 rounded-2xl p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-3xs">
              <div className="flex items-center gap-3">
                <div className="bg-brand-navy/10 text-brand-navy p-2 rounded-xl shrink-0">
                  <Briefcase className="w-5 h-5 text-brand-terracotta" />
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block">Proyecto Activo</span>
                  <h2 className="text-base md:text-lg font-serif font-bold text-brand-navy leading-tight flex flex-wrap items-center gap-2 mt-0.5">
                    {metadata.projectName}
                    <span className="text-[10px] font-mono font-bold text-brand-olive bg-brand-olive/10 border border-brand-olive/20 px-2 py-0.5 rounded-full inline-block">
                      {metadata.budgetNumber}
                    </span>
                  </h2>
                  <span className="text-xs text-slate-500 font-sans block mt-0.5">
                    Receptor: <strong className="text-slate-700">{metadata.clientName}</strong> &middot; Obra: <span className="italic">{metadata.clientAddress || 'Sin Dirección'}</span>
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setAppMode('landing')}
                className="sm:self-center self-start inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-brand-navy hover:text-white bg-white hover:bg-brand-navy border border-brand-sand-dark hover:border-brand-navy transition duration-150 cursor-pointer shadow-3xs shrink-0"
              >
                Cambiar Proyecto
              </button>
            </div>

            <MetricCards 
              totalInvestment={totalInvestment}
              totalBudget={totalBudget}
              totalProfit={totalProfit}
            />
          </div>
        )}

        {/* VIEW CONTROLLER */}
        <div className="flex-1">
          {appMode === 'landing' && (
            <LandingPanel
              budgets={budgets}
              suppliers={suppliers}
              onSelectBudget={setSelectedBudgetId}
              onUpdateBudgets={setBudgets}
              onUpdateSuppliers={setSuppliers}
              onEnterEditor={() => setAppMode('editor')}
            />
          )}
          {appMode === 'editor' && (
            <ExcelGrid 
              sections={sections}
              onUpdateSections={handleUpdateSections}
              onOpenImporterForSection={openImporterForSectionId}
              suppliers={suppliers}
              metadata={metadata}
              onUpdateMetadata={handleUpdateMetadata}
            />
          )}
          {appMode === 'client_budget' && (
            <ClientBudgetView 
              sections={sections}
              metadata={metadata}
              onUpdateMetadata={handleUpdateMetadata}
              onBackToEditor={() => setAppMode('editor')}
            />
          )}
          {appMode === 'dashboard' && (
            <DashboardPanel 
              sections={sections}
              metadata={metadata}
              onUpdateSections={handleUpdateSections}
              onClose={() => setAppMode('editor')}
            />
          )}
        </div>
      </main>

      {/* FOOTER CRUNCH */}
      <footer className="no-print max-w-7xl mx-auto w-full mt-12 pt-6 border-t border-brand-sand-dark flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4 mb-4 select-none">
        <p className="font-medium text-slate-500">
          &copy; {new Date().getFullYear()} Cristina Herrera Decoración. Guardado Localmente en tu Navegador.
        </p>
        <div className="flex gap-4 font-semibold">
          <a href="#" onClick={(e) => { e.preventDefault(); setAppMode('landing'); }} className="hover:text-brand-terracotta transition">Estudio / Proyectos</a>
          <span className="text-slate-300">&middot;</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setAppMode('editor'); }} className="hover:text-brand-olive transition">Hoja de Trabajo Excel</a>
          <span className="text-slate-300">&middot;</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setAppMode('dashboard'); }} className="hover:text-brand-navy transition">Métricas del Proyecto</a>
          <span className="text-slate-300">&middot;</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setAppMode('client_budget'); }} className="hover:text-brand-terracotta transition">Propuesta para Cliente</a>
        </div>
      </footer>

      {/* DIALOG POPUP FOR BULK EXCEL CLIPBOARD IMPORTER */}
      {importerOpen && (
        <ExcelImporter 
          sections={sections}
          onUpdateSections={handleUpdateSections}
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
