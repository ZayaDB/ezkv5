import { NextRequest, NextResponse } from 'next/server';
import { queryFreelancerById } from '@/lib/data/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const group = await queryFreelancerById(params.id);
    if (!group) {
      return NextResponse.json({ error: '그룹을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json(group);
  } catch (error: any) {
    console.error('Get freelancer group error:', error);
    return NextResponse.json(
      { error: error.message || '그룹 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
