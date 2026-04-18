import { redirect } from 'next/navigation';

export default function OntologyPage() {
  redirect('/?view=graph');
}
