/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BudgetSection, BudgetMetadata, Supplier, Budget } from './types';

// Curated suppliers directory for the default state
export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup-zara', name: 'Zara Home', email: 'pedidos@zarahome.com', phone: '+34 900 814 900', category: 'Textil & Accesorios' },
  { id: 'sup-kave', name: 'Kave Home', email: 'proyectos@kavehome.com', phone: '+34 972 853 010', category: 'Mobiliario & Sofás' },
  { id: 'sup-flos', name: 'Flos Lighting', email: 'info@flos.es', phone: '+34 913 250 822', category: 'Iluminación Premium' },
  { id: 'sup-westwing', name: 'Westwing Professional', email: 'b2b@westwing.es', phone: '+34 911 878 123', category: 'Decoración & Alfombras' },
  { id: 'sup-porcelanosa', name: 'Porcelanosa Madrid', email: 'obra@porcelanosa.es', phone: '+34 915 240 850', category: 'Baños & Cerámicas' },
  { id: 'sup-neolith', name: 'Neolith Surfaces', email: 'pedidos@neolith.com', phone: '+34 964 652 233', category: 'Encimeras & Piedra' },
  { id: 'sup-grohe', name: 'Grohe Griferías', email: 'soporte@grohe.es', phone: '+34 933 368 850', category: 'Griferías & Fontanería' },
  { id: 'sup-vibia', name: 'Vibia Iluminación', email: 'info@vibia.com', phone: '+34 934 796 970', category: 'Iluminación Técnica' }
];

