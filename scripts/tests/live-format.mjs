import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const context={};vm.createContext(context);vm.runInContext(readFileSync('public/live-format.js','utf8'),context);const f=context.LiveFormat;
assert.equal(f.cpf('00000000191'),'000.000.001-91');assert.equal(f.validCPF('000.000.001-91'),true);assert.equal(f.validCPF('00000000192'),false);assert.equal(f.validCPF('11111111111'),false);assert.equal(f.validCPF('123'),false);
assert.equal(f.phone('47999999999'),'(47) 99999-9999');assert.equal(f.phone('+55 47 99999-9999'),'(47) 99999-9999');assert.equal(f.phone('4733334444'),'(47) 3333-4444');assert.equal(f.validPhone('47999999999'),true);assert.equal(f.validPhone('4733334444'),true);assert.equal(f.validPhone('00999999999'),false);assert.equal(f.validPhone('47888888888'),false);assert.equal(f.validPhone('479999'),false);
console.log('PASS: live CPF formatting/check digits; BR telephone masks, country prefix, DDD, mobile and landline validation.');
