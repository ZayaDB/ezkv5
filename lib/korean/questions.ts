/**
 * 한국어 연습 문제 (TOPIK I~II 초·중급 유형)
 * - 문제·보기는 한국어, 해설은 kr/en/mn
 * - level: 1 초급1 · 2 초급2 · 3 중급1 · 4 중급2 (TOPIK 1~4급 수준을 대략 나눔)
 */

export type KoreanCategory = "vocab" | "grammar" | "reading";
export type Tri = { kr: string; en: string; mn: string };

export type KoreanQuestion = {
  id: string;
  level: 1 | 2 | 3 | 4;
  cat: KoreanCategory;
  /** 읽기 지문 (있을 때만) */
  passage?: string;
  prompt: string;
  choices: string[];
  answer: number;
  explain: Tri;
  /** 쓰임 예문: 한국어 + 뜻 */
  example?: { ko: string; en: string; mn: string };
};

export const KOREAN_QUESTIONS: KoreanQuestion[] = [
  /* ───────── 초급 1 ───────── */
  {
    id: "v1-student",
    level: 1,
    cat: "vocab",
    prompt: "학교에서 공부하는 사람은 누구예요?",
    choices: ["학생", "의사", "요리사", "경찰"],
    answer: 0,
    explain: {
      kr: "학교에서 공부하는 사람은 '학생'이에요. 의사는 병원, 요리사는 식당, 경찰은 경찰서에서 일해요.",
      en: "A person who studies at school is a '학생' (student). A doctor works at a hospital, a cook at a restaurant, and a police officer at a police station.",
      mn: "Сургуульд сурдаг хүнийг '학생' (оюутан, сурагч) гэдэг. Эмч эмнэлэгт, тогооч ресторанд, цагдаа цагдаагийн газарт ажилладаг.",
    },
    example: { ko: "저는 한국대학교 학생이에요.", en: "I am a student at Hanguk University.", mn: "Би Ханьгүг их сургуулийн оюутан." },
  },
  {
    id: "g1-ieyo",
    level: 1,
    cat: "grammar",
    prompt: "저는 몽골 사람(    ).",
    choices: ["이에요", "예요", "있어요", "해요"],
    answer: 0,
    explain: {
      kr: "명사 끝에 받침이 있으면 '이에요', 없으면 '예요'를 써요. '사람'은 받침(ㅁ)이 있으니까 '사람이에요'가 맞아요.",
      en: "Use '이에요' after a noun ending in a consonant (batchim) and '예요' after a vowel. '사람' ends in ㅁ, so it's '사람이에요'.",
      mn: "Нэр үг гийгүүлэгчээр (batchim) төгсвөл '이에요', эгшгээр төгсвөл '예요' хэрэглэнэ. '사람' нь ㅁ-ээр төгсдөг тул '사람이에요' зөв.",
    },
    example: { ko: "제 이름은 자야예요. 저는 학생이에요.", en: "My name is Zaya. I am a student.", mn: "Миний нэр Заяа. Би оюутан." },
  },
  {
    id: "g1-eseo",
    level: 1,
    cat: "grammar",
    prompt: "도서관(    ) 책을 읽어요.",
    choices: ["에서", "에", "을", "는"],
    answer: 0,
    explain: {
      kr: "어떤 행동을 하는 장소에는 '에서'를 써요. '에'는 가다·오다·있다처럼 도착하거나 있는 곳에 써요. (도서관에 가요 / 도서관에서 공부해요)",
      en: "Use '에서' for the place where an action happens. '에' is for a destination or location of existence, as with 가다, 오다, 있다. (도서관에 가요 / 도서관에서 공부해요)",
      mn: "Үйлдэл хийгдэж буй газрыг '에서'-ээр заана. '에' нь 가다 (явах), 오다 (ирэх), 있다 (байх) зэрэгт очих газар эсвэл байрлалыг заана. (도서관에 가요 — номын санд явна / 도서관에서 공부해요 — номын санд хичээл хийнэ)",
    },
    example: { ko: "저는 카페에서 친구를 만나요.", en: "I meet my friend at a café.", mn: "Би кафед найзтайгаа уулзана." },
  },
  {
    id: "v1-days",
    level: 1,
    cat: "vocab",
    prompt: "오늘은 월요일이에요. 내일은 (    )이에요.",
    choices: ["화요일", "일요일", "수요일", "금요일"],
    answer: 0,
    explain: {
      kr: "요일 순서: 월요일 → 화요일 → 수요일 → 목요일 → 금요일 → 토요일 → 일요일. 월요일 다음 날은 화요일이에요.",
      en: "Days in order: 월요일 (Mon) → 화요일 (Tue) → 수요일 (Wed) → 목요일 (Thu) → 금요일 (Fri) → 토요일 (Sat) → 일요일 (Sun). The day after Monday is 화요일.",
      mn: "Гарагийн дараалал: 월요일 (Даваа) → 화요일 (Мягмар) → 수요일 (Лхагва) → 목요일 (Пүрэв) → 금요일 (Баасан) → 토요일 (Бямба) → 일요일 (Ням). Даваагийн дараах өдөр нь 화요일.",
    },
    example: { ko: "화요일에 한국어 수업이 있어요.", en: "I have Korean class on Tuesday.", mn: "Мягмар гарагт солонгос хэлний хичээлтэй." },
  },
  {
    id: "g1-past",
    level: 1,
    cat: "grammar",
    prompt: "어제 친구를 (    ).",
    choices: ["만났어요", "만나요", "만날 거예요", "만나세요"],
    answer: 0,
    explain: {
      kr: "'어제'는 지난 일이라서 과거형 '-았/었어요'를 써요. 만나다 → 만났어요.",
      en: "'어제' (yesterday) is in the past, so use the past tense '-았/었어요': 만나다 → 만났어요.",
      mn: "'어제' (өчигдөр) нь өнгөрсөн цаг тул '-았/었어요' хэлбэр хэрэглэнэ: 만나다 → 만났어요.",
    },
    example: { ko: "지난주에 부산에 갔어요.", en: "I went to Busan last week.", mn: "Өнгөрсөн долоо хоногт Пусан руу явсан." },
  },
  {
    id: "r1-schedule",
    level: 1,
    cat: "reading",
    passage: "저는 아침 7시에 일어나요. 8시에 밥을 먹어요. 9시에 학교에 가요.",
    prompt: "이 사람은 몇 시에 학교에 가요?",
    choices: ["9시", "7시", "8시", "10시"],
    answer: 0,
    explain: {
      kr: "'9시에 학교에 가요'라고 했어요. 7시는 일어나는 시간, 8시는 밥 먹는 시간이에요.",
      en: "The text says '9시에 학교에 가요' (goes to school at 9). 7 is when they wake up and 8 is when they eat.",
      mn: "Эхэд '9시에 학교에 가요' (9 цагт сургууль руу явна) гэжээ. 7 цагт босдог, 8 цагт хоол иддэг.",
    },
  },

  /* ───────── 초급 2 ───────── */
  {
    id: "g2-nikka",
    level: 2,
    cat: "grammar",
    prompt: "비가 (    ) 우산을 가져가세요.",
    choices: ["오니까", "와서", "오지만", "오고"],
    answer: 0,
    explain: {
      kr: "뒤에 '-세요(명령·부탁)'가 올 때 이유는 '-(으)니까'를 써요. '-아서/어서'는 명령·부탁 문장과 같이 쓸 수 없어요.",
      en: "When the sentence ends with a command or request like '-세요', give the reason with '-(으)니까'. '-아서/어서' can't be used with commands or requests.",
      mn: "Өгүүлбэр '-세요' гэх мэт тушаал, хүсэлтээр төгсвөл шалтгааныг '-(으)니까'-аар илэрхийлнэ. '-아서/어서'-ийг тушаал, хүсэлттэй хамт хэрэглэж болохгүй.",
    },
    example: { ko: "시간이 없으니까 택시를 탑시다.", en: "We don't have time, so let's take a taxi.", mn: "Цаг байхгүй болохоор такси барья." },
  },
  {
    id: "g2-sipeo",
    level: 2,
    cat: "grammar",
    prompt: "한국어를 잘하고 (    ).",
    choices: ["싶어요", "있어요", "주세요", "봐요"],
    answer: 0,
    explain: {
      kr: "하고 싶은 것을 말할 때 '-고 싶다'를 써요. 잘하다 → 잘하고 싶어요(잘하고 싶다).",
      en: "Use '-고 싶다' to say what you want to do: 잘하다 → 잘하고 싶어요 (I want to be good at it).",
      mn: "Хийхийг хүссэн зүйлээ '-고 싶다'-аар илэрхийлнэ: 잘하다 → 잘하고 싶어요 (сайн мэддэг болмоор байна).",
    },
    example: { ko: "방학에 제주도에 가고 싶어요.", en: "I want to go to Jeju Island during the break.", mn: "Амралтаараа Жэжү арал руу явмаар байна." },
  },
  {
    id: "v2-sorry",
    level: 2,
    cat: "vocab",
    prompt: "약속 시간에 늦어서 친구에게 (    ).",
    choices: ["미안하다고 했어요", "고맙다고 했어요", "축하한다고 했어요", "반갑다고 했어요"],
    answer: 0,
    explain: {
      kr: "늦어서 잘못했을 때는 '미안하다(죄송하다)'고 해요. 고맙다는 감사, 축하한다는 좋은 일, 반갑다는 만났을 때 써요.",
      en: "When you're late, you apologize: '미안하다' (sorry). 고맙다 is thanks, 축하한다 is congratulations, and 반갑다 is 'nice to see you'.",
      mn: "Хоцорсон бол уучлал гуйна: '미안하다' (уучлаарай). 고맙다 — баярлалаа, 축하한다 — баяр хүргэе, 반갑다 — уулзсандаа баяртай байна.",
    },
    example: { ko: "늦어서 죄송합니다.", en: "I'm sorry I'm late.", mn: "Хоцорсонд уучлаарай." },
  },
  {
    id: "g2-future",
    level: 2,
    cat: "grammar",
    prompt: "주말에 영화를 (    ) 거예요.",
    choices: ["볼", "본", "보는", "봤을"],
    answer: 0,
    explain: {
      kr: "앞으로 할 일은 '-(으)ㄹ 거예요'로 말해요. 보다 → 볼 거예요.",
      en: "Talk about future plans with '-(으)ㄹ 거예요': 보다 → 볼 거예요 (I will watch).",
      mn: "Ирээдүйд хийх зүйлээ '-(으)ㄹ 거예요'-аар хэлнэ: 보다 → 볼 거예요 (үзнэ).",
    },
    example: { ko: "다음 달에 이사할 거예요.", en: "I'm going to move next month.", mn: "Дараа сард нүүнэ." },
  },
  {
    id: "r2-library",
    level: 2,
    cat: "reading",
    passage: "도서관 이용 시간\n평일 09:00 ~ 21:00\n토요일 10:00 ~ 17:00\n일요일 휴관",
    prompt: "내용과 같은 것을 고르세요.",
    choices: [
      "일요일에는 도서관을 이용할 수 없어요.",
      "토요일에는 9시에 문을 열어요.",
      "평일에는 밤 10시까지 해요.",
      "매일 같은 시간에 문을 열어요.",
    ],
    answer: 0,
    explain: {
      kr: "'휴관'은 쉬는 날이라는 뜻이에요. 일요일에는 문을 닫아요. 토요일은 10시에 열고, 평일은 21시(밤 9시)까지예요.",
      en: "'휴관' means closed. It's closed on Sunday. On Saturday it opens at 10, and on weekdays it's open until 21:00 (9 p.m.).",
      mn: "'휴관' нь амарна (хаалттай) гэсэн үг. Ням гарагт хаалттай. Бямбад 10 цагт нээж, ажлын өдрүүдэд 21:00 (оройн 9) хүртэл ажиллана.",
    },
  },
  {
    id: "v2-hospital",
    level: 2,
    cat: "vocab",
    prompt: "감기에 걸려서 (    )에 갔어요.",
    choices: ["병원", "은행", "우체국", "미용실"],
    answer: 0,
    explain: {
      kr: "아플 때는 '병원'에 가요. 은행은 돈, 우체국은 편지·택배, 미용실은 머리를 자를 때 가요.",
      en: "When you're sick, you go to a '병원' (hospital/clinic). 은행 is a bank, 우체국 a post office, and 미용실 a hair salon.",
      mn: "Өвдвөл '병원' (эмнэлэг) явна. 은행 — банк, 우체국 — шуудан, 미용실 — үсчин.",
    },
    example: { ko: "머리가 아파서 약국에서 약을 샀어요.", en: "I had a headache, so I bought medicine at the pharmacy.", mn: "Толгой өвдөөд эмийн сангаас эм авсан." },
  },

  /* ───────── 중급 1 ───────── */
  {
    id: "g3-deokbune",
    level: 3,
    cat: "grammar",
    prompt: "열심히 공부한 (    ) 시험에 합격했어요.",
    choices: ["덕분에", "대신에", "동안에", "김에"],
    answer: 0,
    explain: {
      kr: "'-(으)ㄴ 덕분에'는 좋은 결과의 이유를 말할 때 써요. 열심히 공부했기 때문에 합격이라는 좋은 결과가 나왔어요.",
      en: "'-(으)ㄴ 덕분에' gives the reason for a good result: thanks to studying hard, I passed.",
      mn: "'-(으)ㄴ 덕분에' нь сайн үр дүнгийн шалтгааныг заана: шаргуу сурсны ачаар шалгалтандаа тэнцсэн.",
    },
    example: { ko: "선배가 도와준 덕분에 서류를 빨리 준비했어요.", en: "Thanks to my senior's help, I prepared the documents quickly.", mn: "Ахлах ангийнхан тусалсны ачаар бичиг баримтаа хурдан бэлдсэн." },
  },
  {
    id: "g3-baram",
    level: 3,
    cat: "grammar",
    prompt: "버스를 놓치는 (    ) 수업에 늦었어요.",
    choices: ["바람에", "덕분에", "대로", "만큼"],
    answer: 0,
    explain: {
      kr: "'-는 바람에'는 예상하지 못한 일 때문에 안 좋은 결과가 생겼을 때 써요. 버스를 놓쳐서 늦었어요.",
      en: "'-는 바람에' is used when something unexpected leads to a bad result: because I missed the bus, I was late.",
      mn: "'-는 바람에' нь гэнэтийн зүйлээс болж муу үр дүн гарсныг заана: автобуснаас хоцорсноос болж хичээлдээ хоцорсон.",
    },
    example: { ko: "휴대폰이 고장 나는 바람에 연락을 못 했어요.", en: "My phone broke, so I couldn't contact you.", mn: "Утас эвдэрсний улмаас холбогдож чадсангүй." },
  },
  {
    id: "v3-reissue",
    level: 3,
    cat: "vocab",
    prompt: "외국인등록증을 잃어버려서 (    ) 신청을 했어요.",
    choices: ["재발급", "재검토", "재활용", "재방송"],
    answer: 0,
    explain: {
      kr: "'재발급'은 잃어버리거나 망가진 카드·서류를 다시 받는 것이에요. 외국인등록증을 잃어버리면 14일 안에 출입국·외국인청에 재발급을 신청해야 해요.",
      en: "'재발급' means getting a lost or damaged card or document reissued. If you lose your residence card, apply for reissue at the immigration office within 14 days.",
      mn: "'재발급' нь гээсэн эсвэл гэмтсэн карт, бичиг баримтыг дахин олгуулахыг хэлнэ. Гадаадын иргэний үнэмлэхээ гээвэл 14 хоногийн дотор цагаачлалын албанд дахин олгуулах хүсэлт гаргах ёстой.",
    },
    example: { ko: "학생증을 재발급받았어요.", en: "I got my student ID reissued.", mn: "Оюутны үнэмлэхээ дахин авсан." },
  },
  {
    id: "r3-extend",
    level: 3,
    cat: "reading",
    passage:
      "체류 기간이 끝나기 전에 출입국·외국인청에 연장 신청을 해야 합니다. 기간이 지난 후에 신청하면 범칙금을 낼 수 있으니 미리 준비하세요.",
    prompt: "내용과 같은 것을 고르세요.",
    choices: [
      "연장 신청은 체류 기간이 끝나기 전에 해야 한다.",
      "체류 기간이 지나도 아무 문제가 없다.",
      "연장 신청은 학교에서 한다.",
      "연장을 신청할 때는 항상 범칙금을 낸다.",
    ],
    answer: 0,
    explain: {
      kr: "'끝나기 전에 연장 신청을 해야 합니다'라고 했어요. 범칙금은 기간이 지난 후에 신청할 때만 낼 수 있어요.",
      en: "The text says you must apply for an extension before your stay period ends. A fine may apply only if you apply after it has expired.",
      mn: "Эхэд оршин суух хугацаа дуусахаас өмнө сунгалтын хүсэлт гаргах ёстой гэжээ. Торгууль нь хугацаа өнгөрсний дараа хүсэлт гаргавал л ногдож болно.",
    },
  },
  {
    id: "g3-must",
    level: 3,
    cat: "grammar",
    prompt: "아무리 바빠도 아침은 (    ).",
    choices: ["먹어야 해요", "먹었어요", "먹고 싶지 않아요", "먹을까요"],
    answer: 0,
    explain: {
      kr: "'아무리 -아도/어도'는 '어떤 상황이라도'라는 뜻이에요. 뒤에는 그래도 꼭 해야 하는 일 '-아야/어야 해요'가 자연스러워요.",
      en: "'아무리 -아도/어도' means 'no matter how...'. It naturally goes with something you still must do: '-아야/어야 해요'.",
      mn: "'아무리 -아도/어도' нь 'хичнээн ч ... байсан' гэсэн утгатай. Араас нь заавал хийх ёстой зүйл буюу '-아야/어야 해요' зохимжтой.",
    },
    example: { ko: "아무리 피곤해도 숙제는 해야 해요.", en: "No matter how tired I am, I have to do my homework.", mn: "Хичнээн ядарсан ч гэрийн даалгавраа хийх ёстой." },
  },
  {
    id: "v3-permit",
    level: 3,
    cat: "vocab",
    prompt: "유학생이 아르바이트를 하려면 시간제 취업 (    )를 받아야 해요.",
    choices: ["허가", "면허", "자격증", "영수증"],
    answer: 0,
    explain: {
      kr: "'허가'는 해도 된다고 허락받는 것이에요. 유학생(D-2)·어학연수생(D-4)은 아르바이트 전에 출입국에서 '시간제 취업 허가'를 받아야 해요.",
      en: "'허가' means permission. Students on D-2 or D-4 visas must get 'part-time work permission' (시간제 취업 허가) from immigration before working.",
      mn: "'허가' нь зөвшөөрөл гэсэн үг. D-2, D-4 визтэй оюутнууд цагийн ажил хийхээс өмнө цагаачлалаас 'цагийн ажлын зөвшөөрөл' (시간제 취업 허가) авах ёстой.",
    },
    example: { ko: "허가 없이 일하면 안 돼요.", en: "You must not work without permission.", mn: "Зөвшөөрөлгүйгээр ажиллаж болохгүй." },
  },

  /* ───────── 중급 2 ───────── */
  {
    id: "g4-moyang",
    level: 4,
    cat: "grammar",
    prompt: "하루 종일 연락이 없는 걸 보니 많이 바쁜 (    ).",
    choices: ["모양이에요", "척해요", "김이에요", "대신이에요"],
    answer: 0,
    explain: {
      kr: "'-(으)ㄴ/는 걸 보니 -(으)ㄴ 모양이다'는 보거나 들은 것을 근거로 추측할 때 써요. 연락이 없으니 바쁜 것 같다는 뜻이에요.",
      en: "'-는 걸 보니 -(으)ㄴ 모양이다' makes a guess based on what you see: since there's been no contact, they must be busy.",
      mn: "'-는 걸 보니 -(으)ㄴ 모양이다' нь харсан, сонссон зүйлдээ үндэслэн таамаглахыг илэрхийлнэ: холбоо барихгүй байгаагаас харахад их завгүй бололтой.",
    },
    example: { ko: "길이 젖은 걸 보니 밤에 비가 온 모양이에요.", en: "The road is wet, so it must have rained last night.", mn: "Зам нойтон байгаагаас харахад шөнө бороо орсон бололтой." },
  },
  {
    id: "v4-maintain",
    level: 4,
    cat: "vocab",
    prompt: "장학금을 계속 받으려면 일정 성적 이상을 (    )해야 합니다.",
    choices: ["유지", "유학", "유행", "유출"],
    answer: 0,
    explain: {
      kr: "'유지하다'는 어떤 상태를 계속 지키는 것이에요. 많은 대학이 장학금을 계속 주는 조건으로 평균 학점 기준을 둬요.",
      en: "'유지하다' means to keep or maintain a state. Many universities require a minimum GPA to keep a scholarship.",
      mn: "'유지하다' нь тодорхой төлөв байдлыг хадгалж байхыг хэлнэ. Олон их сургууль тэтгэлгээ үргэлжлүүлэн авахын тулд дундаж оноо тодорхой түвшнээс дээш байхыг шаарддаг.",
    },
    example: { ko: "건강을 유지하려면 운동을 해야 해요.", en: "To stay healthy, you need to exercise.", mn: "Эрүүл мэндээ хадгалахын тулд дасгал хийх хэрэгтэй." },
  },
  {
    id: "r4-parttime",
    level: 4,
    cat: "reading",
    passage:
      "최근 유학생이 늘면서 학업과 아르바이트를 함께 하는 학생도 많아졌다. 하지만 허가 없이 일하거나 허가받은 시간을 넘겨 일하면 체류 기간 연장 등에서 불이익을 받을 수 있다. 따라서 일을 시작하기 전에 규정을 꼭 확인해야 한다.",
    prompt: "이 글의 중심 내용으로 알맞은 것을 고르세요.",
    choices: [
      "유학생은 아르바이트 규정을 지켜야 한다.",
      "유학생 수가 줄어들고 있다.",
      "아르바이트를 하면 체류 연장에 도움이 된다.",
      "유학생은 아르바이트를 하면 안 된다.",
    ],
    answer: 0,
    explain: {
      kr: "마지막 문장 '규정을 꼭 확인해야 한다'가 중심 내용이에요. 아르바이트 자체를 금지하는 것이 아니라 허가와 시간을 지키라는 글이에요.",
      en: "The main idea is in the last sentence: check the rules before you start. The text doesn't ban part-time work; it says to follow the permit and hour limits.",
      mn: "Гол санаа нь сүүлийн өгүүлбэрт буй 'журмаа заавал шалгах ёстой' гэдэг. Цагийн ажлыг хориглоогүй, зөвшөөрөл болон цагийн хязгаараа баримтлахыг хэлж байна.",
    },
  },
  {
    id: "g4-sumy",
    level: 4,
    cat: "grammar",
    prompt: "내일이 시험인데 하나도 공부를 안 했으니 걱정이 (    ) 수가 없어요.",
    choices: ["안 될", "될", "되는", "됐을"],
    answer: 0,
    explain: {
      kr: "'-지 않을 수가 없다 / 안 -(으)ㄹ 수가 없다'는 '꼭 그렇게 된다'는 강한 뜻이에요. '걱정이 안 될 수가 없다' = 걱정이 될 수밖에 없다.",
      en: "'안 -(으)ㄹ 수가 없다' is a strong double negative meaning 'can't help but'. '걱정이 안 될 수가 없다' = I can't help but worry.",
      mn: "'안 -(으)ㄹ 수가 없다' нь давхар үгүйсгэлээр 'заавал тийм болно, өөр аргагүй' гэсэн хүчтэй утгатай. '걱정이 안 될 수가 없다' = санаа зовохоос өөр аргагүй.",
    },
    example: { ko: "이렇게 맛있으니 안 먹을 수가 없어요.", en: "It's so delicious that I can't help but eat it.", mn: "Ийм амттай болохоор идэхгүй байж чадахгүй нь." },
  },
];

/** 레벨 테스트: 급마다 고르게 10문제 */
export const LEVEL_TEST_IDS = [
  "g1-ieyo",
  "g1-eseo",
  "r1-schedule",
  "g2-nikka",
  "g2-future",
  "r2-library",
  "g3-deokbune",
  "g3-baram",
  "r3-extend",
  "g4-moyang",
];

/** 레벨 테스트 점수(10점 만점) → 예상 수준 */
export function levelFromScore(correct: number): 1 | 2 | 3 | 4 {
  if (correct >= 9) return 4;
  if (correct >= 7) return 3;
  if (correct >= 4) return 2;
  return 1;
}

export const questionById = (id: string) => KOREAN_QUESTIONS.find((q) => q.id === id);
