import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

import { cn } from '@/lib/utils';

// Reusables의 Text를 Hana 글자 단계(34 · 20 · 16 · 14 · 13)로 바꾼 것. 글자는 이 variant들 밖의 조합을 쓰지 않는다.
const textVariants = cva(cn('font-normal text-body text-foreground', Platform.select({ web: 'select-text' })), {
  variants: {
    variant: {
      /** 본문 16 / 400 */
      default: '',
      /** 화면의 큰 글씨 34. 화면당 한 번 */
      display: 'font-bold text-display tracking-[-0.68px]',
      /** 제목 20 */
      title: 'font-bold text-title tracking-[-0.2px]',
      /** 이름처럼 본문에서 강조할 것 16 / 600 */
      strong: 'font-semibold',
      /** 설명, 자기소개 16 / 회색 */
      muted: 'text-grey-700',
      /** 글이 많은 화면의 본문 14 (게시판 글·댓글) */
      sub: 'text-sub',
      /** 메타 정보 (언어, 시간, 개수) 13 */
      caption: 'font-medium text-caption text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

type TextVariant = NonNullable<VariantProps<typeof textVariants>['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = { display: 'heading', title: 'heading' };

/** 버튼처럼 안쪽 글자 스타일을 정해 주는 부모가 쓴다 */
const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof RNText> & VariantProps<typeof textVariants> & { asChild?: boolean }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
