import { redirect } from 'next/navigation';

// Redirection vers le catalog avec filtre tabliers
export default function TabliersPage() {
  redirect('/catalog?category=tabliers');
}
