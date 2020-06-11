export interface Interval {
  start: string;
  end: string;
}

export interface Rule {
  id: number;
  type: number;
  day: string;
  daysOfWeek: Array<number>;
  intervals: Array<Interval>;
}

export interface Filter {
  day: string;
  intervals: Array<Interval>;
}

export interface DateInterval {
  dateStart: Date;
  dateEnd: Date;
}