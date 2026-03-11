export const metadata = {
  title: 'Mina SL-avgångar',
  description: 'Realtidskoll för 117 och Pendeltåg',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body>{children}</body>
    </html>
  )
}
