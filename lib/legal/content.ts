/**
 * 이용약관 · 개인정보처리방침 · 환불정책 (kr/en/mn)
 * 본문 줄 규칙: "- " 로 시작하면 글머리표, 그 외는 문단.
 * 환불 기준은 app/api/payments/cancel/route.ts 의 상수(24시간, 7일)와 반드시 같게 유지할 것.
 */
export type LegalKind = "terms" | "privacy" | "refund";
export type LegalLocale = "kr" | "en" | "mn";
export type LegalSection = { h: string; body: string[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

const kr: Record<LegalKind, LegalDoc> = {
  terms: {
    title: "이용약관",
    intro:
      "이 약관은 LNK(이하 \"회사\")가 운영하는 LNK 웹사이트와 앱(이하 \"서비스\")을 이용할 때 회사와 회원 사이의 권리, 의무, 책임을 정합니다.",
    sections: [
      {
        h: "제1조 (용어)",
        body: [
          "- 회원: 약관에 동의하고 가입한 사람",
          "- 멘토: 회사의 승인을 받아 상담이나 강의를 제공하는 회원",
          "- 수강생·멘티: 강의를 듣거나 상담을 예약하는 회원",
          "- 유료 서비스: 결제가 필요한 멘토 상담과 강의",
        ],
      },
      {
        h: "제2조 (약관의 효력과 변경)",
        body: [
          "약관은 서비스 화면에 게시하면 효력이 생깁니다. 회사가 약관을 바꿀 때는 시행 7일 전(회원에게 불리한 변경은 30일 전)부터 공지합니다.",
          "바뀐 약관에 동의하지 않으면 탈퇴할 수 있습니다. 시행일 이후에도 계속 이용하면 동의한 것으로 봅니다.",
        ],
      },
      {
        h: "제3조 (가입과 계정)",
        body: [
          "이메일과 비밀번호로 가입하며, 만 14세 이상만 가입할 수 있습니다.",
          "계정 정보는 본인이 관리해야 하며, 다른 사람에게 빌려주거나 넘길 수 없습니다. 도용이 의심되면 바로 회사에 알려 주세요.",
        ],
      },
      {
        h: "제4조 (회사가 제공하는 서비스)",
        body: [
          "- 비자·일정 로드맵, AI 비서, 한국 생활 가이드",
          "- 멘토 1:1 상담 예약과 결제",
          "- 라이브 강의, 다시보기, 강의 결제",
          "- 커뮤니티와 그룹 채팅",
          "회사는 점검이나 장애가 있을 때 서비스를 잠시 멈출 수 있으며, 가능한 한 미리 알립니다.",
        ],
      },
      {
        h: "제5조 (유료 서비스와 결제)",
        body: [
          "가격은 각 상담·강의 화면에 원화(KRW)로 표시합니다. 결제는 회사가 계약한 결제대행사(PortOne, 토스페이먼츠)를 통해 이뤄집니다.",
          "결제가 확인되면 예약이나 수강 등록이 확정됩니다. 해외 발행 카드는 카드사 환율과 해외결제 수수료가 붙을 수 있습니다.",
          "취소와 환불은 별도의 환불정책을 따릅니다.",
        ],
      },
      {
        h: "제6조 (중개자로서의 회사)",
        body: [
          "회사는 멘토와 회원을 연결하는 플랫폼을 제공합니다. 상담과 강의의 내용은 각 멘토가 책임집니다.",
          "비자, 법률, 의료, 세무 관련 정보는 참고용이며, 중요한 결정은 반드시 관련 공식 기관이나 자격 있는 전문가에게 확인해야 합니다.",
        ],
      },
      {
        h: "제7조 (회원이 하면 안 되는 일)",
        body: [
          "- 다른 사람의 정보 도용, 거짓 정보 등록",
          "- 욕설, 차별, 괴롭힘, 음란물, 불법 정보 게시",
          "- 플랫폼 밖에서 결제하도록 유도하는 행위",
          "- 강의·상담 영상과 자료를 허락 없이 녹화, 복제, 배포하는 행위",
          "- 서비스 운영을 방해하거나 보안을 우회하는 행위",
          "위반하면 회사는 게시물을 지우거나 이용을 제한할 수 있습니다.",
        ],
      },
      {
        h: "제8조 (게시물과 저작권)",
        body: [
          "회원이 올린 글과 자료의 저작권은 작성자에게 있습니다. 회사는 서비스 운영과 홍보에 필요한 범위에서 이를 사용할 수 있습니다.",
          "멘토의 강의와 다시보기 영상의 권리는 멘토에게 있으며, 수강생은 서비스 안에서 개인 학습 목적으로만 볼 수 있습니다.",
        ],
      },
      {
        h: "제9조 (라이브 강의 녹화)",
        body: [
          "라이브 강의는 다시보기를 위해 자동으로 녹화됩니다. 참여자의 영상, 음성, 채팅이 녹화본에 담길 수 있습니다. 원하지 않으면 카메라와 마이크를 끄고 참여할 수 있습니다.",
        ],
      },
      {
        h: "제10조 (탈퇴와 이용 제한)",
        body: [
          "회원은 언제든지 탈퇴를 요청할 수 있습니다. 진행 중인 예약이나 결제가 있으면 정리한 뒤 탈퇴가 처리됩니다.",
        ],
      },
      {
        h: "제11조 (책임의 제한)",
        body: [
          "회사는 천재지변, 통신 장애 등 회사가 통제할 수 없는 사유로 생긴 손해에 책임지지 않습니다. 회원 사이의 분쟁은 당사자가 해결하는 것이 원칙이며, 회사는 해결을 돕기 위해 노력합니다.",
        ],
      },
      {
        h: "제12조 (준거법과 관할)",
        body: [
          "이 약관은 대한민국 법을 따릅니다. 분쟁이 생기면 민사소송법에 따른 관할 법원에서 해결합니다.",
        ],
      },
    ],
  },
  privacy: {
    title: "개인정보처리방침",
    intro:
      "LNK(이하 \"회사\")는 「개인정보 보호법」에 따라 회원의 개인정보를 보호하고, 관련 고충을 빠르게 처리하기 위해 이 방침을 둡니다.",
    sections: [
      {
        h: "1. 수집하는 개인정보",
        body: [
          "- 가입 시(필수): 이메일, 비밀번호(암호화 저장), 이름",
          "- 프로필(선택): 국적, 학교, 지역, 비자 종류와 만료일, 체류 상태, 사진, 자기소개, 전화번호, 사용 언어",
          "- 멘토 신청 시: 경력, 학력, 전문 분야, 상담 가능 시간, 소개 영상·포트폴리오 링크",
          "- 결제 시: 결제 번호, 금액, 결제 수단 종류, 결제 일시 (카드 번호는 회사가 저장하지 않으며 결제대행사가 처리)",
          "- 이용 중 자동 생성: 접속 기록, 강의 시청 진도, 페이지 조회 기록, AI 비서 사용 횟수",
          "- 라이브 강의·상담 참여 시: 영상, 음성, 채팅 (녹화되는 경우)",
        ],
      },
      {
        h: "2. 이용 목적",
        body: [
          "- 회원 관리와 본인 확인, 비밀번호 재설정",
          "- 비자 만료일 기반 로드맵과 알림 제공",
          "- 멘토 상담 예약, 강의 수강, 결제·환불 처리",
          "- 라이브 강의 운영과 다시보기 제공",
          "- 부정 이용 방지, 문의 응대, 서비스 개선",
        ],
      },
      {
        h: "3. 보유 기간",
        body: [
          "탈퇴하면 바로 삭제합니다. 다만 법령에 따라 아래 정보는 정해진 기간 동안 보관합니다.",
          "- 계약·청약철회, 대금 결제와 재화 공급 기록: 5년 (전자상거래법)",
          "- 소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)",
          "- 접속 기록: 3개월 (통신비밀보호법)",
          "라이브 강의 녹화본은 강의를 연 멘토가 삭제하거나 강의가 종료되면 삭제됩니다.",
        ],
      },
      {
        h: "4. 제3자 제공",
        body: [
          "회사는 회원의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만 상담을 예약하면 상대방 멘토에게 이름, 프로필, 예약 내용이, 강의를 수강하면 강사에게 이름과 수강 정보가 보입니다.",
        ],
      },
      {
        h: "5. 처리 위탁과 국외 이전",
        body: [
          "서비스 운영을 위해 아래 업체에 개인정보 처리를 맡깁니다. 일부는 해외 서버에 저장·처리됩니다.",
          "- Supabase Inc. (호주 시드니 리전): 회원 정보와 서비스 데이터 저장, 로그인",
          "- Netlify Inc. (미국): 웹사이트 호스팅, 접속 기록",
          "- Cloudflare Inc. (미국, 전 세계 서버): 라이브 강의·상담 영상 중계, 녹화본 저장",
          "- 코리아포트원(PortOne), 토스페이먼츠 (대한민국): 결제 처리",
          "- OpenAI (미국): AI 비서 대화 처리 (사용하는 경우, 입력한 질문만 전송)",
          "이전 시점: 서비스 이용 시 네트워크로 전송 · 보유 기간: 위탁 계약 종료 또는 탈퇴 시까지",
          "국외 이전을 원하지 않으면 탈퇴할 수 있으나, 이 경우 서비스를 이용할 수 없습니다.",
        ],
      },
      {
        h: "6. 회원의 권리",
        body: [
          "회원은 언제든지 자기 개인정보를 조회, 수정, 삭제하거나 처리 정지를 요청할 수 있습니다. 마이페이지에서 직접 하거나 문의하기로 요청하면 지체 없이 처리합니다.",
        ],
      },
      {
        h: "7. 쿠키와 로컬 저장소",
        body: [
          "로그인 유지와 설정 저장(언어, 다크 모드, 즐겨찾기)을 위해 쿠키와 브라우저 저장소를 씁니다. 광고 추적 쿠키는 쓰지 않습니다. 브라우저 설정에서 쿠키를 거부할 수 있지만, 이 경우 로그인이 유지되지 않습니다.",
        ],
      },
      {
        h: "8. 안전성 확보 조치",
        body: [
          "- 비밀번호는 복호화할 수 없게 암호화해 저장",
          "- 모든 통신은 HTTPS로 암호화",
          "- 데이터베이스 접근 권한을 행 단위로 제한(RLS)하고, 결제·녹화 같은 민감한 처리는 서버에서만 수행",
        ],
      },
      {
        h: "9. 만 14세 미만",
        body: ["회사는 만 14세 미만 아동의 가입을 받지 않습니다."],
      },
      {
        h: "10. 개인정보 보호책임자와 문의",
        body: [
          "개인정보 관련 문의, 불만, 피해 구제는 아래로 연락해 주세요.",
          "{officer}",
          "{contact}",
          "그 밖에 개인정보침해신고센터(privacy.kisa.or.kr, 118), 개인정보분쟁조정위원회(kopico.go.kr, 1833-6972)에 도움을 요청할 수 있습니다.",
        ],
      },
    ],
  },
  refund: {
    title: "환불정책",
    intro:
      "LNK에서 결제한 멘토 상담과 강의의 취소·환불 기준입니다. 환불은 결제한 수단으로 돌려드립니다.",
    sections: [
      {
        h: "1. 멘토 1:1 상담",
        body: [
          "- 상담 시작 24시간 전까지: 마이페이지 › 결제 내역에서 직접 취소하면 전액 환불",
          "- 상담 시작 24시간 이내: 직접 취소할 수 없습니다. 부득이한 사정이 있으면 문의하기로 연락해 주세요.",
          "- 멘토가 취소하거나 나타나지 않은 경우: 전액 환불",
          "- 결제는 됐는데 같은 시간에 다른 예약이 먼저 확정된 경우: 자동으로 전액 환불",
        ],
      },
      {
        h: "2. 강의",
        body: [
          "- 결제 후 7일 이내이고 수업을 한 번도 듣지 않았다면: 결제 내역에서 직접 취소하면 전액 환불",
          "- 7일이 지났거나 수업(라이브 또는 다시보기)을 들은 경우: 직접 취소할 수 없습니다. 문의하기로 연락하면 남은 수업 비율 등을 고려해 처리합니다.",
          "- 강사가 강의를 취소하거나 진행하지 못한 경우: 전액 환불",
          "- 무료 강의는 결제가 없으므로 환불 대상이 아닙니다.",
        ],
      },
      {
        h: "3. 환불 처리 기간",
        body: [
          "취소가 접수되면 바로 결제대행사에 환불을 요청합니다. 카드는 카드사 사정에 따라 영업일 기준 3~7일 안에 취소가 반영됩니다. 해외 발행 카드는 환율 변동으로 청구·환불 금액이 조금 다를 수 있습니다.",
        ],
      },
      {
        h: "4. 법적 권리",
        body: [
          "이 정책은 「전자상거래 등에서의 소비자보호에 관한 법률」 등 관련 법이 보장하는 소비자의 권리를 줄이지 않습니다. 법이 더 유리하면 법을 따릅니다.",
        ],
      },
      { h: "5. 문의", body: ["{contact}"] },
    ],
  },
};

const en: Record<LegalKind, LegalDoc> = {
  terms: {
    title: "Terms of Service",
    intro:
      "These terms set out the rights, obligations and responsibilities between LNK (\"we\") and members who use the LNK website and app (the \"Service\").",
    sections: [
      {
        h: "1. Definitions",
        body: [
          "- Member: a person who agreed to these terms and signed up",
          "- Mentor: a member approved by us to offer sessions or courses",
          "- Student / mentee: a member who takes courses or books sessions",
          "- Paid services: mentor sessions and courses that require payment",
        ],
      },
      {
        h: "2. Effect and changes",
        body: [
          "These terms take effect when posted on the Service. We announce changes 7 days before they apply (30 days for changes that are unfavorable to members).",
          "If you don't agree to the new terms, you may close your account. Continuing to use the Service after the effective date means you accept them.",
        ],
      },
      {
        h: "3. Sign-up and accounts",
        body: [
          "You sign up with an email and password. You must be at least 14 years old.",
          "You are responsible for your account and may not lend or transfer it. Tell us right away if you suspect someone else is using it.",
        ],
      },
      {
        h: "4. What we provide",
        body: [
          "- Visa and schedule roadmap, AI assistant, Korea life guide",
          "- Booking and paying for 1:1 mentor sessions",
          "- Live classes, replays and course payments",
          "- Community and group chat",
          "We may pause the Service for maintenance or outages and will give notice in advance where possible.",
        ],
      },
      {
        h: "5. Paid services and payment",
        body: [
          "Prices are shown in Korean won (KRW) on each session or course page. Payments are processed by our payment providers (PortOne, Toss Payments).",
          "A booking or enrollment is confirmed once payment is verified. Cards issued abroad may incur the card issuer's exchange rate and foreign transaction fees.",
          "Cancellations and refunds follow our Refund Policy.",
        ],
      },
      {
        h: "6. Our role as a platform",
        body: [
          "We provide a platform that connects mentors and members. Each mentor is responsible for the content of their sessions and courses.",
          "Information about visas, law, health and tax is for reference only. Always confirm important decisions with the relevant official agency or a qualified professional.",
        ],
      },
      {
        h: "7. What members may not do",
        body: [
          "- Use someone else's identity or register false information",
          "- Post abuse, discrimination, harassment, obscene or illegal content",
          "- Steer others to pay outside the platform",
          "- Record, copy or distribute class and session videos or materials without permission",
          "- Disrupt the Service or bypass its security",
          "If you break these rules, we may remove content or restrict your use.",
        ],
      },
      {
        h: "8. Content and copyright",
        body: [
          "You keep the copyright to what you post. We may use it as needed to run and promote the Service.",
          "Mentors own the rights to their classes and replays. Students may watch them only within the Service for personal learning.",
        ],
      },
      {
        h: "9. Recording of live classes",
        body: [
          "Live classes are recorded automatically for replays. Participants' video, audio and chat may appear in the recording. You can join with your camera and microphone off.",
        ],
      },
      {
        h: "10. Closing accounts and restrictions",
        body: [
          "You can ask to close your account at any time. If you have active bookings or payments, we settle them first.",
        ],
      },
      {
        h: "11. Limitation of liability",
        body: [
          "We are not liable for losses caused by events beyond our control, such as natural disasters or network failures. Disputes between members are in principle settled between them, and we will try to help.",
        ],
      },
      {
        h: "12. Governing law",
        body: [
          "These terms are governed by the laws of the Republic of Korea. Disputes go to the competent court under the Korean Civil Procedure Act.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    intro:
      "LNK (\"we\") has this policy to protect members' personal information under Korea's Personal Information Protection Act and to handle related concerns quickly.",
    sections: [
      {
        h: "1. Information we collect",
        body: [
          "- At sign-up (required): email, password (stored encrypted), name",
          "- Profile (optional): nationality, school, region, visa type and expiry date, residence status, photo, bio, phone number, language",
          "- Mentor applications: experience, education, specialties, availability, intro video and portfolio links",
          "- Payments: payment ID, amount, payment method type, date (we never store card numbers; the payment provider handles them)",
          "- Generated during use: access logs, lesson progress, page views, AI assistant usage counts",
          "- Live classes and sessions: video, audio and chat (when recorded)",
        ],
      },
      {
        h: "2. Why we use it",
        body: [
          "- Account management, identity checks, password reset",
          "- Roadmaps and reminders based on your visa expiry date",
          "- Session bookings, course enrollment, payments and refunds",
          "- Running live classes and providing replays",
          "- Preventing abuse, answering inquiries, improving the Service",
        ],
      },
      {
        h: "3. How long we keep it",
        body: [
          "We delete your information when you close your account, except the following, which the law requires us to keep:",
          "- Records of contracts, withdrawals, payments and supply: 5 years (E-Commerce Act)",
          "- Records of consumer complaints and disputes: 3 years (E-Commerce Act)",
          "- Access logs: 3 months (Protection of Communications Secrets Act)",
          "Live class recordings are deleted when the mentor deletes them or the course ends.",
        ],
      },
      {
        h: "4. Sharing with third parties",
        body: [
          "We do not share your information with third parties without your consent. When you book a session, the mentor sees your name, profile and booking details; when you enroll in a course, the instructor sees your name and enrollment.",
        ],
      },
      {
        h: "5. Processors and transfers abroad",
        body: [
          "We use the following companies to run the Service. Some store or process data on servers outside Korea.",
          "- Supabase Inc. (Sydney, Australia region): member data, service data, sign-in",
          "- Netlify Inc. (USA): website hosting, access logs",
          "- Cloudflare Inc. (USA, global network): live class and session video, recordings",
          "- PortOne, Toss Payments (Korea): payment processing",
          "- OpenAI (USA): AI assistant (when used; only the questions you type are sent)",
          "When: transmitted over the network as you use the Service · Kept until: the end of the contract or when you close your account",
          "If you don't want your data transferred abroad, you can close your account, but you won't be able to use the Service.",
        ],
      },
      {
        h: "6. Your rights",
        body: [
          "You can view, correct or delete your information, or ask us to stop processing it, at any time — directly in My page or through Contact us. We act without delay.",
        ],
      },
      {
        h: "7. Cookies and local storage",
        body: [
          "We use cookies and browser storage to keep you signed in and remember settings (language, dark mode, favorites). We don't use advertising trackers. You can block cookies in your browser, but you won't stay signed in.",
        ],
      },
      {
        h: "8. Security measures",
        body: [
          "- Passwords are stored with one-way encryption",
          "- All traffic is encrypted with HTTPS",
          "- Database access is restricted row by row (RLS), and sensitive operations such as payments and recordings run only on our servers",
        ],
      },
      {
        h: "9. Children under 14",
        body: ["We do not accept sign-ups from children under 14."],
      },
      {
        h: "10. Privacy officer and contact",
        body: [
          "For privacy questions, complaints or remedies, contact us:",
          "{officer}",
          "{contact}",
          "You can also get help from the Personal Information Infringement Report Center (privacy.kisa.or.kr, 118) or the Personal Information Dispute Mediation Committee (kopico.go.kr, 1833-6972).",
        ],
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    intro:
      "How cancellations and refunds work for mentor sessions and courses paid on LNK. Refunds go back to the payment method you used.",
    sections: [
      {
        h: "1. 1:1 mentor sessions",
        body: [
          "- Up to 24 hours before the session: cancel in My page › Payments for a full refund",
          "- Within 24 hours of the session: you can't cancel yourself. If something unavoidable came up, contact us.",
          "- The mentor cancels or doesn't show up: full refund",
          "- Paid, but another booking was confirmed for the same time first: automatic full refund",
        ],
      },
      {
        h: "2. Courses",
        body: [
          "- Within 7 days of payment and before you've attended any class: cancel in Payments for a full refund",
          "- After 7 days, or after attending a class (live or replay): you can't cancel yourself. Contact us and we'll consider the remaining classes.",
          "- The instructor cancels or can't run the course: full refund",
          "- Free courses involve no payment, so there is nothing to refund.",
        ],
      },
      {
        h: "3. Processing time",
        body: [
          "We send the refund to the payment provider as soon as the cancellation is accepted. Card refunds appear within 3–7 business days, depending on the card company. For cards issued abroad, exchange-rate changes can make the refunded amount differ slightly from the charge.",
        ],
      },
      {
        h: "4. Your legal rights",
        body: [
          "This policy does not reduce the rights you have under Korea's E-Commerce Consumer Protection Act and related laws. Where the law is more favorable to you, the law applies.",
        ],
      },
      { h: "5. Contact", body: ["{contact}"] },
    ],
  },
};

const mn: Record<LegalKind, LegalDoc> = {
  terms: {
    title: "Үйлчилгээний нөхцөл",
    intro:
      "Энэхүү нөхцөл нь LNK (цаашид \"бид\")-ийн ажиллуулдаг LNK вэбсайт, аппликейшн (цаашид \"Үйлчилгээ\")-ийг ашиглахад бид болон гишүүдийн эрх, үүрэг, хариуцлагыг тодорхойлно.",
    sections: [
      {
        h: "1. Нэр томьёо",
        body: [
          "- Гишүүн: энэ нөхцөлийг зөвшөөрч бүртгүүлсэн хүн",
          "- Ментор: биднээс зөвшөөрөл авч зөвлөгөө, хичээл заадаг гишүүн",
          "- Суралцагч / менти: хичээл үзэх, зөвлөгөө захиалах гишүүн",
          "- Төлбөртэй үйлчилгээ: төлбөр шаарддаг ментор зөвлөгөө, хичээл",
        ],
      },
      {
        h: "2. Хүчин төгөлдөр болох ба өөрчлөлт",
        body: [
          "Нөхцөл нь Үйлчилгээн дээр нийтлэгдсэнээр хүчин төгөлдөр болно. Өөрчлөлтийг хэрэгжихээс 7 хоногийн өмнө (гишүүнд сөрөг өөрчлөлтийг 30 хоногийн өмнө) мэдэгдэнэ.",
          "Шинэ нөхцөлийг зөвшөөрөхгүй бол бүртгэлээ цуцалж болно. Хэрэгжих өдрөөс хойш үргэлжлүүлэн ашиглавал зөвшөөрсөнд тооцно.",
        ],
      },
      {
        h: "3. Бүртгэл ба данс",
        body: [
          "Имэйл, нууц үгээр бүртгүүлнэ. 14 ба түүнээс дээш насны хүн бүртгүүлэх боломжтой.",
          "Дансаа өөрөө хариуцах ба бусдад зээлүүлэх, шилжүүлэхийг хориглоно. Бусад хүн ашиглаж байна гэж сэжиглэвэл даруй бидэнд мэдэгдээрэй.",
        ],
      },
      {
        h: "4. Бидний үзүүлэх үйлчилгээ",
        body: [
          "- Виз, хуваарийн замын зураг, AI туслах, Солонгосын амьдралын гарын авлага",
          "- 1:1 ментор зөвлөгөө захиалах, төлөх",
          "- Шууд хичээл, дахин үзэх, хичээлийн төлбөр",
          "- Нийгэмлэг, бүлгийн чат",
          "Засвар үйлчилгээ, саатлын үед Үйлчилгээг түр зогсоож болох бөгөөд боломжтой бол урьдчилан мэдэгдэнэ.",
        ],
      },
      {
        h: "5. Төлбөртэй үйлчилгээ ба төлбөр",
        body: [
          "Үнийг зөвлөгөө, хичээл бүрийн хуудсанд Солонгос вон (KRW)-оор харуулна. Төлбөрийг манай гэрээт төлбөрийн үйлчилгээ (PortOne, Toss Payments) гүйцэтгэнэ.",
          "Төлбөр баталгаажмагц захиалга, бүртгэл баталгаажна. Гадаадад гаргасан картад картын байгууллагын ханш, гадаад гүйлгээний шимтгэл нэмэгдэж болно.",
          "Цуцлалт, буцаан олголт нь Буцаан олголтын бодлогыг дагана.",
        ],
      },
      {
        h: "6. Платформын үүрэг",
        body: [
          "Бид ментор болон гишүүдийг холбох платформ үзүүлнэ. Зөвлөгөө, хичээлийн агуулгыг ментор бүр хариуцна.",
          "Виз, хууль, эрүүл мэнд, татварын мэдээлэл нь лавлах зорилготой. Чухал шийдвэрийг холбогдох албан байгууллага эсвэл мэргэжлийн хүнээс заавал шалгаарай.",
        ],
      },
      {
        h: "7. Гишүүдэд хориглох зүйл",
        body: [
          "- Бусдын мэдээллийг ашиглах, худал мэдээлэл бүртгүүлэх",
          "- Доромжлол, ялгаварлал, дарамт, садар самуун, хууль бус агуулга нийтлэх",
          "- Платформоос гадуур төлбөр төлүүлэхийг уриалах",
          "- Хичээл, зөвлөгөөний бичлэг, материалыг зөвшөөрөлгүй бичих, хуулбарлах, түгээх",
          "- Үйлчилгээний хэвийн ажиллагааг саатуулах, аюулгүй байдлыг тойрох",
          "Зөрчвөл бид нийтлэлийг устгах эсвэл ашиглалтыг хязгаарлаж болно.",
        ],
      },
      {
        h: "8. Нийтлэл ба зохиогчийн эрх",
        body: [
          "Таны нийтэлсэн зүйлийн зохиогчийн эрх танд хадгалагдана. Бид Үйлчилгээг ажиллуулах, сурталчлахад шаардлагатай хэмжээнд ашиглаж болно.",
          "Хичээл, дахин үзэх бичлэгийн эрх менторт хадгалагдана. Суралцагч зөвхөн Үйлчилгээн дотор хувийн сургалтын зорилгоор үзэж болно.",
        ],
      },
      {
        h: "9. Шууд хичээлийн бичлэг",
        body: [
          "Шууд хичээлийг дахин үзэх зорилгоор автоматаар бичнэ. Оролцогчдын дүрс, дуу, чат бичлэгт орж болно. Камер, микрофоноо унтраагаад оролцож болно.",
        ],
      },
      {
        h: "10. Бүртгэл цуцлах ба хязгаарлалт",
        body: [
          "Хүссэн үедээ бүртгэлээ цуцлах хүсэлт гаргаж болно. Идэвхтэй захиалга, төлбөр байвал эхлээд шийдвэрлэнэ.",
        ],
      },
      {
        h: "11. Хариуцлагын хязгаар",
        body: [
          "Байгалийн гамшиг, сүлжээний саатал зэрэг бидний хяналтаас гадуурх шалтгаанаар учирсан хохирлыг бид хариуцахгүй. Гишүүдийн хоорондын маргааныг талууд өөрсдөө шийдвэрлэх нь зарчим бөгөөд бид туслахыг хичээнэ.",
        ],
      },
      {
        h: "12. Хамаарах хууль",
        body: [
          "Энэ нөхцөлд БНСУ-ын хууль үйлчилнэ. Маргааныг Солонгосын Иргэний хэрэг шүүхэд хянан шийдвэрлэх тухай хуулийн дагуу харьяалах шүүх шийдвэрлэнэ.",
        ],
      },
    ],
  },
  privacy: {
    title: "Хувийн мэдээллийн бодлого",
    intro:
      "LNK (цаашид \"бид\") нь Солонгосын Хувийн мэдээлэл хамгаалах тухай хуулийн дагуу гишүүдийн хувийн мэдээллийг хамгаалж, холбогдох гомдлыг шуурхай шийдвэрлэх зорилгоор энэ бодлогыг баримтална.",
    sections: [
      {
        h: "1. Цуглуулах мэдээлэл",
        body: [
          "- Бүртгэлийн үед (заавал): имэйл, нууц үг (шифрлэн хадгална), нэр",
          "- Профайл (сонголтоор): иргэншил, сургууль, бүс нутаг, визийн төрөл ба дуусах хугацаа, оршин суух статус, зураг, танилцуулга, утасны дугаар, хэл",
          "- Менторын өргөдөл: туршлага, боловсрол, мэргэшил, боломжтой цаг, танилцуулга видео, портфолио холбоос",
          "- Төлбөр: төлбөрийн дугаар, дүн, төлбөрийн хэрэгслийн төрөл, огноо (картын дугаарыг бид хадгалахгүй, төлбөрийн үйлчилгээ боловсруулна)",
          "- Ашиглалтын явцад: нэвтрэлтийн бүртгэл, хичээлийн явц, хуудас үзэлт, AI туслахын хэрэглээний тоо",
          "- Шууд хичээл, зөвлөгөө: дүрс, дуу, чат (бичигдэх тохиолдолд)",
        ],
      },
      {
        h: "2. Ашиглах зорилго",
        body: [
          "- Гишүүнчлэлийн удирдлага, хэн болохыг шалгах, нууц үг сэргээх",
          "- Визийн дуусах хугацаанд суурилсан замын зураг, сануулга",
          "- Зөвлөгөө захиалга, хичээлийн бүртгэл, төлбөр ба буцаан олголт",
          "- Шууд хичээл явуулах, дахин үзэх боломж олгох",
          "- Буруу ашиглалтаас сэргийлэх, асуултад хариулах, Үйлчилгээг сайжруулах",
        ],
      },
      {
        h: "3. Хадгалах хугацаа",
        body: [
          "Бүртгэлээ цуцлахад мэдээллийг устгана. Гэхдээ хуулиар дараах мэдээллийг тогтоосон хугацаанд хадгална:",
          "- Гэрээ, татгалзалт, төлбөр, нийлүүлэлтийн бүртгэл: 5 жил (Цахим худалдааны хууль)",
          "- Хэрэглэгчийн гомдол, маргааны бүртгэл: 3 жил (Цахим худалдааны хууль)",
          "- Нэвтрэлтийн бүртгэл: 3 сар (Харилцааны нууцыг хамгаалах хууль)",
          "Шууд хичээлийн бичлэгийг ментор устгах эсвэл хичээл дуусахад устгана.",
        ],
      },
      {
        h: "4. Гуравдагч этгээдэд өгөх",
        body: [
          "Таны зөвшөөрөлгүйгээр гуравдагч этгээдэд мэдээлэл өгөхгүй. Зөвлөгөө захиалахад ментор таны нэр, профайл, захиалгын мэдээллийг; хичээлд бүртгүүлэхэд багш таны нэр, бүртгэлийг харна.",
        ],
      },
      {
        h: "5. Боловсруулалт даалгах ба гадаад руу шилжүүлэх",
        body: [
          "Үйлчилгээг ажиллуулахын тулд дараах компаниудад мэдээлэл боловсруулахыг даалгана. Зарим нь Солонгосоос гадуурх серверт хадгалагдана.",
          "- Supabase Inc. (Австрали, Сидней бүс): гишүүний болон үйлчилгээний өгөгдөл, нэвтрэлт",
          "- Netlify Inc. (АНУ): вэбсайт байршуулалт, нэвтрэлтийн бүртгэл",
          "- Cloudflare Inc. (АНУ, дэлхийн сүлжээ): шууд хичээл, зөвлөгөөний видео, бичлэг",
          "- PortOne, Toss Payments (БНСУ): төлбөр боловсруулалт",
          "- OpenAI (АНУ): AI туслах (ашиглах үед, зөвхөн таны бичсэн асуулт илгээгдэнэ)",
          "Хэзээ: Үйлчилгээ ашиглах үед сүлжээгээр дамжина · Хадгалах: гэрээ дуусах эсвэл бүртгэл цуцлах хүртэл",
          "Гадаад руу шилжүүлэхийг хүсэхгүй бол бүртгэлээ цуцалж болох ч Үйлчилгээг ашиглах боломжгүй болно.",
        ],
      },
      {
        h: "6. Таны эрх",
        body: [
          "Хувийн мэдээллээ хүссэн үедээ харах, засах, устгах, боловсруулалтыг зогсоохыг хүсэх эрхтэй. Миний хуудаснаас шууд эсвэл Холбоо барих хэсгээр хүсэлт гаргавал саадгүй шийдвэрлэнэ.",
        ],
      },
      {
        h: "7. Күүки ба хөтчийн санах ой",
        body: [
          "Нэвтрэлтийг хадгалах, тохиргоог (хэл, харанхуй горим, дуртай) санахын тулд күүки болон хөтчийн санах ойг ашиглана. Зар сурталчилгааны хяналтын күүки ашиглахгүй. Хөтчийн тохиргооноос күүкиг хааж болох ч нэвтрэлт хадгалагдахгүй.",
        ],
      },
      {
        h: "8. Аюулгүй байдлын арга хэмжээ",
        body: [
          "- Нууц үгийг буцааж тайлах боломжгүй байдлаар шифрлэн хадгална",
          "- Бүх холболтыг HTTPS-ээр шифрлэнэ",
          "- Өгөгдлийн сангийн хандалтыг мөр тус бүрээр хязгаарлаж (RLS), төлбөр, бичлэг зэрэг мэдрэмтгий үйлдлийг зөвхөн манай серверт гүйцэтгэнэ",
        ],
      },
      {
        h: "9. 14-өөс доош насны хүүхэд",
        body: ["14-өөс доош насны хүүхдийн бүртгэлийг хүлээн авахгүй."],
      },
      {
        h: "10. Хувийн мэдээлэл хариуцагч ба холбоо барих",
        body: [
          "Хувийн мэдээлэлтэй холбоотой асуулт, гомдлыг дараах хаягаар илгээнэ үү:",
          "{officer}",
          "{contact}",
          "Мөн Хувийн мэдээллийн зөрчлийн мэдээллийн төв (privacy.kisa.or.kr, 118), Хувийн мэдээллийн маргаан зохицуулах хороо (kopico.go.kr, 1833-6972)-оос тусламж авч болно.",
        ],
      },
    ],
  },
  refund: {
    title: "Буцаан олголтын бодлого",
    intro:
      "LNK дээр төлсөн ментор зөвлөгөө, хичээлийн цуцлалт ба буцаан олголтын журам. Буцаан олголтыг төлсөн хэрэгслээр нь буцаана.",
    sections: [
      {
        h: "1. 1:1 ментор зөвлөгөө",
        body: [
          "- Зөвлөгөө эхлэхээс 24 цагийн өмнө хүртэл: Миний хуудас › Төлбөрийн түүхээс цуцалбал бүрэн буцаана",
          "- Эхлэхээс өмнөх 24 цагийн дотор: өөрөө цуцлах боломжгүй. Зайлшгүй шалтгаан гарвал холбогдоно уу.",
          "- Ментор цуцалсан эсвэл ирээгүй бол: бүрэн буцаана",
          "- Төлбөр төлөгдсөн ч тухайн цагт өөр захиалга түрүүлж баталгаажсан бол: автоматаар бүрэн буцаана",
        ],
      },
      {
        h: "2. Хичээл",
        body: [
          "- Төлбөрөөс хойш 7 хоногийн дотор, нэг ч хичээл үзээгүй бол: Төлбөрийн түүхээс цуцалбал бүрэн буцаана",
          "- 7 хоног өнгөрсөн эсвэл хичээл (шууд эсвэл дахин үзэх) үзсэн бол: өөрөө цуцлах боломжгүй. Холбогдвол үлдсэн хичээлийг харгалзан шийдвэрлэнэ.",
          "- Багш хичээлийг цуцалсан эсвэл явуулж чадаагүй бол: бүрэн буцаана",
          "- Үнэгүй хичээлд төлбөр байхгүй тул буцаан олголт хамаарахгүй.",
        ],
      },
      {
        h: "3. Шийдвэрлэх хугацаа",
        body: [
          "Цуцлалт хүлээн авмагц төлбөрийн үйлчилгээнд буцаалт илгээнэ. Картын буцаалт картын байгууллагаас хамаарч ажлын 3–7 хоногт харагдана. Гадаадад гаргасан картад ханшийн өөрчлөлтөөс болж буцаах дүн бага зэрэг зөрж болно.",
        ],
      },
      {
        h: "4. Хуулиар олгосон эрх",
        body: [
          "Энэ бодлого нь Солонгосын Цахим худалдааны хэрэглэгч хамгаалах тухай хууль болон холбогдох хуулиар олгосон таны эрхийг хязгаарлахгүй. Хууль илүү таатай бол хуулийг дагана.",
        ],
      },
      { h: "5. Холбоо барих", body: ["{contact}"] },
    ],
  },
};

export const legalDocs: Record<LegalLocale, Record<LegalKind, LegalDoc>> = { kr, en, mn };

export function getLegalDoc(locale: string, kind: LegalKind): LegalDoc {
  const l = (["kr", "en", "mn"].includes(locale) ? locale : "kr") as LegalLocale;
  return legalDocs[l][kind];
}
