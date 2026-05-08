import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1E293B',
          light: '#334155',
        },
        slate: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
        },
        electric: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#EFF6FF',
        },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        border: '#E2E8F0',
        status: {
          present: '#10B981',
          late: '#F59E0B',
          sick: '#8B5CF6',
          absent: '#EF4444',
        },
      },
    },
  },
  plugins: [],
}
export default config
