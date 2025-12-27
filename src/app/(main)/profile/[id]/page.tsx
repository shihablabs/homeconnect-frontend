import { ProfileClient } from './ProfileClient';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params in Next.js 15+
  const { id } = await params;
  return <ProfileClient id={id} />;
}
