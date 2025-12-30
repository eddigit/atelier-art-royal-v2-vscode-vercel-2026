import { redirect } from 'next/navigation';

// Redirection vers le catalog avec filtre sautoirs
export default function SautoirsPage() {
  redirect('/catalog?category=sautoirs');
}
