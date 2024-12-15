import { Metadata } from 'next';
import SignUpViewPage from './signup-view';



export const metadata: Metadata = {
  title: 'Authentification | Inscription',
  description: 'Page d&apos;inscription.'
};

export default function Page() {
  return <SignUpViewPage />;
}
