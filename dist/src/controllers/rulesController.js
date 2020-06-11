"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var moment_1 = __importDefault(require("moment"));
var util_1 = require("../util");
var RulesController = /** @class */ (function () {
    function RulesController() {
        var _this = this;
        this.FILE_PATH = path_1.default.resolve(__dirname, '..', '..', 'database.json');
        this.RULE_TYPE_DAY = 0; // Um dia especifico
        this.RULE_TYPE_DAILY = 1; // Diariamente
        this.RULE_TYPE_WEEKLY = 2; // Semanalmente
        this.create = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, type, day, daysOfWeek, intervals, lasInterval, data, dataJson, newRule, exist, newData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, type = _a.type, day = _a.day, daysOfWeek = _a.daysOfWeek, intervals = _a.intervals;
                        if (type < 0 && type > 2) {
                            return [2 /*return*/, res.json({ message: 'Tipo de regra inválida' })];
                        }
                        if (type != this.RULE_TYPE_DAY && day) {
                            return [2 /*return*/, res.json({ message: 'Não é possível definir o dia para esse tipo de regra' })];
                        }
                        if (type == this.RULE_TYPE_DAY && !day) {
                            return [2 /*return*/, res.json({ message: 'Informe a data do dia especifico' })];
                        }
                        if (type == this.RULE_TYPE_WEEKLY && daysOfWeek && daysOfWeek.length == 0) {
                            return [2 /*return*/, res.json({ message: 'Informe os dias da semana' })];
                        }
                        if (intervals.length < 1) {
                            return [2 /*return*/, res.json({ message: 'Informe os intervalos' })];
                        }
                        // Valida intervalos
                        intervals.forEach(function (interval) {
                            var dates = util_1.getDatesByInterval(interval);
                            if (dates.dateStart >= dates.dateEnd) {
                                return res.status(400).json({ message: 'Horário de atendimento inválido' });
                            }
                            if (lasInterval) {
                                var lastIntervalDates = util_1.getDatesByInterval(lasInterval);
                                if (dates.dateStart < lastIntervalDates.dateEnd) {
                                    return res.status(400).json({ message: 'Horário de atendimento inválido' });
                                }
                            }
                            lasInterval = interval;
                        });
                        return [4 /*yield*/, fs_1.default.promises.readFile(this.FILE_PATH, 'utf8')];
                    case 1:
                        data = _b.sent();
                        dataJson = JSON.parse(data);
                        newRule = __assign({ id: Date.now() }, req.body);
                        newRule.daysOfWeek = newRule.daysOfWeek.sort();
                        if (dataJson.rules.length > 0) {
                            exist = util_1.checkNewRuleShock(dataJson.rules, newRule);
                            if (exist) {
                                return [2 /*return*/, res.status(400).json({ message: 'Conflito de Intervalo! Possui uma ou mais regras de atendimento cadastra nesse intervalo(s)' })];
                            }
                        }
                        dataJson.rules.push(newRule);
                        newData = JSON.stringify(dataJson);
                        return [4 /*yield*/, fs_1.default.promises.writeFile(this.FILE_PATH, newData, 'utf8')];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, res.json(newRule)];
                }
            });
        }); };
        this.list = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, start, end, data, parssedData, rules, dateStart_1, dateEnd, ruleList_1, diffDays, i;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.query, start = _a.start, end = _a.end;
                        return [4 /*yield*/, fs_1.default.promises.readFile(this.FILE_PATH, 'utf8')];
                    case 1:
                        data = _b.sent();
                        parssedData = JSON.parse(data);
                        rules = parssedData.rules;
                        if (start && end) {
                            dateStart_1 = moment_1.default(String(start), 'DD-MM-YYYY');
                            dateEnd = moment_1.default(String(end), 'DD-MM-YYYY');
                            ruleList_1 = [];
                            diffDays = dateEnd.diff(dateStart_1, 'days');
                            for (i = 0; i <= diffDays; i++) {
                                rules.map(function (rule) {
                                    if (rule.type == _this.RULE_TYPE_DAY) {
                                        if (moment_1.default(rule.day, 'DD-MM-YYYY').format('DD-MM-YYYY') === dateStart_1.format('DD-MM-YYYY')) {
                                            util_1.addDayInList(dateStart_1.format('DD-MM-YYYY'), rule.intervals, ruleList_1);
                                        }
                                    }
                                    else if (rule.type == _this.RULE_TYPE_DAILY) {
                                        util_1.addDayInList(dateStart_1.format('DD-MM-YYYY'), rule.intervals, ruleList_1);
                                    }
                                    else if (rule.type == _this.RULE_TYPE_WEEKLY) {
                                        if (rule.daysOfWeek.indexOf(moment_1.default(dateStart_1, 'DD-MM-YYYY').weekday()) >= 0) {
                                            util_1.addDayInList(dateStart_1.format('DD-MM-YYYY'), rule.intervals, ruleList_1);
                                        }
                                    }
                                });
                                dateStart_1.add(1, 'days');
                            }
                            return [2 /*return*/, res.json(ruleList_1)];
                        }
                        return [2 /*return*/, res.json(rules)];
                }
            });
        }); };
        this.delete = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, data, parssedData, ruleForRemove, newData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = req.params.id;
                        return [4 /*yield*/, fs_1.default.promises.readFile(this.FILE_PATH, 'utf8')];
                    case 1:
                        data = _a.sent();
                        parssedData = JSON.parse(data);
                        if (!id)
                            return [2 /*return*/, res.status(400).json({ message: 'Informe o id da regra de atendimento' })];
                        ruleForRemove = parssedData.rules.find(function (rule) { return rule.id == id; });
                        if (!ruleForRemove)
                            return [2 /*return*/, res.status(404).json({ message: 'Regra de atendimento não encontrada' })];
                        // Remove regra de atendimento
                        parssedData.rules = parssedData.rules.filter(function (rule) { return rule.id !== ruleForRemove.id; });
                        newData = JSON.stringify(parssedData);
                        return [4 /*yield*/, fs_1.default.promises.writeFile(this.FILE_PATH, newData, 'utf8')];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, res.send({ message: 'Regra de atendimento removida com sucesso' })];
                }
            });
        }); };
    }
    return RulesController;
}());
exports.default = new RulesController();
