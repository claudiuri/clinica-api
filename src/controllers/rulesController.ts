import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';

import { Request, Response } from 'express';
import { checkExists, daysWeek } from '../util';

class RulesController {

  private FILE_PATH: string = path.resolve(__dirname, '..', 'database.json');

  private RULE_TYPE_DAY: number = 0; // Um dia especifico
  private RULE_TYPE_DAILY: number = 1; // Diariamente
  private RULE_TYPE_WEEKLY: number = 2; // Semanalmente

  create = async (req: Request, res: Response) => {

    const { type, day, daysOfWeef, intervals } = req.body;

    if (type < 0 && type > 2) {
      return res.json({ message: 'Tipo de regra inválida' })
    }

    if (type != this.RULE_TYPE_DAY && day) {
      return res.json({ message: 'Não é possível definir o dia para esse tipo de regra' })
    }

    if (type == this.RULE_TYPE_DAY && !day) {
      return res.json({ message: 'Informe a data do dia especifico' })
    }

    if (type == this.RULE_TYPE_WEEKLY && daysOfWeef && daysOfWeef.length == 0) {
      return res.json({ message: 'Informe os dias da semana' })
    }

    if (intervals.length < 1) {
      return res.json({ message: 'Informe os intervalos' })
    }

    let lasInterval:any = null;

    intervals.forEach((interval: any, index: number) => {

      const { start, end } = interval;

      // Transforma em uma array onde a primeira posição é a hora e segunda é o minuto
      let horarioIni = start.split(":");
      let horarioFim = end.split(":");

      let dateNow = new Date();

      let dataIni = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), horarioIni[0], horarioIni[1]);
      let dataFim = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), horarioFim[0], horarioFim[1]);

      if (dataIni >= dataFim) {
        return res.status(400).json({ msg: 'Horário de atendimento inválido' });
      }

      if (lasInterval) {
        
        let lasIntervalHorarioFim = lasInterval.end.split(":");

        let lasIntervalDataFim = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), lasIntervalHorarioFim[0], lasIntervalHorarioFim[1]);

        if (dataIni < lasIntervalDataFim) {
          return res.status(400).json({ msg: 'Horário de atendimento inválido' });
        }
      }

      lasInterval = interval;

    });

    const data = await fs.promises.readFile(this.FILE_PATH, 'utf8');

    const dataJson = JSON.parse(data);

    // dataJson.rules.forEach((rule:any) => {

    //   switch (rule.type) {

    //     case this.RULE_TYPE_DAY:
    //       {
    //         if (type == this.RULE_TYPE_DAY && checkExists(rule.intervals, intervals)) {
    //           return res.status(400).json({ message: 'Regra já cadastrada.' });
    //         }

    //         break;
    //       }
    //     case this.RULE_TYPE_DAILY:
    //       {
    //         if (type == this.RULE_TYPE_DAILY && checkExists(rule.intervals, intervals)) {
    //           return res.status(400).json({ message: 'Regra já cadastrada.' });
    //         }
    //         break;
    //       }
    //   case this.RULE_TYPE_WEEKLY:
    //       {
    //         if(type == this.RULE_TYPE_WEEKLY){
    //           if (daysWeek(daysOfWeef, rule.daysOfWeef) && checkExists(rule.intervals, intervals)) {
    //             return res.status(400).json({ message: 'Regra já cadastrada.' });
    //           }
    //         }
    //         break;
    //       }
    //   }
     
    // });

    const newRule = { id: Date.now(), ...req.body };

    dataJson.rules.push(newRule);

    const newData = JSON.stringify(dataJson);

    await fs.promises.writeFile(this.FILE_PATH, newData, 'utf8');

    return res.send(newRule);
  }

  list = async (req: Request, res: Response) => {

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

    return res.send();
  }
}

export default new RulesController();