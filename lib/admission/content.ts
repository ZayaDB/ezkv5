/**
 * 대학 입시 안내 (외국인 특별전형 · 유웨이어플라이 지원)
 * 2027학년도 각 대학 모집요강(연세대·고려대·서울시립대·이화여대·경북대 등)에서 공통으로 보이는 내용만 정리.
 * 대학마다 다르므로 화면에서 "반드시 모집요강 확인"을 함께 보여준다.
 */
import type { Tri } from "@/lib/korean/questions";

export type AdmissionStep = { title: Tri; body: Tri };
export type ChecklistItem = { id: string; label: Tri; note?: Tri };

export const UWAY_URL = "https://www.uwayapply.com";
export const JINHAK_URL = "https://www.jinhakapply.com";

/** 1년 일정 (3월 입학 / 9월 입학) */
export const TIMELINE: Array<{ when: Tri; what: Tri }> = [
  {
    when: { kr: "입학 1년 전 ~", en: "1 year before ~", mn: "Элсэхээс 1 жилийн өмнөөс ~" },
    what: {
      kr: "TOPIK 준비·응시 (대부분 3급 이상, 상위권 대학·학과는 4~5급). 고교 졸업·성적 서류 아포스티유 준비",
      en: "Prepare for and take TOPIK (most schools ask for level 3+, top schools/majors 4–5). Get apostilles on high school diploma and transcripts",
      mn: "TOPIK-д бэлдэж, шалгалт өгөх (ихэнх сургууль 3-р түвшнээс дээш, шилдэг сургууль, мэргэжил 4–5-р түвшин). Ахлах сургуулийн диплом, дүнгийн хуудсанд апостиль хийлгэх",
    },
  },
  {
    when: { kr: "3월 입학: 전년도 9~12월", en: "March intake: Sep–Dec of the year before", mn: "3-р сарын элсэлт: өмнөх оны 9–12-р сар" },
    what: {
      kr: "원서접수 → 서류 우편 제출 → (일부) 면접 → 합격 발표 → 등록금 납부 → 표준입학허가서 발급",
      en: "Apply online → mail documents → (some schools) interview → results → pay tuition → certificate of admission issued",
      mn: "Онлайн бүртгүүлэх → бичиг баримтаа шуудангаар илгээх → (зарим сургууль) ярилцлага → дүн зарлах → төлбөр төлөх → элсэлтийн гэрчилгээ (표준입학허가서) авах",
    },
  },
  {
    when: { kr: "9월 입학: 같은 해 3~6월", en: "September intake: Mar–Jun of the same year", mn: "9-р сарын элсэлт: тухайн оны 3–6-р сар" },
    what: {
      kr: "모집 인원이 3월 입학보다 적은 대학이 많아요. 학과별 모집 여부를 먼저 확인하세요.",
      en: "Many schools take fewer students in September than in March. Check first whether your major is open.",
      mn: "Олон сургууль 9-р сард 3-р сарынхаас цөөн оюутан авдаг. Мэргэжил тань элсэлт авч байгаа эсэхийг эхлээд шалгаарай.",
    },
  },
  {
    when: { kr: "합격 후", en: "After admission", mn: "Тэнцсэний дараа" },
    what: {
      kr: "표준입학허가서로 유학(D-2) 비자 신청. 한국에 어학연수(D-4)로 있으면 체류자격 변경 신청",
      en: "Apply for a student (D-2) visa with the certificate of admission. If you're already in Korea on D-4, apply for a change of status",
      mn: "Элсэлтийн гэрчилгээгээр оюутны (D-2) виз мэдүүлэх. Солонгост хэлний (D-4) визээр байгаа бол визийн ангилал өөрчлөх хүсэлт гаргах",
    },
  },
];

