/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrendingUp, Wallet, DollarSign, Percent } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricCardsProps {
  totalInvestment: number;
  totalBudget: number;
  totalProfit: number;
}

export function MetricCards({ totalInvestment, totalBudget, totalProfit }: MetricCardsProps) {
  const profitMargin = totalBudget > 0 ? (totalProfit / totalBudget) * 100 : 0;
  
  // Format currency in Euro style
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const metrics = [
    {
      id: 'total-budget',
      title: 'Presupuesto Total (Venta)',
      value: formatCurrency(totalBudget),
      description: 'Importe facturado al cliente',
      icon: DollarSign,
      colorClass: 'bg-white text-brand-navy border-brand-sand-dark shadow-xs hover:border-brand-terracotta/40 font-sans',
      iconBg: 'bg-brand-sand text-brand-terracotta border border-brand-sand-dark',
      titleColor: 'text-slate-450 font-semibold uppercase tracking-wider text-[10px]',
      valColor: 'text-2xl font-bold text-brand-navy font-display mt-1'
    },
    {
      id: 'total-investment',
      title: 'Inversión Total (Coste)',
      value: formatCurrency(totalInvestment),
      description: 'Gastos materiales y mano obra',
      icon: Wallet,
      colorClass: 'bg-white text-brand-navy border-brand-sand-dark shadow-xs hover:border-brand-olive/40 font-sans',
      iconBg: 'bg-brand-sand text-brand-olive border border-brand-sand-dark',
      titleColor: 'text-slate-450 font-semibold uppercase tracking-wider text-[10px]',
      valColor: 'text-2xl font-bold text-brand-navy font-display mt-1'
    },
    {
      id: 'total-profit',
      title: 'Beneficio Estimado',
      value: formatCurrency(totalProfit),
      description: 'Ganancia neta del proyecto',
      icon: TrendingUp,
      colorClass: 'bg-brand-sand/50 text-brand-navy border-brand-sand-dark shadow-xs hover:border-brand-terracotta/40 font-sans',
      iconBg: 'bg-brand-terracotta text-white shadow-xs',
      titleColor: 'text-brand-terracotta font-semibold uppercase tracking-wider text-[10px]',
      valColor: 'text-2xl font-bold text-brand-navy font-display mt-1'
    },
    {
      id: 'profit-margin',
      title: 'Margen Comercial',
      value: `${profitMargin.toFixed(1)}%`,
      description: 'Porcentaje de rentabilidad neta',
      icon: Percent,
      colorClass: 'bg-brand-navy text-white border-brand-navy shadow-md hover:bg-brand-navy-dark font-sans',
      iconBg: 'bg-white/10 text-white',
      titleColor: 'text-brand-sand opacity-90 font-semibold uppercase tracking-wider text-[10px]',
      valColor: 'text-2xl font-extrabold text-white font-display mt-1'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 no-print mb-6">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={`p-5 rounded-2xl border flex flex-col justify-between hover:shadow-xs transition duration-300 ${metric.colorClass}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`${metric.titleColor}`}>{metric.title}</p>
                <h3 className={`${metric.valColor}`}>{metric.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${metric.iconBg}`}>
                <Icon className="w-5 h-5 animate-pulse-slow" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/40 flex items-center gap-1.5 text-xs opacity-75">
              <span>{metric.description}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
