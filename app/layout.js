export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <body style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f0f0f0' }}>
        {children}
      </body>
    </html>
  )
}
