// frontend/src/app/notices/[id]/page.tsx
import { SpecificEvent } from '@/features/event/components/SpecificEvent';

export default async function SpecificEventPage({
                                                     params,
                                                 }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <SpecificEvent id={id} />;
}