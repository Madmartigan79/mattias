// app/layout.js
export const metadata = {
  title: 'Nästa Resa - Spånga & Solhagavägen',
  description: 'Avgångstavla för buss 117 och Pendeltåg',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <head>
        {/* Den här raden laddar hem typsnittet VT323 (Pixel-stilen) från Google */}
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#111' }}>
        {children}
      </body>
    </html>
  )
}
