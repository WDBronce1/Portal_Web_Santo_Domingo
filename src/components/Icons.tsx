import React from 'react';

/* Iconos a medida — rejilla 24 · trazo 1.7 · currentColor · forma orgánica/eco.
   Portado del handoff "Herbario Patrimonial". */

export interface IconProps {
  size?: number;
  sw?: number;
  fill?: string;
  style?: React.CSSProperties;
  className?: string;
}

const S: React.FC<IconProps & { children: React.ReactNode }> = ({
  children, size = 24, sw = 1.7, fill = 'none', style, className,
}) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round"
    strokeLinejoin="round" style={style} className={className} aria-hidden
  >
    {children}
  </svg>
);

export const Home: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M4 11.2 12 4.5l8 6.7" /><path d="M6 9.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.8" /><path d="M10 20v-4.5a2 2 0 0 1 4 0V20" /></S>
);

export const Leaf: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M5 19c0-7 5-12 14-12 0 9-5 13-12 13a6 6 0 0 1-2-1Z" /><path d="M8.5 16.5C11 14 13.5 12.2 16 11" /></S>
);

export const Recycle: React.FC<IconProps> = (p) => (
  <S {...p}>
    <path d="M9 6.5 11 3l2 3.4" /><path d="M13 6.4l2.4 4.1" />
    <path d="M19.5 13.5 21 17l-3.9.2" /><path d="M17.2 17.1l-4.7.1" />
    <path d="M4.6 13.4 3 17l3.9.3" /><path d="M6.8 17.2l2.4-4" />
    <path d="M7.3 9 5 13" /><path d="M16.8 9 19 13" />
  </S>
);

export const Clock: React.FC<IconProps> = (p) => (
  <S {...p}><circle cx={12} cy={12} r={8.2} /><path d="M12 8v4.2l2.8 1.8" /></S>
);

export const Project: React.FC<IconProps> = (p) => (
  <S {...p}>
    <path d="M4 20h16" /><path d="M7 20v-5" /><path d="M12 20V9" /><path d="M17 20v-8" />
    <path d="M12 9c0-2.2 1.6-3.4 3.4-3.4C15.4 7.8 14 9 12 9Z" /><path d="M12 9c0-1.7-1.3-2.7-2.8-2.7C9.2 7.7 10.4 9 12 9Z" />
  </S>
);

export const Calendar: React.FC<IconProps> = (p) => (
  <S {...p}>
    <rect x={4} y={5.5} width={16} height={14.5} rx={2.5} />
    <line x1={4} y1={9.5} x2={20} y2={9.5} /><line x1={8} y1={3.5} x2={8} y2={6.5} /><line x1={16} y1={3.5} x2={16} y2={6.5} />
    <path d="M8.5 14.2l2 2 3.5-3.8" />
  </S>
);

export const Chat: React.FC<IconProps> = (p) => (
  <S {...p}>
    <path d="M5 17.5 4 21l3.6-1.1A8 8 0 1 0 5 17.5Z" />
    <line x1={9} y1={11} x2={15} y2={11} /><line x1={9} y1={14} x2={13} y2={14} />
  </S>
);

export const Tree: React.FC<IconProps> = (p) => (
  <S {...p}>
    <path d="M12 21v-5" /><path d="M12 16c-4 0-6.5-2.4-6.5-6 0-3.2 2.6-6.5 6.5-6.5S18.5 6.8 18.5 10c0 3.6-2.5 6-6.5 6Z" />
    <path d="M12 13.5 9.5 11" /><path d="M12 11l2.4-2.2" />
  </S>
);

export const Pin: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M12 21c4-4 6.5-7 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 14 8 17 12 21Z" /><circle cx={12} cy={10.5} r={2.4} /></S>
);

export const ArrowRight: React.FC<IconProps> = (p) => (
  <S {...p}><line x1={4} y1={12} x2={19} y2={12} /><path d="M13 6l6 6-6 6" /></S>
);

export const ArrowLeft: React.FC<IconProps> = (p) => (
  <S {...p}><line x1={20} y1={12} x2={5} y2={12} /><path d="M11 6l-6 6 6 6" /></S>
);

export const ChevronDown: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M6 9.5l6 6 6-6" /></S>
);

export const Shield: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M12 3.5 19 6v5c0 4.6-3 7.7-7 9.5-4-1.8-7-4.9-7-9.5V6Z" /><path d="M9 12l2.2 2.2L15.5 10" /></S>
);

export const User: React.FC<IconProps> = (p) => (
  <S {...p}><circle cx={12} cy={8.5} r={3.6} /><path d="M5.5 20c.6-3.4 3.2-5.2 6.5-5.2S17.9 16.6 18.5 20" /></S>
);

export const Logout: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><line x1={4} y1={12} x2={15} y2={12} /><path d="M11 8l4 4-4 4" /></S>
);

