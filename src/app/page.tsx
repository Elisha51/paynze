
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/?storefront=true');
  return null;
}
