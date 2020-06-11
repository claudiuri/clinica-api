import path from 'path';
import fs from 'fs';
import moment from 'moment';

import { Request, Response } from 'express';
import { Interval } from '../interfaces';
import { checkNewRuleShock, addDayInList, getDatesByInterval } from '../util';

class RulesController {

  private FILE_PATH: string = path.resolve(__dirname, '..', '..','database.json');

  RULE_TYPE_DAY: number = 0; // Um dia especifico
  RULE_TYPE_DAILY: number = 1; // Diariamente
  RULE_TYPE_WEEKLY: number = 2; // Semanalmente

  create = async (req: Request, res: Response) => {

    const { type, day, daysOfWeek, intervals } = req.body;

    if (type < 0 && type > 2) {
      return res.json({ message: 'Tipo de regra inválida' })
    }

    if (type != this.RULE_TYPE_DAY && day) {
      return res.json({ message: 'Não é possível definir o dia para esse tipo de regra' })
    }

    if (type == this.RULE_TYPE_DAY && !day) {
      return res.json({ message: 'Informe a data do dia especifico' })
    }

    if (type == this.RULE_TYPE_WEEKLY && daysOfWeek && daysOfWeek.length == 0) {
      return res.json({ message: 'Informe os dias da semana' })
    }

    if (intervals.length < 1) {
      return res.json({ message: 'Informe os intervalos' })
    }

    let lasInterval:Interval;

    // Valida intervalos
    intervals.forEach((interval: Interval) => {

      let dates = getDatesByInterval(interval);
      
      if (dates.dateStart >= dates.dateEnd) {
        return res.status(400).json({ message: 'Horário de atendimento inválido' });
      }

      if (lasInterval) {

        let lastIntervalDates = getDatesByInterval(lasInterval);

        if (dates.dateStart < lastIntervalDates.dateEnd) {
          return res.status(400).json({ message: 'Horário de atendimento inválido' });
        }
      }

      lasInterval = interval;

    });

    const data = await fs.promises.readFile(this.FILE_PATH, 'utf8');

    const dataJson = JSON.parse(data);

    const newRule = { id: Date.now(), ...req.body };

    newRule.daysOfWeek = newRule.daysOfWeek.sort();

    if (dataJson.rules.length > 0) {

      let exist = checkNewRuleShock(dataJson.rules, newRule);

      if (exist) {
        return res.status(400).json({ message: 'Conflito de Intervalo! Possui uma ou mais regras de atendimento cadastra nesse intervalo(s)' })
      }
    }

    dataJson.rules.push(newRule);

    const newData = JSON.stringify(dataJson);

    await fs.promises.writeFile(this.FILE_PATH, newData, 'utf8');

    return res.json(newRule);
  }

  list = async (req: Request, res: Response) => {

    const { start, end } = req.query;

    const data = await fs.promises.readFile(this.FILE_PATH, 'utf8');

    const parssedData = JSON.parse(data);

    const { rules } = parssedData;

    if (start && end) {
      
      let dateStart = moment(String(start), 'DD-MM-YYYY');
      let dateEnd = moment(String(end), 'DD-MM-YYYY');

      let ruleList = <any>[];

      const diffDays = dateEnd.diff(dateStart, 'days');
            
      for (let i = 0; i <= diffDays; i++) {

        rules.map((rule: any) => {

            if (rule.type == this.RULE_TYPE_DAY) {
                if (moment(rule.day, 'DD-MM-YYYY').format('DD-MM-YYYY') === dateStart.format('DD-MM-YYYY')) {
                  addDayInList(dateStart.format('DD-MM-YYYY'), rule.intervals, ruleList)
                }
            }
            else if (rule.type == this.RULE_TYPE_DAILY) {
              addDayInList(dateStart.format('DD-MM-YYYY'), rule.intervals, ruleList)
            }
            else if (rule.type == this.RULE_TYPE_WEEKLY) {
                if (rule.daysOfWeek.indexOf(moment(dateStart, 'DD-MM-YYYY').weekday()) >= 0) {
                  addDayInList(dateStart.format('DD-MM-YYYY'), rule.intervals , ruleList)
                }
            }
        });

        dateStart.add(1, 'days')
      }

      return res.json(ruleList)
    }

    return res.json(rules);
  }

  delete = async (req: Request, res: Response) => {

    const { id } = req.params;

    const data = await fs.promises.readFile(this.FILE_PATH, 'utf8');

    const parssedData = JSON.parse(data);

    if (!id) 
      return res.status(400).json({ message: 'Informe o id da regra de atendimento' });

    const ruleForRemove = parssedData.rules.find((rule:any) =>  rule.id == id);

    if (!ruleForRemove)
      return res.status(404).json({ message: 'Regra de atendimento não encontrada' });
    
    // Remove regra de atendimento
    parssedData.rules = parssedData.rules.filter((rule:any) =>  rule.id !== ruleForRemove.id);

    const newData = JSON.stringify(parssedData);
    
    await fs.promises.writeFile(this.FILE_PATH, newData, 'utf8');

    return res.send({ message: 'Regra de atendimento removida com sucesso' });
  }
}

export default new RulesController();