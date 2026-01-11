import { Metadata } from 'next';
import LoginViewPage from './login-view';

export const metadata: Metadata = {
  title: 'Authentification | Connexion',
  description: 'Page de connexion.'
};

export default function Page() {
  return <LoginViewPage />;
}
