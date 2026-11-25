import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

import { cn } from '@/lib/utils';

// Reusables의 Text를 Hana 글자 단계로 바꾼 것. 글자는 이 variant들 밖의 조합을 쓰지 않는다.
const textVariants = cva(cn('font-normal text-body text-foreground', Platform.select({ web: 'select-text' })), {
  variants: {
    variant: {
      default: '',
      /** 탭 제목 (iOS large title 계열) */
      title: 'font-bold text-title',
      /** 오늘의 표현처럼 화면에서 가장 크게 보여줄 문장 */
      display: 'font-bold text-display',
      /** 섹션 제목 */
      section: 'font-bold text-section',
      /** 목록의 이름, 본문 강조 */
      body: 'font-semibold text-body',
      /** 설명, 자기소개 */
      sub: 'text-sub text-grey-700',
      /** 메타 정보 (언어, 시간, 개수) */
      caption: 'font-medium text-caption text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

type TextVariant = NonNullable<VariantProps<typeof textVariants>['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = { title: 'heading', section: 'heading' };

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
