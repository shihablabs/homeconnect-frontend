import { ProfileClient } from './ProfileClient';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {

  const { slug } = await params;
  return <ProfileClient id={slug} />;
}
