import { useMemo } from 'react';
import { format, eachDayOfInterval, startOfYear, endOfYear, getDay } from 'date-fns';

export default function HeatmapCalendar({ data }) {
  const heatmapData = useMemo(() => {
    const map = {};
    (data || []).forEach((d) => {
      map[d.date] = d.count;
    });

    const year = new Date().getFullYear();
    const start = startOfYear(new Date(year, 0, 1));
    const end = new Date() < endOfYear(new Date(year, 0, 1)) ? new Date() : endOfYear(new Date(year, 0, 1));

    return eachDayOfInterval({ start, end }).map((date) => {
      const key = format(date, 'yyyy-MM-dd');
      return {
        date: key,
        count: map[key] || 0,
        dayOfWeek: getDay(date),
        month: format(date, 'MMM'),
      };
    });
  }, [data]);

  const getColor = (count) => {
    if (count === 0) return 'bg-slate-100';
    if (count <= 2) return 'bg-brand-100';
    if (count <= 5) return 'bg-brand-200';
    if (count <= 10) return 'bg-brand-400';
    return 'bg-brand-600';
  };

  const weeks = useMemo(() => {
    const result = [];
    let currentWeek = [];
    heatmapData.forEach((day) => {
      if (day.dayOfWeek === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    });
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, [heatmapData]);

  return (
    <div>
      <div className="flex gap-0.5 overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${getColor(day.count)} transition-colors`}
                title={`${day.date}: ${day.count} payments`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-slate-100" />
          <div className="w-3 h-3 rounded-sm bg-brand-100" />
          <div className="w-3 h-3 rounded-sm bg-brand-200" />
          <div className="w-3 h-3 rounded-sm bg-brand-400" />
          <div className="w-3 h-3 rounded-sm bg-brand-600" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