/** 지원 자격 (공통) */
export const ELIGIBILITY: Tri[] = [
  {
    kr: "부모 모두 외국인인 외국인 (부모 중 한 명이라도 한국 국적이면 대상이 아니에요)",
    en: "You and both parents must be foreign nationals (if either parent is Korean, this track doesn't apply)",
    mn: "Өөрөө болон эцэг, эх хоёулаа гадаадын иргэн байх (эцэг эхийн нэг нь Солонгосын иргэн бол энэ элсэлтэд хамаарахгүй)",
  },
  {
    kr: "학부 신입학: 국내·외 고등학교 졸업(예정)자 (초·중·고 12년 과정)",
    en: "Undergraduate freshman: high school graduate (or expected), 12 years of schooling",
    mn: "Бакалаврын шинэ элсэгч: ахлах сургууль төгссөн (эсвэл төгсөх гэж буй), 12 жилийн боловсрол",
  },
  {
    kr: "편입: 4년제 대학 2년 이상 수료 또는 전문대 졸업 → 3학년 편입",
    en: "Transfer: completed 2+ years at a 4-year university or graduated from a junior college → enter as a 3rd-year",
    mn: "Шилжилт: 4 жилийн их сургуульд 2-оос дээш жил суралцсан эсвэл коллеж төгссөн → 3-р курсэд шилжих",
  },
  {
    kr: "한국어: TOPIK 3급 이상이 가장 흔해요. 의약·간호 등은 5급 이상, 일부 대학은 입학 후 TOPIK 4급을 졸업 요건으로 둬요",
    en: "Korean: TOPIK level 3+ is the most common requirement. Medicine/nursing often need level 5+, and some schools require TOPIK 4 to graduate",
    mn: "Солонгос хэл: TOPIK 3-р түвшнээс дээш нь хамгийн түгээмэл шаардлага. Анагаах, сувилахуй зэрэгт ихэвчлэн 5-р түвшнээс дээш, зарим сургууль төгсөхөд TOPIK 4 шаарддаг",
  },
];

/** 서류 체크리스트 */
export const CHECKLIST: ChecklistItem[] = [
  { id: "form", label: { kr: "입학원서 (온라인 작성 후 출력)", en: "Application form (fill in online, then print)", mn: "Элсэлтийн өргөдөл (онлайнаар бөглөөд хэвлэх)" } },
  {
    id: "essay",
    label: { kr: "자기소개서 · 학업계획서", en: "Personal statement & study plan", mn: "Өөрийн танилцуулга ба суралцах төлөвлөгөө" },
    note: {
      kr: "LNK 멘토에게 첨삭을 받을 수 있어요",
      en: "You can get feedback from an LNK mentor",
      mn: "LNK ментороос засвар, зөвлөгөө авч болно",
    },
  },
  {
    id: "diploma",
    label: { kr: "고등학교 졸업증명서 · 성적증명서", en: "High school diploma & transcripts", mn: "Ахлах сургуулийн диплом ба дүнгийн хуудас" },
    note: {
      kr: "아포스티유 또는 영사확인 필요 (몽골은 아포스티유 가능 국가)",
      en: "Apostille or consular legalization required (Mongolia is an Apostille country)",
      mn: "Апостиль эсвэл консулын баталгаажуулалт шаардлагатай (Монгол Улс апостиль хийдэг орон)",
    },
  },
  {
    id: "family",
    label: { kr: "가족관계 증명서류 (부모 모두 외국인임을 증명)", en: "Family relationship document (proves both parents are foreign)", mn: "Гэр бүлийн харилцааны баримт (эцэг, эх хоёулаа гадаадын иргэн болохыг нотлох)" },
    note: { kr: "출생증명서 등 + 번역·공증", en: "e.g. birth certificate + translation/notarization", mn: "Төрсний гэрчилгээ гэх мэт + орчуулга, нотариат" },
  },
  { id: "passport", label: { kr: "본인·부모 여권 사본 (외국인등록증 있으면 사본)", en: "Copies of your and your parents' passports (and residence card if you have one)", mn: "Өөрийн болон эцэг эхийн паспортын хуулбар (гадаадын иргэний үнэмлэхтэй бол хуулбар)" } },
  {
    id: "topik",
    label: { kr: "TOPIK 성적표", en: "TOPIK score report", mn: "TOPIK-ийн дүнгийн хуудас" },
    note: { kr: "원서 마감일 기준 유효기간(2년) 안의 성적만 인정", en: "Only scores valid (2 years) on the application deadline count", mn: "Бүртгэл хаагдах өдрөөр хүчинтэй (2 жил) оноо л тооцогдоно" },
  },
  {
    id: "bank",
    label: { kr: "재정능력 입증서류 (은행 잔고증명서)", en: "Proof of finances (bank balance certificate)", mn: "Санхүүгийн чадварын баримт (банкны үлдэгдлийн тодорхойлолт)" },
    note: {
      kr: "필요 금액·발급일 기준은 대학마다 달라요 (보통 1년 학비+생활비 수준)",
      en: "Required amount and issue-date rules differ by school (usually about one year of tuition + living costs)",
      mn: "Шаардлагатай дүн, олгосон хугацааны шаардлага сургууль бүрт өөр (ихэвчлэн 1 жилийн сургалтын төлбөр + амьжиргааны зардал)",
    },
  },
  { id: "photo", label: { kr: "증명사진", en: "ID photo", mn: "Цээж зураг" } },
  { id: "fee", label: { kr: "전형료 결제 (보통 10~15만 원)", en: "Application fee (usually ₩100,000–150,000)", mn: "Бүртгэлийн хураамж (ихэвчлэн 100,000–150,000 вон)" } },
];

