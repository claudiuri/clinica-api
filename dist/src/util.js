"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDayInList = exports.checksIntervalShock = exports.getDatesByInterval = exports.checkIntervals = exports.checkNewRuleShock = void 0;
var moment_1 = __importDefault(require("moment"));
var rulesController_1 = __importDefault(require("./controllers/rulesController"));
function checkNewRuleShock(rulesInDb, newRule) {
    var hasConflit = false;
    var filtredIntervals = Array();
    var rulesWithoutDaily = Array();
    // Filtra todas regras cadastradas do tipo daily e salva as outras uma lista para ser testada caso não haja conflito
    rulesInDb.forEach(function (rule) {
        if (rule.type == rulesController_1.default.RULE_TYPE_DAILY) {
            filtredIntervals = filtredIntervals.concat(rule.intervals);
        }
        else {
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
            case rulesController_1.default.RULE_TYPE_DAY:
                {
                    var dayOfWeek_1 = moment_1.default(newRule.day, 'DD/MM/YYY').weekday();
                    rulesWithoutDaily.forEach(function (rule) {
                        if ((rule.type == rulesController_1.default.RULE_TYPE_DAY && rule.day == newRule.day) ||
                            (rule.type == rulesController_1.default.RULE_TYPE_WEEKLY && rule.daysOfWeek.includes(dayOfWeek_1))) {
                            filtredIntervals = filtredIntervals.concat(rule.intervals);
                        }
                    });
                    break;
                }
            case rulesController_1.default.RULE_TYPE_WEEKLY:
                {
                    // Filtra todas regras cadastradas do tipo WEEKLY que possui alguns dos dias da semanas cadastradas
                    rulesWithoutDaily.forEach(function (rule) {
                        if (rule.type == rulesController_1.default.RULE_TYPE_DAY) { // Dia especifico
                            var dayOfWeek = moment_1.default(rule.day, 'DD/MM/YYY').weekday();
                            console.log(dayOfWeek);
                            if (newRule.daysOfWeek.includes(dayOfWeek)) {
                                filtredIntervals = filtredIntervals.concat(rule.intervals);
                            }
                        }
                        else { // Semalnalemnte
                            if (rule.type == rulesController_1.default.RULE_TYPE_WEEKLY) {
                                newRule.daysOfWeek.forEach(function (day) {
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
            case rulesController_1.default.RULE_TYPE_DAILY:
                {
                    // Filtra todas regras cadastradas do tipo WEEKLY que possui alguns dos dias da semanas cadastradas
                    rulesWithoutDaily.forEach(function (rule) {
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
exports.checkNewRuleShock = checkNewRuleShock;
function checkIntervals(intervalsA, intervalsB) {
    var controle;
    for (var i = 0; i < intervalsA.length; i++) {
        controle = checksIntervalShock(intervalsA[i], intervalsB);
        if (!controle) {
            return false;
        }
    }
    return controle;
}
exports.checkIntervals = checkIntervals;
function getDatesByInterval(interval) {
    // Transforma em uma array onde a primeira posição é a hora e segunda é o minuto
    var hourStart = interval.start.split(":");
    var hourEnd = interval.end.split(":");
    var dateNow = new Date();
    var dateStart = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), Number(hourStart[0]), Number(hourStart[1]));
    var dateEnd = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), Number(hourEnd[0]), Number(hourEnd[1]));
    return { dateStart: dateStart, dateEnd: dateEnd };
}
exports.getDatesByInterval = getDatesByInterval;
function checksIntervalShock(intervalA, intervalsB) {
    var dateIntervalA = getDatesByInterval(intervalA);
    var dateIniA = dateIntervalA.dateStart;
    var dateFimA = dateIntervalA.dateEnd;
    for (var i = 0; i < intervalsB.length; i++) {
        var dateIntervalB = getDatesByInterval(intervalsB[i]);
        var dateStartB = dateIntervalB.dateStart;
        var dateEndB = dateIntervalB.dateEnd;
        if ((dateEndB >= dateIniA && dateEndB <= dateFimA) || (dateStartB >= dateIniA && dateStartB <= dateFimA)) {
            return true;
        }
    }
    return false;
}
exports.checksIntervalShock = checksIntervalShock;
function addDayInList(day, intervals, list) {
    var newRule = { day: day, intervals: intervals };
    var wasAdded = false;
    if (list.length > 0) {
        list.forEach(function (rule, index) {
            if (rule.day === newRule.day) {
                wasAdded = true;
                list[index].intervals = rule.intervals.concat(newRule.intervals);
            }
        });
    }
    else {
        wasAdded = true;
        list.push(newRule);
    }
    if (!wasAdded) {
        list.push(newRule);
    }
    return list;
}
exports.addDayInList = addDayInList;
