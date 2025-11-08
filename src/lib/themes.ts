export type Theme = {
  name: string;
  preview: {
    background: string;
    primary: string;
    accent: string;
  };
};

export const themes: Theme[] = [
  {
    name: 'Minimal Retail',
    preview: {
      background: 'linear-gradient(to top right, #f8fafc, #f1f5f9)',
      primary: '#1e293b',
      accent: '#e2e8f0',
    },
  },
  {
    name: 'Modern Boutique',
    preview: {
      background: 'linear-gradient(to top right, #fff1f2, #ffe4e6)',
      primary: '#ec4899',
      accent: '#f9a8d4',
    },
  },
  {
    name: 'Catalog Pro',
    preview: {
      background: 'linear-gradient(to top right, #f8fafc, #eef2ff)',
      primary: '#334155',
      accent: '#64748b',
    },
  },
  {
    name: 'Hybrid Commerce',
    preview: {
      background: 'linear-gradient(to top right, #f0fdf4, #dcfce7)',
      primary: '#22c55e',
      accent: '#86efac',
    },
  },
  {
    name: 'Express Vendor',
    preview: {
      background: 'linear-gradient(to top right, #fefce8, #fef9c3)',
      primary: '#f59e0b',
      accent: '#fcd34d',
    },
  },
];