/** 유웨이어플라이로 지원하는 순서 */
export const UWAY_STEPS: AdmissionStep[] = [
  {
    title: { kr: "대학 모집요강 확인", en: "Read the school's admission guide", mn: "Сургуулийн элсэлтийн журмыг унших" },
    body: {
      kr: "대학 국제처(입학처) 홈페이지에서 '외국인 특별전형 모집요강'을 내려받아 일정·자격·서류를 확인해요. 접수 사이트가 유웨이인지 진학어플라이인지도 여기 나와 있어요.",
      en: "Download the 'international student admission guide' from the school's international or admissions office site. It lists dates, eligibility, documents, and whether applications go through UwayApply or JinhakApply.",
      mn: "Сургуулийн олон улсын эсвэл элсэлтийн албаны сайтаас 'гадаад оюутны элсэлтийн журам'-ыг татаж аваад хугацаа, шаардлага, бичиг баримтаа шалгана. Бүртгэл UwayApply эсвэл JinhakApply-аар явагдах нь энд бичигдсэн байдаг.",
    },
  },
  {
    title: { kr: "유웨이어플라이 회원가입", en: "Sign up on UwayApply", mn: "UwayApply-д бүртгүүлэх" },
    body: {
      kr: "반드시 지원자 본인 이름으로 가입해요. 한국 휴대폰이 없어도 가입할 수 있어요.",
      en: "Sign up in the applicant's own name. You can sign up without a Korean phone number.",
      mn: "Заавал өргөдөл гаргагчийн өөрийн нэрээр бүртгүүлнэ. Солонгос утасны дугааргүй ч бүртгүүлж болно.",
    },
  },
  {
    title: { kr: "'Int'l student'에서 대학 고르기", en: "Pick your school under 'Int'l student'", mn: "'Int'l student' хэсгээс сургуулиа сонгох" },
    body: {
      kr: "첫 화면의 'Int'l student'(외국인) 메뉴에서 대학과 학기(예: 2027.1학기)를 골라요.",
      en: "In the 'Int'l student' menu on the main page, choose the school and term (e.g. 2027 Spring).",
      mn: "Нүүр хуудасны 'Int'l student' цэснээс сургууль болон улирлаа (жишээ нь 2027 оны хавар) сонгоно.",
    },
  },
  {
    title: { kr: "원서 작성 · 사진 업로드", en: "Fill in the form & upload a photo", mn: "Өргөдөл бөглөж, зураг оруулах" },
    body: {
      kr: "학과는 보통 한 전형에 1개만 고를 수 있어요. 외국인등록번호가 있으면 '있음'을 고르고 입력해요.",
      en: "Usually you can choose only one major per track. If you have an alien registration number, select 'yes' and enter it.",
      mn: "Ихэвчлэн нэг элсэлтэд зөвхөн нэг мэргэжил сонгоно. Гадаадын иргэний бүртгэлийн дугаартай бол 'байгаа'-г сонгоод оруулна.",
    },
  },
  {
    title: { kr: "전형료 결제", en: "Pay the application fee", mn: "Бүртгэлийн хураамж төлөх" },
    body: {
      kr: "결제하면 접수가 끝나요. 접수 후에는 취소·학과 변경·환불이 안 되니 결제 전에 꼭 다시 확인하세요.",
      en: "Payment completes the application. After that you can't cancel, change majors, or get a refund, so double-check before paying.",
      mn: "Төлбөр төлснөөр бүртгэл дуусна. Үүний дараа цуцлах, мэргэжил солих, буцаан олголт авах боломжгүй тул төлөхөөсөө өмнө дахин шалгаарай.",
    },
  },
  {
    title: { kr: "원서 출력 · 서류 우편 제출", en: "Print the form & mail your documents", mn: "Өргөдлөө хэвлэж, бичиг баримтаа шуудангаар илгээх" },
    body: {
      kr: "수험번호가 적힌 원서와 '발송용 봉투 표지'를 출력해 서류와 함께 마감일까지 도착하도록 보내요. 우편만 받는 대학이 늘고 있어요.",
      en: "Print the form with your application number and the 'mailing envelope cover', then send them with your documents so they arrive by the deadline. More schools now accept mail only.",
      mn: "Шалгуулагчийн дугаартай өргөдөл болон 'илгээх дугтуйн нүүр'-ийг хэвлээд бичиг баримттайгаа хамт хугацаандаа хүрэхээр илгээнэ. Зөвхөн шуудангаар хүлээн авдаг сургууль нэмэгдэж байна.",
    },
  },
  {
    title: { kr: "결과 확인 · 등록", en: "Check results & enroll", mn: "Дүнгээ шалгаж, бүртгүүлэх" },
    body: {
      kr: "합격하면 등록금을 내고 표준입학허가서를 받아요. 이걸로 D-2 비자를 신청해요 (마이페이지 비자 로드맵에서 다음 단계 확인).",
      en: "If accepted, pay tuition and receive the certificate of admission. Use it to apply for a D-2 visa (see the next steps in your My page visa roadmap).",
      mn: "Тэнцвэл сургалтын төлбөрөө төлж, элсэлтийн гэрчилгээ авна. Үүгээр D-2 виз мэдүүлнэ (дараагийн алхмаа Миний хуудасны визийн замын зургаас хараарай).",
    },
  },
];

