import moment from 'moment';

import rulesController from './controllers/rulesController';

import { Rule, Interval, Filter, DateInterval } from './interfaces';

export function checkNewRuleShock (rulesInDb: Array<Rule>, newRule: Rule): boolean  {
  
  let hasConflit = false
  let filtredIntervals = Array<Interval>(); 
  let rulesWithoutDaily =Array<Rule>();

  // Filtra todas regras cadastradas do tipo daily e salva as outras uma lista para ser testada caso não haja conflito
  rulesInDb.forEach((rule) => {

    if (rule.type == rulesController.RULE_TYPE_DAILY) {
      filtredIntervals = filtredIntervals.concat(rule.intervals);
    } else {
      rulesWithoutDaily.push(rule);
    }
  });

  if (filtredIntervals.length > 0) {
    // Verifica se as regras cadastradas do tipo DAILY dão conflito com a nova regra
    hasConflit = checkIntervals(filtredIntervals, newRule.intervals);
  }

  if (!hasConflit) {

    filtredIntervals = [];

    switch (newRule.type) {

      case rulesController.RULE_TYPE_DAY:
        {
          let dayOfWeek = moment(newRule.day, 'DD/MM/YYY').weekday();
          
          rulesWithoutDaily.forEach((rule:any) => {

            if ((rule.type == rulesController.RULE_TYPE_DAY && rule.day == newRule.day) || 
                (rule.type == rulesController.RULE_TYPE_WEEKLY && rule.daysOfWeek.includes(dayOfWeek))) {

              filtredIntervals = filtredIntervals.concat(rule.intervals);
            }
          });
          
          break;
        }
      case rulesController.RULE_TYPE_WEEKLY:
        {
          // Filtra todas regras cadastradas do tipo WEEKLY que possui alguns dos dias da semanas cadastradas
          rulesWithoutDaily.forEach((rule) => {

            if (rule.type == rulesController.RULE_TYPE_DAY) { // Dia especifico

              let dayOfWeek = moment(rule.day, 'DD/MM/YYY').weekday();

              console.log(dayOfWeek)

              if (newRule.daysOfWeek.includes(dayOfWeek)) {
                filtredIntervals = filtredIntervals.concat(rule.intervals);
              }

            } else { // Semalnalemnte

              if (rule.type == rulesController.RULE_TYPE_WEEKLY) {
                newRule.daysOfWeek.forEach((day:number) => {
                  if (rule.daysOfWeek.includes(day)) {
                    filtredIntervals = filtredIntervals.concat(rule.intervals);
                    return;
                  }
                });
              }
            }
          });

          break;
        }
      case rulesController.RULE_TYPE_DAILY:
        {
           // Filtra todas regras cadastradas do tipo WEEKLY que possui alguns dos dias da semanas cadastradas
          rulesWithoutDaily.forEach((rule:any) => {
            filtredIntervals = filtredIntervals.concat(rule.intervals);
          });

          break;
        }
    }

    if (filtredIntervals.length > 0) {

      hasConflit = checkIntervals(filtredIntervals, newRule.intervals);
    }
  }

  return hasConflit;
}

export function checkIntervals(intervalsA: Array<Interval>, intervalsB: Array<Interval>): boolean {
  
  let controle: any;
  
  for (let i = 0; i < intervalsA.length; i++) {
    controle = checksIntervalShock(intervalsA[i], intervalsB);

    if (!controle) {
      return false;
    }
  }

  return controle;
}

export function getDatesByInterval(interval: Interval): DateInterval {

  // Transforma em uma array onde a primeira posição é a hora e segunda é o minuto
  let hourStart = interval.start.split(":");
  let hourEnd = interval.end.split(":");

  let dateNow = new Date();

  let dateStart = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), Number(hourStart[0]), Number(hourStart[1]));
  let dateEnd = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), Number(hourEnd[0]), Number(hourEnd[1]));

  return { dateStart, dateEnd  };
}

export function checksIntervalShock(intervalA: Interval, intervalsB: Array<Interval>) {
  
  let dateIntervalA = getDatesByInterval(intervalA);

  let dateIniA = dateIntervalA.dateStart;
  let dateFimA = dateIntervalA.dateEnd;

  for (let i = 0; i < intervalsB.length; i++) {

    let dateIntervalB = getDatesByInterval(intervalsB[i]);

    let dateStartB = dateIntervalB.dateStart;
    let dateEndB = dateIntervalB.dateEnd;

    if ((dateEndB >= dateIniA && dateEndB <= dateFimA) || (dateStartB >= dateIniA && dateStartB <= dateFimA )) {
      return true;
    } 
  }
  return false;
}

export function addDayInList(day: string, intervals: Array<Interval>, list: Array<Filter>) {
  let newRule = { day, intervals };
  let wasAdded = false
 
  if (list.length > 0) {

    list.forEach((rule, index) =>{
      if (rule.day === newRule.day) {
        wasAdded = true
        list[index].intervals = rule.intervals.concat(newRule.intervals)
      }
    });
  } 
  else {
    wasAdded = true
    list.push(newRule)
  }

  if (!wasAdded) {
    list.push(newRule)
  }

  return list
}