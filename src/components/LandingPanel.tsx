/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  FolderPlus, 
  Trash2, 
  Copy, 
  Search, 
  LayoutDashboard, 
  Truck, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Phone, 
  Mail, 
  Tag, 
  ArrowRight,
  Plus,
  Briefcase,
  X,
  FileCheck2,
  Trash
} from 'lucide-react';
import { Budget, Supplier, BudgetSection } from '../types';

interface LandingPanelProps {
  budgets: Budget[];
  suppliers: Supplier[];
  onSelectBudget: (id: string) => void;
  onUpdateBudgets: (budgets: Budget[]) => void;
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
  onEnterEditor: () => void;
}

export function LandingPanel({ 
  budgets, 
  suppliers, 
  onSelectBudget, 
  onUpdateBudgets, 
  onUpdateSuppliers,
  onEnterEditor
}: LandingPanelProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'crm' | 'suppliers'>('projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [yearFilter, setYearFilter] = useState<string>('todos');
  const [quarterFilter, setQuarterFilter] = useState<string>('todos');
  const [crmViewMode, setCrmViewMode] = useState<'grouped' | 'list'>('grouped');
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  
  // New budget dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newStatus, setNewStatus] = useState<Budget['status']>('borrador');

  // New supplier state
  const [isAddSupOpen, setIsAddSupOpen] = useState(false);
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supCategory, setSupCategory] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');

  // Currency Formatter
  const formatEuro = (val: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
  };

  // Helper to extract quarter from date string YYYY-MM-DD
  const getQuarterFromDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const month = parseInt(dateStr.substring(5, 7), 10);
    if (isNaN(month)) return null;
    if (month >= 1 && month <= 3) return 'T1';
    if (month >= 4 && month <= 6) return 'T2';
    if (month >= 7 && month <= 9) return 'T3';
    if (month >= 10 && month <= 12) return 'T4';
    return null;
  };

  // Derive unique years dynamically from budgets list
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    budgets.forEach(b => {
      if (b.metadata.budgetDate) {
        const year = b.metadata.budgetDate.substring(0, 4);
        if (year && !isNaN(Number(year))) {
          years.add(year);
        }
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [budgets]);

  // Financial KPIs Calculations across all budgets
  const kpis = useMemo(() => {
    let totalPVP = 0;
    let totalCost = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let draftCount = 0;

    budgets.forEach(b => {
      // Calculate budgets by status
      if (b.status === 'aprobado') approvedCount++;
      else if (b.status === 'pendiente') pendingCount++;
      else if (b.status === 'borrador') draftCount++;

      // Accumulate financials
      b.sections.forEach(s => {
        s.items.forEach(it => {
          const qty = it.quantity || 0;
          totalPVP += (it.price || 0) * qty;
          totalCost += (it.cost || 0) * qty;
        });
      });
    });

    const totalProfit = totalPVP - totalCost;
    const profitMargin = totalPVP > 0 ? (totalProfit / totalPVP) * 100 : 0;

    return {
      totalPVP,
      totalCost,
      totalProfit,
      profitMargin,
      approvedCount,
      pendingCount,
      draftCount,
      totalCount: budgets.length
    };
  }, [budgets]);

  // Aggregate pending logictics ('pedido' or 'retrasado') across ALL projects
  const pendingOrders = useMemo(() => {
    const ordersList: Array<{
      budgetId: string;
      budgetNumber: string;
      projectName: string;
      itemId: string;
      description: string;
      quantity: number;
      distributor: string;
      availability: 'pedido' | 'retrasado';
      reference?: string;
    }> = [];

    budgets.forEach(b => {
      b.sections.forEach(s => {
        s.items.forEach(it => {
          if (it.availability === 'pedido' || it.availability === 'retrasado') {
            ordersList.push({
              budgetId: b.id,
              budgetNumber: b.metadata.budgetNumber,
              projectName: b.metadata.projectName,
              itemId: it.id,
              description: it.description,
              quantity: it.quantity,
              distributor: it.distributor,
              availability: it.availability,
              reference: it.reference
            });
          }
        });
      });
    });

    return ordersList;
  }, [budgets]);

  // Filtered Budgets for the Catalog List
  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const matchSearch = 
        b.metadata.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.metadata.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.metadata.budgetNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = 
        statusFilter === 'todos' || 
        b.status === statusFilter || 
        (statusFilter === 'pendientes' && b.status === 'pendiente');

      let matchYear = true;
      if (yearFilter !== 'todos' && b.metadata.budgetDate) {
        matchYear = b.metadata.budgetDate.substring(0, 4) === yearFilter;
      }

      let matchQuarter = true;
      if (quarterFilter !== 'todos' && b.metadata.budgetDate) {
        const q = getQuarterFromDate(b.metadata.budgetDate);
        matchQuarter = q === quarterFilter;
      }

      return matchSearch && matchStatus && matchYear && matchQuarter;
    });
  }, [budgets, searchTerm, statusFilter, yearFilter, quarterFilter]);

  // Filtered Suppliers for the Directory List
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const search = supplierSearch.toLowerCase().trim();
      if (!search) return true;
      return (
        s.name.toLowerCase().includes(search) ||
        (s.category && s.category.toLowerCase().includes(search)) ||
        (s.email && s.email.toLowerCase().includes(search)) ||
        (s.phone && s.phone.toLowerCase().includes(search))
      );
    });
  }, [suppliers, supplierSearch]);

  // Filtered pending orders based on CRM search query
  const filteredCrmOrders = useMemo(() => {
    return pendingOrders.filter(ord => {
      const q = crmSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        ord.description.toLowerCase().includes(q) ||
        ord.projectName.toLowerCase().includes(q) ||
        ord.distributor.toLowerCase().includes(q) ||
        (ord.reference && ord.reference.toLowerCase().includes(q))
      );
    });
  }, [pendingOrders, crmSearchQuery]);

  // Pending orders grouped by project
  const ordersGroupedByProject = useMemo(() => {
    const groups: {
      [budgetId: string]: {
        projectName: string;
        budgetNumber: string;
        budgetId: string;
        items: typeof pendingOrders;
      }
    } = {};

    filteredCrmOrders.forEach(ord => {
      if (!groups[ord.budgetId]) {
        groups[ord.budgetId] = {
          projectName: ord.projectName,
          budgetNumber: ord.budgetNumber,
          budgetId: ord.budgetId,
          items: []
        };
      }
      groups[ord.budgetId].items.push(ord);
    });

    return Object.values(groups);
  }, [filteredCrmOrders]);

  // 1. Create a New Empty Budget
  const handleCreateBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newClientName) {
      alert('Por favor, ingresa el nombre del proyecto y del cliente.');
      return;
    }

    const newId = `budget-${Date.now()}`;
    const budgetYear = new Date().getFullYear();
    const randNum = Math.floor(Math.random() * 900 + 100);
    const newBudgetNumber = `CH-${budgetYear}-${randNum}`;

    const defaultSections: BudgetSection[] = [
      { id: 'salon-' + Date.now(), name: 'Salón', items: [] },
      { id: 'cocina-' + Date.now(), name: 'Cocina', items: [] },
      { id: 'banos-' + Date.now(), name: 'Baños', items: [] }
    ];

    const newBudget: Budget = {
      id: newId,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      metadata: {
        projectName: newProjName,
        clientName: newClientName,
        clientEmail: newClientEmail,
        clientPhone: newClientPhone,
        clientAddress: newClientAddress,
        budgetDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budgetNumber: newBudgetNumber,
        companyName: 'Cristina Herrera Decoración',
        companyNif: 'B-88776655',
        companyAddress: 'Calle de Serrano 45, Planta 2, 28001 Madrid',
        companyEmail: 'estudio@cristinaherrera.com',
        companyPhone: '+34 910 123 456',
        notes: 'Precios válidos por 30 días. Los plazos de ejecución se acordarán tras la firma del contrato y la aceptación formal del presupuesto. El pago se realizará mediante transferencia bancaria (40% al inicio del proyecto, 40% a la llegada de materiales principales, y 20% a la entrega de llaves y memoria final de obra). El presupuesto no incluye tasas municipales de licencias de obra menor.',
        vatRate: 21,
        includeVat: true,
        valoracionFinal: `Estudio conceptual inicial para la reforma e interiorismo del espacio de ${newClientName}.`
      },
      sections: defaultSections
    };

    const updated = [newBudget, ...budgets];
    onUpdateBudgets(updated);
    
    // Select the new budget and route directly to the spreadsheet editor
    onSelectBudget(newId);
    onEnterEditor();
    
    // Reset form states
    setNewProjName('');
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientAddress('');
    setNewStatus('borrador');
    setIsCreateOpen(false);
  };

  // 2. Clone/Duplicate an existing budget
  const handleCloneBudget = (b: Budget, e: React.MouseEvent) => {
    e.stopPropagation();
    const clonedId = `budget-${Date.now()}`;
    const newNumber = `CH-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`;
    const clonedBudget: Budget = {
      ...b,
      id: clonedId,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...b.metadata,
        projectName: `${b.metadata.projectName} (Copia)`,
        budgetNumber: newNumber
      },
      // Deep copy sections
      sections: b.sections.map(s => ({
        ...s,
        id: `sec-${Date.now()}-${Math.random()}`,
        items: s.items.map(it => ({ ...it, id: `it-${Date.now()}-${Math.random()}` }))
      }))
    };

    onUpdateBudgets([clonedBudget, ...budgets]);
  };

  // 3. Delete a budget
  const handleDeleteBudget = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Estás seguro de que deseas eliminar el presupuesto de "${name}"? Esta acción no se puede deshacer.`)) {
      const updated = budgets.filter(b => b.id !== id);
      onUpdateBudgets(updated);
    }
  };

  // 4. Change status direct dropdown
  const handleStatusChange = (id: string, status: Budget['status'], e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const updated = budgets.map(b => {
      if (b.id === id) {
        return { ...b, status, updatedAt: new Date().toISOString() };
      }
      return b;
    });
    onUpdateBudgets(updated);
  };

  // 5. Add registered supplier submit
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) {
      alert('El nombre comercial del proveedor es obligatorio.');
      return;
    }

    const newSup: Supplier = {
      id: `sup-${Date.now()}`,
      name: supName,
      phone: supPhone,
      email: supEmail,
      category: supCategory
    };

    onUpdateSuppliers([newSup, ...suppliers]);
    setSupName('');
    setSupPhone('');
    setSupEmail('');
    setSupCategory('');
    setIsAddSupOpen(false);
  };

  // 6. Delete supplier
  const handleDeleteSupplier = (id: string) => {
    if (confirm('¿Deseas eliminar este proveedor de la lista frecuente?')) {
      const updated = suppliers.filter(s => s.id !== id);
      onUpdateSuppliers(updated);
    }
  };

  // Calculate project values inside list
  const getBudgetTotals = (b: Budget) => {
    let priceSum = 0;
    let costSum = 0;
    b.sections.forEach(s => {
      s.items.forEach(it => {
        const qty = it.quantity || 0;
        priceSum += (it.price || 0) * qty;
        costSum += (it.cost || 0) * qty;
      });
    });
    return {
      priceTotal: priceSum,
      profitTotal: priceSum - costSum
    };
  };

  return (
    <div className="space-y-6">
      
      {/* 1. FINANCIAL DASHBOARD KPI HEADER SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI: Active Business potential volume */}
        <div className="bg-white border border-brand-sand-dark p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block">Facturación Activa</span>
            <span className="text-xl md:text-2xl font-bold font-display text-brand-navy block mt-1 font-mono">{formatEuro(kpis.totalPVP)}</span>
            <span className="text-xs font-serif text-brand-olive block mt-0.5">{kpis.totalCount} Proyectos Totales</span>
          </div>
          <div className="p-3 bg-brand-sand rounded-xl text-brand-navy shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Expected business profit */}
        <div className="bg-white border border-brand-sand-dark p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block">Margen de Beneficio</span>
            <span className="text-xl md:text-2xl font-bold font-display text-brand-terracotta block mt-1 font-mono">{formatEuro(kpis.totalProfit)}</span>
            <span className="text-xs font-semibold text-brand-olive bg-brand-olive/10 px-2 py-0.5 rounded-full inline-block mt-1">
              Media: {kpis.profitMargin.toFixed(1)}% Margen
            </span>
          </div>
          <div className="p-3 bg-brand-sand rounded-xl text-brand-terracotta shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Pending logistic items across all budgets */}
        <div 
          onClick={() => {
            setActiveTab('crm');
            setCrmViewMode('grouped');
          }}
          className="bg-white border border-brand-sand-dark p-5 rounded-2xl flex items-center justify-between shadow-xs hover:border-brand-terracotta cursor-pointer transition-all duration-200 group active:scale-98"
        >
          <div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block group-hover:text-brand-terracotta transition">Pedidos Pendientes</span>
            <span className="text-xl md:text-2xl font-bold font-display text-brand-navy block mt-1 font-mono">
              {pendingOrders.length} Artículos
            </span>
            <span className="text-xs text-brand-terracotta font-serif font-bold block mt-0.5">
              En tránsito por recibir
            </span>
          </div>
          <div className="p-3 bg-brand-sand rounded-xl text-brand-olive group-hover:bg-brand-terracotta/10 group-hover:text-brand-terracotta shrink-0 transition-all duration-200">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Project Status Distribution count */}
        <div className="bg-white border border-brand-sand-dark p-5 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-slate-400 uppercase block">Estados del Catálogo</span>
            <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500 font-mono">
              <span className="flex items-center gap-0.5 text-brand-olive">
                <CheckCircle className="w-3.5 h-3.5" /> {kpis.approvedCount}
              </span>
              <span className="flex items-center gap-0.5 text-brand-terracotta">
                <Clock className="w-3.5 h-3.5" /> {kpis.pendingCount}
              </span>
              <span className="flex items-center gap-0.5 text-slate-400">
                <FileText className="w-3.5 h-3.5" /> {kpis.draftCount}
              </span>
            </div>
          </div>
          <div className="p-3 bg-brand-sand rounded-xl text-brand-olive shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. TABBED MANAGEMENT INTERFACE CONTAINER */}
      <div className="bg-white border border-brand-sand-dark rounded-2xl shadow-xs overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="bg-brand-sand/30 border-b border-brand-sand-dark px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex border border-brand-sand-dark/80 p-1 bg-[#FCFAF8] rounded-xl">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${activeTab === 'projects' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-500 hover:text-brand-navy'}`}
            >
              <Briefcase className="w-3.5 h-3.5 inline mr-1.5" />
              Proyectos y Presupuestos
            </button>
            <button
              onClick={() => setActiveTab('crm')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${activeTab === 'crm' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-500 hover:text-brand-navy'}`}
            >
              <Truck className="w-3.5 h-3.5 inline mr-1.5" />
              Pedidos CRM Logístico
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`py-2 px-4 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${activeTab === 'suppliers' ? 'bg-brand-navy text-white shadow-xs' : 'text-slate-500 hover:text-brand-navy'}`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1.5" />
              Directorio de Proveedores
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {activeTab === 'projects' && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-white bg-brand-terracotta hover:bg-brand-terracotta-dark shadow-xs transition duration-200 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                Nuevo Presupuesto
              </button>
            )}

            {activeTab === 'suppliers' && (
              <button
                onClick={() => setIsAddSupOpen(true)}
                className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-white bg-brand-olive hover:bg-brand-olive-dark shadow-xs transition duration-200 cursor-pointer w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                Alta Proveedor
              </button>
            )}
          </div>
        </div>

        {/* Tab Body Render Panel */}
        <div className="p-6">
          
          {/* A. PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar presupuesto por nombre, cliente, número..."
                    className="w-full pl-9 pr-4 py-2 border border-brand-sand-dark rounded-xl text-xs text-brand-navy outline-none bg-[#FCFAF8] focus:border-brand-terracotta transition"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-[#FCFAF8] border border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy outline-none font-semibold focus:border-brand-terracotta cursor-pointer"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="borrador">⚪ Borradores</option>
                    <option value="pendiente">🟡 Pendientes</option>
                    <option value="aprobado">🟢 Aprobados</option>
                    <option value="terminado">🟢 Terminados</option>
                    <option value="rechazado">🔴 Rechazados</option>
                  </select>

                  <select
                    value={yearFilter}
                    onChange={e => setYearFilter(e.target.value)}
                    className="bg-[#FCFAF8] border border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy outline-none font-semibold focus:border-brand-terracotta cursor-pointer"
                  >
                    <option value="todos">Todos los Años</option>
                    {availableYears.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>

                  <select
                    value={quarterFilter}
                    onChange={e => setQuarterFilter(e.target.value)}
                    className="bg-[#FCFAF8] border border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy outline-none font-semibold focus:border-brand-terracotta cursor-pointer"
                  >
                    <option value="todos">Todos los Trimestres</option>
                    <option value="T1">T1 (Ene - Mar)</option>
                    <option value="T2">T2 (Abr - Jun)</option>
                    <option value="T3">T3 (Jul - Sep)</option>
                    <option value="T4">T4 (Oct - Dic)</option>
                  </select>
                </div>
              </div>

              {/* Budgets List Grid/Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-brand-sand-dark text-brand-olive font-bold uppercase tracking-wider text-[10px] pb-2 font-mono">
                      <th className="py-3 px-3">Código ID</th>
                      <th className="py-3 px-3">Proyecto / Obra</th>
                      <th className="py-3 px-3">Cliente Receptor</th>
                      <th className="py-3 px-3 text-right">Importe PVP</th>
                      <th className="py-3 px-3 text-right">Beneficio Est.</th>
                      <th className="py-3 px-3">Estado</th>
                      <th className="py-3 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sand-dark/50 text-brand-charcoal font-medium">
                    {filteredBudgets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400 font-serif italic text-sm">
                          No se han encontrado presupuestos en el catálogo activo.
                        </td>
                      </tr>
                    ) : (
                      filteredBudgets.map(b => {
                        const { priceTotal, profitTotal } = getBudgetTotals(b);
                        
                        return (
                          <tr 
                            key={b.id} 
                            onClick={() => onSelectBudget(b.id)}
                            className="hover:bg-brand-sand/15 transition duration-150 cursor-pointer"
                          >
                            <td className="py-3.5 px-3 font-mono font-bold text-brand-navy">
                              {b.metadata.budgetNumber}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="font-serif font-bold text-sm text-brand-navy block leading-snug">
                                {b.metadata.projectName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">Actualizado: {new Date(b.updatedAt).toLocaleDateString()}</span>
                            </td>
                            <td className="py-3.5 px-3 text-slate-600">
                              {b.metadata.clientName}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-brand-navy">
                              {formatEuro(priceTotal)}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-brand-terracotta">
                              {formatEuro(profitTotal)}
                            </td>
                            <td className="py-3.5 px-3" onClick={e => e.stopPropagation()}>
                              <select
                                value={b.status}
                                onChange={e => handleStatusChange(b.id, e.target.value as Budget['status'], e)}
                                className={`text-[10px] font-bold rounded-full px-2.5 py-1 border outline-none font-mono ${
                                  b.status === 'aprobado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  b.status === 'pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  b.status === 'terminado' ? 'bg-brand-olive/10 text-brand-olive border-brand-olive/20' :
                                  'bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                              >
                                <option value="borrador">⚪ Borrador</option>
                                <option value="pendiente">🟡 Pendiente</option>
                                <option value="aprobado">🟢 Aprobado</option>
                                <option value="terminado">🟢 Terminado</option>
                                <option value="rechazado">🔴 Rechazado</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-3 text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={(e) => { onSelectBudget(b.id); onEnterEditor(); }}
                                  className="p-1.5 bg-[#FAF7F2] hover:bg-brand-sand border border-brand-sand-dark text-brand-navy rounded-lg transition"
                                  title="Editar Presupuesto"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleCloneBudget(b, e)}
                                  className="p-1.5 bg-[#FAF7F2] hover:bg-brand-sand border border-brand-sand-dark text-brand-olive rounded-lg transition"
                                  title="Duplicar Presupuesto"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteBudget(b.id, b.metadata.projectName, e)}
                                  className="p-1.5 bg-[#FAF7F2] hover:bg-brand-terracotta/10 border border-brand-sand-dark hover:border-brand-terracotta/20 text-brand-terracotta rounded-lg transition"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* B. CRM LOGISTICS TAB (ORDERS OVERVIEW) */}
          {activeTab === 'crm' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header Selector dual-view */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAF7F2] border border-brand-sand-dark/60 p-5 rounded-2xl shadow-xs">
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-brand-navy text-sm flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-terracotta" />
                    Gestión Logística & Control de Mercancías
                  </h4>
                  <p className="text-slate-500 text-xs pl-5.5">
                    Controla y supervisa los artículos de todos tus proyectos activos en estado <b>"Pedido"</b> o <b>"Retrasado"</b>.
                  </p>
                </div>

                {/* Alternador de Vista Estilo Premium */}
                <div className="flex items-center bg-white border border-brand-sand-dark rounded-xl p-1 shrink-0 shadow-xs self-start md:self-auto">
                  <button
                    onClick={() => setCrmViewMode('grouped')}
                    className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      crmViewMode === 'grouped'
                        ? 'bg-brand-navy text-white shadow-xs'
                        : 'text-slate-500 hover:text-brand-navy'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Agrupado por Proyecto
                  </button>
                  <button
                    onClick={() => setCrmViewMode('list')}
                    className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                      crmViewMode === 'list'
                        ? 'bg-brand-navy text-white shadow-xs'
                        : 'text-slate-500 hover:text-brand-navy'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    Lista unificada
                  </button>
                </div>
              </div>

              {/* Barra de búsqueda para CRM si hay artículos en total */}
              {pendingOrders.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={crmSearchQuery}
                    onChange={e => setCrmSearchQuery(e.target.value)}
                    placeholder="Buscar por artículo, proyecto, distribuidor, referencia..."
                    className="w-full pl-10 pr-4 py-2.5 border border-brand-sand-dark rounded-xl text-xs text-brand-navy outline-none bg-[#FCFAF8] focus:border-brand-terracotta transition"
                  />
                  {crmSearchQuery && (
                    <button
                      onClick={() => setCrmSearchQuery('')}
                      className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-brand-navy"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Contenido según vista seleccionada */}
              {filteredCrmOrders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-brand-sand-dark rounded-2xl shadow-xs p-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h5 className="font-serif font-bold text-brand-navy text-base">¡Logística al día!</h5>
                  <p className="text-slate-400 text-xs max-w-md mx-auto">
                    {crmSearchQuery 
                      ? 'No hay artículos en tránsito que coincidan con los criterios de búsqueda actuales.'
                      : 'No tienes ningún artículo marcado como "Pedido" o "Retrasado" en ninguna de tus obras de interiorismo activas.'
                    }
                  </p>
                  {crmSearchQuery && (
                    <button
                      onClick={() => setCrmSearchQuery('')}
                      className="text-xs font-bold text-brand-terracotta hover:underline mt-2 block mx-auto cursor-pointer"
                    >
                      Limpiar Filtro de Búsqueda
                    </button>
                  )}
                </div>
              ) : crmViewMode === 'grouped' ? (
                /* VISTA AGRUPADA POR PROYECTO */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ordersGroupedByProject.map(group => (
                    <div 
                      key={group.budgetId} 
                      className="bg-white border border-brand-sand-dark rounded-2xl shadow-xs overflow-hidden flex flex-col hover:border-brand-olive transition-all duration-200"
                    >
                      {/* Cabecera del Proyecto */}
                      <div className="bg-brand-sand/15 border-b border-brand-sand-dark/60 p-4 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-bold text-brand-navy text-sm">{group.projectName}</h4>
                          <span className="text-[10px] font-mono text-brand-olive font-bold block">{group.budgetNumber}</span>
                        </div>
                        <span className="bg-brand-terracotta/10 text-brand-terracotta text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full shrink-0">
                          {group.items.length} {group.items.length === 1 ? 'artículo' : 'artículos'}
                        </span>
                      </div>

                      {/* Lista de Artículos */}
                      <div className="p-4 flex-1 space-y-3">
                        {group.items.map(it => (
                          <div 
                            key={it.itemId} 
                            className="flex items-start justify-between gap-3 text-xs p-3 bg-brand-sand/5 hover:bg-brand-sand/15 border border-brand-sand-dark/30 rounded-xl transition duration-150"
                          >
                            <div className="space-y-1.5">
                              <p className="font-bold text-brand-navy leading-snug">{it.description}</p>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {it.reference && (
                                  <span className="bg-brand-navy/5 text-brand-navy border border-brand-navy/10 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                    REF: {it.reference}
                                  </span>
                                )}
                                <span className="bg-brand-sand-dark/40 text-brand-navy text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                                  {it.distributor}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 space-y-1.5">
                              <span className="font-mono font-bold text-brand-navy block">{it.quantity} uds</span>
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold rounded-full px-2 py-0.5 ${
                                it.availability === 'retrasado'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                              }`}>
                                {it.availability === 'retrasado' ? <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> : <Clock className="w-2.5 h-2.5 shrink-0" />}
                                {it.availability === 'retrasado' ? 'RETRASADO' : 'PEDIDO'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pie con Enlace Directo */}
                      <div className="bg-[#FAF7F2] border-t border-brand-sand-dark/40 p-3 text-right">
                        <button
                          onClick={() => { onSelectBudget(group.budgetId); onEnterEditor(); }}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg border border-brand-sand-dark bg-white hover:bg-brand-sand text-[10px] font-bold text-brand-navy hover:scale-102 transition duration-200 cursor-pointer active:scale-97"
                        >
                          Gestionar Obra / Abrir Excel
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* VISTA DE LISTA UNIFICADA (TABLA PLANA) */
                <div className="overflow-x-auto border border-brand-sand-dark rounded-2xl bg-white shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-brand-sand-dark text-brand-olive font-bold uppercase tracking-wider text-[10px] pb-2 font-mono bg-brand-sand/10">
                        <th className="py-3 px-4">Artículo / Descripción</th>
                        <th className="py-3 px-4">Obra / Proyecto</th>
                        <th className="py-3 px-4">Distribuidor</th>
                        <th className="py-3 px-4 text-right">Cant.</th>
                        <th className="py-3 px-4">Estado Logístico</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-sand-dark/50 text-brand-charcoal font-medium">
                      {filteredCrmOrders.map((ord, idx) => (
                        <tr key={`${ord.budgetId}-${ord.itemId}-${idx}`} className="hover:bg-brand-sand/15 transition duration-150">
                          <td className="py-3 px-4">
                            <div className="font-bold text-brand-navy">{ord.description}</div>
                            {ord.reference && (
                              <span className="inline-block mt-1 bg-brand-navy/5 text-brand-navy border border-brand-navy/10 text-[9px] font-mono px-1.5 py-0.5 rounded font-bold">
                                REF: {ord.reference}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-serif font-bold text-brand-navy">{ord.projectName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ord.budgetNumber}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-brand-sand px-2 py-0.5 rounded text-[10px] font-mono text-brand-navy font-bold">{ord.distributor}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-brand-navy">{ord.quantity}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 ${
                              ord.availability === 'retrasado'
                                ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                : 'bg-blue-50 text-blue-700 border border-blue-100'
                            }`}>
                              {ord.availability === 'retrasado' ? <AlertTriangle className="w-3 h-3 shrink-0" /> : <Clock className="w-3 h-3 shrink-0" />}
                              {ord.availability.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => { onSelectBudget(ord.budgetId); onEnterEditor(); }}
                              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg border border-brand-sand-dark bg-white hover:bg-brand-sand text-[10px] font-bold text-brand-navy hover:scale-102 transition duration-200 cursor-pointer active:scale-97"
                            >
                              Ir al Proyecto
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* C. SUPPLIERS TAB */}
          {activeTab === 'suppliers' && (
            <div className="space-y-4">
              <div className="bg-[#FAF7F2] border border-brand-sand-dark/60 p-4 rounded-xl">
                <h4 className="font-serif font-bold text-brand-navy text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-terracotta" />
                  Directorio de Proveedores Dados de Alta
                </h4>
                <p className="text-slate-500 text-xs mt-1 pl-5.5">
                  Almacena tus fabricantes, tiendas y distribuidores predilectos. Estos registros estarán disponibles como sugerencias automáticas de autocompletado en el editor de presupuestos para evitar errores de escritura repetidos.
                </p>
              </div>

              {/* Search Toolbar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={e => setSupplierSearch(e.target.value)}
                  placeholder="Buscar proveedor por nombre, categoría, teléfono o email..."
                  className="w-full pl-9 pr-4 py-2 border border-brand-sand-dark rounded-xl text-xs text-brand-navy outline-none bg-[#FCFAF8] focus:border-brand-terracotta transition"
                />
              </div>

              <div className="overflow-x-auto border border-brand-sand-dark rounded-2xl bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-brand-sand-dark text-brand-olive font-bold uppercase tracking-wider text-[10px] pb-2 font-mono bg-brand-sand/10">
                      <th className="py-3 px-4">Nombre Comercial</th>
                      <th className="py-3 px-4">Categoría / Familia</th>
                      <th className="py-3 px-4">Teléfono</th>
                      <th className="py-3 px-4">E-mail de Pedidos</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sand-dark/50 text-brand-charcoal font-medium">
                    {suppliers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 font-serif italic text-sm">
                          No hay proveedores registrados en el directorio frecuente.
                        </td>
                      </tr>
                    ) : filteredSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400 font-serif italic text-sm">
                          No se han encontrado proveedores que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredSuppliers.map(s => (
                        <tr key={s.id} className="hover:bg-brand-sand/15 transition duration-150">
                          <td className="py-3 px-4 font-bold text-brand-navy text-sm">
                            {s.name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-olive bg-brand-olive/10 px-2.5 py-0.5 rounded-full inline-block">
                              {s.category || 'Sin Categoría'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono">
                            {s.phone || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-sans">
                            {s.email || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSupplier(s.id)}
                              className="p-1.5 text-slate-400 hover:text-brand-terracotta hover:bg-brand-terracotta/5 rounded-lg border border-transparent hover:border-brand-sand-dark/60 transition cursor-pointer inline-flex items-center"
                              title="Eliminar Proveedor"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 3. NEW BUDGET CREATION DIALOG (MODAL OVERLAY) */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-[#FCFAF8] border border-brand-sand-dark rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-slideUp">
            
            {/* Header */}
            <div className="bg-brand-sand/40 border-b border-brand-sand-dark px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-brand-navy text-lg flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-brand-terracotta" />
                Crear Nuevo Presupuesto
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-brand-navy transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateBudgetSubmit} className="p-6 space-y-4">
              
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre del Proyecto / Obra *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Diseño Salón & Cocina Chalet Aravaca"
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre del Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Lorente"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estado Inicial</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as Budget['status'])}
                    className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta font-semibold"
                  >
                    <option value="borrador">⚪ Borrador</option>
                    <option value="pendiente">🟡 Pendiente</option>
                    <option value="aprobado">🟢 Aprobado</option>
                    <option value="terminado">🟢 Terminado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Cliente</label>
                  <input
                    type="email"
                    placeholder="cliente@correo.com"
                    value={newClientEmail}
                    onChange={e => setNewClientEmail(e.target.value)}
                    className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teléfono Cliente</label>
                  <input
                    type="text"
                    placeholder="+34 600 000 000"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ubicación de la Obra (Dirección)</label>
                <input
                  type="text"
                  placeholder="Calle, Número, Planta, Ciudad"
                  value={newClientAddress}
                  onChange={e => setNewClientAddress(e.target.value)}
                  className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-brand-sand-dark/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="py-2.5 px-5 rounded-xl border border-brand-sand-dark text-xs font-bold text-brand-navy hover:bg-brand-sand transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-dark text-xs font-bold text-white shadow-md active:scale-97 transition cursor-pointer"
                >
                  Generar y Abrir Editor
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 4. NEW SUPPLIER DIALOG (MODAL OVERLAY) */}
      {isAddSupOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-[#FCFAF8] border border-brand-sand-dark rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-slideUp">
            
            <div className="bg-brand-sand/40 border-b border-brand-sand-dark px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-brand-navy text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-olive" />
                Alta en Directorio de Proveedores
              </h3>
              <button
                onClick={() => setIsAddSupOpen(false)}
                className="text-slate-400 hover:text-brand-navy transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre del Distribuidor *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Porcelanosa S.A."
                  value={supName}
                  onChange={e => setSupName(e.target.value)}
                  className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Categoría / Familia</label>
                <input
                  type="text"
                  placeholder="Ej. Mármoles, Luminarias, Tapicería..."
                  value={supCategory}
                  onChange={e => setSupCategory(e.target.value)}
                  className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta focus:ring-1 focus:ring-brand-terracotta/20 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Teléfono Contacto</label>
                  <input
                    type="text"
                    placeholder="+34 900 000 000"
                    value={supPhone}
                    onChange={e => setSupPhone(e.target.value)}
                    className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">E-mail Pedidos</label>
                  <input
                    type="email"
                    placeholder="comercial@proveedor.com"
                    value={supEmail}
                    onChange={e => setSupEmail(e.target.value)}
                    className="w-full bg-white border border-brand-sand-dark rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-terracotta transition"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-brand-sand-dark/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddSupOpen(false)}
                  className="py-2 px-4 rounded-xl border border-brand-sand-dark text-xs font-bold text-brand-navy hover:bg-brand-sand transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-brand-olive hover:bg-brand-olive-dark text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
