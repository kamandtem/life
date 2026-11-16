import React, { useState, useMemo } from 'react';
import {
  Home,
  Calendar,
  Sparkles,
  BookOpen,
  Settings,
  Bell,
  Search,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Camera,
  Heart,
  Star,
  Clock,
  Share2,
  SlidersHorizontal,
  Image as ImageIcon,
  Smile,
  ArrowLeft,
  Menu,
  CheckCircle2,
  Eye,
  Smartphone,
  Layers,
  Bookmark,
  Sun,
  Award,
  Flame,
  Edit3,
  Trash2
} from 'lucide-react';

// ==========================================
// 1. PERSIAN NUMERALS & JALALI HELPERS
// ==========================================
const toPersianNum = (num) => {
  if (num === null || num === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (d) => persianDigits[d]);
};

const JALALI_MONTHS = [
  { id: 1, name: 'فروردین', days: 31, season: 'بهار', emoji: '🌸', color: '#FF7675', bg: '#FFF0F0', count: 29 },
  { id: 2, name: 'اردیبهشت', days: 31, season: 'بهار', emoji: '🌿', color: '#00B894', bg: '#E8FBF6', count: 31 },
  { id: 3, name: 'خرداد', days: 31, season: 'بهار', emoji: '☀️', color: '#FDCB6E', bg: '#FFF9EC', count: 27 },
  { id: 4, name: 'تیر', days: 31, season: 'تابستان', emoji: '🍉', color: '#FF7675', bg: '#FFF2F2', count: 30 },
  { id: 5, name: 'مرداد', days: 31, season: 'تابستان', emoji: '🏖️', color: '#74B9FF', bg: '#EDF6FF', count: 25 },
  { id: 6, name: 'شهریور', days: 31, season: 'تابستان', emoji: '🌾', color: '#FFA502', bg: '#FFF6E8', count: 28 },
  { id: 7, name: 'مهر', days: 30, season: 'پاییز', emoji: '🍂', color: '#E17055', bg: '#FDF1EE', count: 30 },
  { id: 8, name: 'آبان', days: 30, season: 'پاییز', emoji: '🌧️', color: '#6C5CE7', bg: '#F1EFFD', count: 25, current: true },
  { id: 9, name: 'آذر', days: 30, season: 'پاییز', emoji: '☕', color: '#A29BFE', bg: '#F4F3FF', count: 0 },
  { id: 10, name: 'دی', days: 30, season: 'زمستان', emoji: '❄️', color: '#74B9FF', bg: '#F0F8FF', count: 0 },
  { id: 11, name: 'بهمن', days: 30, season: 'زمستان', emoji: '⛄', color: '#81ECEC', bg: '#EEFCFC', count: 0 },
  { id: 12, name: 'اسفند', days: 29, season: 'زمستان', emoji: '🌱', color: '#55EFC4', bg: '#EDFCF7', count: 0 },
];

const WEEK_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const WEEK_DAYS_FULL = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

// ==========================================
// 2. CUSTOM KAWAII SVG ILLUSTRATIONS
// (Strictly matching the reference image's exact characters)
// ==========================================

