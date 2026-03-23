import { NextRequest, NextResponse } from 'next/server';
import { queryCommunityGroups } from '@/lib/data/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const groups = await queryCommunityGroups({ category, limit: 200 });
    return NextResponse.json({ groups });
  } catch (error: any) {
    console.error('Get community groups error:', error);
    return NextResponse.json(
      { error: error.message || '커뮤니티 목록을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
