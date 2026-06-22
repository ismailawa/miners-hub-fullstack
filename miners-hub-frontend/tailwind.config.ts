import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
                secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
                border: 'rgb(var(--color-border-rgb) / <alpha-value>)',
                'text-primary': 'rgb(var(--color-text-primary-rgb) / <alpha-value>)',
                'text-secondary': 'rgb(var(--color-text-secondary-rgb) / <alpha-value>)',
                'text-muted': 'rgb(var(--color-text-muted-rgb) / <alpha-value>)',
                accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
                'accent-content': 'rgb(var(--color-accent-content-rgb) / <alpha-value>)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
export default config
