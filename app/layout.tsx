import type { Metadata, Viewport } from 'next';
import './globals.css';
import SmartlookConsent from './smartlook-consent';
import {siteUrl} from './seo';
export const viewport:Viewport={width:'device-width',initialScale:1,interactiveWidget:'resizes-content',viewportFit:'cover'};
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:'Descobridor',description:'Plataforma de consultas cadastrais e atendimento.',applicationName:'Descobridor',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body className="antialiased">{children}<SmartlookConsent/></body></html>}
