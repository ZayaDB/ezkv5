import { NextRequest, NextResponse } from 'next/server';
import { queryStudyInfoById } from '@/lib/data/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await queryStudyInfoById(params.id);
    if (!item) {
      return NextResponse.json({ error: '문서를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Get study info item error:', error);
    return NextResponse.json(
      { error: error.message || '문서를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
