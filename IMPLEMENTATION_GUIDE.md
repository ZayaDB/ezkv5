# MentorLink – Implementation Guide

## 🛠 Tech Stack Recommendation

- **Framework**: Next.js 14 (App Router) or React 18+
- **Styling**: Tailwind CSS 3.x
- **UI Components**: Radix UI (headless, accessible)
- **Forms**: React Hook Form + Zod
- **State Management**: Zustand or React Query
- **Icons**: Heroicons or Lucide React
- **Animations**: Framer Motion
- **Fonts**: Inter (Google Fonts)

---

## 📦 Project Structure

```
mentorlink/
├── src/
│   ├── app/                    # Next.js App Router (if using Next.js)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing page
│   │   ├── onboarding/
│   │   ├── mentors/
│   │   ├── dashboard/
│   │   └── community/
│   │
│   ├── components/
│   │   ├── ui/                 # Base components (Radix UI wrappers)
│   │   ├── features/           # Feature components
│   │   └── layout/             # Layout components
│   │
│   ├── lib/
│   │   ├── design-tokens.ts    # Design system tokens
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript types
│
├── public/
│   ├── images/
│   └── icons/
│
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🎨 Design Tokens Implementation

### `lib/design-tokens.ts`

```typescript
export const colors = {
  primary: {
    50: '#E6F2FF',
    100: '#CCE5FF',
    500: '#0066FF',
    700: '#0052CC',
    900: '#003D99',
  },
  accent: {
    50: '#E6FCF7',
    500: '#00C896',
    700: '#00A078',
  },
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    400: '#A3A3A3',
    600: '#525252',
    900: '#171717',
  },
  semantic: {
    success: '#00C896',
    warning: '#FFB800',
    error: '#FF4444',
    info: '#0066FF',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.04)',
  md: '0 2px 8px rgba(0,0,0,0.08)',
  lg: '0 4px 16px rgba(0,0,0,0.12)',
  xl: '0 8px 24px rgba(0,0,0,0.16)',
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
  fontSize: {
    display: ['48px', { lineHeight: '56px' }],
    h1: ['36px', { lineHeight: '44px' }],
    h2: ['28px', { lineHeight: '36px' }],
    h3: ['22px', { lineHeight: '30px' }],
    h4: ['18px', { lineHeight: '26px' }],
    'body-lg': ['18px', { lineHeight: '28px' }],
    body: ['16px', { lineHeight: '24px' }],
    'body-sm': ['14px', { lineHeight: '20px' }],
    caption: ['12px', { lineHeight: '16px' }],
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
```

---

## 🧩 Example Components

### 1. Base Button Component

```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        outline: 'border-2 border-gray-200 text-gray-900 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

### 2. Mentor Card Component

```typescript
// components/features/mentor/MentorCard.tsx
import Image from 'next/image';
import { Star, MapPin, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

interface MentorCardProps {
  mentor: {
    id: string;
    name: string;
    title: string;
    location: string;
    languages: string[];
    rating: number;
    reviewCount: number;
    specialties: string[];
    price: number | 'Free';
    availability: 'available' | 'limited' | 'unavailable';
    photo: string;
    verified: boolean;
    stats: {
      sessions: number;
      responseRate: number;
    };
  };
}

export function MentorCard({ mentor }: MentorCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <Avatar
            src={mentor.photo}
            alt={mentor.name}
            size="lg"
            className="w-20 h-20"
          />
          {mentor.verified && (
            <div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {mentor.name}
          </h3>
          <p className="text-sm text-gray-600 truncate">{mentor.title}</p>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{mentor.location}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium text-gray-900">{mentor.rating}</span>
        </div>
        <span className="text-sm text-gray-500">
          ({mentor.reviewCount} reviews)
        </span>
      </div>

      {/* Languages */}
      <div className="flex items-center gap-2 mb-3">
        {mentor.languages.map((lang) => (
          <Badge key={lang} variant="secondary" size="sm">
            {lang}
          </Badge>
        ))}
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2 mb-4">
        {mentor.specialties.slice(0, 3).map((specialty) => (
          <Badge key={specialty} variant="outline" size="sm">
            {specialty}
          </Badge>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{mentor.stats.sessions}+ sessions</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{mentor.stats.responseRate}% response rate</span>
        </div>
      </div>

      {/* Price & Availability */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {mentor.price === 'Free' ? 'Free' : `$${mentor.price}`}
          </span>
          {mentor.price !== 'Free' && (
            <span className="text-sm text-gray-500">/hour</span>
          )}
        </div>
        {mentor.availability === 'available' && (
          <Badge variant="success" size="sm">
            Available this week
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="primary" size="md" className="flex-1">
          View Profile
        </Button>
        <Button variant="outline" size="md">
          Message
        </Button>
      </div>
    </div>
  );
}
```

### 3. Onboarding Step Component

```typescript
// components/features/onboarding/OnboardingStep.tsx
import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface OnboardingStepProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  backLabel?: string;
  canSkip?: boolean;
  onSkip?: () => void;
  isNextDisabled?: boolean;
}

export function OnboardingStep({
  currentStep,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  backLabel = 'Back',
  canSkip = false,
  onSkip,
  isNextDisabled = false,
}: OnboardingStepProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(progress)}% complete
            </span>
          </div>
          <ProgressBar value={progress} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            {subtitle && (
              <p className="text-lg text-gray-600 mb-8">{subtitle}</p>
            )}
            
            <div className="mb-8">{children}</div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-200">
              <div>
                {onBack && (
                  <Button variant="ghost" onClick={onBack}>
                    {backLabel}
                  </Button>
                )}
                {canSkip && onSkip && (
                  <Button variant="ghost" onClick={onSkip} className="ml-2">
                    Skip
                  </Button>
                )}
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={onNext}
                disabled={isNextDisabled}
              >
                {nextLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 4. Goal Selector Component

```typescript
// components/features/onboarding/GoalSelector.tsx
import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const goals: Goal[] = [
  {
    id: 'visa',
    icon: '🛂',
    title: 'Visa & Immigration',
    description: 'Help with visa applications, renewals, and documentation',
  },
  {
    id: 'housing',
    icon: '🏠',
    title: 'Housing',
    description: 'Finding apartments, understanding leases, roommates',
  },
  {
    id: 'healthcare',
    icon: '🏥',
    title: 'Healthcare',
    description: 'Understanding insurance, finding doctors, hospital visits',
  },
  {
    id: 'academic',
    icon: '📚',
    title: 'Academic Support',
    description: 'Study strategies, course selection, research guidance',
  },
  {
    id: 'career',
    icon: '💼',
    title: 'Career & Freelance',
    description: 'Job search, freelance setup, networking',
  },
  {
    id: 'daily-life',
    icon: '🌍',
    title: 'Daily Life',
    description: 'Language practice, cultural adaptation, making friends',
  },
];

interface GoalSelectorProps {
  selectedGoals: string[];
  onSelectionChange: (goals: string[]) => void;
}

export function GoalSelector({ selectedGoals, onSelectionChange }: GoalSelectorProps) {
  const handleToggle = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      onSelectionChange(selectedGoals.filter((id) => id !== goalId));
    } else {
      onSelectionChange([...selectedGoals, goalId]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((goal) => {
        const isSelected = selectedGoals.includes(goal.id);
        return (
          <button
            key={goal.id}
            type="button"
            onClick={() => handleToggle(goal.id)}
            className={cn(
              'relative p-6 rounded-lg border-2 text-left transition-all duration-200',
              'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              isSelected
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            )}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 bg-primary-500 rounded-full p-1">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="text-3xl mb-3">{goal.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {goal.title}
            </h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </button>
        );
      })}
    </div>
  );
}
```

---

## 🎯 Tailwind Config

```javascript
// tailwind.config.js
const { colors, spacing, borderRadius, shadows, typography } = require('./src/lib/design-tokens');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        accent: colors.accent,
        gray: colors.gray,
        ...colors.semantic,
      },
      spacing: spacing,
      borderRadius: borderRadius,
      boxShadow: shadows,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## 📱 Responsive Breakpoints

```typescript
// Use Tailwind's default breakpoints
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px

// Example usage:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid */}
</div>
```

---

## 🎨 Utility Functions

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(then);
}
```

---

## 🚀 Getting Started

1. **Initialize Project**
   ```bash
   npx create-next-app@latest mentorlink --typescript --tailwind --app
   cd mentorlink
   ```

2. **Install Dependencies**
   ```bash
   npm install lucide-react class-variance-authority clsx tailwind-merge
   npm install -D @tailwindcss/forms @tailwindcss/typography
   ```

3. **Setup Fonts**
   - Add Inter font from Google Fonts to `app/layout.tsx`

4. **Create Component Structure**
   - Follow the structure outlined above
   - Start with base UI components
   - Build feature components incrementally

5. **Implement Design Tokens**
   - Copy `design-tokens.ts` to `lib/`
   - Update `tailwind.config.js` with tokens

---

## 📝 Next Steps

1. Build base UI components (Button, Input, Card, Badge, etc.)
2. Implement landing page
3. Build onboarding flow
4. Create mentor search & profile pages
5. Add dashboard
6. Implement community features

---

**Remember**: Start with mobile, then enhance for desktop. Test accessibility early. Iterate based on user feedback.



