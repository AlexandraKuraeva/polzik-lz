

import { SessionProvider } from 'next-auth/react'
import {inter} from './ui/fonts';
import './global.css';



export default function RootLayout({ children }) {
  console.log(inter);
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}> <SessionProvider>{children} </SessionProvider></body>
    </html>
  );
}
