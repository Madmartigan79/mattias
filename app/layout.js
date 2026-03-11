// Den här raden "importerar" din CSS-fil så att appen får färg och form
import './globals.css'

export const metadata = {
  title: 'Mina SL-avgångar',
  description: 'Realtidskoll för 117 och Pendeltåg',
}

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  )
}
