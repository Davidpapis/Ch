/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BudgetSection, BudgetMetadata } from './types';

export const INITIAL_SECTIONS: BudgetSection[] = [
  {
    id: 'banos',
    name: 'Baños',
    items: [
      {
        id: 'b1',
        description: 'Grifo de lavabo monomando acabado negro mate',
        cost: 45.00,
        price: 85.00,
        quantity: 2
      },
      {
        id: 'b2',
        description: 'Lámpara colgante LED estanca IP44',
        cost: 25.00,
        price: 49.90,
        quantity: 3
      },
      {
        id: 'b3',
        description: 'Mampara de ducha de vidrio templado 6mm',
        cost: 180.00,
        price: 320.00,
        quantity: 1
      },
      {
        id: 'b4',
        description: 'Espejo retroiluminado antivaho redondo 80cm',
        cost: 75.00,
        price: 150.00,
        quantity: 2
      }
    ]
  },
  {
    id: 'cocina',
    name: 'Cocina',
    items: [
      {
        id: 'c1',
        description: 'Grifo de cocina extraíble caño alto',
        cost: 65.00,
        price: 130.00,
        quantity: 1
      },
      {
        id: 'c2',
        description: 'Mueble bajo para fregadero y lavavajillas integrado',
        cost: 220.00,
        price: 390.00,
        quantity: 1
      },
      {
        id: 'c3',
        description: 'Campana extractora decorativa de acero inoxidable',
        cost: 140.00,
        price: 260.00,
        quantity: 1
      },
      {
        id: 'c4',
        description: 'Focos empotrables LED empotrados en falso techo',
        cost: 15.00,
        price: 30.00,
        quantity: 6
      }
    ]
  },
  {
    id: 'salon',
    name: 'Salón',
    items: [
      {
        id: 's1',
        description: 'Sofá chaise longue tapizado en tela antimanchas (3 plazas)',
        cost: 450.00,
        price: 890.00,
        quantity: 1
      },
      {
        id: 's2',
        description: 'Mesa de centro modular de madera de roble barnizada',
        cost: 110.00,
        price: 220.00,
        quantity: 1
      },
      {
        id: 's3',
        description: 'Mueble de televisión flotante con estanterías integradas',
        cost: 180.00,
        price: 350.00,
        quantity: 1
      },
      {
        id: 's4',
        description: 'Lámpara de pie de diseño con arco cromado regulable',
        cost: 50.00,
        price: 99.00,
        quantity: 1
      }
    ]
  },
  {
    id: 'dormitorio',
    name: 'Dormitorios',
    items: [
      {
        id: 'd1',
        description: 'Armario empotrado de puertas correderas lacado blanco',
        cost: 350.00,
        price: 680.00,
        quantity: 2
      },
      {
        id: 'd2',
        description: 'Apliques de pared para cabecero de lectura con USB',
        cost: 20.00,
        price: 39.90,
        quantity: 4
      }
    ]
  }
];

export const INITIAL_METADATA: BudgetMetadata = {
  projectName: 'Reforma Integral de Piso en Centro',
  clientName: 'Alejandro Gómez',
  clientEmail: 'alejandro.gomez@client.com',
  clientPhone: '612 345 678',
  clientAddress: 'Calle de Alcalá 142, 3ºB, Madrid',
  budgetDate: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias despues
  budgetNumber: 'REF-2026-0042',
  companyName: 'Reformas y Diseños Elegantes S.L.',
  companyNif: 'B-87654321',
  companyAddress: 'Paseo de la Castellana 95, Planta 15, Madrid',
  companyEmail: 'contacto@reformasdisenoelegante.es',
  companyPhone: '912 345 678',
  notes: 'Precios válidos por 30 días. Los plazos de ejecución se acordarán tras la firma del contrato y la aceptación formal del presupuesto. El pago se realizará mediante transferencia bancaria (40% al inicio, 40% durante la obra, y 20% a la entrega del proyecto).',
  vatRate: 21,
  includeVat: true
};
