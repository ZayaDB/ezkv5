# MentorLink – Sample Components

## Landing Page Hero Section

```typescript
// components/features/landing/HeroSection.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-6">
              <Shield className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-700">
                Trusted by 10,000+ students
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your trusted guide to{' '}
              <span className="text-primary-500">life abroad</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect with mentors who've walked your path. Get help with visas,
              housing, studies, and everything in between.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="group">
                Find Your Mentor
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg">
                Become a Mentor
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span>Active in 50+ countries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span>2,500+ verified mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span>4.8/5 average rating</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Image */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/hero-mentor-mentee.jpg"
                  alt="Mentor and mentee having a conversation"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">10,000+</div>
                    <div className="text-sm text-gray-600">Active students</div>
                  </div>
                </div>
              </div>

              {/* Floating Success Card */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-accent-500" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">Success rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Value Proposition Cards

```typescript
// components/features/landing/ValueProposition.tsx
import { Network, HandHeart, TrendingUp } from 'lucide-react';

const values = [
  {
    icon: Network,
    title: 'Find Your Match',
    description:
      'Filter by country, university, field, and language. Find someone who's been exactly where you are.',
  },
  {
    icon: HandHeart,
    title: 'Get Real Help',
    description:
      'Visa applications, housing searches, hospital visits, freelance setup. We help with the real stuff.',
  },
  {
    icon: TrendingUp,
    title: 'Build Confidence',
    description:
      'Weekly check-ins, progress tracking, and a community that has your back.',
  },
];

export function ValueProposition() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need to thrive abroad
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're not just a matching platform—we're your support system for
            every step of your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-8 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

---

## Testimonial Card

```typescript
// components/shared/TestimonialCard.tsx
import Image from 'next/image';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

interface TestimonialCardProps {
  testimonial: {
    id: string;
    quote: string;
    author: {
      name: string;
      photo: string;
      country: string;
      university: string;
    };
    rating: number;
  };
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < testimonial.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
        "{testimonial.quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        <Avatar
          src={testimonial.author.photo}
          alt={testimonial.author.name}
          size="md"
        />
        <div>
          <div className="font-semibold text-gray-900">
            {testimonial.author.name}
          </div>
          <div className="text-sm text-gray-600">
            {testimonial.author.country} • {testimonial.author.university}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Mentor Search Filters (Mobile Bottom Sheet)

```typescript
// components/features/mentor/MentorFilters.tsx
'use client';

import { useState } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface MentorFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    location: string[];
    languages: string[];
    fields: string[];
    priceRange: [number, number];
    availability: boolean;
    rating: number;
  };
  onFiltersChange: (filters: typeof MentorFiltersProps.filters) => void;
}

export function MentorFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: MentorFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = {
      location: [],
      languages: [],
      fields: [],
      priceRange: [0, 200],
      availability: false,
      rating: 0,
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-50 lg:hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-8">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Location
            </label>
            <input
              type="text"
              placeholder="Country, city, or university"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Languages
            </label>
            <div className="flex flex-wrap gap-2">
              {['English', 'Spanish', 'Mandarin', 'Korean', 'Japanese'].map(
                (lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      const newLangs = localFilters.languages.includes(lang)
                        ? localFilters.languages.filter((l) => l !== lang)
                        : [...localFilters.languages, lang];
                      setLocalFilters({ ...localFilters, languages: newLangs });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      localFilters.languages.includes(lang)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Price Range
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="200"
                value={localFilters.priceRange[1]}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceRange: [0, parseInt(e.target.value)],
                  })
                }
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>$0</span>
                <span className="font-medium text-gray-900">
                  Up to ${localFilters.priceRange[1]}/hour
                </span>
                <span>$200+</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[4, 4.5, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() =>
                    setLocalFilters({ ...localFilters, rating })
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    localFilters.rating === rating
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {rating}+ ⭐
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button variant="outline" onClick={handleClear} className="flex-1">
            Clear All
          </Button>
          <Button variant="primary" onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
}
```

---

## Dashboard Upcoming Sessions Card

```typescript
// components/features/dashboard/UpcomingSessions.tsx
import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface Session {
  id: string;
  mentor: {
    name: string;
    photo: string;
  };
  type: string;
  date: Date;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  meetingLink?: string;
}

interface UpcomingSessionsProps {
  sessions: Session[];
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Upcoming Sessions
        </h2>
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No upcoming sessions</p>
          <Button variant="primary">Book Your First Session</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Upcoming Sessions
        </h2>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <Avatar
              src={session.mentor.photo}
              alt={session.mentor.name}
              size="md"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {session.mentor.name}
                  </h3>
                  <p className="text-sm text-gray-600">{session.type}</p>
                </div>
                <Badge
                  variant={
                    session.status === 'confirmed'
                      ? 'success'
                      : session.status === 'pending'
                      ? 'warning'
                      : 'error'
                  }
                  size="sm"
                >
                  {session.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDate(session.date)} at{' '}
                    {session.date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{session.duration} minutes</span>
                </div>
                {session.meetingLink && (
                  <div className="flex items-center gap-1">
                    <Video className="w-4 h-4" />
                    <span>Video call</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {session.status === 'confirmed' && (
                  <>
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    {session.meetingLink && (
                      <Button variant="primary" size="sm">
                        Join Call
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Emergency Help Component

```typescript
// components/features/community/EmergencyHelp.tsx
import { Phone, MessageCircle, AlertCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const emergencyOptions = [
  {
    id: 'crisis',
    icon: Heart,
    title: 'Crisis Support',
    description: 'Mental health crisis, emotional support',
    phone: '1-800-XXX-XXXX',
    chat: 'Chat with a counselor',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
  },
  {
    id: 'legal',
    icon: AlertCircle,
    title: 'Legal Emergency',
    description: 'Visa issues, legal problems',
    action: 'Contact our legal support team',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-500',
  },
  {
    id: 'medical',
    icon: Phone,
    title: 'Medical Emergency',
    description: 'Healthcare questions, hospital help',
    action: 'Find a hospital near you',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-500',
  },
  {
    id: 'general',
    icon: MessageCircle,
    title: 'General Support',
    description: 'Anything else',
    action: 'Contact support team',
    color: 'bg-gray-50 border-gray-200',
    iconColor: 'text-gray-500',
  },
];

export function EmergencyHelp() {
  return (
    <section className="bg-white rounded-xl p-8 border-2 border-red-200">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Need Immediate Help?
        </h2>
        <p className="text-lg text-gray-600">
          We're here 24/7 for emergencies. All conversations are confidential
          and secure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {emergencyOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className={`${option.color} border-2 rounded-xl p-6 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`${option.iconColor} bg-white rounded-lg p-3`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {option.description}
                  </p>
                  {option.phone && (
                    <div className="space-y-2">
                      <a
                        href={`tel:${option.phone}`}
                        className="block text-primary-600 font-medium hover:text-primary-700"
                      >
                        📞 {option.phone}
                      </a>
                      <Button variant="outline" size="sm" className="w-full">
                        {option.chat}
                      </Button>
                    </div>
                  )}
                  {option.action && (
                    <Button variant="primary" size="sm" className="w-full">
                      {option.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          🔒 All conversations are confidential and secure. Your privacy is our
          priority.
        </p>
      </div>
    </section>
  );
}
```

---

These components demonstrate the design system in action. They follow the principles of:
- **Clarity**: Clear hierarchy, readable text
- **Trust**: Real photos, verified badges, security signals
- **Empathy**: Warm language, supportive messaging
- **Premium**: Generous spacing, subtle shadows, smooth transitions



