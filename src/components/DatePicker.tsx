import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (dateStr: string) => void;
  className?: string;
  placeholder?: string;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export function DatePicker({ value, onChange, className = '', placeholder = 'Seleccionar fecha' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial date or fallback to today
  const today = new Date();
  const parsedDate = value ? new Date(value) : null;

  // View state for the calendar calendar navigation (month/year)
  const [viewYear, setViewYear] = useState(parsedDate ? parsedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate ? parsedDate.getMonth() : today.getMonth());

  // Update view state when the value changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close calendar popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: check if two dates are the same day
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Helper: format Date object to YYYY-MM-DD string using local parts to prevent timezone offsets
  const formatDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate days grid
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getCalendarDays = () => {
    // First day of current month: JS getDay() has Sunday as 0, Monday as 1, etc.
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    // Map to Monday start: Lu=0, Ma=1, Mi=2, Ju=3, Vi=4, Sá=5, Do=6
    const startOffset = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
    const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth - 1);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month padding days
    for (let i = startOffset - 1; i >= 0; i--) {
      const prevMonthDate = new Date(viewYear, viewMonth - 1, daysInPrevMonth - i);
      days.push({ date: prevMonthDate, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const currentMonthDate = new Date(viewYear, viewMonth, i);
      days.push({ date: currentMonthDate, isCurrentMonth: true });
    }

    // Next month padding days to complete grid (multiples of 7, let's say 42 cells grid)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDate = new Date(viewYear, viewMonth + 1, i);
      days.push({ date: nextMonthDate, isCurrentMonth: false });
    }

    return days;
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const selectDate = (date: Date) => {
    onChange(formatDateString(date));
    setIsOpen(false);
  };

  const selectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectDate(today);
  };

  // Human-readable formatted display date (e.g. "26/05/2026")
  const getDisplayValue = () => {
    if (!parsedDate || isNaN(parsedDate.getTime())) return '';
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${parsedDate.getFullYear()}`;
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Input Panel */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-white dark:bg-brand-sand border border-brand-sand-dark dark:border-brand-sand-dark rounded-xl px-3 py-2 text-xs text-brand-navy dark:text-brand-charcoal cursor-pointer select-none hover:border-brand-terracotta dark:hover:border-brand-terracotta transition-colors duration-150 ${className}`}
      >
        <span className={getDisplayValue() ? 'font-mono font-bold' : 'text-slate-400 font-sans'}>
          {getDisplayValue() || placeholder}
        </span>
        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 dark:text-brand-navy-light shrink-0 ml-2" />
      </div>

      {/* Floating Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 z-50 bg-white dark:bg-brand-sand-light border border-brand-sand-dark dark:border-brand-sand-dark rounded-2xl shadow-xl p-3 select-none premium-glass animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Calendar Header: Month, Year and Arrows */}
          <div className="flex items-center justify-between mb-3.5">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-brand-sand dark:hover:bg-brand-sand text-slate-500 dark:text-brand-charcoal transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="font-serif font-bold text-sm text-brand-navy dark:text-brand-navy-dark">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-brand-sand dark:hover:bg-brand-sand text-slate-500 dark:text-brand-charcoal transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday letters */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((day, idx) => (
              <span key={idx} className="text-[10px] font-bold font-mono text-slate-400 dark:text-brand-navy-light uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map(({ date, isCurrentMonth }, idx) => {
              const isToday = isSameDay(date, today);
              const isSelected = parsedDate ? isSameDay(date, parsedDate) : false;

              return (
                <button
                  key={idx}
                  onClick={() => selectDate(date)}
                  className={`
                    h-7 w-7 text-[11px] rounded-lg font-mono font-medium flex items-center justify-center transition-all cursor-pointer
                    ${isCurrentMonth 
                      ? 'text-brand-charcoal dark:text-brand-charcoal' 
                      : 'text-slate-300 dark:text-slate-600'
                    }
                    ${isToday && !isSelected
                      ? 'border border-brand-terracotta/70 text-brand-terracotta dark:text-brand-terracotta font-bold'
                      : ''
                    }
                    ${isSelected
                      ? 'bg-brand-terracotta text-white font-bold shadow-md shadow-brand-terracotta/20 scale-105'
                      : 'hover:bg-brand-sand dark:hover:bg-brand-sand hover:scale-105'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick helper footer */}
          <div className="mt-3 pt-2.5 border-t border-brand-sand-dark dark:border-brand-sand-dark flex items-center justify-between text-[10px]">
            <span className="text-slate-400 dark:text-brand-navy-light">
              Hoy: <b className="font-mono text-brand-navy dark:text-brand-navy-dark">{today.getDate()}/{today.getMonth() + 1}/{today.getFullYear()}</b>
            </span>
            <button
              onClick={selectToday}
              className="px-2 py-1 rounded bg-brand-sand dark:bg-brand-sand text-brand-navy dark:text-brand-navy-dark hover:bg-brand-sand-dark hover:text-brand-navy-dark font-bold transition"
            >
              Hoy
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
