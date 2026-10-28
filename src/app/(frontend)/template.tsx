import { ViewTransition } from 'react'
import type React from 'react'

// Sidetransition: ved sideskift toner det gamle indhold ud, og det nye ind (se .page-fade i globals.css). Header og footer ligger i
// layoutet og bliver stående. Template genskabes ved hvert sideskift, så ViewTransition kan se, at indholdet er skiftet.
export default function Template({ children }: { children: React.ReactNode }) {
  return <ViewTransition default="page-fade">{children}</ViewTransition>
}
