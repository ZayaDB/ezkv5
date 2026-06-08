export type RoadmapTemplateStep = {
  title: string;
  description?: string;
};

export type RoadmapTemplate = {
  key: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  steps: RoadmapTemplateStep[];
};

export const ROADMAP_TEMPLATES: Record<string, RoadmapTemplate> = {
  visa_extension: {
    key: "visa_extension",
    title: "비자 연장 준비",
    description: "비자 만료 전 필요한 서류와 절차를 단계별로 진행합니다.",
    priority: "high",
    steps: [
      { title: "비자 만료일 확인", description: "여권·외국인등록증의 만료일을 확인하세요." },
      { title: "학교 서류 요청", description: "재학증명서·성적증명서를 국제처에 요청하세요." },
      { title: "소득·잔고 증빙 준비", description: "은행 잔고증명서 등 필요 서류를 준비하세요." },
      { title: "출입국·외국인청 예약", description: "HiKorea 또는 방문 예약을 진행하세요." },
      { title: "신청 및 수수료 납부", description: "신청서 작성 후 수수료를 납부하세요." },
    ],
  },
  settling_korea: {
    key: "settling_korea",
    title: "한국 정착",
    description: "입국 후 기본 생활 인프라를 갖춥니다.",
    priority: "medium",
    steps: [
      { title: "외국인등록 신청", description: "입국 후 90일 이내 신청이 필요합니다." },
      { title: "휴대폰·통신 개통", description: "본인인증이 가능한 번호를 개통하세요." },
      { title: "은행 계좌 개설", description: "외국인등록증으로 계좌를 개설하세요." },
      { title: "건강보험 확인", description: "국민건강보험 가입 대상 여부를 확인하세요." },
    ],
  },
  moving: {
    key: "moving",
    title: "이사 준비",
    description: "주거 이전에 필요한 체크리스트입니다.",
    priority: "medium",
    steps: [
      { title: "예산·지역 정하기", description: "월세·보증금 예산과 희망 지역을 정하세요." },
      { title: "매물 탐색", description: "사기 예방을 위해 공인중개사·학교 추천 경로를 활용하세요." },
      { title: "계약서 검토", description: "보증금·해지 조건·관리비를 확인하세요." },
      { title: "전입신고·주소 변경", description: "이사 후 외국인등록 주소를 변경하세요." },
    ],
  },
  job_prep: {
    key: "job_prep",
    title: "취업 준비",
    description: "졸업 후 또는 인턴·알바를 위한 준비 단계입니다.",
    priority: "medium",
    steps: [
      { title: "비자별 취업 가능 범위 확인", description: "D-2·D-10 등 체류 자격별 근로 조건을 확인하세요." },
      { title: "이력서·포트폴리오 정리", description: "한국어·영어 버전을 준비하세요." },
      { title: "멘토·커리어 상담", description: "분야별 멘토와 상담 일정을 잡으세요." },
      { title: "지원 및 면접 준비", description: "지원 일정을 캘린더에 등록하세요." },
    ],
  },
  d10_prep: {
    key: "d10_prep",
    title: "D-10 구직비자 준비",
    description: "졸업 후 구직비자 전환을 위한 로드맵입니다.",
    priority: "high",
    steps: [
      { title: "전환 자격 요건 확인", description: "학위·졸업 요건·체류 기간을 확인하세요." },
      { title: "필요 서류 목록 정리", description: "학교·출입국 요구 서류를 정리하세요." },
      { title: "구직 활동 계획 수립", description: "지원 목표·기간을 설정하세요." },
      { title: "신청 일정 예약", description: "만료 전 여유 있게 신청 일정을 잡으세요." },
    ],
  },
};

export function resolveTemplateKey(message: string): string | null {
  const m = message.toLowerCase();
  if (/비자.*연장|연장.*비자|visa.*extend|виз.*сунгах/.test(m)) return "visa_extension";
  if (/이사|moving|move|шилжих|орон сууц/.test(m)) return "moving";
  if (/정착|입국|외국인등록|settle|arrival/.test(m)) return "settling_korea";
  if (/d-?10|구직비자/.test(m)) return "d10_prep";
  if (/취업|알바|job|career|ажил/.test(m)) return "job_prep";
  return null;
}
