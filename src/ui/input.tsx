import { Platform, TextInput } from 'react-native';

import { cn } from '@/lib/utils';

// Reusables의 Input을 Hana에 맞춘 것: 높이 48, 회색 테두리, 포커스되면 포인트 컬러 테두리.
function Input({ className, ...props }: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className={cn(
        'h-12 w-full min-w-0 rounded-lg border border-input bg-background px-4 font-normal text-body text-foreground',
        'focus:border-primary',
        props.editable === false && 'opacity-50',
        Platform.select({ web: 'outline-none' }),
        className,
      )}
      placeholderTextColorClassName="accent-muted-foreground"
      {...props}
    />
  );
}

export { Input };