export const Mail: React.FC<IconProps> = (p) => (
  <S {...p}><rect x={3.5} y={5.5} width={17} height={13} rx={2.4} /><path d="M4.5 7.5 12 13l7.5-5.5" /></S>
);

export const Lock: React.FC<IconProps> = (p) => (
  <S {...p}><rect x={5} y={11} width={14} height={9} rx={2.4} /><path d="M8 11V8.5a4 4 0 0 1 8 0V11" /><line x1={12} y1={14.5} x2={12} y2={16.5} /></S>
);

export const IdCard: React.FC<IconProps> = (p) => (
  <S {...p}>
    <rect x={3.5} y={5.5} width={17} height={13} rx={2.4} /><circle cx={8.5} cy={11} r={2} />
    <path d="M6 15.2c.4-1.4 1.4-2 2.5-2s2.1.6 2.5 2" /><line x1={13.5} y1={10} x2={18} y2={10} /><line x1={13.5} y1={13} x2={17} y2={13} />
  </S>
);

export const Star: React.FC<IconProps> = (p) => (
  <S fill="currentColor" sw={0} {...p}><path d="M12 3.6l2.4 5 5.4.6-4 3.7 1.1 5.3L12 20.9l-4.9 2.3 1.1-5.3-4-3.7 5.4-.6Z" /></S>
);

export const StarOutline: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M12 4l2.3 4.7 5.2.7-3.8 3.6 1 5.1L12 19.4l-4.7 2.3 1-5.1L4.5 9.4l5.2-.7Z" /></S>
);

export const Plus: React.FC<IconProps> = (p) => (
  <S {...p}><circle cx={12} cy={12} r={8.3} /><line x1={12} y1={8.5} x2={12} y2={15.5} /><line x1={8.5} y1={12} x2={15.5} y2={12} /></S>
);

export const Trash: React.FC<IconProps> = (p) => (
  <S {...p}>
    <line x1={4.5} y1={7} x2={19.5} y2={7} /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M6.5 7l1 12a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9l1-12" /><line x1={10} y1={10.5} x2={10} y2={16.5} /><line x1={14} y1={10.5} x2={14} y2={16.5} />
  </S>
);

export const Users: React.FC<IconProps> = (p) => (
  <S {...p}>
    <circle cx={9} cy={9} r={3.2} /><path d="M3.5 19c.5-2.8 2.6-4.3 5.5-4.3s5 1.5 5.5 4.3" />
    <path d="M16 6.4a3 3 0 0 1 0 5.4" /><path d="M17.5 14.8c2 .6 3.2 1.9 3.5 4.2" />
  </S>
);

export const Chart: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M4 4v15a1 1 0 0 0 1 1h15" /><line x1={8} y1={16} x2={8} y2={12} /><line x1={12} y1={16} x2={12} y2={8} /><line x1={16} y1={16} x2={16} y2={11} /><line x1={20} y1={16} x2={20} y2={6} /></S>
);

export const Search: React.FC<IconProps> = (p) => (
  <S {...p}><circle cx={11} cy={11} r={6.2} /><line x1={15.6} y1={15.6} x2={20} y2={20} /></S>
);

export const Bin: React.FC<IconProps> = (p) => (
  <S {...p}>
    <path d="M6 8h12l-1 11a1.5 1.5 0 0 1-1.5 1.4h-7A1.5 1.5 0 0 1 7 19Z" />
    <path d="M9 8V5.6A1.6 1.6 0 0 1 10.6 4h2.8A1.6 1.6 0 0 1 15 5.6V8" /><line x1={4.5} y1={8} x2={19.5} y2={8} />
  </S>
);

export const Drop: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M12 3.5c3 4 5.5 6.6 5.5 9.6A5.5 5.5 0 0 1 6.5 13c0-3 2.5-5.6 5.5-9.5Z" /></S>
);

export const MapIcon: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M9 4 3.5 6.2v13.5L9 17.5l6 2.3 5.5-2.2V4L15 6.3Z" /><line x1={9} y1={4} x2={9} y2={17.5} /><line x1={15} y1={6.3} x2={15} y2={19.8} /></S>
);

export const Sprout: React.FC<IconProps> = (p) => (
  <S {...p}><path d="M12 21v-8" /><path d="M12 13c-3.2 0-5-2-5-5 3.2 0 5 2 5 5Z" /><path d="M12 11.5c0-2.7 1.8-4.5 4.5-4.5 0 2.7-1.8 4.5-4.5 4.5Z" /></S>
);

export const Icons = {
  Home, Leaf, Recycle, Clock, Project, Calendar, Chat, Tree, Pin, ArrowRight,
  ArrowLeft, ChevronDown, Shield, User, Logout, Mail, Lock, IdCard, Star,
  StarOutline, Plus, Trash, Users, Chart, Search, Bin, Drop, Map: MapIcon, Sprout,
};

export default Icons;
