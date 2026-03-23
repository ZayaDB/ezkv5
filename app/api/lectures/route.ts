import { NextRequest, NextResponse } from 'next/server';
import { queryLectures } from '@/lib/data/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'online' | 'offline' | null;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    const { lectures, total } = await queryLectures({
      type: type === 'online' || type === 'offline' ? type : undefined,
      category,
      page,
      limit,
    });

    return NextResponse.json({
      lectures,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (error: any) {
    console.error('Get lectures error:', error);
    return NextResponse.json(
      { error: error.message || '강의 목록을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
