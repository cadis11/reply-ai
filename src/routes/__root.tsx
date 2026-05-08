import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ReplyAI — Professional Review Replies for Small Businesses' },
      { name: 'description', content: 'Generate 3 professional reply variations for any customer review in seconds. Tailored to your business type, tone, and the review sentiment. Free to use.' },
      { name: 'robots', content: 'index, follow' },
      // Open Graph
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'ReplyAI — Professional Review Replies for Small Businesses' },
      { property: 'og:description', content: 'Generate 3 professional reply variations for any customer review in seconds. Free AI tool for small business owners.' },
      { property: 'og:site_name', content: 'ReplyAI' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'ReplyAI — Professional Review Replies' },
      { name: 'twitter:description', content: 'AI-powered review replies for small businesses. 3 variations, instant results, free to use.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      },
    ],
  }),
  notFoundComponent: () => <div>Route not found</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="font-inter">
        {children}
        <Scripts />
      </body>
    </html>
  )
}