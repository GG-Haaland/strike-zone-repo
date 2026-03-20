import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Strike Zone · Bowling League Tracker",
  description:
    "Real-time bowling scorekeeper with team leaderboards, streak tracking, and interactive 3D lane animations.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
