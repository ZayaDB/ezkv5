import { NextRequest, NextResponse } from 'next/server';
import { queryLectureById } from '@/lib/data/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lecture = await queryLectureById(params.id);
    if (!lecture) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(lecture);
  } catch (error: any) {
    console.error('Get lecture error:', error);
    return NextResponse.json(
      { error: error.message || '강의 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
