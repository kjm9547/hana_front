import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// global.css에 추가한 이름을 tailwind-merge에도 알려준다.
// 안 알려주면 text-title(글자 크기)과 text-foreground(색)를 같은 그룹으로 보고 하나를 지워 버린다.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['display', 'title', 'body', 'sub', 'caption', 'tiny', 'wordmark'],
      spacing: ['page', 'hairline'],
    },
  },
});

/** className 합치기. 뒤에 온 클래스가 같은 속성의 앞 클래스를 이긴다. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
