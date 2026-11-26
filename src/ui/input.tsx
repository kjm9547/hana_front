import { Platform, TextInput } from 'react-native';

import { cn } from '@/lib/utils';

// Reusables의 Input을 Hana에 맞춘 것: 높이 56, 테두리 없는 회색 면, 모서리 14.
function Input({ className, ...props }: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className={cn(
        'h-14 w-full min-w-0 rounded-md bg-input px-5 font-normal text-body text-foreground',
        props.editable === false && 'opacity-50',
        Platform.select({ web: 'outline-none focus-visible:ring-2 focus-visible:ring-ring/50' }),
        className,
      )}
      placeholderTextColorClassName="accent-muted-foreground"
      {...props}
    />
  );
}

export { Input };
