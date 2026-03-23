import { NextRequest, NextResponse } from 'next/server';
import { queryFreelancerGroups } from '@/lib/data/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const groups = await queryFreelancerGroups({ category, limit: 200 });
    return NextResponse.json({ groups });
  } catch (error: any) {
    console.error('Get freelancer groups error:', error);
    return NextResponse.json(
      { error: error.message || '프리랜서 그룹 목록을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
