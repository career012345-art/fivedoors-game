/* ============================================================
   다섯 개의 문 — 게임 콘텐츠 파일 (공공기관 지원 준비 편)
   ============================================================
   ★ 이 파일만 수정하면 문항·문 개수·점수 규칙을 바꿀 수 있습니다.
   ★ 수정 후 test.html 을 브라우저로 열어 초록불을 확인하세요.

   ★ 문항 type
     - "pick"    : 보기 칩 골라 담기 (options 또는 optionsFrom)
     - "short"   : 단어·한 문장 (maxChars 로 글자 제한 표시 가능)
     - "text"    : 서술형
     - "card"    : 경험·경력 카드 — 실제 입사지원서 형식
                   (소속기관/역할/활동기간/활동내용 100자)
     - "univ"    : 학과 교과목 골라 담기 (기존 데이터 재사용)
     - "list"/"episode" 도 사용 가능 (7번방의 기록과 동일)

   ★ optionsFrom — 업로드한 서류에서 자동 생성되는 보기
     "docTasks"     직무수행내용        "docSkills"   필요기술
     "docKnowledge" 필요지식           "docAttitudes" 직무수행태도
     "docBasics"    직업기초능력        "docQuals"    관련자격+가점자격
     "docValues"    핵심가치           "docTalents"  인재상
     (서류가 없으면 options 의 기본 보기가 대신 표시됨)
   ============================================================ */

