export function formatDate(
  {
    date = new Date(),
    locale = 'id-ID',
    timeZone = 'Asia/Jakarta',
    pattern = 'YYYY-MM-DD HH:mm:ss',
  }: {
    date?: Date;
    locale?: string;
    timeZone?: string;
    pattern?: string;
  } = {
    date: new Date(),
    locale: 'id-ID',
    timeZone: 'Asia/Jakarta',
    pattern: 'YYYY-MM-DD HH:mm:ss',
  }
): string {
  // Determine month format based on pattern
  let monthFormat: 'numeric' | '2-digit' | 'short' | 'long' = '2-digit';
  if (pattern.includes('MMMM')) {
    monthFormat = 'long';
  } else if (pattern.includes('MMM')) {
    monthFormat = 'short';
  } else if (pattern.includes('M') && !pattern.includes('MM')) {
    monthFormat = 'numeric';
  }

  // Determine day format based on pattern
  let dayFormat: 'numeric' | '2-digit' = '2-digit';
  if (pattern.includes('D') && !pattern.includes('DD')) {
    dayFormat = 'numeric';
  }

  // Determine year format based on pattern
  let yearFormat: 'numeric' | '2-digit' = 'numeric';
  if (pattern.includes('YY') && !pattern.includes('YYYY')) {
    yearFormat = '2-digit';
  }

  // Determine hour format based on pattern
  let hourFormat: 'numeric' | '2-digit' = '2-digit';
  if (pattern.includes('H') && !pattern.includes('HH')) {
    hourFormat = 'numeric';
  }

  // Determine minute format based on pattern
  let minuteFormat: 'numeric' | '2-digit' = '2-digit';
  if (pattern.includes('m') && !pattern.includes('mm')) {
    minuteFormat = 'numeric';
  }

  // Determine second format based on pattern
  let secondFormat: 'numeric' | '2-digit' = '2-digit';
  if (pattern.includes('s') && !pattern.includes('ss')) {
    secondFormat = 'numeric';
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    year: yearFormat,
    month: monthFormat,
    day: dayFormat,
    hour: hourFormat,
    minute: minuteFormat,
    second: secondFormat,
    hour12: false,
    timeZone,
  });

  // Hasil Intl.DateTimeFormat jadi array parts
  const parts = formatter.formatToParts(date).reduce<Record<string, string>>((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const map: Record<string, string> = {
    YYYY: parts.year,
    YY: parts.year?.slice(-2) || parts.year,
    MMMM: parts.month,
    MMM: parts.month,
    MM: parts.month,
    M: parts.month,
    DD: parts.day,
    D: parts.day,
    HH: parts.hour,
    H: parts.hour,
    mm: parts.minute,
    m: parts.minute,
    ss: parts.second,
    s: parts.second,
  };

  return pattern.replace(
    /YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|mm|m|ss|s/g,
    (match) => map[match] || match
  );
}

export function formatDefaultDate(dateString: string) {
  return formatDate({
    date: new Date(dateString),
    pattern: 'D MMMM YYYY',
  });
}