// 2.1 Welcome Screen: Cute Orange Bear + 3 Floating Thought Cards
const WelcomeBearIllustration = () => (
  <div className="relative w-56 h-52 mx-auto flex items-center justify-center select-none">
    {/* Soft Radial Peach Dot Glow behind character */}
    <div
      className="absolute inset-0 rounded-full opacity-75 blur-xl"
      style={{
        background: 'radial-gradient(circle, rgba(255,190,152,0.45) 0%, rgba(235,232,250,0.2) 65%, transparent 100%)'
      }}
    />
    <div
      className="absolute inset-3 opacity-35"
      style={{
        backgroundImage: 'radial-gradient(#F3A683 1.5px, transparent 1.5px)',
        backgroundSize: '10px 10px',
        borderRadius: '9999px'
      }}
    />

    {/* Floating Left Card (Tilted) - Bicycle / Journey */}
    <div
      className="absolute top-6 left-2 w-14 h-14 bg-white rounded-2xl shadow-[0_8px_20px_rgba(108,92,231,0.12)] border border-[#F3F1FC] flex items-center justify-center transform -rotate-12 transition-transform duration-500 hover:scale-110 z-10"
    >
      <svg viewBox="0 0 36 36" className="w-9 h-9">
        <circle cx="9" cy="24" r="5.5" fill="none" stroke="#4834D4" strokeWidth="2.4" />
        <circle cx="27" cy="24" r="5.5" fill="none" stroke="#4834D4" strokeWidth="2.4" />
        <path d="M9 24 L16 14 L24 14 L18 24 Z" fill="none" stroke="#6C5CE7" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M24 14 L27 24 M14 14 L18 14 M23 11 L26 11" stroke="#4834D4" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>

    {/* Floating Center Top Card - Green Open Memory Journal Book */}
    <div
      className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-15 bg-white rounded-2xl shadow-[0_10px_24px_rgba(108,92,231,0.14)] border border-[#F3F1FC] flex items-center justify-center transform rotate-2 z-20 p-2"
    >
      <svg viewBox="0 0 40 36" className="w-10 h-9">
        <rect x="4" y="6" width="32" height="24" rx="4" fill="#00B894" />
        <path d="M20 7 C15 7 9 8.5 7 10 L7 27 C9 25.5 15 24 20 24 C25 24 31 25.5 33 27 L33 10 C31 8.5 25 7 20 7 Z" fill="#FFFFFF" />
        <line x1="20" y1="7" x2="20" y2="25" stroke="#DFE6E9" strokeWidth="1.5" />
        <path d="M13 7 L13 15 L15.5 13.5 L18 15 L18 7 Z" fill="#FF7675" />
      </svg>
    </div>

    {/* Floating Right Card (Tilted) - Sweet Memory / Red Apple-Heart */}
    <div
      className="absolute top-7 right-2 w-14 h-14 bg-white rounded-2xl shadow-[0_8px_20px_rgba(108,92,231,0.12)] border border-[#F3F1FC] flex items-center justify-center transform rotate-12 transition-transform duration-500 hover:scale-110 z-10"
    >
      <svg viewBox="0 0 36 36" className="w-8 h-8">
        <path d="M18 10 C15 10 13 7 15 5 C17 5 18 7 18 10 Z" fill="#00B894" />
        <path d="M23 9 C23 9 20 6 18 9" stroke="#6AB04C" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 11 C13 9 8 13 8 19 C8 25 13 30 18 29 C23 30 28 25 28 19 C28 13 23 9 18 11 Z" fill="#FF6B6B" />
        <path d="M12 16 C11 18 11 21 12.5 23" stroke="#FF9FF3" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>

    {/* Decorative Sparkles & Thought Bubbles */}
    <div className="absolute top-20 left-10 w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
    <div className="absolute top-20 right-11 w-2 h-2 rounded-full bg-white shadow-sm" />
    <span className="absolute top-16 left-4 text-[#FDCB6E] text-sm">✦</span>
    <span className="absolute top-4 right-12 text-[#FDCB6E] text-xs">✦</span>
    <span className="absolute bottom-14 left-8 text-[#FDCB6E] text-xs">✦</span>

    {/* Cute Warm Orange Bear Head */}
    <svg viewBox="0 0 120 100" className="w-32 h-28 mt-20 relative z-10 drop-shadow-sm">
      {/* Ears */}
      <circle cx="28" cy="30" r="15" fill="#F08A4B" />
      <circle cx="28" cy="30" r="8" fill="#FAD390" />
      <circle cx="92" cy="30" r="15" fill="#F08A4B" />
      <circle cx="92" cy="30" r="8" fill="#FAD390" />
      {/* Head */}
      <path
        d="M20 55 C20 28 40 20 60 20 C80 20 100 28 100 55 C100 78 84 88 60 88 C36 88 20 78 20 55 Z"
        fill="#F39256"
      />
      {/* Cheeks */}
      <ellipse cx="33" cy="60" rx="7" ry="4.5" fill="#FF7675" opacity="0.55" />
      <ellipse cx="87" cy="60" rx="7" ry="4.5" fill="#FF7675" opacity="0.55" />
      {/* Muzzle */}
      <ellipse cx="60" cy="63" rx="18" ry="15" fill="#FDE3A7" />
      {/* Eyes */}
      <circle cx="44" cy="49" r="4" fill="#2D3436" />
      <circle cx="45.2" cy="47.8" r="1.3" fill="#FFFFFF" />
      <circle cx="76" cy="49" r="4" fill="#2D3436" />
      <circle cx="77.2" cy="47.8" r="1.3" fill="#FFFFFF" />
      {/* Nose */}
      <ellipse cx="60" cy="56" rx="5.5" ry="4" fill="#4A2E1B" />
      {/* Happy Open Mouth */}
      <path d="M53 63 C55 71 65 71 67 63 Z" fill="#D65A5A" />
      <path d="M56 67 C58 65 62 65 64 67 C62 70 58 70 56 67 Z" fill="#FF9FF3" />
    </svg>
  </div>
);

// 2.2 Dashboard Header: Cute Green Frog holding a Leaf Umbrella
const FrogLeafIllustration = () => (
  <svg viewBox="0 0 130 120" className="w-28 h-24 select-none overflow-visible drop-shadow-sm">
    {/* Soft Yellow Glow behind frog */}
    <circle cx="70" cy="72" r="36" fill="#FFF3B0" opacity="0.45" filter="blur(10px)" />
    {/* Leaf Stem */}
    <path d="M62 82 Q75 52 60 24" fill="none" stroke="#44BD32" strokeWidth="4" strokeLinecap="round" />
    {/* Big Green Leaf Umbrella */}
    <path
      d="M15 26 C25 5 68 2 108 26 C88 38 45 40 15 26 Z"
      fill="#78E08F"
    />
    <path
      d="M15 26 C45 18 78 18 108 26"
      fill="none"
      stroke="#38ADA9"
      strokeWidth="2"
      opacity="0.6"
    />
    {/* Frog Body */}
    <ellipse cx="70" cy="88" rx="22" ry="18" fill="#2ECC71" />
    <ellipse cx="70" cy="91" rx="14" ry="12" fill="#B8E994" />
    {/* Frog Head */}
    <ellipse cx="70" cy="66" rx="26" ry="19" fill="#2ECC71" />
    {/* Eye Bulges */}
    <circle cx="54" cy="49" r="10" fill="#2ECC71" />
    <circle cx="86" cy="49" r="10" fill="#2ECC71" />
    <circle cx="54" cy="49" r="6.5" fill="#FFFFFF" />
    <circle cx="86" cy="49" r="6.5" fill="#FFFFFF" />
    <circle cx="54" cy="49" r="4" fill="#1E272E" />
    <circle cx="86" cy="49" r="4" fill="#1E272E" />
    <circle cx="55.5" cy="47.5" r="1.5" fill="#FFFFFF" />
    <circle cx="87.5" cy="47.5" r="1.5" fill="#FFFFFF" />
    {/* Rosy Cheeks */}
    <ellipse cx="47" cy="64" rx="5.5" ry="3.5" fill="#FF7675" opacity="0.75" />
    <ellipse cx="93" cy="64" rx="5.5" ry="3.5" fill="#FF7675" opacity="0.75" />
    {/* Cute Smile */}
    <path d="M62 63 C65 71 75 71 78 63 Z" fill="#EB4D4B" />
    <path d="M65 67 C68 65 72 65 75 67 C73 70 67 70 65 67 Z" fill="#FF7979" />
    {/* Frog Arms */}
    <path d="M52 80 Q60 74 66 76" fill="none" stroke="#27AE60" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M88 80 Q98 72 102 66" fill="none" stroke="#2ECC71" strokeWidth="5.5" strokeLinecap="round" />
    {/* Grass tuft */}
    <path d="M36 104 L32 95 M40 104 L40 93 M44 104 L48 96" stroke="#2ECC71" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 2.3 Purple Bear on Clouds (Inside Lifetime Progress Card)
const PurpleCloudBearSVG = () => (
  <svg viewBox="0 0 120 110" className="w-28 h-24 select-none overflow-visible">
    {/* Sparkles */}
    <circle cx="18" cy="24" r="2" fill="#FFF" opacity="0.8" />
    <circle cx="102" cy="20" r="2.5" fill="#FDCB6E" />
    {/* Ears */}
    <circle cx="32" cy="26" r="12" fill="#8C7AE6" />
    <circle cx="32" cy="26" r="6.5" fill="#D6A2E8" />
    <circle cx="88" cy="26" r="12" fill="#8C7AE6" />
    <circle cx="88" cy="26" r="6.5" fill="#D6A2E8" />
    {/* Bear Head & Body */}
    <path
      d="M24 62 C24 30 38 18 60 18 C82 18 96 30 96 62 C96 82 84 94 60 94 C36 94 24 82 24 62 Z"
      fill="#9C88FF"
    />
    {/* Belly patch */}
    <ellipse cx="60" cy="74" rx="20" ry="16" fill="#D2C9FF" />
    {/* Waving Arms */}
    <path d="M26 58 Q10 48 14 38" fill="none" stroke="#9C88FF" strokeWidth="11" strokeLinecap="round" />
    <path d="M94 58 Q110 48 106 38" fill="none" stroke="#9C88FF" strokeWidth="11" strokeLinecap="round" />
    {/* Eyes */}
    <circle cx="46" cy="42" r="3.8" fill="#1E272E" />
    <circle cx="47.2" cy="40.8" r="1.2" fill="#FFFFFF" />
    <circle cx="74" cy="42" r="3.8" fill="#1E272E" />
    <circle cx="75.2" cy="40.8" r="1.2" fill="#FFFFFF" />
    {/* Muzzle & Mouth */}
    <ellipse cx="60" cy="49" rx="11" ry="8.5" fill="#EDE9FE" />
    <ellipse cx="60" cy="46" rx="4" ry="3" fill="#2F3640" />
    <path d="M55 51 C57 57 63 57 65 51 Z" fill="#E84393" />
    {/* Rosy Cheeks */}
    <ellipse cx="38" cy="49" rx="5" ry="3" fill="#FD79A8" opacity="0.6" />
    <ellipse cx="82" cy="49" rx="5" ry="3" fill="#FD79A8" opacity="0.6" />
    {/* Fluffy White Clouds at bottom */}
    <circle cx="22" cy="96" r="16" fill="#FFFFFF" opacity="0.95" />
    <circle cx="46" cy="98" r="18" fill="#FFFFFF" />
    <circle cx="74" cy="99" r="17" fill="#FFFFFF" />
    <circle cx="98" cy="95" r="15" fill="#FFFFFF" opacity="0.92" />
  </svg>
);

// 2.4 Streak Flame Purple Bear (Screen 4: Memory Tracker)
const FlameStreakBearSVG = () => (
  <svg viewBox="0 0 140 130" className="w-32 h-28 mx-auto select-none overflow-visible">
    {/* Outer Soft Pink Flame Aura */}
    <path
      d="M70 8 C86 25 112 36 116 68 C120 96 98 118 70 118 C42 118 20 96 24 68 C28 36 54 25 70 8 Z"
      fill="#FFD3DA"
      opacity="0.65"
    />
    <path
      d="M42 26 C52 38 35 55 38 78 C40 100 56 114 70 114 C84 114 100 100 102 78 C105 55 88 38 98 26 C85 35 78 20 70 14 C62 20 55 35 42 26 Z"
      fill="#FF9AA2"
      opacity="0.65"
    />
    {/* Tiny Flame Sparks */}
    <circle cx="24" cy="44" r="3" fill="#FFB7B2" />
    <circle cx="116" cy="48" r="3.5" fill="#FFB7B2" />
    <circle cx="70" cy="4" r="2.5" fill="#FF9AA2" />

    {/* Purple Bear Inside Flame */}
    <circle cx="48" cy="46" r="9" fill="#8C7AE6" />
    <circle cx="92" cy="46" r="9" fill="#8C7AE6" />
    <path
      d="M40 80 C40 52 50 42 70 42 C90 42 100 52 100 80 C100 100 88 112 70 112 C52 112 40 100 40 80 Z"
      fill="#8C7AE6"
    />
    <ellipse cx="70" cy="90" rx="18" ry="16" fill="#D6C9FF" />
    {/* Eyes & Muzzle */}
    <circle cx="58" cy="60" r="3" fill="#1E272E" />
    <circle cx="82" cy="60" r="3" fill="#1E272E" />
    <ellipse cx="70" cy="65" rx="9" ry="7" fill="#F3EFFE" />
    <ellipse cx="70" cy="63" rx="3.5" ry="2.5" fill="#2D3436" />
    <path d="M66 67 C68 72 72 72 74 67 Z" fill="#EB4D4B" />
    {/* Cheering Arms */}
    <path d="M42 74 Q30 64 34 54" fill="none" stroke="#8C7AE6" strokeWidth="9" strokeLinecap="round" />
    <path d="M98 74 Q110 64 106 54" fill="none" stroke="#8C7AE6" strokeWidth="9" strokeLinecap="round" />
    {/* Cute Feet */}
    <ellipse cx="54" cy="110" rx="8" ry="5.5" fill="#7158E2" />
    <ellipse cx="86" cy="110" rx="8" ry="5.5" fill="#7158E2" />
  </svg>
);

// 2.5 Mini Card Icons (Water/Hourglass, Sleeping Bear, Green Bike) matching middle phone
const MiniHourglassSVG = () => (
  <svg viewBox="0 0 40 40" className="w-9 h-9 mx-auto">
    <rect x="10" y="6" width="20" height="28" rx="4" fill="#D6EEFF" />
    <path d="M12 16 Q20 19 28 16 L26 32 C26 33 14 33 14 32 Z" fill="#48DBFB" />
    <circle cx="17" cy="24" r="1.5" fill="#FFF" opacity="0.8" />
    <circle cx="23" cy="28" r="1" fill="#FFF" opacity="0.8" />
  </svg>
);

const MiniSleepingBearSVG = () => (
  <svg viewBox="0 0 44 40" className="w-10 h-9 mx-auto">
    <circle cx="14" cy="14" r="5" fill="#F39256" />
    <circle cx="30" cy="14" r="5" fill="#F39256" />
    <ellipse cx="22" cy="22" rx="12" ry="10" fill="#F39256" />
    <ellipse cx="22" cy="25" rx="6" ry="4.5" fill="#FDE3A7" />
    <path d="M16 20 Q18 22 20 20" fill="none" stroke="#2D3436" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M24 20 Q26 22 28 20" fill="none" stroke="#2D3436" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="22" cy="23.5" r="2" fill="#4A2E1B" />
    <text x="32" y="12" fontSize="8" fill="#F39256" fontWeight="bold">z</text>
  </svg>
);

const MiniBikeSVG = () => (
  <svg viewBox="0 0 44 40" className="w-10 h-9 mx-auto">
    <circle cx="12" cy="26" r="6" fill="none" stroke="#00B894" strokeWidth="2.5" />
    <circle cx="32" cy="26" r="6" fill="none" stroke="#00B894" strokeWidth="2.5" />
    <path d="M12 26 L19 16 L29 16 L22 26 Z" fill="none" stroke="#00B894" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M29 16 L32 26 M17 16 L21 16 M27 13 L31 13" stroke="#009432" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

// ==========================================
// 3. INITIAL DATA STATE
// ==========================================
const INITIAL_MEMORIES = [
  {
    id: 1,
    title: 'قدم زدن در باغ ارم شیراز',
    subtitle: 'عطر بهارنارنج و غروب دل‌انگیز',
    date: '۲۵ آبان ۱۴۰۵',
    day: 25,
    month: 8,
    year: 1405,
    emoji: '🌿',
    category: 'سفر و طبیعت',
    completed: true,
    iconBg: '#E6F7FF',
    iconColor: '#0984E3',
    note: 'امروز بعدازظهر همراه با خانواده در مسیر سروهای بلند باغ ارم قدم زدیم. هوای پاییزی شیراز فوق‌العاده لطیف بود و صدای آب آرامش عجیبی داشت.',
    hasPhoto: true,
  },
  {
    id: 2,
    title: 'قهوه و گفتگو با صمیمی‌ترین دوست',
    subtitle: 'به مدت ۲ ساعت در کافه کتاب',
    date: '۲۵ آبان ۱۴۰۵',
    day: 25,
    month: 8,
    year: 1405,
    emoji: '☕',
    category: 'دوستان',
    completed: true,
    iconBg: '#FFF6E5',
    iconColor: '#FFA502',
    note: 'بعد از چند ماه بالاخره توانستیم بنشینیم و از خاطرات دانشگاه و برنامه‌های سال آینده صحبت کنیم.',
    hasPhoto: false,
  },
  {
    id: 3,
    title: 'ثبت یادداشت قدردانی شبانه',
    subtitle: 'پایان روز با حس آرامش',
    date: '۲۵ آبان ۱۴۰۵',
    day: 25,
    month: 8,
    year: 1405,
    emoji: '📖',
    category: 'خلوت من',
    completed: false,
    iconBg: '#EBFBEE',
    iconColor: '#00B894',
    note: 'سه اتفاق کوچکی که امروز باعث لبخند من شد را در دفترچه شخصی نوشتم.',
    hasPhoto: false,
  },
];

const INITIAL_NOTEBOOK_ENTRIES = [
  {
    id: 101,
    title: 'سفرنامه پاییزی کویر مرنجاب',
    category: 'سفرنامه',
    date: '۱۸ آبان ۱۴۰۵',
    emoji: '🌌',
    coverGrad: 'from-[#6C5CE7] to-[#A29BFE]',
    excerpt: 'آسمان پرستاره کویر در سکوت مطلق شب، یکی از باشکوه‌ترین تصویرهایی بود که در ۲۹ سال زندگی‌ام دیده‌ام...',
    count: '۱۲ یادداشت'
  },
  {
    id: 102,
    title: 'نامه‌ای به خودم در ۴۰ سالگی',
    category: 'دل‌نوشته‌ها',
    date: '۱۰ آبان ۱۴۰۵',
    emoji: '💌',
    coverGrad: 'from-[#FF7675] to-[#FAB1A0]',
    excerpt: 'امروز که این سطرها را می‌نویسم، در میانه دهه سوم زندگی هستم. امیدوارم وقتی این صفحه را باز می‌کنی...',
    count: '۸ یادداشت'
  },
  {
    id: 103,
    title: 'ایده‌های عکاسی مستند روزمره',
    category: 'ایده‌ها',
    date: '۲ آبان ۱۴۰۵',
    emoji: '📸',
    coverGrad: 'from-[#00B894] to-[#55EFC4]',
    excerpt: 'ثبت یک فریم عکس از پنجره اتاق در هر فصل سال و ساخت یک کلاژ از گذر زمان در تقویم زندگی...',
    count: '۱۵ یادداشت'
  },
];

// ==========================================
// 4. STATUS BAR & BOTTOM NAVIGATION
// ==========================================
const StatusBar = ({ light = false }) => (
  <div
    dir="ltr"
    className={`w-full px-7 pt-3.5 pb-1.5 flex items-center justify-between text-xs font-semibold select-none z-30 ${
      light ? 'text-white' : 'text-[#1E272E]'
    }`}
  >
    <span className="tracking-tight font-bold text-[13px]">9:41</span>
    <div className="flex items-center gap-1.5">
      {/* Cellular Signal Bars */}
      <div className="flex items-end gap-[2px] h-3">
        <span className={`w-[2.5px] h-1.5 rounded-full ${light ? 'bg-white' : 'bg-[#1E272E]'}`} />
        <span className={`w-[2.5px] h-2 rounded-full ${light ? 'bg-white' : 'bg-[#1E272E]'}`} />
        <span className={`w-[2.5px] h-2.5 rounded-full ${light ? 'bg-white' : 'bg-[#1E272E]'}`} />
        <span className={`w-[2.5px] h-3 rounded-full ${light ? 'bg-white/50' : 'bg-[#1E272E]/35'}`} />
      </div>
      {/* Wifi */}
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.4 16.4 10.6 16 12 16s2.6.4 3.5 1.1l1.4-1.4C15.6 14.6 13.9 14 12 14s-3.6.6-4.9 1.7zm-2.8-2.8l1.4 1.4C7.3 13 9.5 12 12 12s4.7 1 6.3 2.3l1.4-1.4C17.7 11.1 15 10 12 10s-5.7 1.1-7.7 2.9z" />
      </svg>
      {/* Battery */}
      <div className={`w-5 h-2.5 rounded-[3px] border ${light ? 'border-white/80' : 'border-[#1E272E]/80'} p-[1.5px] flex items-center`}>
        <div className={`w-full h-full rounded-[1px] ${light ? 'bg-white' : 'bg-[#1E272E]'}`} />
      </div>
    </div>
  </div>
);

const BottomNavBar = ({ activeScreen, onSelectScreen }) => {
  const navItems = [
    { id: 'dashboard', label: 'خانه', icon: Home },
    { id: 'calendar', label: 'تقویم', icon: Calendar },
    { id: 'tracker', label: 'خاطرات', icon: Sparkles },
    { id: 'notebook', label: 'دفترچه', icon: BookOpen },
    { id: 'settings', label: 'تنظیمات', icon: Settings },
  ];

  return (
    <div className="px-4 pb-4 pt-1 bg-gradient-to-t from-white via-white/95 to-transparent sticky bottom-0 z-30">
      <div className="bg-white rounded-[30px] px-2.5 py-2 shadow-[0_12px_32px_rgba(108,92,231,0.12)] border border-[#F2F0FA] flex items-center justify-between">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectScreen(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-[#F8F7FF] shadow-[0_4px_14px_rgba(108,92,231,0.1)] scale-105'
                  : 'hover:bg-[#FAF9FE]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? 'bg-[#1E272E] text-white' : 'text-[#838194]'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] mt-1 font-bold transition-colors ${
                  isActive ? 'text-[#1E272E]' : 'text-[#9593A6]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 5. INDIVIDUAL SCREENS (1 TO 7)
// ==========================================

// ------------------------------------------
// SCREEN 1: WELCOME SCREEN (صفحه خوش‌آمدگویی)
// Replicates Left Phone in Reference Image
// ------------------------------------------
const WelcomeScreen = ({ onNavigate, lifespan }) => {
  return (
    <div
      dir="rtl"
      className="h-full flex flex-col justify-between relative overflow-y-auto no-scrollbar select-none"
      style={{
        background: 'linear-gradient(180deg, #E8E3FA 0%, #F5F3FD 26%, #FFFFFF 55%, #FAF9FE 100%)'
      }}
    >
      <StatusBar light={false} />

      {/* Top Illustration & Headline Area */}
      <div className="px-6 pt-4 flex flex-col items-center text-center">
        <WelcomeBearIllustration />

        <h1 className="text-[22px] font-extrabold text-[#1E272E] leading-snug mt-2 tracking-tight">
          هر روزت یک داستان دارد
        </h1>
        <p className="text-xs text-[#8E8C9E] leading-relaxed mt-2.5 max-w-[235px] font-medium">
          خاطرات روزهای زندگی‌ات را ثبت کن و هیچ لحظه‌ای را فراموش نکن.
        </p>
      </div>

      {/* Bottom Interactive Area (Pill tags + Rounded Input/Start Card) */}
      <div className="px-4 pb-5 mt-6 space-y-3">
        {/* Horizontal Pill Tags (Matches "Habit Tips | Set-up goals | Schedule") */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-0.5">
          <button
            onClick={() => onNavigate('editor')}
            className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl shadow-[0_6px_18px_rgba(108,92,231,0.07)] border border-[#F2F0FA] shrink-0 hover:scale-105 transition"
          >
            <span className="w-5 h-5 rounded-full bg-[#FFF6E0] flex items-center justify-center text-xs">💡</span>
            <span className="text-[11px] font-bold text-[#2D3436]">ثبت خاطره روزانه</span>
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl shadow-[0_6px_18px_rgba(108,92,231,0.07)] border border-[#F2F0FA] shrink-0 hover:scale-105 transition"
          >
            <span className="w-5 h-5 rounded-full bg-[#FFEBF0] flex items-center justify-center text-xs">🎯</span>
            <span className="text-[11px] font-bold text-[#2D3436]">تقویم {toPersianNum(lifespan)} ساله</span>
          </button>

          <button
            onClick={() => onNavigate('tracker')}
            className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl shadow-[0_6px_18px_rgba(108,92,231,0.07)] border border-[#F2F0FA] shrink-0 hover:scale-105 transition"
          >
            <span className="w-5 h-5 rounded-full bg-[#E8FBF4] flex items-center justify-center text-xs">📅</span>
            <span className="text-[11px] font-bold text-[#2D3436]">رد پای خاطرات</span>
          </button>
        </div>

        {/* Bottom Rounded White Box with Soft Lavender Glow (Matches "Ask anything..." box) */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#C7BFFC] via-[#B8AEEFA0] to-[#D6CEFF] rounded-[28px] blur-md opacity-70" />
          <div className="relative bg-white rounded-[26px] p-4 shadow-[0_12px_30px_rgba(108,92,231,0.12)] border border-[#EAE6FA] flex flex-col justify-between min-h-[118px]">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#9A98A9] font-medium">
                  امروز چه لحظه‌ای را می‌خواهی ماندگار کنی؟
                </span>
                <span className="text-[10px] font-bold bg-[#F3F1FC] text-[#6C5CE7] px-2 py-0.5 rounded-full">
                  افق {toPersianNum(lifespan)} سال
                </span>
              </div>
              <p className="text-xs font-bold text-[#4B4958] mt-1.5">
                متولد ۱۵ مهر ۱۳۷۷ • سال ۲۹ زندگی
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('editor')}
                  title="پیوست یادداشت"
                  className="w-8 h-8 rounded-full bg-[#EEEBFA] text-[#6C5CE7] flex items-center justify-center hover:bg-[#E2DDF8] transition"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('editor')}
                  title="افزودن عکس"
                  className="w-8 h-8 rounded-full bg-[#EEEBFA] text-[#6C5CE7] flex items-center justify-center hover:bg-[#E2DDF8] transition"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 bg-[#1A1A24] hover:bg-[#6C5CE7] text-white px-4 py-2 rounded-full text-xs font-bold shadow-[0_6px_16px_rgba(26,26,36,0.25)] transition-all duration-300 group"
              >
                <span>شروع کنیم</span>
                <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------
// SCREEN 2: MAIN DASHBOARD (داشبورد اصلی)
// Replicates Middle Phone in Reference Image
// ------------------------------------------
const DashboardScreen = ({
  memories,
  onToggleMemory,
  onNavigate,
  lifespan,
  currentAge = 28
}) => {
  const progressPercent = Math.round((currentAge / lifespan) * 100);
  const yearsLeft = lifespan - currentAge;

  return (
    <div
      dir="rtl"
      className="h-full flex flex-col justify-between relative overflow-y-auto no-scrollbar select-none bg-[#FBFbfe]"
    >
      {/* Top Lavender-Purple Gradient Header */}
      <div
        className="relative pb-4 rounded-b-[36px]"
        style={{
          background: 'linear-gradient(180deg, #6E62D5 0%, #8E84E6 48%, #DFDCF9 84%, #FBFBFE 100%)'
        }}
      >
        <StatusBar light={true} />

        {/* Header Action Row */}
        <div className="px-5 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('welcome')}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5 text-white">
              <button onClick={() => onNavigate('settings')} className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF6B6B] ring-2 ring-[#8378E3]" />
              </button>
              <button onClick={() => onNavigate('notebook')}>
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Speech Bubble Pill above the Frog */}
          <div className="bg-white/25 backdrop-blur-md border border-white/35 px-3 py-1.5 rounded-full text-[10px] font-bold text-white shadow-sm">
            از یک خاطره کوچک شروع کن!
          </div>
        </div>

        {/* Personalized Greeting + Frog with Leaf Umbrella */}
        <div className="px-5 pt-3 flex items-center justify-between relative">
          <div className="z-10">
            <h2 className="text-xl font-extrabold text-white drop-shadow-sm">
              سلام، مجتبی 👋
            </h2>
            <p className="text-xs text-white/90 font-medium mt-1">
              آماده ثبت داستان امروزت هستی؟
            </p>
            <span className="inline-block mt-1.5 text-[10px] font-bold text-[#574B90] bg-white/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
              جمعه، ۲۵ آبان ۱۴۰۵
            </span>
          </div>

          <div className="-mt-3 -ml-2 z-10">
            <FrogLeafIllustration />
          </div>
        </div>

        {/* 3 Rounded Vertical White Statistic Cards (Exact match to Water / Sleep / Exercise) */}
        <div className="px-4 -mt-2 grid grid-cols-3 gap-2.5 relative z-20">
          {/* Card 1: سال‌های سپری‌شده */}
          <button
            onClick={() => onNavigate('calendar')}
            className="bg-white rounded-[24px] p-3 shadow-[0_10px_25px_rgba(108,92,231,0.09)] border border-[#F3F1FC] flex flex-col items-center text-center hover:-translate-y-0.5 transition"
          >
            <MiniHourglassSVG />
            <span className="text-[10px] font-bold text-[#7C7A8E] mt-1.5">
              سال‌های سپری‌شده
            </span>
            <span className="text-base font-extrabold text-[#1E272E] mt-0.5">
              {toPersianNum(currentAge)}
            </span>
            <span className="text-[9px] text-[#A4A2B5] font-medium">
              از {toPersianNum(lifespan)} سال
            </span>
          </button>

          {/* Card 2: خاطرات ثبت‌شده */}
          <button
            onClick={() => onNavigate('tracker')}
            className="bg-white rounded-[24px] p-3 shadow-[0_10px_25px_rgba(108,92,231,0.09)] border border-[#F3F1FC] flex flex-col items-center text-center hover:-translate-y-0.5 transition"
          >
            <MiniSleepingBearSVG />
            <span className="text-[10px] font-bold text-[#7C7A8E] mt-1.5">
              خاطرات ثبت‌شده
            </span>
            <span className="text-base font-extrabold text-[#1E272E] mt-0.5">
              {toPersianNum(1420 + memories.length - 3)}
            </span>
            <span className="text-[9px] text-[#A4A2B5] font-medium">
              خاطره شیرین
            </span>
          </button>

          {/* Card 3: روزهای به‌یادماندنی */}
          <button
            onClick={() => onNavigate('notebook')}
            className="bg-white rounded-[24px] p-3 shadow-[0_10px_25px_rgba(108,92,231,0.09)] border border-[#F3F1FC] flex flex-col items-center text-center hover:-translate-y-0.5 transition"
          >
            <MiniBikeSVG />
            <span className="text-[10px] font-bold text-[#7C7A8E] mt-1.5">
              روزهای به‌یادماندنی
            </span>
            <span className="text-base font-extrabold text-[#1E272E] mt-0.5">
              {toPersianNum(315)}
            </span>
            <span className="text-[9px] text-[#A4A2B5] font-medium">
              روز ویژه
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 space-y-4 flex-1">
        {/* Deep Royal Purple Progress Card (Matches "Today's progress" card with Purple Bear on Clouds) */}
        <div
          onClick={() => onNavigate('calendar')}
          className="cursor-pointer relative overflow-hidden rounded-[28px] p-4 shadow-[0_12px_28px_rgba(84,72,200,0.26)] flex items-center justify-between text-white transition hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, #4B42B6 0%, #6157D6 100%)'
          }}
        >
          {/* Right Side: Progress Info */}
          <div className="flex-1 z-10 pl-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-tight">
                پیشرفت تقویم زندگی
              </span>
              <span className="text-[11px] font-bold text-white/90">
                {toPersianNum(progressPercent)}٪
              </span>
            </div>

            {/* 5 Segmented Pill Bars (Matches orange + translucent lavender pills) */}
            <div className="flex items-center gap-1.5 my-2.5" dir="ltr">
              <div className="h-2.5 flex-1 rounded-full bg-[#FF9F43] relative flex items-center justify-end pr-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="h-2.5 flex-1 rounded-full bg-[#9B92E8]/70" />
              <div className="h-2.5 flex-1 rounded-full bg-[#9B92E8]/45" />
              <div className="h-2.5 flex-1 rounded-full bg-[#9B92E8]/35" />
              <div className="h-2.5 flex-1 rounded-full bg-[#9B92E8]/25" />
            </div>

            {/* Bottom Frosted Badges */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9.5px] font-semibold">
                {toPersianNum(yearsLeft)} سال پیش رو
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9.5px] font-semibold">
                هفته {toPersianNum(1460)} زندگی
              </span>
            </div>
          </div>

          {/* Left Side: Cute Purple Bear on Clouds */}
          <div className="w-24 -ml-2 -mb-3 shrink-0">
            <PurpleCloudBearSVG />
          </div>
        </div>

        {/* Section: خاطرات امروز من (Matches "Today's Habits" header + list) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2.5">
            <h3 className="text-sm font-extrabold text-[#1E272E]">
              خاطرات امروز من
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('calendar')}
                className="w-6 h-6 rounded-lg text-[#B2B0C4] hover:text-[#6C5CE7] flex items-center justify-center"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('editor')}
                title="ثبت خاطره جدید"
                className="w-6 h-6 rounded-full bg-[#2D3436] hover:bg-[#6C5CE7] text-white flex items-center justify-center shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List of Rounded White Memory Cards */}
          <div className="space-y-2.5 pb-2">
            {memories.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleMemory(item.id)}
                className="cursor-pointer bg-white rounded-[22px] p-3 shadow-[0_6px_20px_rgba(108,92,231,0.06)] border border-[#F4F2FA] flex items-center justify-between hover:border-[#DCD6F7] transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: item.iconBg }}
                  >
                    {item.emoji}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#1E272E]">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-[#9A98A9] font-medium mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Green Checkmark Circle (Exact match to reference) */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    item.completed
                      ? 'bg-[#10AC84] text-white shadow-[0_3px_10px_rgba(16,172,132,0.35)]'
                      : 'border-2 border-[#E2E0EC] text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNavBar activeScreen="dashboard" onSelectScreen={onNavigate} />
    </div>
  );
};

// ------------------------------------------
// SCREEN 3: LIFE CALENDAR (تقویم زندگی)
// Zoom between: 1. کل عمر | 2. سال‌ها | 3. ماهانه | 4. روزانه
// ------------------------------------------
const LifeCalendarScreen = ({
  lifespan,
  currentAge = 28,
  onNavigate,
  onSelectDayForEdit,
  memories
}) => {
  const [zoomLevel, setZoomLevel] = useState('lifetime'); // 'lifetime' | 'year' | 'month' | 'day'
  const [selectedYear, setSelectedYear] = useState(29); // Year 29 = 1405
  const [selectedMonth, setSelectedMonth] = useState(8); // Aban = 8
  const [selectedDay, setSelectedDay] = useState(25);

  const currentMonthObj = JALALI_MONTHS.find((m) => m.id === selectedMonth) || JALALI_MONTHS[7];

  // Sample daily mood map for Aban 1405
  const dayMemoriesMap = useMemo(() => {
    const map = {
      1: { emoji: '🍂', title: 'شروع آبان', color: '#FFEAA7' },
      3: { emoji: '📚', title: 'کتاب جدید', color: '#E8FBF6' },
      6: { emoji: '🎂', title: 'تولد سارا', color: '#FFEBF0' },
      9: { emoji: '🌧️', title: 'اولین باران', color: '#EDF6FF' },
      12: { emoji: '🎬', title: 'سینما', color: '#F3F1FC' },
      15: { emoji: '🏔️', title: 'کوهنوردی', color: '#E8FBF6' },
      18: { emoji: '🌌', title: 'کویر مرنجاب', color: '#EAE6FA' },
      21: { emoji: '🎨', title: 'گالری نقاشی', color: '#FFF4E6' },
      23: { emoji: '☕', title: 'کافه کتاب', color: '#FFF0F0' },
      24: { emoji: '🌿', title: 'پیاده‌روی', color: '#E8FBF6' },
      25: { emoji: '✨', title: 'امروز', color: '#6C5CE7', isToday: true },
    };
    return map;
  }, []);

  return (
    <div
      dir="rtl"
      className="h-full flex flex-col justify-between relative overflow-y-auto no-scrollbar select-none bg-[#FAF9FE]"
    >
      {/* Lavender Header */}
      <div
        className="pb-4 rounded-b-[32px]"
        style={{
          background: 'linear-gradient(180deg, #6E62D5 0%, #988EEB 55%, #EDEAFD 90%, #FAF9FE 100%)'
        }}
      >
        <StatusBar light={true} />

        <div className="px-5 pt-2 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white">تقویم زندگی من</h2>
            <p className="text-[11px] text-white/85 font-medium">
              هر خانه، یک فصل از داستان {toPersianNum(lifespan)} ساله توست
            </p>
          </div>
          <button
            onClick={() => onNavigate('editor')}
            className="bg-white/25 backdrop-blur-md border border-white/40 text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 hover:bg-white/35 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت امروز</span>
          </button>
        </div>

        {/* 4-Level Pill Zoom Switcher */}
        <div className="px-4 mt-3.5">
          <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-[0_8px_20px_rgba(108,92,231,0.12)] border border-white grid grid-cols-4 gap-1">
            {[
              { id: 'lifetime', label: 'کل عمر' },
              { id: 'year', label: 'سال‌ها' },
              { id: 'month', label: 'ماهانه' },
              { id: 'day', label: 'روزانه' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setZoomLevel(tab.id)}
                className={`py-1.5 rounded-xl text-[11px] font-extrabold transition-all ${
                  zoomLevel === tab.id
                    ? 'bg-[#6C5CE7] text-white shadow-[0_4px_12px_rgba(108,92,231,0.3)]'
                    : 'text-[#7C7A8E] hover:bg-[#F3F1FC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Calendar Body */}
      <div className="px-4 py-2 flex-1 space-y-3 overflow-y-auto no-scrollbar">
        {/* VIEW 1: ENTIRE LIFETIME (کل عمر) */}
        {zoomLevel === 'lifetime' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Summary Legend Card */}
            <div className="bg-white rounded-[24px] p-3.5 shadow-[0_8px_24px_rgba(108,92,231,0.07)] border border-[#F2F0FA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#636E72]">
                  <span className="w-3 h-3 rounded-md bg-[#DCD6F7] inline-block" />
                  <span>سپری‌شده ({toPersianNum(currentAge)})</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#6C5CE7]">
                  <span className="w-3 h-3 rounded-md bg-[#6C5CE7] inline-block" />
                  <span>امسال ({toPersianNum(29)})</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#A4A2B5]">
                  <span className="w-3 h-3 rounded-md bg-[#F3F2F8] border border-[#E4E2F0] inline-block" />
                  <span>آینده ({toPersianNum(lifespan - 29)})</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#00B894] bg-[#E8FBF6] px-2 py-0.5 rounded-full">
                افق {toPersianNum(lifespan)} سال
              </span>
            </div>

            {/* Grid of All Years (Rounded Pastel Mini-Cards) */}
            <div className="bg-white rounded-[28px] p-3.5 shadow-[0_10px_28px_rgba(108,92,231,0.08)] border border-[#F2F0FA]">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className="text-xs font-extrabold text-[#1E272E]">
                  نقشه سال‌های زندگی (برای بزرگ‌نمایی روی سال کلیک کن)
                </span>
              </div>

              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: lifespan }, (_, idx) => {
                  const yearNum = idx + 1;
                  const isPast = yearNum <= currentAge;
                  const isCurrent = yearNum === currentAge + 1;

                  return (
                    <button
                      key={yearNum}
                      onClick={() => {
                        setSelectedYear(yearNum);
                        setZoomLevel('year');
                      }}
                      className={`h-7 rounded-xl text-[10px] font-extrabold flex flex-col items-center justify-center transition-all relative ${
                        isCurrent
                          ? 'bg-[#6C5CE7] text-white shadow-[0_4px_12px_rgba(108,92,231,0.45)] ring-2 ring-[#FF7675] scale-110 z-10'
                          : isPast
                          ? 'bg-[#EAE6FA] text-[#574B90] hover:bg-[#DCD5F8]'
                          : 'bg-[#F7F6FC] text-[#B8B6C8] border border-[#EFEOT8] hover:border-[#DCD6F7]'
                      }`}
                    >
                      <span>{toPersianNum(yearNum)}</span>
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF7675] absolute -top-0.5 -left-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: INDIVIDUAL YEAR -> 12 MONTHS (سال‌ها) */}
        {zoomLevel === 'year' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="bg-white rounded-[22px] p-3 shadow-[0_6px_18px_rgba(108,92,231,0.07)] border border-[#F2F0FA] flex items-center justify-between">
              <button
                onClick={() => setSelectedYear((y) => Math.max(1, y - 1))}
                className="w-7 h-7 rounded-full bg-[#F3F1FC] text-[#6C5CE7] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="text-center">
                <h3 className="text-xs font-extrabold text-[#1E272E]">
                  سال {toPersianNum(selectedYear)} زندگی • سال {toPersianNum(1376 + selectedYear)} خورشیدی
                </h3>
                <p className="text-[10px] text-[#8E8C9E]">
                  {toPersianNum(225)} خاطره ثبت‌شده در ۱۲ ماه
                </p>
              </div>
              <button
                onClick={() => setSelectedYear((y) => Math.min(lifespan, y + 1))}
                className="w-7 h-7 rounded-full bg-[#F3F1FC] text-[#6C5CE7] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {JALALI_MONTHS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMonth(m.id);
                    setZoomLevel('month');
                  }}
                  className={`bg-white rounded-[22px] p-3 text-right shadow-[0_8px_20px_rgba(108,92,231,0.06)] border transition hover:-translate-y-0.5 ${
                    m.current ? 'border-[#6C5CE7] ring-2 ring-[#6C5CE7]/20' : 'border-[#F2F0FA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
                      style={{ backgroundColor: m.bg }}
                    >
                      {m.emoji}
                    </span>
                    <span className="text-[9px] font-bold text-[#9A98A9]">
                      {toPersianNum(m.count)}/{toPersianNum(m.days)}
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-[#1E272E] mt-2">
                    {m.name}
                  </h4>
                  <div className="w-full h-1.5 bg-[#F3F1FC] rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((m.count / m.days) * 100)}%`,
                        backgroundColor: m.color
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: INDIVIDUAL MONTH -> DAYS GRID (ماهانه) */}
        {zoomLevel === 'month' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Month Selector Bar */}
            <div className="bg-white rounded-[22px] p-3 shadow-[0_6px_18px_rgba(108,92,231,0.07)] border border-[#F2F0FA] flex items-center justify-between">
              <button
                onClick={() => setSelectedMonth((m) => (m > 1 ? m - 1 : 12))}
                className="w-7 h-7 rounded-full bg-[#F3F1FC] text-[#6C5CE7] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="text-center">
                <h3 className="text-xs font-extrabold text-[#1E272E]">
                  {currentMonthObj.emoji} {currentMonthObj.name} ۱۴۰۵ (سال {toPersianNum(selectedYear)} زندگی)
                </h3>
                <p className="text-[10px] text-[#8E8C9E]">
                  روی هر روز کلیک کن تا خاطره و تصویر آن را ببینی
                </p>
              </div>
              <button
                onClick={() => setSelectedMonth((m) => (m < 12 ? m + 1 : 1))}
                className="w-7 h-7 rounded-full bg-[#F3F1FC] text-[#6C5CE7] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Monthly Calendar Grid (Starts with Saturday 'ش') */}
            <div className="bg-white rounded-[26px] p-3.5 shadow-[0_10px_28px_rgba(108,92,231,0.08)] border border-[#F2F0FA]">
              <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
                {WEEK_DAYS_SHORT.map((d, i) => (
                  <span key={i} className="text-[10px] font-extrabold text-[#8E8C9E]">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {/* 1 Empty Offset cell for Aban starting on Sunday */}
                <div className="h-11" />
                {Array.from({ length: currentMonthObj.days }, (_, idx) => {
                  const dayNum = idx + 1;
                  const info = dayMemoriesMap[dayNum];
                  const isToday = dayNum === 25;

                  return (
                    <button
                      key={dayNum}
                      onClick={() => {
                        setSelectedDay(dayNum);
                        setZoomLevel('day');
                      }}
                      style={{
                        backgroundColor: isToday
                          ? '#6C5CE7'
                          : info
                          ? info.color
                          : '#F9F8FD'
                      }}
                      className={`h-11 rounded-2xl p-1 flex flex-col items-center justify-between transition hover:scale-105 ${
                        isToday
                          ? 'text-white shadow-[0_6px_14px_rgba(108,92,231,0.35)]'
                          : 'text-[#2D3436] border border-[#F1EFFA]'
                      }`}
                    >
                      <span className="text-[9px] font-extrabold">
                        {toPersianNum(dayNum)}
                      </span>
                      <span className="text-xs leading-none">
                        {info ? info.emoji : '·'}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isToday
                            ? 'bg-[#FFEAA7]'
                            : info
                            ? 'bg-[#00B894]'
                            : 'bg-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: SINGLE DAY DETAIL (روزانه) */}
        {zoomLevel === 'day' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="bg-white rounded-[28px] p-4 shadow-[0_10px_28px_rgba(108,92,231,0.09)] border border-[#F2F0FA]">
              <div className="flex items-center justify-between">
                <span className="bg-[#F3F1FC] text-[#6C5CE7] px-3 py-1 rounded-full text-[11px] font-extrabold">
                  {toPersianNum(selectedDay)} {currentMonthObj.name} ۱۴۰۵
                </span>
                <span className="text-2xl">
                  {dayMemoriesMap[selectedDay]?.emoji || '🌿'}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-[#1E272E] mt-3">
                {dayMemoriesMap[selectedDay]?.title || 'قدم زدن در باغ ارم شیراز'}
              </h3>
              <p className="text-xs text-[#636E72] leading-relaxed mt-1.5">
                {memories[0]?.note}
              </p>

              {/* Soft Pastel Photo Illustration Preview */}
              <div className="mt-3 rounded-2xl overflow-hidden bg-gradient-to-br from-[#DFDCF9] via-[#EAE6FA] to-[#FFF0F3] p-3 flex items-center justify-between border border-[#EAE6FA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg shadow-sm">
                    📸
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-[#2D3436] block">
                      تصویر ثبت‌شده روز
                    </span>
                    <span className="text-[10px] text-[#6C5CE7] font-bold">
                      شیراز • باغ ارم • ساعت ۱۷:۲۰
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-full text-[#00B894]">
                  محفوظ
                </span>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between">
                <button
                  onClick={() => setZoomLevel('month')}
                  className="text-xs font-bold text-[#8E8C9E] hover:text-[#1E272E]"
                >
                  بازگشت به ماه
                </button>
                <button
                  onClick={() => {
                    if (onSelectDayForEdit) onSelectDayForEdit(selectedDay);
                    onNavigate('editor');
                  }}
                  className="bg-[#6C5CE7] text-white px-4 py-2 rounded-full text-xs font-bold shadow-[0_6px_16px_rgba(108,92,231,0.3)]"
                >
                  ویرایش یا افزودن خاطره
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNavBar activeScreen="calendar" onSelectScreen={onNavigate} />
    </div>
  );
};

// ------------------------------------------
// SCREEN 4: MEMORY TRACKER (رد پای خاطرات من)
// Strictly Replicates Rightmost Phone in Reference Image
// ------------------------------------------
const MemoryTrackerScreen = ({ onNavigate }) => {
  const weekStreakDays = [
    { day: 'ش', done: true, num: 22 },
    { day: 'ی', done: true, num: 23 },
    { day: 'د', done: true, num: 24 },
    { day: 'س', done: true, num: 25, active: true },
    { day: 'چ', done: false, num: 26 },
    { day: 'پ', done: false, num: 27 },
    { day: 'ج', done: false, num: 28 },
  ];

  const barChartHeights = [55, 32, 36, 48, 35, 72, 68];

  return (
    <div
      dir="rtl"
      className="h-full flex flex-col justify-between relative overflow-y-auto no-scrollbar select-none bg-[#FAF9FE]"
    >
      {/* Top Lavender Gradient Header */}
      <div
        className="pb-16 rounded-b-[36px]"
        style={{
          background: 'linear-gradient(180deg, #6E62D5 0%, #988EEB 60%, #EAE6FA 100%)'
        }}
      >
        <StatusBar light={true} />

        <div className="px-5 pt-2 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            رد پای خاطرات من
          </h2>

          <div className="flex items-center gap-2 bg-white/25 backdrop-blur-md border border-white/35 rounded-full px-3 py-1.5 text-white">
            <SlidersHorizontal className="w-3.5 h-3.5 cursor-pointer" />
            <Share2 className="w-3.5 h-3.5 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Floating Content Cards */}
      <div className="px-4 -mt-12 space-y-3 flex-1 pb-2">
        {/* Large White Rounded Streak Card (Matches "4 Days Streak" with Flame Bear) */}
        <div className="bg-white rounded-[30px] p-4 shadow-[0_12px_32px_rgba(108,92,231,0.09)] border border-[#F2F0FA] text-center relative overflow-hidden">
          <div className="-mt-2">
            <FlameStreakBearSVG />
          </div>

          <h3 className="text-base font-extrabold text-[#1E272E] mt-1">
            ۱۲ روز پیوسته
          </h3>
          <p className="text-[11px] text-[#9A98A9] font-medium mt-0.5">
            ثبت مستمر لحظه‌های ناب
          </p>

          {/* Weekly Connected Pink Streak Row (Matches Sun..Sat pink pill checkmarks) */}
          <div className="mt-3.5">
            <div className="grid grid-cols-7 text-center mb-1.5">
              {weekStreakDays.map((item, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-bold ${
                    item.active ? 'text-[#FF6B81] font-extrabold' : 'text-[#A4A2B5]'
                  }`}
                >
                  {item.day}
                </span>
              ))}
            </div>

            <div className="relative flex items-center justify-between px-1 py-1.5 bg-[#FFF5F7] rounded-full">
              {/* Pink Horizontal Connecting Bar */}
              <div className="absolute right-2 left-[44%] h-7 bg-gradient-to-l from-[#FFCCD5] to-[#FF8FA3]/40 rounded-full z-0" />

              {weekStreakDays.map((item, idx) => (
                <div key={idx} className="relative z-10 flex items-center justify-center w-7 h-7">
                  {item.done ? (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        item.active
                          ? 'bg-white text-[#FF6B81] ring-4 ring-[#FF7675]/40 shadow-[0_0_12px_rgba(255,107,129,0.6)]'
                          : 'bg-[#E88D96] text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#B2B0C4]">
                      {toPersianNum(item.num)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] font-bold text-[#8E8C9E] mt-3">
            {toPersianNum(4)} از {toPersianNum(6)} دسته‌بندی خاطره امروز تکمیل شده است
          </p>
        </div>

        {/* Two Side-by-Side Analytics Cards (Matches "Sleep time" & "Workout time") */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card Right: زمان ثبت خاطره (Orange Vertical Pill Bars) */}
          <div className="bg-white rounded-[26px] p-3.5 shadow-[0_8px_24px_rgba(108,92,231,0.06)] border border-[#F2F0FA]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#1E272E]">
                زمان ثبت خاطره
              </span>
              <ChevronLeft className="w-3.5 h-3.5 text-[#B2B0C4]" />
            </div>

            <div className="flex items-end justify-between gap-1.5 h-16 pt-2 px-0.5">
              {barChartHeights.map((h, i) => (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                  <div className="w-full h-full bg-[#F4F3FA] rounded-full flex items-end overflow-hidden">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-[#F39C12] to-[#FDCB6E]"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-[#A4A2B5] mt-1">
                    {WEEK_DAYS_SHORT[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Left: حس و حال هفته (Circular Green Ring Progress) */}
          <div className="bg-white rounded-[26px] p-3.5 shadow-[0_8px_24px_rgba(108,92,231,0.06)] border border-[#F2F0FA] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="#E8FBF6"
                    strokeWidth="4.5"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="none"
                    stroke="#10AC84"
                    strokeWidth="4.5"
                    strokeDasharray="113"
                    strokeDashoffset="22"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm">🌿</span>
              </div>
              <Layers className="w-3.5 h-3.5 text-[#D2D0E0]" />
            </div>

            <div className="mt-2">
              <h4 className="text-xs font-extrabold text-[#1E272E]">
                حس خوب هفته
              </h4>
              <p className="text-[10px] text-[#9A98A9] font-medium mt-0.5">
                {toPersianNum(85)}٪ لحظه‌های آرام
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Segmented Category Progress Cards (Matches "Drink Water 3/8") */}
        <div className="bg-white rounded-[24px] p-3 shadow-[0_8px_22px_rgba(108,92,231,0.06)] border border-[#F2F0FA] flex items-center justify-between gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#EBF7FF] flex items-center justify-center text-base shrink-0">
            💧
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-[#1E272E]">
                لحظه‌های قدردانی
              </span>
              <span className="text-[9.5px] font-bold text-[#9A98A9]">عالی</span>
            </div>
            <div className="flex items-center gap-1" dir="ltr">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((seg) => (
                <div
                  key={seg}
                  className={`h-2 flex-1 rounded-full ${
                    seg <= 5 ? 'bg-[#00A8FF]' : 'bg-[#EEF0F8]'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="bg-[#FFF0E0] text-[#E67E22] px-2.5 py-1.5 rounded-xl text-xs font-extrabold">
            {toPersianNum(5)}/{toPersianNum(8)}
          </div>
        </div>
      </div>

      <BottomNavBar activeScreen="tracker" onSelectScreen={onNavigate} />
    </div>
  );
};

// ------------------------------------------
// SCREEN 5: DAILY MEMORY EDITOR (ویرایشگر خاطره روزانه)
// ------------------------------------------
const DailyMemoryEditorScreen = ({ onSaveMemory, onNavigate, selectedDay = 25 }) => {
  const [title, setTitle] = useState('تماشای غروب پاییزی و نوشیدن چای دارچین');
  const [note, setNote] = useState(
    'امروز عصر چند دقیقه کنار پنجره ایستادم و تغییر رنگ برگ‌های درختان حیاط را تماشا کردم. گاهی ساده‌ترین لحظه‌ها، ماندگارترین خاطرات عمر می‌شوند.'
  );
  const [selectedEmoji, setSelectedEmoji] = useState('🍂');
  const [selectedCategory, setSelectedCategory] = useState('خلوت من');
  const [hasPhoto, setHasPhoto] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const emojis = [
    { icon: '🍂', label: 'پاییزی' },
    { icon: '😊', label: 'شاد' },
    { icon: '🌿', label: 'آرام' },
    { icon: '😍', label: 'عاشقانه' },
    { icon: '☕', label: 'دلنشین' },
    { icon: '📸', label: 'ماندگار' },
  ];

  const categories = ['خلوت من', 'خانواده', 'سفر و طبیعت', 'دوستان', 'کار و هنر'];

  const handleSave = () => {
    if (!title.trim()) return;
    onSaveMemory({
      id: Date.now(),
      title,
      subtitle: `${selectedCategory} • ثبت‌شده در تقویم`,
      date: `${toPersianNum(selectedDay)} آبان ۱۴۰۵`,
      day: selectedDay,
      month: 8,
      year: 1405,
      emoji: selectedEmoji,
      category: selectedCategory,
      completed: true,
      iconBg: '#F3F1FC',
      iconColor: '#6C5CE7',
      note,
      hasPhoto
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onNavigate('dashboard');
    }, 900);
  };

  return (
    <div
      dir="rtl"
      className="h-full flex flex-col justify-between relative overflow-y-auto no-scrollbar select-none bg-[#FAF9FE]"
    >
      {/* Soft Lavender Header */}
      <div
        className="pb-8 rounded-b-[34px]"
        style={{
          background: 'linear-gradient(180deg, #6E62D5 0%, #988EEB 65%, #EAE6FA 100%)'
        }}
      >
        <StatusBar light={true} />
        <div className="px-5 pt-2 flex items-center justify-between text-white">
          <div>
            <h2 className="text-base font-extrabold">ثبت خاطره روزانه</h2>
            <p className="text-[10.5px] text-white/85 mt-0.5">
              جمعه، {toPersianNum(selectedDay)} آبان ۱۴۰۵ • سال ۲۹ زندگی
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rounded White Editing Card */}
      <div className="px-4 -mt-5 flex-1 pb-3">
        <div className="bg-white rounded-[28px] p-4 shadow-[0_12px_32px_rgba(108,92,231,0.1)] border border-[#F2F0FA] space-y-3.5">
          {/* Emoji / Mood Picker */}
          <div>
            <label className="text-[11px] font-extrabold text-[#636E72] block mb-1.5">
              حس و حال و نماد امروز
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {emojis.map((item) => (
                <button
                  key={item.icon}
                  type="button"
                  onClick={() => setSelectedEmoji(item.icon)}
                  className={`py-2 rounded-2xl flex flex-col items-center justify-center transition ${
                    selectedEmoji === item.icon
                      ? 'bg-[#EAE6FA] ring-2 ring-[#6C5CE7] scale-105'
                      : 'bg-[#F8F7FC] hover:bg-[#F1EFFA]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[8.5px] font-bold text-[#636E72] mt-0.5">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Memory Title Input */}
          <div>
            <label className="text-[11px] font-extrabold text-[#636E72] block mb-1">
              عنوان خاطره
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F8F7FC] border border-[#EAE6FA] rounded-2xl px-3.5 py-2.5 text-xs font-extrabold text-[#1E272E] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              placeholder="عنوان کوتاه خاطره امروز..."
            />
          </div>

          {/* Category Pills */}
          <div>
            <label className="text-[11px] font-extrabold text-[#636E72] block mb-1">
              دسته‌بندی خاطره
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold shrink-0 transition ${
                    selectedCategory === cat
                      ? 'bg-[#6C5CE7] text-white shadow-sm'
                      : 'bg-[#F3F1FC] text-[#636E72]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-line Note Editor */}
          <div>
            <label className="text-[11px] font-extrabold text-[#636E72] block mb-1">
              داستان و یادداشت روز
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#F8F7FC] border border-[#EAE6FA] rounded-2xl p-3 text-xs text-[#2D3436] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] resize-none"
              placeholder="جزئیات این لحظه را بنویس..."
            />
          </div>

          {/* Photo Attachment Toggle */}
          <div
            onClick={() => setHasPhoto(!hasPhoto)}
            className={`cursor-pointer rounded-2xl p-2.5 border transition flex items-center justify-between ${
              hasPhoto
                ? 'bg-[#F3F1FC] border-[#C8BFF7]'
                : 'bg-[#FAF9FE] border-[#EAE6FA]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#6C5CE7] shadow-sm">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-[#1E272E] block">
                  {hasPhoto ? 'عکس خاطره پیوست شد' : 'افزودن تصویر به این روز'}
                </span>
                <span className="text-[10px] text-[#8E8C9E]">
                  {hasPhoto ? 'غروب_آبان_۱۴۰۵.jpg' : 'حداکثر یک عکس منتخب برای هر روز'}
                </span>
              </div>
            </div>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                hasPhoto ? 'bg-[#00B894] text-white' : 'border border-[#CBC8D8]'
              }`}
            >
              {hasPhoto && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {/* Save Pill Button */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#8C7AE6] hover:opacity-95 text-white text-xs font-extrabold shadow-[0_8px_20px_rgba(108,92,231,0.35)] flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {savedToast ? 'با موفقیت در تقویم زندگی ثبت شد!' : 'ذخیره در تقویم زندگی'}
            </span>
          </button>
        </div>
      </div>

      <BottomNavBar activeScreen="tracker" onSelectScreen={onNavigate} />
    </div>
  );
};

// ------------------------------------------
// SCREEN 6: PERSONAL NOTEBOOK (دفترچه شخصی)
// ------------------------------------------
const PersonalNotebookScreen = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('همه');

  const categories = ['همه', 'سفرنامه', 'دل‌نوشته‌ها', 'ایده‌ها', 'خاطرات ویژه'];

  const filteredEntries = INITIAL_NOTEBOOK_ENTRIES.filter((entry) => {
    const matchesCat = activeCategory === 'همه' || entry.category === activeCategory;
    const matchesSearch =
      entry.title.includes(searchQuery) || entry.excerpt.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  return (
    <div
      dir="rtl"
      className="h-full flex flex-col justify-between relative overflow-y-auto no-scrollbar select-none bg-[#FAF9FE]"
    >
      {/* Lavender Gradient Header */}
      <div
        className="pb-5 rounded-b-[32px]"
        style={{
          background: 'linear-gradient(180deg, #6E62D5 0%, #988EEB 60%, #EDEAFD 95%, #FAF9FE 100%)'
        }}
      >
        <StatusBar light={true} />

        <div className="px-5 pt-2 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-white">دفترچه شخصی من</h2>
            <p className="text-[11px] text-white/85">
              یادداشت‌های عمیق، نامه‌ها و سفرنامه‌های زندگی
            </p>
          </div>
          <button
            onClick={() => onNavigate('editor')}
            className="bg-[#1E272E] text-white px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>یادداشت جدید</span>
          </button>
        </div>

        {/* Frosted Search Pill */}
        <div className="px-4 mt-3">
          <div className="bg-white rounded-2xl px-3.5 py-2 shadow-[0_8px_20px_rgba(108,92,231,0.1)] border border-[#F2F0FA] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#9A98A9]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در میان یادداشت‌ها و تاریخ‌ها..."
              className="w-full text-xs text-[#2D3436] bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 space-y-3.5 flex-1 overflow-y-auto no-scrollbar">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10.5px] font-extrabold shrink-0 transition ${
                activeCategory === cat
                  ? 'bg-[#6C5CE7] text-white shadow-sm'
                  : 'bg-white text-[#7C7A8E] border border-[#F2F0FA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notebook Cover-Style Cards Carousel */}
        <div>
          <h3 className="text-xs font-extrabold text-[#1E272E] mb-2 px-1">
            جلد دفترچه‌های موضوعی
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { title: 'سفر و طبیعت', count: '۲۴ برگ', emoji: '🏕️', bg: '#E8FBF6', accent: '#00B894' },
              { title: 'دل‌نوشته‌ها', count: '۱۸ برگ', emoji: '💌', bg: '#FFF0F3', accent: '#FF7675' },
              { title: 'آلبوم ۱۴۰۵', count: '۴۲ برگ', emoji: '📸', bg: '#F3F1FC', accent: '#6C5CE7' },
            ].map((cov, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('editor')}
                className="cursor-pointer bg-white rounded-[22px] p-3 shadow-[0_8px_20px_rgba(108,92,231,0.07)] border border-[#F2F0FA] relative overflow-hidden hover:-translate-y-0.5 transition"
              >
                {/* Notebook Spine Line */}
                <div
                  className="absolute top-0 right-0 bottom-0 w-1.5"
                  style={{ backgroundColor: cov.accent }}
                />
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ backgroundColor: cov.bg }}
                >
                  {cov.emoji}
                </div>
                <h4 className="text-[11px] font-extrabold text-[#1E272E] mt-2">
                  {cov.title}
                </h4>
                <span className="text-[9.5px] text-[#9A98A9] font-bold">
                  {cov.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Detailed Notes */}
        <div className="space-y-2.5 pb-2">
          <h3 className="text-xs font-extrabold text-[#1E272E] px-1">
            یادداشت‌های پیشین
          </h3>
          {filteredEntries.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate('editor')}
              className="cursor-pointer bg-white rounded-[24px] p-3.5 shadow-[0_8px_22px_rgba(108,92,231,0.06)] border border-[#F2F0FA] hover:border-[#DCD6F7] transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-[#F3F1FC] flex items-center justify-center text-sm">
                    {item.emoji}
                  </span>
                  <h4 className="text-xs font-extrabold text-[#1E272E]">
                    {item.title}
                  </h4>
                </div>
                <span className="text-[9.5px] font-bold text-[#6C5CE7] bg-[#F3F1FC] px-2 py-0.5 rounded-full">
                  {item.date}
                </span>
              </div>
              <p className="text-[11px] text-[#7C7A8E] leading-relaxed mt-2 line-clamp-2">
                {item.excerpt}
              </p>
            </div>
          ))}
        </div>
      </div>

      <BottomNavBar activeScreen="notebook" onSelectScreen={onNavigate} />
    </div>
  );
};

// ------------------------------------------
// SCREEN 7: SETTINGS (تنظیمات)
// ------------------------------------------
const SettingsScreen = ({ lifespan, setLifespan, onNavigate }) => {
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('۲۱:۳۰');
  const [notifMessage, setNotifMessage] = useState(
    'امروز چه لحظه‌ای لبخند به لبت آورد؟ ثبتش کن ✨'
  );

  return (
    <div
      dir="rtl"
      className="h-full flex flex-col justify-between relative overflow-y-auto no-scrollbar select-none bg-[#FAF9FE]"
    >
      {/* Lavender Header */}
      <div
        className="pb-6 rounded-b-[32px]"
        style={{
          background: 'linear-gradient(180deg, #6E62D5 0%, #988EEB 65%, #EAE6FA 100%)'
        }}
      >
        <StatusBar light={true} />
        <div className="px-5 pt-2 flex items-center justify-between text-white">
          <div>
            <h2 className="text-lg font-extrabold">تنظیمات تقویم زندگی</h2>
            <p className="text-[11px] text-white/85">
              شخصی‌سازی افق عمر، یادآور هوشمند و تقویم جلالی
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/25 border border-white/40 flex items-center justify-center text-lg">
            🐻
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3 flex-1 pb-2 overflow-y-auto no-scrollbar">
        {/* Personal Info & Estimated Lifespan Card */}
        <div className="bg-white rounded-[26px] p-4 shadow-[0_10px_26px_rgba(108,92,231,0.08)] border border-[#F2F0FA] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-[#1E272E]">
                مجتبی ارجمند
              </h3>
              <p className="text-[10.5px] text-[#8E8C9E] mt-0.5">
                تاریخ تولد: ۱۵ مهر ۱۳۷۷ • تقویم خورشیدی
              </p>
            </div>
            <span className="bg-[#E8FBF6] text-[#00B894] px-2.5 py-1 rounded-full text-[10px] font-extrabold">
              نسخه طلایی
            </span>
          </div>

          <div className="pt-2 border-t border-[#F4F2FA]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-[#2D3436]">
                افق عمر تخمینی در تقویم
              </span>
              <span className="text-xs font-extrabold text-[#6C5CE7] bg-[#F3F1FC] px-2.5 py-0.5 rounded-full">
                {toPersianNum(lifespan)} سال
              </span>
            </div>
            <input
              type="range"
              min={65}
              max={100}
              value={lifespan}
              onChange={(e) => setLifespan(Number(e.target.value))}
              className="w-full accent-[#6C5CE7] cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-[#A4A2B5] font-bold">
              <span>{toPersianNum(65)} سال</span>
              <span>{toPersianNum(80)} سال</span>
              <span>{toPersianNum(85)} سال</span>
              <span>{toPersianNum(100)} سال</span>
            </div>
          </div>
        </div>

        {/* Daily Reminder Card */}
        <div className="bg-white rounded-[26px] p-4 shadow-[0_10px_26px_rgba(108,92,231,0.08)] border border-[#F2F0FA] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-[#1E272E]">
                یادآور روزانه ثبت خاطره
              </h4>
              <p className="text-[10px] text-[#9A98A9]">
                ارسال اعلان ملایم شبانه برای ثبت داستان روز
              </p>
            </div>
            <button
              onClick={() => setDailyReminder(!dailyReminder)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors flex items-center ${
                dailyReminder ? 'bg-[#10AC84] justify-start' : 'bg-[#DFE4EA] justify-end'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md block" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold text-[#636E72]">
              زمان یادآوری شبانه
            </span>
            <div className="flex items-center gap-1.5">
              {['۲۰:۰۰', '۲۱:۳۰', '۲۲:۳۰'].map((t) => (
                <button
                  key={t}
                  onClick={() => setReminderTime(t)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition ${
                    reminderTime === t
                      ? 'bg-[#6C5CE7] text-white'
                      : 'bg-[#F3F1FC] text-[#636E72]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-bold text-[#636E72] block mb-1">
              پیام شخصی یادآور
            </label>
            <input
              type="text"
              value={notifMessage}
              onChange={(e) => setNotifMessage(e.target.value)}
              className="w-full bg-[#F8F7FC] border border-[#EAE6FA] rounded-xl px-3 py-2 text-[11px] font-medium text-[#2D3436] focus:outline-none"
            />
          </div>
        </div>

        {/* Calendar Preferences Card */}
        <div className="bg-white rounded-[26px] p-3.5 shadow-[0_10px_26px_rgba(108,92,231,0.08)] border border-[#F2F0FA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#F3F1FC] flex items-center justify-center text-sm">
              📅
            </span>
            <div>
              <h4 className="text-xs font-extrabold text-[#1E272E]">
                تقویم جلالی • شروع هفته از شنبه
              </h4>
              <p className="text-[10px] text-[#9A98A9]">
                اعداد فارسی و مناسبت‌های خورشیدی فعال است
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-[#6C5CE7]">فعال</span>
        </div>
      </div>

      <BottomNavBar activeScreen="settings" onSelectScreen={onNavigate} />
    </div>
  );
};

// ==========================================
// 6. SMARTPHONE FRAME WRAPPER
// ==========================================
const PhoneFrame = ({ children, className = '', titleBadge = '' }) => (
  <div className={`relative flex flex-col items-center ${className}`}>
    {titleBadge && (
      <div className="mb-3 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-[#EAE6FA] text-[11px] font-extrabold text-[#574B90]">
        {titleBadge}
      </div>
    )}
    <div className="w-[336px] h-[695px] bg-white rounded-[46px] p-2.5 shadow-[0_25px_70px_-10px_rgba(95,82,195,0.18)] border border-white/90 relative overflow-hidden shrink-0">
      <div className="w-full h-full rounded-[38px] overflow-hidden bg-white relative border border-[#F2F0FA]">
        {children}
      </div>
    </div>
  </div>
);

// ==========================================
// 7. MAIN APPLICATION CONTAINER
// Includes Showcase Mode (Exact 3-Phone Reference Layout) + All 7 Screens Interactive Mode
// ==========================================
export default function App() {
  const [viewMode, setViewMode] = useState('showcase'); // 'showcase' | 'single'
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [lifespan, setLifespan] = useState(85);
  const [memories, setMemories] = useState(INITIAL_MEMORIES);
  const [selectedDayForEdit, setSelectedDayForEdit] = useState(25);

  const handleToggleMemory = (id) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleSaveMemory = (newMem) => {
    setMemories((prev) => [newMem, ...prev]);
  };

  const navigateAndFocus = (screenId) => {
    setActiveScreen(screenId);
    if (viewMode === 'showcase' && !['welcome', 'dashboard', 'tracker'].includes(screenId)) {
      setViewMode('single');
    }
  };

  const allScreensList = [
    { id: 'welcome', label: '۱. خوش‌آمدگویی' },
    { id: 'dashboard', label: '۲. داشبورد اصلی' },
    { id: 'calendar', label: '۳. تقویم زندگی (۸۵ سال)' },
    { id: 'tracker', label: '۴. رد پای خاطرات' },
    { id: 'editor', label: '۵. ثبت خاطره روز' },
    { id: 'notebook', label: '۶. دفترچه شخصی' },
    { id: 'settings', label: '۷. تنظیمات' },
  ];

  const renderScreenById = (screenId) => {
    switch (screenId) {
      case 'welcome':
        return <WelcomeScreen onNavigate={navigateAndFocus} lifespan={lifespan} />;
      case 'dashboard':
        return (
          <DashboardScreen
            memories={memories}
            onToggleMemory={handleToggleMemory}
            onNavigate={navigateAndFocus}
            lifespan={lifespan}
          />
        );
      case 'calendar':
        return (
          <LifeCalendarScreen
            lifespan={lifespan}
            onNavigate={navigateAndFocus}
            onSelectDayForEdit={setSelectedDayForEdit}
            memories={memories}
          />
        );
      case 'tracker':
        return <MemoryTrackerScreen onNavigate={navigateAndFocus} />;
      case 'editor':
        return (
          <DailyMemoryEditorScreen
            onSaveMemory={handleSaveMemory}
            onNavigate={navigateAndFocus}
            selectedDay={selectedDayForEdit}
          />
        );
      case 'notebook':
        return <PersonalNotebookScreen onNavigate={navigateAndFocus} />;
      case 'settings':
        return (
          <SettingsScreen
            lifespan={lifespan}
            setLifespan={setLifespan}
            onNavigate={navigateAndFocus}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full relative overflow-x-hidden pb-16 select-none"
      style={{
        fontFamily: "'Vazirmatn', system-ui, -apple-system, sans-serif",
        background:
          'radial-gradient(circle at 15% 80%, rgba(235, 228, 255, 0.85) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(255, 224, 210, 0.75) 0%, transparent 50%), linear-gradient(135deg, #F7F6FD 0%, #FDFCFE 50%, #FBF4F2 100%)'
      }}
    >
      {/* Load Persian Geometric Font Vazirmatn */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
      `}</style>

      {/* Decorative 3D-Style Soft Fluffy Clouds & Cute Bottom Paws/Heart (Replicating Reference Canvas) */}
      <div className="pointer-events-none fixed top-10 left-6 z-0 hidden xl:block opacity-90">
        <svg viewBox="0 0 180 120" className="w-40 h-28 drop-shadow-md">
          <circle cx="95" cy="55" r="38" fill="#F2F5FA" />
          <circle cx="55" cy="70" r="28" fill="#E8EDF5" />
          <circle cx="130" cy="72" r="26" fill="#FFFFFF" />
          <ellipse cx="92" cy="82" rx="55" ry="22" fill="#E4E9F2" />
        </svg>
      </div>

      {/* Cute Pink Heart & Bear Paws at Bottom Center-Left (Exact Match to Reference Presentation) */}
      <div className="pointer-events-none fixed -bottom-3 left-1/3 z-20 hidden lg:flex items-end gap-3">
        <svg viewBox="0 0 180 110" className="w-44 h-28 overflow-visible">
          {/* Pink Floating Heart */}
          <path
            d="M45 25 C35 10 12 18 15 38 C18 55 45 70 45 70 C45 70 72 55 75 38 C78 18 55 10 45 25 Z"
            fill="#FF7675"
          />
          <path
            d="M45 32 C39 22 24 27 26 40 C28 50 45 60 45 60 C45 60 62 50 64 40 C66 27 51 22 45 32 Z"
            fill="#FF9AA2"
          />
          {/* Orange Bear Paw */}
          <path d="M68 115 C65 78 78 68 92 68 C106 68 118 78 115 115 Z" fill="#F39256" />
          <ellipse cx="78" cy="74" rx="3.5" ry="6" fill="#3D2314" />
          <ellipse cx="92" cy="70" rx="3.5" ry="6" fill="#3D2314" />
          <ellipse cx="105" cy="74" rx="3.5" ry="6" fill="#3D2314" />
          {/* Purple Bear Paw */}
          <path d="M118 115 C115 72 132 60 150 60 C168 60 182 72 180 115 Z" fill="#8C7AE6" />
          <circle cx="122" cy="70" r="8" fill="#7158E2" />
          <circle cx="148" cy="58" r="9" fill="#7158E2" />
          <circle cx="174" cy="68" r="8" fill="#7158E2" />
          <ellipse cx="148" cy="95" rx="18" ry="15" fill="#D6C9FF" />
        </svg>
      </div>

      {/* Top Interactive Prototype Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/75 border-b border-[#EAE6FA] px-4 py-2.5 shadow-[0_4px_20px_rgba(108,92,231,0.05)]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* App Brand Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#A29BFE] text-white flex items-center justify-center shadow-[0_6px_16px_rgba(108,92,231,0.3)] text-lg">
              📅
            </div>
            <div>
              <h1 className="text-sm font-black text-[#1E272E] flex items-center gap-2">
                <span>اپلیکیشن «تقویم زندگی»</span>
                <span className="text-[10px] font-bold bg-[#F3F1FC] text-[#6C5CE7] px-2.5 py-0.5 rounded-full">
                  نسخه تعاملی وفادار به طرح مرجع
                </span>
              </h1>
              <p className="text-[11px] text-[#8E8C9E] font-medium">
                تقویم تصویری {toPersianNum(lifespan)} سال عمر و دفترچه خاطرات روزانه
              </p>
            </div>
          </div>

          {/* Screen Switcher Pills (All 7 Required Screens) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {allScreensList.map((scr) => (
              <button
                key={scr.id}
                onClick={() => {
                  setActiveScreen(scr.id);
                  setViewMode('single');
                }}
                className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition shrink-0 ${
                  viewMode === 'single' && activeScreen === scr.id
                    ? 'bg-[#6C5CE7] text-white shadow-[0_4px_12px_rgba(108,92,231,0.3)]'
                    : 'bg-[#F5F3FD] text-[#574B90] hover:bg-[#EAE6FA]'
                }`}
              >
                {scr.label}
              </button>
            ))}
          </div>

          {/* Showcase vs Single View Mode Toggle */}
          <div className="flex items-center bg-[#F3F1FC] p-1 rounded-full border border-[#E5E0FA]">
            <button
              onClick={() => setViewMode('showcase')}
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition ${
                viewMode === 'showcase'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-[#7C7A8E]'
              }`}
            >
              نمای ۳ گوشی (مشابه تصویر مرجع)
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition ${
                viewMode === 'single'
                  ? 'bg-white text-[#6C5CE7] shadow-sm'
                  : 'text-[#7C7A8E]'
              }`}
            >
              بررسی تکی ۷ صفحه
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          MODE A: 3-PHONE SHOWCASE (Exact Composition of Reference Image)
         ========================================== */}
      {viewMode === 'showcase' ? (
        <main className="max-w-6xl mx-auto px-4 pt-8 pb-10">
          {/* Staggered 3 Phones Layout matching Left, Middle (Elevated), and Right Phones */}
          <div
            dir="ltr"
            className="flex flex-col lg:flex-row items-center justify-center gap-7 lg:gap-8"
          >
            {/* LEFT PHONE: Welcome Screen */}
            <div className="lg:mt-14 transition-transform duration-500">
              <PhoneFrame titleBadge="۱. صفحه خوش‌آمدگویی (هر روزت یک داستان دارد)">
                <WelcomeScreen onNavigate={navigateAndFocus} lifespan={lifespan} />
              </PhoneFrame>
            </div>

            {/* MIDDLE PHONE (Elevated): Main Dashboard */}
            <div className="lg:-mt-4 transition-transform duration-500">
              <PhoneFrame titleBadge="۲. داشبورد اصلی (پیشرفت تقویم زندگی)">
                <DashboardScreen
                  memories={memories}
                  onToggleMemory={handleToggleMemory}
                  onNavigate={navigateAndFocus}
                  lifespan={lifespan}
                />
              </PhoneFrame>
            </div>

            {/* RIGHT PHONE: Memory Tracker */}
            <div className="lg:mt-12 transition-transform duration-500">
              <PhoneFrame titleBadge="۴. رد پای خاطرات من (۱۲ روز پیوسته)">
                <MemoryTrackerScreen onNavigate={navigateAndFocus} />
              </PhoneFrame>
            </div>
          </div>

          {/* Second Row in Showcase: The Remaining 4 Screens Side-by-Side so all 7 Screens are immediately visible */}
          <div className="mt-14 pt-8 border-t border-[#EAE6FA]/80">
            <div className="text-center mb-7">
              <span className="bg-[#EAE6FA] text-[#6C5CE7] px-3.5 py-1 rounded-full text-xs font-extrabold">
                سایر صفحات اصلی سامانه «تقویم زندگی» با همان زبان بصری
              </span>
              <h2 className="text-lg font-black text-[#1E272E] mt-2">
                تقویم عمر ۸۵ ساله • ثبت خاطره روزانه • دفترچه شخصی • تنظیمات
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-7">
              <PhoneFrame titleBadge="۳. تقویم زندگی (بزرگ‌نمایی کل عمر تا روز)">
                <LifeCalendarScreen
                  lifespan={lifespan}
                  onNavigate={navigateAndFocus}
                  onSelectDayForEdit={setSelectedDayForEdit}
                  memories={memories}
                />
              </PhoneFrame>

              <PhoneFrame titleBadge="۵. ویرایشگر خاطره روزانه">
                <DailyMemoryEditorScreen
                  onSaveMemory={handleSaveMemory}
                  onNavigate={navigateAndFocus}
                  selectedDay={selectedDayForEdit}
                />
              </PhoneFrame>

              <PhoneFrame titleBadge="۶. دفترچه شخصی">
                <PersonalNotebookScreen onNavigate={navigateAndFocus} />
              </PhoneFrame>

              <PhoneFrame titleBadge="۷. تنظیمات و افق عمر">
                <SettingsScreen
                  lifespan={lifespan}
                  setLifespan={setLifespan}
                  onNavigate={navigateAndFocus}
                />
              </PhoneFrame>
            </div>
          </div>
        </main>
      ) : (
        /* ==========================================
           MODE B: FOCUSED SINGLE PHONE INTERACTIVE VIEW
           ========================================== */
        <main className="max-w-4xl mx-auto px-4 pt-6 flex flex-col md:flex-row items-center justify-center gap-8">
          <PhoneFrame
            titleBadge={
              allScreensList.find((s) => s.id === activeScreen)?.label || ''
            }
          >
            {renderScreenById(activeScreen)}
          </PhoneFrame>

          {/* Quick Side Navigation Panel for Testing All 7 Screens */}
          <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-5 shadow-[0_15px_40px_rgba(108,92,231,0.1)] border border-[#EAE6FA] w-full max-w-xs space-y-3">
            <h3 className="text-sm font-black text-[#1E272E]">
              راهنمای صفحات «تقویم زندگی»
            </h3>
            <p className="text-xs text-[#7C7A8E] leading-relaxed">
              می‌توانید از منوی پایین داخل گوشی یا دکمه‌های زیر، میان هر ۷ صفحه جابه‌جا شوید و قابلیت بزرگ‌نمایی تقویم (کل عمر ← سال ← ماه ← روز) را امتحان کنید:
            </p>
            <div className="space-y-1.5">
              {allScreensList.map((scr) => (
                <button
                  key={scr.id}
                  onClick={() => setActiveScreen(scr.id)}
                  className={`w-full text-right px-3.5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-between transition ${
                    activeScreen === scr.id
                      ? 'bg-[#6C5CE7] text-white shadow-[0_6px_16px_rgba(108,92,231,0.3)]'
                      : 'bg-[#F8F7FC] text-[#2D3436] hover:bg-[#EAE6FA]'
                  }`}
                >
                  <span>{scr.label}</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}