/** 장학금 (자주 보는 것) */
export const SCHOLARSHIPS: Array<{ title: Tri; body: Tri }> = [
  {
    title: { kr: "TOPIK 급수 장학금", en: "TOPIK-level scholarships", mn: "TOPIK түвшний тэтгэлэг" },
    body: {
      kr: "많은 대학이 입학 때 TOPIK 급수에 따라 첫 학기 등록금의 일부를 감면해요. 급수가 높을수록 감면이 커요.",
      en: "Many schools reduce first-semester tuition based on your TOPIK level at admission. The higher the level, the bigger the discount.",
      mn: "Олон сургууль элсэх үеийн TOPIK түвшингээр эхний улирлын төлбөрийн тодорхой хэсгийг хөнгөлдөг. Түвшин өндөр байх тусам хөнгөлөлт их.",
    },
  },
  {
    title: { kr: "성적 장학금", en: "Merit scholarships", mn: "Сурлагын тэтгэлэг" },
    body: {
      kr: "입학 후에는 직전 학기 평균 학점으로 장학금을 정하는 대학이 많아요. 계속 받으려면 기준 학점을 유지해야 해요.",
      en: "After you enroll, many schools award scholarships based on last semester's GPA. You must keep the minimum GPA to keep it.",
      mn: "Элссэний дараа олон сургууль өмнөх улирлын дундаж оноогоор тэтгэлэг олгодог. Үргэлжлүүлэн авахын тулд шаардлагатай дундаж оноогоо хадгалах ёстой.",
    },
  },
  {
    title: { kr: "GKS (정부초청장학생)", en: "GKS (Global Korea Scholarship)", mn: "GKS (Солонгосын засгийн газрын тэтгэлэг)" },
    body: {
      kr: "한국 정부가 학비·생활비·항공권을 지원해요. 국립국제교육원(studyinkorea.go.kr)에서 매년 모집 공고가 나와요.",
      en: "The Korean government covers tuition, living costs, and airfare. NIIED (studyinkorea.go.kr) posts the call for applications every year.",
      mn: "Солонгосын засгийн газар сургалтын төлбөр, амьжиргааны зардал, онгоцны тийзийг санхүүжүүлдэг. NIIED (studyinkorea.go.kr) жил бүр зарлал гаргадаг.",
    },
  },
];