export const INITIAL_SECTIONS: BudgetSection[] = [
  {
    id: 'salon',
    name: 'Salón Principal',
    items: [
      {
        id: 's1',
        description: 'Sofá tapizado lino natural modelo "Linen Dream" (3 plazas)',
        cost: 650.00,
        price: 1250.00,
        quantity: 1,
        distributor: 'Zara Home',
        availability: 'disponible',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 's2',
        description: 'Mesa de centro madera de roble macizo acabado natural',
        cost: 210.00,
        price: 390.00,
        quantity: 1,
        distributor: 'Kave Home',
        availability: 'entregado',
        imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 's3',
        description: 'Lámpara de pie de diseño en acero cepillado modelo Arco',
        cost: 140.00,
        price: 280.00,
        quantity: 1,
        distributor: 'Flos Lighting',
        availability: 'pedido',
        imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 's4',
        description: 'Cortinas de lino confeccionadas a medida con riel oculto',
        cost: 320.00,
        price: 680.00,
        quantity: 2,
        distributor: 'Zara Home',
        availability: 'pedido',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 's5',
        description: 'Alfombra de lana tejida a mano estilo nórdico (200x300cm)',
        cost: 240.00,
        price: 490.00,
        quantity: 1,
        distributor: 'Westwing Professional',
        availability: 'retrasado',
        imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  {
    id: 'cocina',
    name: 'Cocina & Comedor',
    items: [
      {
        id: 'c1',
        description: 'Encimera porcelánica efecto mármol Calacatta Gold 20mm',
        cost: 1200.00,
        price: 2150.00,
        quantity: 1,
        distributor: 'Neolith Surfaces',
        availability: 'entregado',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'c2',
        description: 'Grifería monomando caño alto extraíble acabado latón cepillado',
        cost: 110.00,
        price: 220.00,
        quantity: 1,
        distributor: 'Grohe Griferías',
        availability: 'disponible',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'c3',
        description: 'Mobiliario de cocina lacado seda mate con tirador uñero',
        cost: 3400.00,
        price: 5800.00,
        quantity: 1,
        distributor: 'Kave Home',
        availability: 'pedido',
        imageUrl: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'c4',
        description: 'Taburete alto madera roble y asiento enea trenzado (Juego de 3)',
        cost: 180.00,
        price: 360.00,
        quantity: 3,
        distributor: 'Westwing Professional',
        availability: 'entregado',
        imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  {
    id: 'banos',
    name: 'Baño Suite',
    items: [
      {
        id: 'b1',
        description: 'Lavabo sobre encimera de piedra natural pulida gris',
        cost: 160.00,
        price: 320.00,
        quantity: 2,
        distributor: 'Porcelanosa Madrid',
        availability: 'entregado',
        imageUrl: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'b2',
        description: 'Mueble suspendido bajo lavabo en madera de nogal hidrófugo',
        cost: 310.00,
        price: 640.00,
        quantity: 1,
        distributor: 'Kave Home',
        availability: 'pedido',
        imageUrl: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'b3',
        description: 'Espejo circular retroiluminado LED antivaho de 90cm',
        cost: 85.00,
        price: 190.00,
        quantity: 2,
        distributor: 'Westwing Professional',
        availability: 'disponible',
        imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'b4',
        description: 'Grifería de lavabo empotrada mural en negro mate',
        cost: 95.00,
        price: 185.00,
        quantity: 2,
        distributor: 'Grohe Griferías',
        availability: 'retrasado',
        imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  {
    id: 'dormitorio',
    name: 'Dormitorio Principal',
    items: [
      {
        id: 'd1',
        description: 'Cabecero tapizado en boucle color arena a medida (180cm)',
        cost: 280.00,
        price: 590.00,
        quantity: 1,
        distributor: 'Kave Home',
        availability: 'disponible',
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'd2',
        description: 'Mesita de noche volada en madera de roble y cajón',
        cost: 75.00,
        price: 155.00,
        quantity: 2,
        distributor: 'Kave Home',
        availability: 'entregado',
        imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'd3',
        description: 'Aplique de lectura orientable en latón cepillado con USB',
        cost: 40.00,
        price: 85.00,
        quantity: 2,
        distributor: 'Vibia Iluminación',
        availability: 'entregado',
        imageUrl: 'https://images.unsplash.com/photo-1517999144091-3d9dca6d1e43?auto=format&fit=crop&w=600&q=80'
      }
    ]
  }
];

export const INITIAL_METADATA: BudgetMetadata = {
  projectName: 'Reforma Integral & Interiorismo Piso Retiro',
  clientName: 'María García & Carlos Ruiz',
  clientEmail: 'maria.garcia@gmail.com',
  clientPhone: '+34 611 223 344',
  clientAddress: 'Calle de Alfonso XII, 12, 4º Derecha, 28014 Madrid',
  clientDni: '12345678Z',
  budgetDate: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  budgetNumber: 'CH-2026-018',
  companyName: 'Cristina Herrera Decoración',
  companyNif: 'B-88776655',
  companyAddress: 'Calle de Serrano 45, Planta 2, 28001 Madrid',
  companyEmail: 'estudio@cristinaherrera.com',
  companyPhone: '+34 910 123 456',
  notes: 'Precios válidos por 30 días. Los plazos de ejecución se acordarán tras la firma del contrato y la aceptación formal del presupuesto. El pago se realizará mediante transferencia bancaria (40% al inicio del proyecto, 40% a la llegada de materiales principales, y 20% a la entrega de llaves y memoria final de obra). El presupuesto no incluye tasas municipales de licencias de obra menor.',
  vatRate: 21,
  includeVat: true,
  adminExpensesType: 'amount',
  valoracionFinal: 'Para este proyecto de Cristina Herrera Decoración, se ha planteado una atmósfera que fusiona la calidez del diseño nórdico con la frescura y luz del mediterráneo. Hemos seleccionado texturas orgánicas como el lino natural en tapizados, maderas nobles de roble con acabados mate y revestimientos de piedra natural en encimeras y lavabos. Las estancias se abren a la luz, utilizando una paleta neutra enriquecida con sutiles acentos terracota y verde oliva, logrando un equilibrio perfecto entre elegancia atemporal y confort familiar.'
};

// INITIAL_BUDGETS declaration moved to bottom of file to avoid Temporal Dead Zone ReferenceError

export const IMPORTED_LOS_NARANJOS_BUDGET: Budget = {
    id: "budget-los-naranjos",
    status: "en_progreso",
    updatedAt: new Date().toISOString(),
    metadata: {
    "projectName": "LOS NARANJOS NUEVA ANDALUCIA",
    "clientName": "MARBELLA ESPACIOS 2.0 S.L.",
    "clientEmail": "contacto@marbellaespacios.com",
    "clientPhone": "609 45 22 03",
    "clientAddress": "Ramón Gómez de la Serna 23, Ed. Marbella House, Marbella (Málaga)",
    "clientDni": "B-92837411",
    "budgetDate": "2026-05-15",
    "validUntil": "2026-08-15",
    "budgetNumber": "CH-2026-089",
    "companyName": "Cristina Herrera Decoración",
    "companyNif": "ES-Y4938210A",
    "companyAddress": "Calle de Serrano, 45, 28001 Madrid",
    "companyEmail": "estudio@cristinaherrera.com",
    "companyPhone": "644 123 456",
    "notes": "Los plazos de entrega y condiciones particulares de pago se detallarán bajo firma de contrato ejecutivo. Precios válidos según la validez estipulada en cabecera.",
    "vatRate": 21,
    "includeVat": true,
    "valoracionFinal": "Propuesta integral de interiorismo y decoración para el residencial de Los Naranjos. Se presenta una selección exclusiva con estética de inspiración nórdica y mediterránea, priorizando texturas naturales, maderas nobles, lino y una paleta de colores cálidos y arena.",
    "discountPercent": 0,
    "adminExpenses": 0,
    "adminExpensesType": "amount"
},
    sections: [
    {
        "id": "34bea23e-c1c1-4ce0-addb-5b952c381f5d",
        "name": "BEDROOM 1",
        "items": [
            {
                "id": "05524595-af60-4b0b-9536-1a9f372a0dd2",
                "description": "UPHOLSTERED HEADBOARDS BUTTONS.",
                "price": 199.82,
                "cost": 166.32,
                "quantity": 2,
                "distributor": "KENAY KUN-0349N16",
                "availability": "disponible"
            },
            {
                "id": "0534059d-1b6d-4099-8cdd-e19806191bdf",
                "description": "NATUR PREMIUM VISCO POCKET MATTRESS 90X1.90 CM",
                "price": 299.0,
                "cost": 198.0,
                "quantity": 2,
                "distributor": "LEROY 86369786",
                "availability": "disponible"
            },
            {
                "id": "0d28e9ff-8b84-4616-83c3-744449cd6763",
                "description": "DECORATIVE FLOWER CUSHIONS",
                "price": 49.0,
                "cost": 40.0,
                "quantity": 2,
                "distributor": "MAISON Ref. 249589",
                "availability": "disponible"
            },
            {
                "id": "b9f77b66-b505-401b-af5e-83b0c7b9afa4",
                "description": "PLAIN BURGUNDI DECORATIVE  CUSHIONS",
                "price": 28.0,
                "cost": 20.0,
                "quantity": 2,
                "distributor": "MAISON Ref. M22069211",
                "availability": "disponible"
            },
            {
                "id": "c9a32adf-85d4-4482-a73d-55106e854709",
                "description": "BED BLANKET",
                "price": 32.0,
                "cost": 20.0,
                "quantity": 2,
                "distributor": "MAISON Ref. 247107",
                "availability": "disponible"
            },
            {
                "id": "f9de2a39-1a8d-4f59-a9d9-b17439a80cfb",
                "description": "BEDSIDE LAMP",
                "price": 62.0,
                "cost": 40.0,
                "quantity": 1,
                "distributor": "MAISON Ref. 119131",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "17b55bc2-052e-4898-ab25-e6c32ca90d0d",
        "name": "BEDROOM 2",
        "items": [
            {
                "id": "a6579173-9922-48a1-8112-ff15f16dee5d",
                "description": "RATTAN HEADBOARD   HEADBOARD REPLACEMENT DUE TO LACK OF STOCK",
                "price": 144.5,
                "cost": 123.0,
                "quantity": 2,
                "distributor": "LEROY 91051509",
                "availability": "disponible"
            },
            {
                "id": "0d97eed0-43bf-4358-9e16-dd5c8fe27ce6",
                "description": "NATUR PREMIUM VISCO POCKET SPRUNG MATTRESS 90X1.90 CM",
                "price": 299.0,
                "cost": 198.0,
                "quantity": 2,
                "distributor": "LEROY 86369786",
                "availability": "disponible"
            },
            {
                "id": "f5b97cd9-f9a3-4041-827f-a17ffa55d3aa",
                "description": "STRIPED DECORATIVE CUSHIONS",
                "price": 48.0,
                "cost": 40.0,
                "quantity": 2,
                "distributor": "EL CORTE INGLES NOTO",
                "availability": "disponible"
            },
            {
                "id": "1982d181-23be-4f49-afb2-1899094fe53c",
                "description": "BEDSIDE LAMP                                                                              LAMPARA DE MESA",
                "price": 28.0,
                "cost": 12.99,
                "quantity": 1,
                "distributor": "LEROY Ref.Ref. 93040906",
                "availability": "disponible"
            },
            {
                "id": "60f71827-02d4-4241-b24b-ac8a53ac9abf",
                "description": "BED BLANKET",
                "price": 43.0,
                "cost": 23.0,
                "quantity": 2,
                "distributor": "LEROY Ref. 93895309",
                "availability": "disponible"
            },
            {
                "id": "20e1ff4d-f275-486f-81af-34c0b6240c2e",
                "description": "NIGHT TABLE",
                "price": 143.0,
                "cost": 98.96,
                "quantity": 1,
                "distributor": "SKLUM REF: 123580-251057",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "1ef42dda-1d30-4c91-a2bb-df09e575c81e",
        "name": "BATHROOM 1 Y 2",
        "items": [
            {
                "id": "d0891500-8faf-4a6c-8d74-407bf5bb56d3",
                "description": "INSTALLATION OF BATHROOM SCREEN",
                "price": 120.0,
                "cost": 120.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            },
            {
                "id": "59bada5a-b998-4051-969b-3f821686e5da",
                "description": "INSTALLATION OF WOODEN SHELF UNDER WASHBASIN CABINET BATHROOM 1",
                "price": 187.0,
                "cost": 150.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            },
            {
                "id": "80e98c34-12db-40be-b7a9-102a4e23a42e",
                "description": "INSTALLATION OF WOODEN SHELF UNDER WASHBASIN CABINET MASTER  BATHROOM",
                "price": 220.0,
                "cost": 200.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "3a115325-7e8c-4541-8b29-0a1ab2672c18",
        "name": "MASTER BEDROOM",
        "items": [
            {
                "id": "81a95233-9dce-4cea-aa3c-a1d8cde9c3a2",
                "description": "COMPLETE MATTRESS SET WITH POCKET SPRINGS, VISCOELASTIC FOAM, AND UPHOLSTERED BASE, MEASURING 1.60X x 2.00",
                "price": 840.0,
                "cost": 714.0,
                "quantity": 1,
                "distributor": "LEROY REF: 86369835 320 colchon +394",
                "availability": "disponible"
            },
            {
                "id": "6eb0310b-fac9-48a6-8b89-4376341dcb74",
                "description": "BED FOOT RUG",
                "price": 78.0,
                "cost": 29.99,
                "quantity": 1,
                "distributor": "REF; 93873813",
                "availability": "disponible"
            },
            {
                "id": "58ffd9dd-b031-4e43-a135-9531224ec1e6",
                "description": "UPHOLSTERED HEADBOARD WITH BEIGE STICKERS 1.60",
                "price": 196.0,
                "cost": 219.9,
                "quantity": 1,
                "distributor": "KENAY SOLUM 1.50 Ref: KUN-0360N4",
                "availability": "disponible"
            },
            {
                "id": "b31e75da-ddd1-4cf2-9a14-8d36189c04fb",
                "description": "DECORATIVE FLOWER CUSHIONS.",
                "price": 82.5,
                "cost": 70.0,
                "quantity": 2,
                "distributor": "EL CORTE INGLES NAVA",
                "availability": "disponible"
            },
            {
                "id": "57e3bca7-38ed-488e-a243-754376fd2413",
                "description": "BLUE DECORATIVE CUSHIONS.",
                "price": 45.0,
                "cost": 40.0,
                "quantity": 2,
                "distributor": "MAISON Ref. 249175",
                "availability": "disponible"
            },
            {
                "id": "6f8faefc-34e2-44a2-abeb-2d2c4a346c40",
                "description": "GREEN BEDSPREAD.",
                "price": 56.0,
                "cost": 45.0,
                "quantity": 1,
                "distributor": "AMAZON",
                "availability": "disponible"
            },
            {
                "id": "c8164583-f9c4-4f26-af50-073376bddefe",
                "description": "STRIPED WALLPAPER",
                "price": 57.61,
                "cost": 50.949999999999996,
                "quantity": 3,
                "distributor": "LEROY Ref. 98294307-1 ROLLO 50,95",
                "availability": "disponible"
            },
            {
                "id": "18b76581-e1b0-49ce-a78d-c5dbcbb8ccb8",
                "description": "WALLPAPER INSTALLATION",
                "price": 375.0,
                "cost": 320.0,
                "quantity": 1,
                "distributor": "DANIEL",
                "availability": "disponible"
            },
            {
                "id": "df65ace3-3a7d-48bb-b251-63ed1b460598",
                "description": "SIDE TABLE",
                "price": 150.76,
                "cost": 114.5,
                "quantity": 2,
                "distributor": "KENAY HEGAS : KPK-0107-2",
                "availability": "disponible"
            },
            {
                "id": "15fa0aed-85c4-42f1-bf23-e2fbe8d6482b",
                "description": "NIGHT LIGHTS",
                "price": 80.0,
                "cost": 70.0,
                "quantity": 2,
                "distributor": "LEROY  89004543",
                "availability": "disponible"
            },
            {
                "id": "427f9197-10fb-47b1-acbe-f84c784d707c",
                "description": "CONSOLE WITH 2 DRAWERS.",
                "price": 287.87,
                "cost": 269.9,
                "quantity": 1,
                "distributor": "KENAY HEGAS  KXJ-0045NA-2",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "da4afd39-c8be-446a-aa39-594cf43a28dc",
        "name": "SALON",
        "items": [
            {
                "id": "2f1224c6-5947-4695-a6ff-d2dbc8c5fda4",
                "description": "IKEA VIMLE NAVY BLUE 4-SEATER SOFA WITH DELIVERY AND INSTALLATION",
                "price": 1.358,
                "cost": 1.258,
                "quantity": 1,
                "distributor": "IKEA 894.411.61 VIMLE AZUL MARINO",
                "availability": "disponible"
            },
            {
                "id": "30ca11af-8a05-4841-a7df-88df1ccfc58c",
                "description": "SOFA CUSHION DRAWING",
                "price": 55.0,
                "cost": 46.0,
                "quantity": 2,
                "distributor": "EL CORTE INGLES NAN7S",
                "availability": "disponible"
            },
            {
                "id": "43e5d978-3d3e-46db-8c68-2d9ab66b7dce",
                "description": "MUSTARD PLAIN DECORATIVE CUSHIONS",
                "price": 45.0,
                "cost": 37.0,
                "quantity": 2,
                "distributor": "LAREDOUTE MISSIA",
                "availability": "disponible"
            },
            {
                "id": "d64460d6-b7c9-4354-9ee0-eace9b56d592",
                "description": "SET OVAL DINING  TABLE IN MANGO  WOOD 200 x 110 WITH 6 UPHOLSTERED CHAIRS",
                "price": 1224.0,
                "cost": 832.05,
                "quantity": 1,
                "distributor": "SKLUM REF: 143230-306341 REF:164879-371357",
                "availability": "disponible"
            },
            {
                "id": "34ee3d19-eb42-4b5a-b83a-4f675e070e89",
                "description": "BLUE AND MUSTARD TONES SOFA RUG 1,92 X 2,90",
                "price": 214.9,
                "cost": 129.0,
                "quantity": 1,
                "distributor": "LEROY Ref. Ref. 87964512",
                "availability": "disponible"
            },
            {
                "id": "eddbee1b-7878-4a28-a580-c48f4a9a3f82",
                "description": "SEMI TRANSPARENT FOLDING BLIND BEHIND SOFA -BLIND INSTALLATION",
                "price": 104.0,
                "cost": 46.99,
                "quantity": 1,
                "distributor": "LEROY 92069119",
                "availability": "disponible"
            },
            {
                "id": "e35417ef-4288-48f8-b7d3-78b65514f9b7",
                "description": "FIREPLACE AREA ARMCHAIRS.",
                "price": 102.0,
                "cost": 98.91,
                "quantity": 2,
                "distributor": "SKLUMREF: REF: 209424-575384",
                "availability": "disponible"
            },
            {
                "id": "bb5ca63d-677e-4cd5-9c2b-67b020228d7e",
                "description": "PACK OF 2 ROUND FIREPLACE TABLES",
                "price": 135.99,
                "cost": 105.99,
                "quantity": 1,
                "distributor": "LEROY Ref. 97293985",
                "availability": "disponible"
            },
            {
                "id": "76ab545c-9fac-43e3-bf9e-90c8213ac9e0",
                "description": "FLORAL CENTERPIECE FOR TABLE",
                "price": 45.0,
                "cost": 38.0,
                "quantity": 1,
                "distributor": "AMAZON",
                "availability": "disponible"
            },
            {
                "id": "6214d038-4c7a-407e-9123-0b574ea9d909",
                "description": "ARTIFICIAL KENTYAS PLANTS",
                "price": 110.0,
                "cost": 100.0,
                "quantity": 2,
                "distributor": "Pendiente",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "0a48ce3b-8c80-4eb2-8776-e4383b2b8545",
        "name": "KITCHEN",
        "items": [
            {
                "id": "8da78a8b-85b3-49a5-91ec-604adf439e8e",
                "description": "ROMMER FCE 320 COMBI REFRIGERATOR, 1.70 x 54",
                "price": 499.0,
                "cost": 499.0,
                "quantity": 1,
                "distributor": "ALVARO ABRILIA",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "6012aa6c-d89f-43d4-b841-483b7a7b5a78",
        "name": "BED LINEN",
        "items": [
            {
                "id": "ed135638-805c-41e8-bb3c-4204073627de",
                "description": "ANNUAL RENTAL OF BED LINEN AND TOWELS",
                "price": 700.0,
                "cost": 560.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "b9c05f64-5df0-4d34-ace2-a68bb8a5309a",
        "name": "TERRACE AND SEVERAL THINGS",
        "items": [
            {
                "id": "c747d5fb-9331-4561-b605-c073afb653e0",
                "description": "CLEANING OF FLOORS AND WALLS WITH A PRESSURE WASHER, REMOVAL OF MOLD, AND SUBSEQUENT PAINTING WITH WHITE ANTI-MOLD EXTERIOR PAINT",
                "price": 450.0,
                "cost": 450.003,
                "quantity": 1,
                "distributor": "Columna 1",
                "availability": "disponible"
            },
            {
                "id": "c270166e-4e4a-466e-aa40-ee1be065010c",
                "description": "DOMESTIC FIRE EXTINGUISHERS ACCORDING TO REGULATIONS.",
                "price": 36.5,
                "cost": 26.5,
                "quantity": 2,
                "distributor": "Pendiente",
                "availability": "disponible"
            },
            {
                "id": "b48b272e-3f48-46f3-92c7-353dfffc29c7",
                "description": "COMPLETE PHOTOGRAPHIC SHOOT WITH HIGH-QUALITY PHOTOS FOR PUBLICATION ON PLATFORMS AND WEBSITE.",
                "price": 220.0,
                "cost": 120.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            },
            {
                "id": "19fb78ef-ae3e-4cd4-a0b2-50859f3da6dd",
                "description": "TOUCH UPS  WHIT WHITE PAINT ON DIFFERENT  WALLS AND FILLING",
                "price": 120.0,
                "cost": 120.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            },
            {
                "id": "83372ea1-934a-4dce-a1c5-b69697528171",
                "description": "COMPLETE FIRST AID KIT ACCORDING TO REGULATIONS.",
                "price": 38.0,
                "cost": 25.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            },
            {
                "id": "38dbb382-4d45-459d-837f-a8c481b3bcd2",
                "description": "TERRACE SEVERAL THINGS",
                "price": 0.0,
                "cost": 318.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "1205632b-b192-4332-88ce-c45fcec8657d",
        "name": "TERRAZA (Mobiliario Exterior)",
        "items": [
            {
                "id": "fa35fd45-7b20-4b71-9556-ff3d166d7134",
                "description": "SOFÁ DE EXTERIOR DE MADERA DE EUCALIPTO Y CUERDA BEIGE. Medida 202x77 cm. (Outdoor sofa made of eucalyptus wood and beige rope)",
                "price": 1225.33,
                "cost": 906.29,
                "quantity": 2,
                "distributor": "CR- OSANA-1",
                "availability": "disponible"
            },
            {
                "id": "a46cb74f-692c-432b-9063-c3204607e370",
                "description": "SILLÓN DE EXTERIOR EN MADERA DE EUCALIPTO Y CUERDA BEIGE. Medida 95x77 cm. (OUTDOOR CHAIR IN EUCALYPTUS WOOD AND BEIGE ROPE)",
                "price": 660.0,
                "cost": 574.75,
                "quantity": 2,
                "distributor": "CR- OSANA",
                "availability": "disponible"
            },
            {
                "id": "4def792e-8299-4d53-ad78-cf939a5c9093",
                "description": "MESA CENTRO REDONDA EN MADERA DE TECA Y ALUMINIO GRIS CLARO. 56,5 X 56,5 CM.(ROUND COFFEE TABLE IN TEAK WOOD AND LIGHT GREY ALUMINUM. 56.5 X 56.5 CM.)",
                "price": 471.1,
                "cost": 327.91,
                "quantity": 1,
                "distributor": "CR- ILIA",
                "availability": "disponible"
            },
            {
                "id": "4a9ec1f1-f7ee-413d-9054-9c961436d840",
                "description": "MESA CENTRO REDONDA EN MADERA DE TECA Y ALUMINIO GRIS CLARO. 100 X 100 CM.(ROUND COFFE TABLE IN TEAK WOOD AND LIGHT GREY ALUMINIUM. 100 x 100 cm.)",
                "price": 894.97,
                "cost": 630.41,
                "quantity": 1,
                "distributor": "CR- ILIA",
                "availability": "disponible"
            },
            {
                "id": "77e88550-42ef-4444-b600-2ce959f98644",
                "description": "MESA AUXILIAR REDONDA CON PATA Y SOBRE EN MADERA DE TECA. 55 X 46 CM.(ROUND SIDE TABLE WITH TEAK WOOD LEG AND TOP. 55 X 46 CM.)",
                "price": 471.1,
                "cost": 327.91,
                "quantity": 1,
                "distributor": "CR-KAI-S",
                "availability": "disponible"
            },
            {
                "id": "4f0c4d9a-ff5d-42e3-ad5c-1e74b265153b",
                "description": "ALFOMBRAS DE EXTERIOR YUTE 300 X 200 (JUTE OUTDOOR RUGS 300 X 200)",
                "price": 371.15,
                "cost": 269.9,
                "quantity": 2,
                "distributor": "SK  172402-402193",
                "availability": "disponible"
            },
            {
                "id": "818e4c18-4280-4f3a-ab9b-67edcd572f64",
                "description": "COJINES DECORACION SOFAS (DECORATIVE CUSHIONS FOR SOFAS)",
                "price": 48.5,
                "cost": 35.0,
                "quantity": 8,
                "distributor": "Pendiente",
                "availability": "disponible"
            },
            {
                "id": "5ea2efa7-f8dc-4774-87e9-6cf4a0bd677b",
                "description": "DECORACIÓN PLANTAS ARTIFICIALES, OBJETOS DECO (DECORATION (ARTIFICIAL PLANTS, DECORATIVE OBJECTS))",
                "price": 365.0,
                "cost": 300.0,
                "quantity": 1,
                "distributor": "Pendiente",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "3d9375f1-1e6c-42a7-8274-afb576657aaf",
        "name": "SUMINISTROS Y SOLERÍA OBRA",
        "items": [
            {
                "id": "3565db0c-34bc-4356-8889-f12cc5a5cb88",
                "description": "Suministro de solería para cocina. (Se da precio estimativo hasta elegir el modelo final)",
                "price": 30.0,
                "cost": 24.0,
                "quantity": 16,
                "distributor": "Suministros Obra",
                "availability": "disponible"
            },
            {
                "id": "c909268f-a6ef-4c55-b406-ace3ee2c9f7b",
                "description": "Suministro de tiradores y manivelas de puertas de armario y de paso.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 10,
                "distributor": "Suministros Obra",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "de495c5f-3b7a-45ed-8b35-e6963054df48",
        "name": "MOBILIARIO Y ELECTRODOMÉSTICOS COCINA",
        "items": [
            {
                "id": "4d0f5fd9-fde6-421e-8599-035a93d4d948",
                "description": "Mobiliario de cocina fabricado en estratificado blanco brillo con interiores en color antracita. Con iluminación bajo mebles altos.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "8a498855-74f5-4b01-800b-4279f16b13f8",
                "description": "Encimera y frente de pared en MONOCRON (muestra a elegir). Suministro e instalación.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "e77446ed-ec3f-48a6-9c9e-4e1233bc0e66",
                "description": "Campana integrable 60 cm.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "4176e613-61ec-473e-9f62-6974bc813587",
                "description": "Placa vitrocramica 3 fuegos 60 cm.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "83d3180f-18dd-45bf-a6fe-2913ee78b3ab",
                "description": "Lavavajillas integrable 60 cm.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "2c623427-dae4-4f26-9f50-fc8f252a9fca",
                "description": "Frigoríco combi integrable.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "705aeb44-5083-4599-b859-63165251d5fd",
                "description": "Microondas integrable.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "e9861535-16ca-4a60-9c28-fcccdc84b83d",
                "description": "Horno",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "72a23ef9-503b-42a1-b9d6-dbfa11afc420",
                "description": "Grifo de fregadero de 3 vías, monomando IO PACÍFICO OSMO.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            },
            {
                "id": "1d1885fd-8b49-4dc7-ac90-b08948f8c407",
                "description": "Fregadero Franke INOX. 45*50 CM.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Mobiliario Cocina",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "14f14030-9625-49a1-8ca5-7ae5b3de1277",
        "name": "ROPA BLANCA Y TEXTILES RESIDENCIAL",
        "items": [
            {
                "id": "165cebaf-76b2-485d-8033-8c80c6727ca1",
                "description": "SHEET SETS FOR 1.50 CM BED.",
                "price": 48.0,
                "cost": 38.400000000000006,
                "quantity": 2,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "c48aa003-4243-494d-97f3-aef67d895e17",
                "description": "SHEET SETS FOR 90 CM BED. (Two beds)",
                "price": 39.0,
                "cost": 31.200000000000003,
                "quantity": 4,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "aaaa5fd3-0322-4cd2-827f-81f2ba3e3644",
                "description": "SUMMER BEDSPREADS FOR 90 CM BED. (Two beds)",
                "price": 32.0,
                "cost": 25.6,
                "quantity": 4,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "9b9e74f4-ad0a-47ac-b5a8-144a1974fd2b",
                "description": "SUMMER BED QUILTS FOR BED 1.50 CM.",
                "price": 43.5,
                "cost": 34.800000000000004,
                "quantity": 2,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "02467420-494f-4836-9d0a-89b9225534f5",
                "description": "BED MATTRESS PROTECTOR 90 CM. (Two beds)",
                "price": 24.58,
                "cost": 19.664,
                "quantity": 4,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "b65bf897-7004-4999-877f-b667f47d225e",
                "description": "BED MATTRESS PROTECTOR 1.50 CM.",
                "price": 29.64,
                "cost": 23.712000000000003,
                "quantity": 2,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "5604784f-499a-4d60-8d04-aa040df89a9a",
                "description": "BED COVER COVER 1.50 CM.",
                "price": 24.56,
                "cost": 19.648,
                "quantity": 1,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "b08a5484-18af-40f1-a221-b196ee50c402",
                "description": "BED COVER COVER 90 CM.",
                "price": 21.3,
                "cost": 17.040000000000003,
                "quantity": 2,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "06a08fa5-fc86-4c39-acaa-0cb1e6e68b26",
                "description": "DUVET COVERS FOR BED 1.50 CM.",
                "price": 38.95,
                "cost": 31.160000000000004,
                "quantity": 2,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "5c7d1273-82bf-4bf3-8e61-803a775cd0bb",
                "description": "DUVET COVERS FOR BED 90 CM.",
                "price": 26.85,
                "cost": 21.480000000000004,
                "quantity": 4,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "dd94ea71-cc75-4fc6-866c-2aa3f9f0c381",
                "description": "QUILT FOR BED 90 CM.",
                "price": 38.56,
                "cost": 30.848000000000003,
                "quantity": 2,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "def444cb-6cbf-41ad-896c-9cbe3df23042",
                "description": "QUILT FOR BED 1.50 CM.",
                "price": 47.86,
                "cost": 38.288000000000004,
                "quantity": 1,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "70fa9d7a-0aa0-4b8c-a5f7-17b9edac8169",
                "description": "PILLOWS 90 CM. HYPOALLERGENIC",
                "price": 39.67,
                "cost": 31.736000000000004,
                "quantity": 4,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "a59250d2-b1e4-44f4-8db0-2f9550e6a95c",
                "description": "BATHROOM MATS",
                "price": 6.5,
                "cost": 5.2,
                "quantity": 4,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "34046815-3072-4cb1-87e8-7c427b2cd67f",
                "description": "BASIN TOWELS",
                "price": 16.5,
                "cost": 13.200000000000001,
                "quantity": 8,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            },
            {
                "id": "3bc8add2-e857-4785-91f4-1e6f96904b10",
                "description": "BATHROOM TOWELS",
                "price": 29.25,
                "cost": 23.400000000000002,
                "quantity": 8,
                "distributor": "Ropa Blanca / Textil",
                "availability": "disponible"
            }
        ]
    },
    {
        "id": "4843c36c-3a2c-490f-acfa-7d1d4d920402",
        "name": "MENAJE DE COCINA Y ACCESORIOS",
        "items": [
            {
                "id": "c1a8b71f-8481-489e-a251-39b3f69e1425",
                "description": "Wine Glasses",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 6,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "ca7878c7-f4e0-4350-ac54-58afe9adaa6b",
                "description": "Glass jug",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "088cee90-3392-4738-9984-472911c8d2ab",
                "description": "meat knife set",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 4,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "75fd1f4e-668a-493f-a2b9-70239f6cd500",
                "description": "Cutting knife set",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 8,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "d79d0e69-f238-440b-bf12-f325b9da7a4e",
                "description": "Colored water glasses set",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 8,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "643d2c7b-f113-4de2-8ce9-087899f08048",
                "description": "Kitchen battery 6 units",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "b84685f2-8962-421e-bb0c-c4fa57806926",
                "description": "Strainer set",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 2,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "647aa706-20d4-4dc3-bc46-0816ad4f5857",
                "description": "Pack of can openers, scissors, corkscrew, whisk grater, drainer, trivet, peeler, etc.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "5d2da6b4-29f1-41cb-9774-243a8884b756",
                "description": "rubber spatula",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 2,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "17ccb4d8-71cd-493b-946b-6cb37784a1bd",
                "description": "Wooden cutlery set",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 3,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "eebaff19-e59d-4329-998f-8fc24f99fccf",
                "description": "Saucepan, drainer, etc.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 4,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "206b39a0-79ac-47c6-9813-df9ceb84c928",
                "description": "cutlery drainer",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "b3add64e-0b06-448d-b35b-4d6cbbc5306f",
                "description": "Oven trays",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 2,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "e9d4292f-650e-4053-8ee4-5108cee49705",
                "description": "Set of pans 3 units",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "5ecbeccf-4b26-4626-967d-6a83ec49df32",
                "description": "Placemats",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 4,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "8c3ad8e9-c2d7-403a-a43d-5357ba445843",
                "description": "cutting board",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "bad1b2a8-56ac-49ca-bbc2-c99d0e353044",
                "description": "Italian coffee maker (6 cups)",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "3b053521-ee77-46fb-b8d7-adc73b806e33",
                "description": "kettel",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "56ece403-59e2-4eb5-8c05-50637d8ebcad",
                "description": "Iron",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "ccb8f9f0-8e6b-407e-b09f-fe2ad7f65781",
                "description": "ironing board",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "b864d731-db1d-412a-a1b9-d77ced7f1fe8",
                "description": "Broom and dustpan",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "09137cca-5856-41cd-95df-54c6c32a544a",
                "description": "bucket and mop",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "e7310e46-d114-45fa-88c3-4a351817d86d",
                "description": "Toaster",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "b1e8bb6f-4fb8-41d8-9a73-209375eecab5",
                "description": "Blender",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "08615782-6b57-4111-a236-f5560aa4d1b6",
                "description": "Juice juicer",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "9570aa52-218b-4bcb-b3e3-c79c819444a6",
                "description": "First aid kit",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "3c85195d-d06b-4a77-8c7d-26734dfa7d7d",
                "description": "domestic fire extinguisher",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "7435bdec-edb3-46d5-aa12-7455fde180d0",
                "description": "Vacuum cleaner accessories",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "618b3e41-c7be-47b7-934a-aa5bff9c5f80",
                "description": "bathroom trash cans",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 2,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "21beef30-1ecd-4107-9331-c3da53f41a98",
                "description": "Clothes line",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "0047c0b0-a6c4-4650-ac72-2f116ce3582e",
                "description": "Trash can",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "95691a89-31dd-4554-924f-464dd74ab35b",
                "description": "Kitchen cloths",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 8,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "462761b0-953f-4cc2-a6ad-29773bc1f406",
                "description": "Cutlery",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "5c4eb77d-0cc4-4473-a6fc-65049f1a8d47",
                "description": "Portable crib with mattress, pillow and sheet set.",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "7b227c86-b440-4ed3-9a4e-494f95f172af",
                "description": "high chair",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "87b34a3f-580d-4ce0-8653-b769d5650c0c",
                "description": "Hangers",
                "price": 0.0,
                "cost": 0.0,
                "quantity": 30,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            },
            {
                "id": "719c2fff-651b-4af4-ace4-f307cf34efc1",
                "description": "Lote Completo Menaje de Cocina y Accesorios (Total Capítulo 07)",
                "price": 1394.0,
                "cost": 1115.2,
                "quantity": 1,
                "distributor": "Menaje Completo",
                "availability": "disponible"
            }
        ]
    }
]
};

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'budget-1',
    status: 'en_progreso',
    updatedAt: new Date().toISOString(),
    metadata: INITIAL_METADATA,
    sections: INITIAL_SECTIONS
  },
  {
    id: 'budget-2',
    status: 'aprobado',
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      ...INITIAL_METADATA,
      projectName: 'Proyecto Mobiliario ático Barrio de Salamanca',
      clientName: 'Alfonso Pérez de Castro',
      clientEmail: 'alfonso.perez@yahoo.es',
      clientPhone: '+34 670 998 877',
      clientAddress: 'Calle de Claudio Coello 89, Ático B, 28006 Madrid',
      budgetNumber: 'CH-2026-015',
      valoracionFinal: 'Propuesta de mobiliario a medida y estilismo decorativo para un ático con amplia terraza. Se ha priorizado el uso de maderas de teca y roble para exteriores e interiores, textiles orgánicos en color lino crudo y piezas iconográficas de iluminación escandinava.'
    },
    sections: [
      {
        id: 'salon-salamanca',
        name: 'Salón Comedor',
        items: [
          {
            id: 'as1',
            description: 'Aparador de madera de nogal con rejilla de mimbre natural',
            cost: 450.00,
            price: 890.00,
            quantity: 1,
            distributor: 'Kave Home',
            availability: 'entregado',
            imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'as2',
            description: 'Mesa de comedor extensible roble macizo (hasta 10 comensales)',
            cost: 580.00,
            price: 1100.00,
            quantity: 1,
            distributor: 'Kave Home',
            availability: 'entregado',
            imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'as3',
            description: 'Silla de comedor tapizada en terciopelo gris piedra (Juego de 6)',
            cost: 70.00,
            price: 150.00,
            quantity: 6,
            distributor: 'Westwing Professional',
            availability: 'entregado',
            imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80'
          }
        ]
      }
    ]
  },
  {
    id: 'budget-3',
    status: 'pendiente',
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      ...INITIAL_METADATA,
      projectName: 'Renovación de Iluminación & Baños Chalet Pozuelo',
      clientName: 'Elena Santamaría',
      clientEmail: 'elena.santa@outlook.com',
      clientPhone: '+34 622 334 455',
      clientAddress: 'Avenida de la Victoria, 145, Chalet 4, 28224 Pozuelo de Alarcón',
      budgetNumber: 'CH-2026-017',
      valoracionFinal: 'Estudio lumínico técnico-decorativo y actualización estética del baño de cortesía y baño principal. Planteamos una iluminación indirecta empotrada de bajo deslumbramiento combinada con lámparas colgantes decorativas en latón cepillado de gran elegancia.'
    },
    sections: [
      {
        id: 'baños-pozuelo',
        name: 'Baño de Cortesía',
        items: [
          {
            id: 'bp1',
            description: 'Grifería empotrada mural dorada cepillada alta gama',
            cost: 130.00,
            price: 250.00,
            quantity: 1,
            distributor: 'Grohe Griferías',
            availability: 'pedido',
            imageUrl: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80'
          },
          {
            id: 'bp2',
            description: 'Revestimiento de azulejo artesanal cerámico verde sabina (m2)',
            cost: 25.00,
            price: 52.00,
            quantity: 15,
            distributor: 'Porcelanosa Madrid',
            availability: 'retrasado',
            imageUrl: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80'
          }
        ]
      }
    ]
  },
  IMPORTED_LOS_NARANJOS_BUDGET
];
