"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("util");
var fs_1 = require("fs");
function ethnicities_pretty(ethnicities) {
    return ethnicities.map(function (study) {
        return (function (study_name) { return study_name + ": " + study[study_name].join(', '); })(Object.keys(study)[0]);
    });
}
exports.ethnicities_pretty = ethnicities_pretty;
function s_col_to_s(s) {
    return s.slice(0, s.indexOf(':'));
}
exports.s_col_to_s = s_col_to_s;
function in_range(range, num) {
    if (range === 'all' || range[0] === '_')
        return false;
    var dash = range.indexOf('-');
    if (dash !== -1)
        return num >= parseInt(range.slice(0, dash - range.length)) && num <= parseInt(range.slice(-dash));
    var last = range.slice(-2);
    if (!isNaN(parseInt(last[0])))
        last = last[1];
    if (isNaN(parseInt(last))) {
        var rest = parseInt(range);
        var options = {
            '>': num > rest,
            '+': num >= rest,
            '>=': num >= rest,
            '=>': num >= rest,
        };
        if (Object.keys(options).indexOf(last) === -1)
            throw TypeError("Invalid operation of `" + last + "`");
        return options[last];
    }
    return range == num;
}
exports.in_range = in_range;
function risk_from_study(risk_json, input) {
    if (util_1.isNullOrUndefined(risk_json))
        throw TypeError('`risk_json` must be defined');
    else if (util_1.isNullOrUndefined(input))
        throw TypeError('`input` must be defined');
    function ensure_map(k) {
        if (k === 'map')
            return true;
        throw TypeError("Expected map, got " + k);
    }
    var study = risk_json.studies[input.study];
    var out0 = study[study.expr[0].key];
    var out1 = util_1.isArray(out0) ? out0.filter(function (o) {
        return study.expr[0].filter.every(function (k) {
            return k === 'age' ? in_range(o.age, input[k]) : o[k] === input[k];
        });
    })[study.expr[0].take - 1] :
        out0[ensure_map(study.expr[0].type) && Object.keys(out0).filter(function (k) {
            return in_range(k, input[study.expr[0].key]);
        })[study.expr[0].take - 1]];
    if (!out1)
        throw TypeError('Expected out to match something');
    return util_1.isNumber(out1) ? out1 : out1[study.expr[0].extract];
}
exports.risk_from_study = risk_from_study;
function list_ethnicities(risk_json) {
    if (util_1.isNullOrUndefined(risk_json))
        throw TypeError('`risk_json` must be defined');
    return Object.keys(risk_json.studies).map(function (k) {
        return _a = {}, _a[k] = risk_json.studies[k].ethnicities, _a;
        var _a;
    });
}
exports.list_ethnicities = list_ethnicities;
if (require.main === module) {
    fs_1.exists('./risk.json', function (fs_exists) {
        fs_1.writeFileSync("/tmp/a.json", "fs_exists = " + fs_exists, { encoding: "utf8" });
        fs_exists && console.info(JSON.stringify(require('./risk'), null, '\t'));
    });
}
