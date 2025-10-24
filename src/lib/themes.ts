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
    name: 'Default',
    preview: {
      background: 'linear-gradient(to top right, #eff6ff, #dbeafe)',
      primary: '#2563eb',
      accent: '#60a5fa',
    },
  },
  {
    name: 'Sunset',
    preview: {
      background: 'linear-gradient(to top right, #fff1f2, #ffe4e6)',
      primary: '#e11d48',
      accent: '#f472b6',
    },
  },
  {
    name: 'Mint',
    preview: {
      background: 'linear-gradient(to top right, #f0fdf4, #dcfce7)',
      primary: '#16a34a',
      accent: '#4ade80',
    },
  },
    {
    name: 'Ocean',
    preview: {
      background: 'linear-gradient(to top right, #f0f9ff, #e0f2fe)',
      primary: '#0891b2',
      accent: '#22d3ee',
    },
  },
  {
    name: 'Burgundy',
    preview: {
      background: 'linear-gradient(to top right, #fdf2f8, #fce7f3)',
      primary: '#c026d3',
      accent: '#e879f9',
    },
  },
];
