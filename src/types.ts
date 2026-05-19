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
}
