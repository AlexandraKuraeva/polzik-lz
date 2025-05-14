

import { Providers } from './ui/providers';
import {inter} from './ui/fonts';
import './global.css';



export default function RootLayout({ children }) {
  
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}><Providers>{children}</Providers></body>
    </html>
  );
}
