import { redirect } from 'next/navigation';

// Redirection vers le catalog avec filtre bijoux
export default function BijouxPage() {
  redirect('/catalog?category=bijoux');
}
