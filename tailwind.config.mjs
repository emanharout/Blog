import defaultTheme from 'tailwindcss/defaultTheme'
/** @type {import('tailwindcss').Config} */

export default {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
	],
	darkMode: 'selector',
	theme: {
		extend: {
			spacing: {
				// Horizontal spacing to be applied on left-most and right-most edges
                // so that all content is aligned on the outer edges of any page
				// Use like so: class="px-outer-edge" or class="mx-outer-edge"
				'outer-edge': '1.5rem'
			  },
			colors: {
				primary: {
					50: `hsl(var(--primary-color-50) / <alpha-value>)`,
					100: `hsl(var(--primary-color-100) / <alpha-value>)`,
					200: `hsl(var(--primary-color-200) / <alpha-value>)`,
					300: `hsl(var(--primary-color-300) / <alpha-value>)`,
					400: `hsl(var(--primary-color-400) / <alpha-value>)`,
					500: `hsl(var(--primary-color-500) / <alpha-value>)`,
					600: `hsl(var(--primary-color-600) / <alpha-value>)`,
					700: `hsl(var(--primary-color-700) / <alpha-value>)`,
					800: `hsl(var(--primary-color-800) / <alpha-value>)`,
					900: `hsl(var(--primary-color-900) / <alpha-value>)`,
					950: `hsl(var(--primary-color-950) / <alpha-value>)`,
				},
				secondary: {
					50: `hsl(var(--secondary-color-50) / <alpha-value>)`,
					100: `hsl(var(--secondary-color-100) / <alpha-value>)`,
					200: `hsl(var(--secondary-color-200) / <alpha-value>)`,
					300: `hsl(var(--secondary-color-300) / <alpha-value>)`,
					400: `hsl(var(--secondary-color-400) / <alpha-value>)`,
					500: `hsl(var(--secondary-color-500) / <alpha-value>)`,
					600: `hsl(var(--secondary-color-600) / <alpha-value>)`,
					700: `hsl(var(--secondary-color-700) / <alpha-value>)`,
					800: `hsl(var(--secondary-color-800) / <alpha-value>)`,
					900: `hsl(var(--secondary-color-900) / <alpha-value>)`,
					950: `hsl(var(--secondary-color-950) / <alpha-value>)`,
				},
				bg: {
					// Temperature Tone BG (warm or cool off-white/black)
					1: 'hsl(var(--background-color-1) / <alpha-value>)',
					2: 'hsl(var(--background-color-2) / <alpha-value>)',

					// Colored BG (uses theme's primary color)
					primary: {
						2: 'hsl(var(--primary-bg) / <alpha-value>)',
					},
				},
				fg: {
					// Temperature Tone FG (warm or cool off-white/black)
					1: 'hsl(var(--fg-color-1) / <alpha-value>)',
					2: 'hsl(var(--fg-color-2) / <alpha-value>)',

					// Colored FG (uses theme's primary color)
					primary: {
						link: {
							2: 'hsl(var(--fg-primary-link-2) / <alpha-value>)',
							'2-hover': 'hsl(var(--fg-primary-link-2-hover) / <alpha-value>)',
						},
					},
					border: {
						2: 'hsl(var(--fg-color-border-2) / <alpha-value>)',
					},

					// Light color is always off-white. Meant to me used when the bg is colorful.
					light: 'hsl(var(--fg-light) / <alpha-value>)',
				},
				gray: {
					// Temperature: Matches tone of theme's primary color (warm or cool)
					temp: {
						50: `hsl(var(--temperature-gray-50) / <alpha-value>)`,
						100: `hsl(var(--temperature-gray-100) / <alpha-value>)`,
						200: `hsl(var(--temperature-gray-200) / <alpha-value>)`,
						300: `hsl(var(--temperature-gray-300) / <alpha-value>)`,
						400: `hsl(var(--temperature-gray-400) / <alpha-value>)`,
						500: `hsl(var(--temperature-gray-500) / <alpha-value>)`,
						600: `hsl(var(--temperature-gray-600) / <alpha-value>)`,
						700: `hsl(var(--temperature-gray-700) / <alpha-value>)`,
						800: `hsl(var(--temperature-gray-800) / <alpha-value>)`,
						900: `hsl(var(--temperature-gray-900) / <alpha-value>)`,
					},
					neutral: {
						50: `hsl(var(--gray-50) / <alpha-value>)`,
						100: `hsl(var(--gray-100) / <alpha-value>)`,
						200: `hsl(var(--gray-200) / <alpha-value>)`,
						300: `hsl(var(--gray-300) / <alpha-value>)`,
						400: `hsl(var(--gray-400) / <alpha-value>)`,
						500: `hsl(var(--gray-500) / <alpha-value>)`,
						600: `hsl(var(--gray-600) / <alpha-value>)`,
						700: `hsl(var(--gray-700) / <alpha-value>)`,
						800: `hsl(var(--gray-800) / <alpha-value>)`,
						900: `hsl(var(--gray-900) / <alpha-value>)`,
					}
				}
			},
			fontFamily: {
				serif: ['Frank Ruhl Libre Variable', ...defaultTheme.fontFamily.serif],
				sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
			},
			typography: () => ({
				fg1: {
				  css: {
					'--tw-prose-body': 'hsl(var(--fg-color-1))', // 800
					'--tw-prose-headings': 'hsl(var(--fg-color-1))', // 900
					'--tw-prose-lead': 'hsl(var(--fg-color-1))', // 700
					'--tw-prose-links': 'hsl(var(--fg-color-1))', // 900
					'--tw-prose-bold': 'hsl(var(--fg-color-1))', // 900
					'--tw-prose-counters': 'hsl(var(--fg-color-1))', // 600
					'--tw-prose-bullets': 'hsl(var(--fg-color-1))', // 400
					'--tw-prose-hr': 'hsl(var(--fg-color-1))', // 300
					'--tw-prose-quotes': 'hsl(var(--fg-color-1))', // 900
					'--tw-prose-quote-borders': 'hsl(var(--fg-color-1))', // 300
					'--tw-prose-captions': 'hsl(var(--fg-color-1))', // 700
					'--tw-prose-code': 'hsl(var(--fg-color-1))', // 900
					'--tw-prose-pre-code': 'hsl(var(--fg-color-1))', // 100
					'--tw-prose-pre-bg': 'hsl(var(--fg-color-1))', // 900
					'--tw-prose-th-borders': 'hsl(var(--fg-color-1))', // 300
					'--tw-prose-td-borders': 'hsl(var(--fg-color-1))', // 200
					'--tw-prose-invert-body': 'hsl(var(--fg-color-1))', // 200
					'--tw-prose-invert-headings': 'hsl(var(--fg-color-1))', // theme('colors.white'),
					'--tw-prose-invert-lead': 'hsl(var(--fg-color-1))', // 300
					'--tw-prose-invert-links': 'hsl(var(--fg-color-1))', // theme('colors.white'),
					'--tw-prose-invert-bold': 'hsl(var(--fg-color-1))', // theme('colors.white'),
					'--tw-prose-invert-counters': 'hsl(var(--fg-color-1))', // 400
					'--tw-prose-invert-bullets': 'hsl(var(--fg-color-1))', // 600
					'--tw-prose-invert-hr': 'hsl(var(--fg-color-1))', // 700
					'--tw-prose-invert-quotes': 'hsl(var(--fg-color-1))', // 100
					'--tw-prose-invert-quote-borders': 'hsl(var(--fg-color-1))', // 700
					'--tw-prose-invert-captions': 'hsl(var(--fg-color-1))', // 400
					'--tw-prose-invert-code': 'hsl(var(--fg-color-1))',  // theme('colors.white'),
					'--tw-prose-invert-pre-code': 'hsl(var(--fg-color-1))', // 300
					'--tw-prose-invert-pre-bg': 'hsl(var(--fg-color-1))', // 'rgb(0 0 0) / 50%)',
					'--tw-prose-invert-th-borders': 'hsl(var(--fg-color-1))', // 600
					'--tw-prose-invert-td-borders': 'hsl(var(--fg-color-1))',  // 700
				  },
				},
				fg2: {
					css: {
						'--tw-prose-body': 'hsl(var(--fg-color-2))', // 800
						'--tw-prose-headings': 'hsl(var(--fg-color-2))', // 900
						'--tw-prose-lead': 'hsl(var(--fg-color-2))', // 700
						'--tw-prose-links': 'hsl(var(--fg-color-2))', // 900
						'--tw-prose-bold': 'hsl(var(--fg-color-2))', // 900
						'--tw-prose-counters': 'hsl(var(--fg-color-2))', // 600
						'--tw-prose-bullets': 'hsl(var(--fg-color-2))', // 400
						'--tw-prose-hr': 'hsl(var(--fg-color-2))', // 300
						'--tw-prose-quotes': 'hsl(var(--fg-color-2))', // 900
						'--tw-prose-quote-borders': 'hsl(var(--fg-color-2))', // 300
						'--tw-prose-captions': 'hsl(var(--fg-color-2))', // 700
						'--tw-prose-code': 'hsl(var(--fg-color-2))', // 900
						'--tw-prose-pre-code': 'hsl(var(--fg-color-2))', // 100
						'--tw-prose-pre-bg': 'hsl(var(--fg-color-2))', // 900
						'--tw-prose-th-borders': 'hsl(var(--fg-color-2))', // 300
						'--tw-prose-td-borders': 'hsl(var(--fg-color-2))', // 200
						'--tw-prose-invert-body': 'hsl(var(--fg-color-2))', // 200
						'--tw-prose-invert-headings': 'hsl(var(--fg-color-2))', // theme('colors.white'),
						'--tw-prose-invert-lead': 'hsl(var(--fg-color-2))', // 300
						'--tw-prose-invert-links': 'hsl(var(--fg-color-2))', // theme('colors.white'),
						'--tw-prose-invert-bold': 'hsl(var(--fg-color-2))', // theme('colors.white'),
						'--tw-prose-invert-counters': 'hsl(var(--fg-color-2))', // 400
						'--tw-prose-invert-bullets': 'hsl(var(--fg-color-2))', // 600
						'--tw-prose-invert-hr': 'hsl(var(--fg-color-2))', // 700
						'--tw-prose-invert-quotes': 'hsl(var(--fg-color-2))', // 100
						'--tw-prose-invert-quote-borders': 'hsl(var(--fg-color-2))', // 700
						'--tw-prose-invert-captions': 'hsl(var(--fg-color-2))', // 400
						'--tw-prose-invert-code': 'hsl(var(--fg-color-2))',  // theme('colors.white'),
						'--tw-prose-invert-pre-code': 'hsl(var(--fg-color-2))', // 300
						'--tw-prose-invert-pre-bg': 'hsl(var(--fg-color-2))', // 'rgb(0 0 0) / 50%)',
						'--tw-prose-invert-th-borders': 'hsl(var(--fg-color-2))', // 600
						'--tw-prose-invert-td-borders': 'hsl(var(--fg-color-2))',  // 700
					},
				},
				DEFAULT: {
					css: {
					  blockquote: {
						'font-style': 'normal', // Optional: Reset to your preferred style
						quotes: 'none', // Disables default behavior of adding quotation marks to quotes
						'&::before': {
						  content: 'none', // Remove opening quotation mark
						},
						'&::after': {
						  content: 'none', // Remove closing quotation mark
						},
					  },
					},
				},
			  }),
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
