import type { Messages } from './ko';

/** 日本語 — ko.ts와 같은 모양. 초안은 Claude 번역, 출시 전 원어민 검수 필요 */
export const ja: Messages = {
  lang: { ko: '韓国語', ja: '日本語' },

  tabs: { index: 'ホーム', chats: 'トーク', match: 'ランダム', board: '掲示板', profile: 'プロフィール' },

  auth: {
    apple: 'Appleで続ける',
    google: 'Googleで続ける',
    line: 'LINEで続ける',
    kakao: 'Kakaoで続ける',
    socialSoon: 'ソーシャルログインは近日公開です',
    hana: 'Hanaで続ける',
    email: 'メールアドレス',
    password: 'パスワード',
    login: 'ログイン',
    otherWays: '他の方法で続ける',
    testLogin: 'テストログイン',
    noAccount: 'アカウントをお持ちでないですか？',
    signUp: '新規登録',
    termsBefore: '続けると',
    terms: '利用規約',
    termsAfter: 'に同意したことになります',
  },

  signup: {
    steps: {
      email: 'メールアドレスを\n教えてください',
      password: 'パスワードを\n決めてください',
      nickname: 'なんと\nお呼びしましょうか？',
      lang: '話す言語を\n選んでください',
      gender: '性別を\n選んでください',
      birth: '生年月日を\n教えてください',
    },
    back: '戻る',
    next: '次へ',
    passwordRule: '8文字以上',
    nickname: 'ニックネーム',
    male: '男性',
    female: '女性',
    year: '年',
    month: '月',
    day: '日',
    welcome: 'ようこそ！',
    start: 'はじめる',
  },

  profile: {
    noBio: 'まだ自己紹介がありません',
    editBio: '自己紹介を編集',
    logout: 'ログアウト',
  },

  time: {
    // 일본은 채팅 시계를 24시간으로 쓴다: "15:42"
    clock: (h, mm) => `${h}:${mm}`,
    today: '今日',
    yesterday: '昨日',
    justNow: 'たった今',
    minutesAgo: (n) => `${n}分前`,
    hoursAgo: (n) => `${n}時間前`,
    weekdays: '日月火水木金土',
    monthDay: (m, d) => `${m}月${d}日`,
    withWeekday: (date, wd) => `${date}(${wd})`,
    withYear: (y, rest) => `${y}年${rest}`,
    shortDate: (y, m, d) => `${y}/${m}/${d}`,
  },

  errors: {
    status: {
      400: '入力内容をもう一度確認してください',
      401: 'メールアドレスまたはパスワードが正しくありません',
      403: '権限がありません',
      404: '見つかりませんでした',
      409: 'このメールアドレスはすでに登録されています',
      413: '写真のサイズが大きすぎます',
    },
    network: 'サーバーに接続できません',
    unknown: 'しばらくしてからもう一度お試しください',
  },
};
