import {
  Home, ShoppingCart, Activity, ShieldPlus, Shirt, Gift,
  Coffee, Plane, HeartPulse, GraduationCap, Users, Music, Utensils,
  Car, Lightbulb, Smartphone, Wallet, HelpCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'Home': Home,
  'ShoppingCart': ShoppingCart,
  'Activity': Activity,
  'ShieldPlus': ShieldPlus,
  'Shirt': Shirt,
  'Gift': Gift,
  'Coffee': Coffee,
  'Plane': Plane,
  'HeartPulse': HeartPulse,
  'GraduationCap': GraduationCap,
  'Users': Users,
  'Music': Music,
  'Utensils': Utensils,
  'Car': Car,
  'Lightbulb': Lightbulb,
  'Smartphone': Smartphone,
  'Wallet': Wallet,
  'HelpCircle': HelpCircle,
};

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
}

export function IconRenderer({ name, size = 20, className = '' }: IconRendererProps) {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent size={size} className={className} />;
}
