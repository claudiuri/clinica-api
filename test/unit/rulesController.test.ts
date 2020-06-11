import { 
  addDayInList, 
  checkIntervals, 
  getDatesByInterval, 
  checksIntervalShock, 
  checkNewRuleShock  
} from '../../src/util';

const rulesDb = [ 
  { id: 1, type: 0, day: "10/07/2020", daysOfWeek : [], intervals: [{ start: "9:00", end:"11:00" }]},
  { id: 2, type: 1, day: "", daysOfWeek : [], intervals: [{ start: "7:00", end:"8:00" }]},
  { id: 3, type: 2, day: "", daysOfWeek : [1, 3], intervals: [{ start: "9:00", end:"11:00" }]},
];

const newRulesConflicting  = [
 { id: 4, type: 0, day: "10/07/2020", daysOfWeek : [], intervals: [{ start: "7:00", end:"8:00" }]},
 { id: 5, type: 1, day: "", daysOfWeek : [], intervals: [{ start: "7:00", end:"8:00" }]},
 { id: 6, type: 2, day: "", daysOfWeek : [1, 3], intervals: [{ start: "7:00", end:"8:00" }]}
];

const newRulesNotConflicting  = [
  { id: 4, type: 0, day: "11/07/2020", daysOfWeek : [], intervals: [{ start: "6:00", end:"6:30" }]},
  { id: 5, type: 1, day: "", daysOfWeek : [], intervals: [{ start: "11:30", end:"12:00" }]},
  { id: 6, type: 2, day: "", daysOfWeek : [1, 3], intervals: [{ start: "13:00", end:"14:00" }]}
 ];

describe('util.addDayInList', () => {
  
  it('should return a list with added day', () => {

    const rule = { day: "23-07-2020", intervals: [{ start: "12:00", end: "13:00" }] };
    const rules = <any>[];

    const newRulesList = addDayInList(rule.day, rule.intervals, rules);

    expect(newRulesList).toContainEqual(rule);
    expect(newRulesList).toHaveLength(1);
  });
  
});

describe('util.getDatesByInterval', () => {
  
  it('should return an object with two dates', () => {

    const interval = { start: "9:00", end:"11:00" };
    const dates = getDatesByInterval(interval);

    expect(dates).toHaveProperty('dateStart');
    expect(dates).toHaveProperty('dateEnd');
    expect(dates.dateStart).toBeInstanceOf(Date)
    expect(dates.dateEnd).toBeInstanceOf(Date)
  });
});

describe('util.checksIntervalShock', () => {
  
  it('should return true if there is shock', () => {

    const intervalA = { start: "9:00", end:"11:00" };
    const intervalB = [{ start: "9:00", end:"11:00" }, { start: "11:30", end:"12:00" }];

    expect(checksIntervalShock(intervalA, intervalB)).toBeTruthy();
  });

  it('should return false if there is no shock', () => {

    const intervalA = { start: "9:00", end:"11:00" };
    const intervalB = [{ start: "11:30", end:"12:00" }, { start: "13:30", end:"14:00" }];

    expect(checksIntervalShock(intervalA, intervalB)).toBeFalsy();
  });
});

describe('util.checkIntervals', () => {
  
  it('should return true if there is conflict ', () => {

    const intervalsA = [ { start: "9:00", end:"11:00"}, { start: "12:00", end:"13:00"}, { start: "14:00", end:"15:00"} ];
    const intervalsB = [ { start: "8:00", end:"9:00"}, { start: "12:30", end:"14:30"} ]

    expect(checkIntervals(intervalsA, intervalsB)).toBeTruthy();
  });

  it('should return false if there is no conflict', () => {

    const intervalsA = [ { start: "9:00", end:"11:00"}, { start: "12:00", end:"13:00"}, { start: "14:00", end:"15:00"} ];
    const intervalsB = [ { start: "7:00", end:"8:00"}, { start: "16:00", end:"17:30"} ]

    expect(checkIntervals(intervalsA, intervalsB)).toBeFalsy();
  });
  
});

describe('util.checkNewRuleShock', () => {

  newRulesConflicting.forEach(rule => {

    it('(Rules Conflicting) should return true if there is conflict', () => {

      expect(checkNewRuleShock( rulesDb, rule)).toBeTruthy();
    });

  });

  newRulesNotConflicting.forEach(rule => {

    it('(Rules Not Conflicting) should return false if there is no conflict', () => {
      
      expect(checkNewRuleShock( rulesDb, rule)).toBeFalsy();
    });

  });
});