// frontend/src/app/notices/[id]/page.tsx
import { SpecificNotice } from '@/features/notice/components/SpecificNotice';

export default async function SpecificNoticePage({
                                                     params,
                                                 }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <SpecificNotice id={id} />;
}