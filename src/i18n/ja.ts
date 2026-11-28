import type { Messages } from './ko';

/** 日本語 — ko.ts와 같은 모양. 초안은 Claude 번역, 출시 전 원어민 검수 필요 */
export const ja: Messages = {
  lang: { ko: '韓国語', ja: '日本語' },

  common: { close: '閉じる', cancel: 'キャンセル' },

  tabs: { index: 'ホーム', chats: 'トーク', match: 'ランダム', board: '掲示板', profile: 'プロフィール' },

  home: {
    title: '言語交換の友だち',
    empty: 'まだ友だちがいません',
    emptySub: '新しい友だちが登録するとここに表示されます',
  },

  chats: {
    empty: 'まだトークがありません',
    emptySub: 'ホームで友だちを選んで、最初のあいさつをしてみましょう',
    findFriends: '友だちを探す',
    mine: '自分: ',
    noMessage: '最初のあいさつをしてみましょう',
  },

  chat: {
    back: 'トーク一覧へ',
    empty: (name) => `${name}さんとの最初のトークです`,
    emptySub: '心をこめて最初のあいさつをしてみましょう',
    placeholder: 'メッセージを送る',
    send: '送信',
  },

  match: {
    title: '今すぐ\n通話しよう',
    start: 'ランダム通話をはじめる',
    waiting: '相手を\n探しています',
    stop: '探すのをやめる',
  },

  board: {
    write: '投稿する',
    empty: 'まだ投稿がありません',
    emptySub: '最初の投稿をしてみましょう',
    photo: (title) => `${title}の写真`,
    photoN: (title, n) => `${title}の写真 ${n}`,
  },

  post: {
    back: '掲示板へ',
    delete: '投稿を削除',
    confirmDelete: 'この投稿を削除しますか？',
    confirmDeleteSub: 'コメントといいねも一緒に削除されます',
    deleteYes: '削除',
    chat: 'トークする',
    like: 'いいね',
    unlike: 'いいねを取り消す',
    comments: (n) => `コメント ${n}`,
    comment: 'コメント',
    commentPlaceholder: 'コメントを書く',
    commentSend: 'コメントを送信',
  },

  write: {
    title: '投稿',
    submit: '投稿する',
    titlePlaceholder: 'タイトル',
    body: '本文',
    bodyPlaceholder: '韓国語でも日本語でも大丈夫です',
    photos: (n, max) => `写真 ${n} / ${max}`,
    addPhoto: '写真を追加',
    removePhoto: (n) => `写真${n}を外す`,
  },

  editBio: {
    title: '自己紹介',
    placeholder: 'どの言語を、なぜ学んでいるのか書いてみましょう',
    save: '保存',
  },

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
