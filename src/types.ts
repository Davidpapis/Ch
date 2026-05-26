/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BudgetItem {
  id: string;
  description: string;
  cost: number; // Inversión unitaria
  price: number; // Precio de venta unitario
  quantity: number; // Cantidad
  distributor: string; // Distribuidor/Origen
  availability: 'disponible' | 'pedido' | 'retrasado' | 'entregado'; // Estado actual
  imageUrl?: string; // Fotografía conceptual del artículo/mobiliario
}

export interface BudgetSection {
  id: string;
  name: string; // "Baño", "Cocina", "Comedor", "Dormitorio", etc.
  items: BudgetItem[];
}

export interface BudgetMetadata {
  projectName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientDni?: string; // DNI/NIE/CIF del Cliente
  budgetDate: string;
  validUntil: string;
  budgetNumber: string;
  companyName: string;
  companyNif: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  notes: string;
  vatRate: number; // % de IVA por defecto o personalizado (p. ej., 21 o 10)
  includeVat: boolean; // Si se debe mostrar IVA en el presupuesto del cliente
  valoracionFinal: string; // Valoración y descripción conceptual de la decoradora
  discountPercent?: number; // % de descuento comercial aplicado
  adminExpenses?: number; // Gastos de gestión administrativa (€)
  adminExpensesType?: 'percent' | 'amount';
  discountType?: 'percent' | 'amount';
  discountValue?: number;
  customAdjustments?: { id: string; label: string; amount: number }[];
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  category?: string;
}

export interface Budget {
  id: string;
  metadata: BudgetMetadata;
  sections: BudgetSection[];
  status: 'borrador' | 'en_progreso' | 'pendiente' | 'aprobado' | 'rechazado';
  updatedAt: string;
}

