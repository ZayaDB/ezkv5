import { NextRequest, NextResponse } from 'next/server';
import { queryStudyInfos } from '@/lib/data/queries';
import type { StudyInfo } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cat = searchParams.get('category') as StudyInfo['category'] | null;
    const valid: StudyInfo['category'][] = ['visa', 'housing', 'hospital', 'lifeTips'];
    const category = cat && valid.includes(cat) ? cat : undefined;
    const items = await queryStudyInfos({ category });
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Get study info error:', error);
    return NextResponse.json(
      { error: error.message || '유학 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
