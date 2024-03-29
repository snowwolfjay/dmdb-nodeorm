"use strict";
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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableBase = void 0;
var rxjs_1 = require("rxjs");
var TableBase = /** @class */ (function () {
    function TableBase(repoMane, name, rowDef) {
        this.repoMane = repoMane;
        this.name = name;
        this.rowDef = rowDef;
        this.ready$$ = new rxjs_1.BehaviorSubject(false);
        this.allFields = [];
        //
        this.prepare();
        this.allFields = rowDef.map(function (e) { return e.split("")[0]; });
    }
    TableBase.prototype.prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "CREATE TABLE IF NOT EXISTS ".concat(this.name, " (  \n            ").concat(this.rowDef.join(","), "\n        )\n        ");
                        return [4 /*yield*/, this.repoMane.conn.execute(sql)];
                    case 1:
                        _a.sent();
                        console.info("prepare ".concat(this.name, " ok:\n        ").concat(sql, "\n        "));
                        this.ready$$.next(true);
                        return [2 /*return*/];
                }
            });
        });
    };
    TableBase.prototype.ready = function (timeoutMs) {
        if (timeoutMs === void 0) { timeoutMs = 30000; }
        return (0, rxjs_1.firstValueFrom)(this.ready$$.pipe((0, rxjs_1.filter)(function (e) { return !!e; }), (0, rxjs_1.timeout)(timeoutMs)));
    };
    TableBase.prototype.create = function (fields, opts) {
        return __awaiter(this, void 0, void 0, function () {
            var conn, cols, args, pats, sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ready()];
                    case 1:
                        _a.sent();
                        conn = this.repoMane.conn;
                        cols = Object.keys(fields);
                        args = cols.map(function (key) { return ({ val: fields[key] }); });
                        pats = cols.map(function (_, i) { return ":".concat(i + 1); });
                        sql = "INSERT INTO ".concat(this.name, "(").concat(cols.join(","), ") VALUES(").concat(pats.join(","), ")");
                        console.log("execute insert sql:\n            ".concat(sql, "\n        "));
                        console.log(args);
                        return [4 /*yield*/, conn.execute(sql, args)];
                    case 2:
                        result = _a.sent();
                        (opts === null || opts === void 0 ? void 0 : opts.commit) !== false && conn.execute("commit;");
                        return [2 /*return*/, result];
                }
            });
        });
    };
    TableBase.prototype.commit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var conn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conn = this.repoMane.conn;
                        return [4 /*yield*/, conn.execute("commit;")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return TableBase;
}());
exports.TableBase = TableBase;
