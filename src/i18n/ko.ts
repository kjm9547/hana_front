/**
 * 한국어 문구 — 원본. 화면별로 묶는다.
 * ja.ts는 이 모양과 똑같아야 한다 (키가 빠지거나 남으면 타입 오류).
 * 이름·숫자가 들어가는 문구는 함수로: (name: string) => `${name}님`
 */
export const ko = {
  /** 사용자가 쓰는 언어의 이름 */
  lang: { ko: '한국어', ja: '일본어' },

  common: { close: '닫기', cancel: '취소' },

  tabs: { index: '메인', chats: '대화방', match: '랜덤매칭', board: '게시판', profile: '프로필' },

  home: {
    title: '언어교환 친구',
    empty: '아직 친구가 없어요',
    emptySub: '새 친구가 가입하면 여기에 보여요',
  },

  chats: {
    empty: '아직 대화가 없어요',
    emptySub: '메인에서 친구를 골라 첫 인사를 건네보세요',
    findFriends: '친구 찾기',
    /** 마지막 메시지가 내 것일 때 앞에 붙인다 */
    mine: '나: ',
    noMessage: '첫 인사를 건네보세요',
  },

  chat: {
    back: '대화 목록으로',
    empty: (name: string) => `${name}님과의 첫 대화예요`,
    emptySub: '정성 어린 첫 인사를 건네보세요',
    placeholder: '메시지 보내기',
    send: '보내기',
  },

  match: {
    title: '지금 바로\n통화해요',
    start: '랜덤 통화 시작',
    waiting: '상대를\n찾고 있어요',
    stop: '그만 찾기',
  },

  board: {
    write: '글쓰기',
    empty: '아직 글이 없어요',
    emptySub: '첫 번째 글을 올려보세요',
    /** 사진 대체 글 (화면 읽기) */
    photo: (title: string) => `${title} 사진`,
    photoN: (title: string, n: number) => `${title} 사진 ${n}`,
  },

  post: {
    back: '게시판으로',
    delete: '글 지우기',
    confirmDelete: '이 글을 지울까요?',
    confirmDeleteSub: '댓글과 좋아요도 함께 지워져요',
    deleteYes: '지우기',
    chat: '대화하기',
    like: '좋아요',
    unlike: '좋아요 취소',
    comments: (n: number) => `댓글 ${n}`,
    comment: '댓글',
    commentPlaceholder: '댓글 달기',
    commentSend: '댓글 등록',
  },

  write: {
    title: '글쓰기',
    submit: '올리기',
    titlePlaceholder: '제목',
    body: '내용',
    bodyPlaceholder: '한국어도 일본어도 괜찮아요',
    photos: (n: number, max: number) => `사진 ${n} / ${max}`,
    addPhoto: '사진 추가',
    removePhoto: (n: number) => `사진 ${n} 빼기`,
  },

  editBio: {
    title: '자기소개',
    placeholder: '어떤 언어를, 왜 배우고 있는지 적어보세요',
    save: '저장',
  },

  auth: {
    apple: 'Apple로 계속하기',
    google: 'Google로 계속하기',
    line: 'LINE으로 계속하기',
    kakao: '카카오로 계속하기',
    socialSoon: '소셜 로그인은 곧 열려요',
    hana: 'Hana로 계속하기',
    email: '이메일',
    password: '비밀번호',
    login: '로그인',
    otherWays: '다른 방법으로 계속하기',
    testLogin: '테스트 로그인',
    noAccount: '계정이 없으신가요?',
    signUp: '회원가입',
    // "계속하면 [약관]에 동의하게 돼요" — 가운데만 굵게
    termsBefore: '계속하면 ',
    terms: '약관',
    termsAfter: '에 동의하게 돼요',
  },

  signup: {
    steps: {
      email: '이메일을\n알려주세요',
      password: '비밀번호를\n정해주세요',
      nickname: '뭐라고\n불러드릴까요?',
      lang: '쓰는 언어를\n골라주세요',
      gender: '성별을\n골라주세요',
      birth: '생년월일을\n알려주세요',
    },
    back: '이전',
    next: '다음',
    passwordRule: '8자 이상',
    nickname: '닉네임',
    male: '남성',
    female: '여성',
    year: '년',
    month: '월',
    day: '일',
    welcome: '반가워요!',
    start: '시작하기',
  },

  profile: {
    noBio: '아직 자기소개가 없어요',
    editBio: '자기소개 수정',
    logout: '로그아웃',
  },

  time: {
    /** 채팅 시계: "오후 3:42" */
    clock: (h: number, mm: string) => `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${mm}`,
    today: '오늘',
    yesterday: '어제',
    justNow: '방금',
    minutesAgo: (n: number) => `${n}분 전`,
    hoursAgo: (n: number) => `${n}시간 전`,
    weekdays: '일월화수목금토',
    /** "11월 23일" */
    monthDay: (m: number, d: number) => `${m}월 ${d}일`,
    /** 날짜 구분선: "11월 23일 (월)" */
    withWeekday: (date: string, wd: string) => `${date} (${wd})`,
    /** "2025년 11월 23일 (일)" */
    withYear: (y: number, rest: string) => `${y}년 ${rest}`,
    /** 작년 이전 짧은 날짜: "2025. 3. 1." */
    shortDate: (y: number, m: number, d: number) => `${y}. ${m}. ${d}.`,
  },

  /** 서버 오류는 상태 코드로 고른다 (서버 메시지는 영어라 그대로 보여 주지 않는다) */
  errors: {
    status: {
      400: '입력한 내용을 다시 확인해 주세요',
      401: '이메일 또는 비밀번호가 맞지 않아요',
      403: '권한이 없어요',
      404: '찾을 수 없어요',
      409: '이미 가입된 이메일이에요',
      413: '사진이 너무 커요',
    },
    network: '서버에 연결할 수 없어요',
    unknown: '잠시 후 다시 시도해 주세요',
  },
};

export type Messages = typeof ko;
