// app/layout.js
export const metadata = {
  title: 'Avgångstavla',
  description: 'Realtid för buss och tåg',
  // Det här är magin som säger till iOS att appen kan köras i helskärm
  appleWebApp: {
    capable: true,
    title: 'Avgångar',
    statusBarStyle: 'black', // Gör klockan/batteriet längst upp snyggt mörkt
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
        {/* En extra säkerhetsåtgärd för äldre iPads */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#111' }}>
        {children}
      </body>
    </html>
  )
}
