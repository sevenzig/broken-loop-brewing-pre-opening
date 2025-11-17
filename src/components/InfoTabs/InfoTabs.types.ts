import React from 'react';

export interface InfoTabsProps {
  className?: string;
  initialActiveTab?: 'hours' | 'directions' | 'policies';
  onTabChange?: (tab: 'hours' | 'directions' | 'policies') => void;
}

export interface TabContent {
  id: 'hours' | 'directions' | 'policies';
  label: string;
  icon: string;
  content: React.ReactNode;
}

export interface BusinessHoursData {
  day: string;
  hours: string;
  isToday: boolean;
}

export interface CurrentStatus {
  isOpen: boolean;
  closingTime: string;
  nextOpenDay: string;
  openingTime: string;
  message: string;
} 