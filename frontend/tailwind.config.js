/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fdf4f3',
                    100: '#fce8e6',
                    200: '#f9d4d1',
                    300: '#f4b5af',
                    400: '#ec8b82',
                    500: '#e05d4f',
                    600: '#cc4133',
                    700: '#ab3428',
                    800: '#8d2e24',
                    900: '#762c24',
                    950: '#40130e',
                },
                secondary: {
                    50: '#f6f7f9',
                    100: '#eceef2',
                    200: '#d5d9e2',
                    300: '#b1bac8',
                    400: '#8795aa',
                    500: '#68778f',
                    600: '#536076',
                    700: '#444e60',
                    800: '#3b4351',
                    900: '#343a46',
                    950: '#23272f',
                },
                accent: {
                    50: '#fefbe8',
                    100: '#fef7c3',
                    200: '#feec89',
                    300: '#fddb46',
                    400: '#fac815',
                    500: '#eab005',
                    600: '#ca8a02',
                    700: '#a16205',
                    800: '#854d0c',
                    900: '#713f10',
                    950: '#422105',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