window.GAME_CONTENT = {

  meta: {
    title: "다섯 개의 문",
    subtitle: "공공기관 합격 준비실",
    version: "1.0.1"
  },

  settings: {
    // 구글시트 연동 주소 (새 시트의 Apps Script 웹앱 URL — 비우면 전송 생략)
    sheetEndpoint: "https://script.google.com/macros/s/AKfycbzrAM1_Q3dPKEKUTv_k1W1DQhXjObhBfAv-QQy2SeePIdevTUlgbqw4xMiClXvkTAHfjA/exec",

    badgeThresholdPercent: 60,
    truthRoomMinBadges: 2,      // 배지 2개 미만이면 진실의 방
    minHangulSyllables: 5,
    liteMinHangul: 2,
    minLatinChars: 10,
    sincereBonusChars: 50,
    shortSincereChars: 15,
    episodeSimilarity: 0.45,    // 답변 간 중복 의심 기준 (0~1, 낮출수록 민감)

    scores: {
      base: 10,
      sincereBonus: 5,
      resultBonus: 5,
      episodeBonus: 10
    },

    resultKeywords: ["%", "등", "위", "명", "회", "완성", "수상", "합격", "달성", "성공", "증가", "감소", "개월", "시간", "년"],
    avatars: ["🧑‍💼", "👩‍💼", "🧑‍🎓", "👩‍🎓", "🧑‍🔧", "👮"]
  },

  rooms: [
    {
      id: "door1",
      title: "스펙 금고",
      badge: { icon: "📋", name: "스펙 마스터" },
      intro: "첫 번째 문, 스펙 금고입니다.\n공고가 요구하는 자격을 하나씩 대조해 보세요.",
      questions: [
        { id: "d1q1", type: "pick", count: 6, allowCustom: true, optionsFrom: "docQuals",
          item: { icon: "🎖️", label: "자격증 서랍" },
          text: "이 공고와 관련된 자격·성적 목록이에요. 보유한 것을 골라 담으세요! (목록에 없는 자격은 직접 추가)",
          options: ["컴퓨터활용능력", "한국사능력검정시험", "정보처리기사", "운전면허"],
          intent: "요구·가점 자격 대비 보유 현황 (서류 가점 계산 재료)" },
        { id: "d1q2", type: "short",
          item: { icon: "🗣️", label: "어학 성적표" },
          text: "어학 성적이 있다면? (시험명과 점수를 숫자로!)",
          placeholder: "예: 토익 750",
          intent: "어학 기준 충족 여부 (공고 기준과 대조)" },
        { id: "d1q3", type: "univ", count: 3,
          item: { icon: "📚", label: "전공 책장" },
          text: "직무와 관련된 전공 과목을 3개까지 골라 담으세요! (⭐는 직무 관련 과목)",
          placeholder: "예: 회계원리",
          intent: "직무-전공 연결 (지원서 교육사항·면접 전공질문 재료)" },
        { id: "d1q4", type: "short",
          item: { icon: "🎓", label: "수료증 파일" },
          text: "학교 밖에서 받은 교육·훈련이 있다면? (교육명 + 이수시간 숫자)",
          placeholder: "예: 빅데이터 분석 기초 40시간",
          intent: "지원서 교육사항(최대 10칸) 재료" },
        { id: "d1q5", type: "short", maxChars: 100,
          item: { icon: "✍️", label: "지원서 미리쓰기" },
          text: "그 교육에서 배운 '직무 관련 내용'을 100자 안에! (지원서 교육사항 칸에 그대로 쓸 수 있게)",
          placeholder: "예: 엑셀 피벗과 기초 통계로 데이터 요약 보고서 작성 실습",
          intent: "지원서 교육사항 100자 칸 초안" }
      ]
    },
    {
      id: "door2",
      title: "경험 카드의 방",
      badge: { icon: "🃏", name: "카드 콜렉터" },
      intro: "두 번째 문입니다.\n여기서 만든 카드는 실제 입사지원서(경험·경력사항)에 그대로 옮겨 쓸 수 있어요!",
      questions: [
        { id: "d2q1", type: "card",
          item: { icon: "🃏", label: "경험 카드 ①" },
          text: "가장 내세울 경험·경력 하나를 지원서 형식으로 만들어 보세요.",
          intent: "지원서 경험·경력사항(최대 6칸)의 1번 칸 초안" },
        { id: "d2q2", type: "card",
          item: { icon: "🎴", label: "경험 카드 ②" },
          text: "하나 더 있다면 두 번째 카드도! (없으면 건너뛰기)",
          intent: "지원서 경험·경력사항 2번 칸 초안" },
        { id: "d2q3", type: "short",
          item: { icon: "🔗", label: "연결 고리" },
          text: "카드 ①의 경험이 이 직무와 닿는 점을 한 줄로!",
          placeholder: "예: 재고 정리 알바에서 숫자 맞추는 꼼꼼함을 배움",
          intent: "경험-직무 연결 논리 (면접 답변의 뼈대)" },
        { id: "d2q4", type: "pick", count: 1, allowCustom: true, optionsFrom: "docBasics",
          item: { icon: "💪", label: "능력 배지" },
          text: "카드 ①에서 발휘된 직업기초능력을 하나 고른다면?",
          options: ["의사소통능력", "수리능력", "문제해결능력", "자원관리능력", "대인관계능력"],
          intent: "경험을 NCS 직업기초능력 언어로 번역 (필기·면접 대비)" }
      ]
    },
    {
      id: "door3",
      title: "기관의 방",
      badge: { icon: "🏛️", name: "기관 전문가" },
      intro: "세 번째 문입니다.\n이 방의 답은 자기소개서 문항과 바로 연결됩니다.",
      questions: [
        { id: "d3q1", type: "short",
          item: { icon: "🏛️", label: "기관 현판" },
          text: "이 기관이 하는 일을 내 말로 한 문장으로 설명한다면?",
          placeholder: "예: 전국에 전기를 안정적으로 공급하는 회사",
          intent: "기관 이해도 (남의 문장이 아닌 자기 언어인지)" },
        { id: "d3q2", type: "pick", count: 1, allowCustom: true, optionsFrom: "docValues",
          item: { icon: "💠", label: "가치의 문장" },
          text: "이 기관의 핵심가치예요. 나와 가장 맞닿아 있는 하나를 골라보세요!",
          options: ["도전", "혁신", "소통", "신뢰", "책임"],
          intent: "자소서 '핵심가치' 문항 대비 — 선택한 가치가 곧 자소서 소재 방향" },
        { id: "d3q3", type: "short",
          item: { icon: "📖", label: "가치의 증거" },
          text: "그 가치를 실천했던 나의 경험을 한 줄로! (자소서 사례 후보)",
          placeholder: "예: 동아리 갈등을 중재해 공연을 끝까지 올린 일",
          intent: "핵심가치 자소서 문항의 사례 확보" },
        { id: "d3q4", type: "pick", count: 1, allowCustom: true, optionsFrom: "docTalents",
          item: { icon: "🌟", label: "인재상 거울" },
          text: "이 기관의 인재상이에요. 나를 가장 닮은 요소는?",
          options: ["열정", "소통", "창의", "청렴", "책임"],
          intent: "자소서 '인재상 부합도' 문항 대비" },
        { id: "d3q5", type: "short",
          item: { icon: "🖋️", label: "부합의 근거" },
          text: "그렇게 볼 수 있는 사례를 한 줄로!",
          placeholder: "예: 3년간 매일 마감 기록을 남긴 성실함",
          intent: "인재상 자소서 문항의 사례 확보" }
      ]
    },
    {
      id: "door4",
      title: "수행업무의 방",
      badge: { icon: "🔧", name: "실무 매처" },
      intro: "네 번째 문입니다.\n직무기술서에 적힌 '진짜 하는 일'과 나를 맞대어 보세요.",
      questions: [
        { id: "d4q1", type: "pick", count: 3, allowCustom: true, optionsFrom: "docTasks",
          item: { icon: "📋", label: "업무 목록판" },
          text: "이 직무가 실제로 하는 일이에요. 비슷한 것을 해본 업무를 골라 담으세요!",
          options: ["문서 작성", "고객 응대", "자료 정리", "행사 운영"],
          intent: "수행업무-경험 매칭 (경험·경력 기술서의 뼈대)" },
        { id: "d4q2", type: "short",
          item: { icon: "⏱️", label: "경력 시계" },
          text: "그중 하나 — 어디서, 얼마나 해봤나요? (개월 수를 숫자로!)",
          placeholder: "예: 학과 사무실 근로장학생으로 6개월",
          intent: "매칭 경험의 구체화 (기간 수치)" },
        { id: "d4q3", type: "pick", count: 3, allowCustom: true, optionsFrom: "docSkills",
          item: { icon: "🛠️", label: "기술 진열대" },
          text: "이 직무의 필요기술이에요. 자신 있는 것을 골라 담으세요!",
          options: ["문서작성 능력", "컴퓨터 활용 능력", "의사소통"],
          intent: "필요기술 대비 강점 기술 (직무면접 대비)" },
        { id: "d4q4", type: "short",
          item: { icon: "🎯", label: "실력의 증거" },
          text: "그중 최고 무기 하나 — 근거를 한 줄로! (숫자·결과가 있으면 최고)",
          placeholder: "예: 엑셀 함수로 재고표를 만들어 정산 시간 절반 단축",
          intent: "기술 주장의 증거 (STAR의 R)" },
        { id: "d4q5", type: "pick", count: 2, allowCustom: true, optionsFrom: "docAttitudes",
          item: { icon: "🧭", label: "태도 나침반" },
          text: "이 직무가 원하는 태도예요. 나와 어울리는 것을 2개까지!",
          options: ["세밀한 일처리", "청렴하고 공정한 태도", "적극적 협조"],
          intent: "직무수행태도 자기 대조 (인성면접 대비)" }
      ]
    },
    {
      id: "door5",
      title: "발굴의 방",
      badge: { icon: "💎", name: "원석 발굴가" },
      intro: "마지막 문입니다.\n스스로는 별것 아니라고 여겼던 것들 속에 보석이 있어요.",
      questions: [
        { id: "d5q1", type: "short",
          item: { icon: "⏳", label: "모래시계" },
          text: "학교·전공·자격증을 빼고, 가장 오래 한 것은? (이름 + 기간)",
          placeholder: "예: 새벽 수영 3년",
          intent: "지속성의 증거 (본인은 사소하다 여기는 성실성 발굴)" },
        { id: "d5q2", type: "short",
          item: { icon: "🙋", label: "부탁 쪽지" },
          text: "주변 사람들이 나에게 자주 부탁하는 일은?",
          placeholder: "예: 여행 계획 짜기, 발표자료 다듬기",
          intent: "타인이 인정한 숨은 강점 (자기평가의 사각지대)" },
        { id: "d5q3", type: "short",
          item: { icon: "❤️", label: "무보수 통장" },
          text: "돈을 받지 않아도 계속했던 활동은?",
          placeholder: "예: 교회 주보 디자인 2년",
          intent: "내적 동기의 방향 (직업 적합성 단서)" },
        { id: "d5q4", type: "pick", count: 2, allowCustom: true,
          item: { icon: "🏠", label: "가족 앨범" },
          text: "가족·지인의 일을 도운 경험이 있다면? (본인은 경력으로 치지 않는 것들!)",
          options: ["가게 일 돕기", "농사·수확 돕기", "행사·잔치 준비", "간병·돌봄",
                    "이사·정리", "기계·컴퓨터 고치기", "아이 돌보기", "장부·계산 정리",
                    "SNS·온라인 홍보 돕기"],
          intent: "비공식 경력 발굴 (지원서 경험사항 후보)" },
        { id: "d5q5", type: "short",
          item: { icon: "🔢", label: "숫자 저금통" },
          text: "숫자로 남아 있는 나의 기록이 있다면? (팔로워, 판매량, 봉사시간, 개근, 게임 랭킹까지!)",
          placeholder: "예: 블로그 이웃 800명, 헌혈 12회",
          intent: "정량 성과 발굴 (자소서·면접의 숫자 증거)" },
        { id: "d5q6", type: "short",
          item: { icon: "🗝️", label: "황금 열쇠" },
          text: "남들은 어려워하는데 나는 이상하게 쉬운 일 하나!",
          placeholder: "예: 처음 보는 사람에게 말 걸기",
          intent: "차별화 강점의 원석 (상담에서 파고들 지점)" }
      ]
    }
  ],

  texts: {
    introDesc: "다섯 개의 문을 열며 지원 준비물을 만드는 게임입니다.\n답은 짧게! 단어와 숫자면 충분해요. 끝나면 지원서에 옮겨 쓸 리포트가 생깁니다.",

    // 문마다 표시되는 "서류 힌트" — {n}=기관명 {group}=직군
    docHints: {
      title: "📄 서류 힌트",
      frames: {
        door1: "{n} 공고 기준이에요. 애매하면 일단 담고, 상담에서 같이 확인해요!",
        door2: "블라인드 채용: 학교명·지도교수명은 쓰면 안 돼요. 회사명은 써도 됩니다!",
        door4: "{n} {group} 직무기술서에서 뽑은 목록이에요. '비슷하게라도' 해봤으면 담으세요!"
      }
    },

    episodeNewLabel: "🆕 새 에피소드 만들기",
    episodeReuseLabel: "🎒 에피소드 가방에서 꺼내기",
    episodeReuseWarn: "이미 사용한 에피소드예요!",
    badgeGet: "배지 획득!",
    badgeMiss: "아쉽지만 배지를 놓쳤어요. 답을 조금만 더 채우면 배지를 받을 수 있어요.",
    perfectClear: "🎉 퍼펙트 클리어! 다섯 개의 문을 모두 통과했습니다!",
    truthRoom: "🚪 상담 선생님이 [진실의 방]을 준비하고 있습니다...\n상담일에 만나요.",
    normalClear: "수고했어요! 리포트를 저장하고 상담일에 가져오세요."
  }
};
