const { Config, Columns, FdbConfig, MySqlConfig } = require('../config');
const { Query } = require('./utils/query');

var Firebird = require('node-firebird');
const mysql = require('sync-mysql');

const connection = new mysql(MySqlConfig);
const getText = (txt) => {
    if (!txt) return null;
    return txt
        .replace(/[^a-z^ ]/gi, '');
}
const getNumber = (txt) => {
    if (!txt) return null;
    return txt
        .replace(/[^0-9]/gi, '');
}
const castStr = (raw) => raw ? raw.toString('utf-8') : raw;
const castDate = (raw) => raw ? new Date(castStr(raw)) : raw;

console.log('importando...');
const recursive = (offset, time) => {
    if (offset >= Config.total) {
        console.log('Fim...');
        return;
    }
    const pool = Firebird.pool(5, FdbConfig);
    const timeStr = time ? ` Time: ${(new Date() - time) / 1000} s` : '';
    console.log('Processando: ' + (offset + Config.limit) + ' / ' + Config.total + timeStr);
    const startTime = new Date();
    pool.get((err, db) => {
        if (err) throw err;
        const query = `
            select 
                first ${Config.limit} skip ${offset}
                CON_CODIGO as ID,
                CON_CPFCNPJ as CPF_CNPJ,
                CON_NOME as FULL_NAME,
                CON_SOBRENOME as LAST_NAME,
                CON_ENDERECO as ADDRESS,
                CON_COMPLEMENTO as COMPLEMENT,
                CON_BAIRRO as NEIGHBORHOOD,
                CON_CEP as CEP,
                CON_CIDADE as CITY_NAME,
                CON_UF as STATE_UF,
                CON_DATANASCIMENTO as BIRTH_DATE,
                CON_FONE as PHONE
            from consulta;`;
        db.query(query, null, async (err, list) => {
            if (err) throw err;
            db.detach();

            const ImportRows = [];
            for (let index in list) {
                const raw = list[index];
                const cpf_cnpj = getNumber(castStr(raw['CPF_CNPJ'])) || '';
                ImportRows.push([
                    raw['ID'],
                    getText(castStr(raw['FULL_NAME'])),
                    getText(castStr(raw['LAST_NAME'])),
                    cpf_cnpj.length === 11 ? cpf_cnpj : null,
                    cpf_cnpj.length === 14 ? cpf_cnpj : null,
                    castStr(raw['ADDRESS']),
                    castStr(raw['COMPLEMENT']),
                    castStr(raw['NEIGHBORHOOD']),
                    castStr(raw['CEP']),
                    getText(castStr(raw['CITY_NAME'])),
                    getText(castStr(raw['STATE_UF'])),
                    castDate(raw['BIRTH_DATE']),
                    castStr(raw['PHONE'])
                ]);
            }

            await connection.query(Query.get('peoples', Columns.peoples, ImportRows));
            recursive(offset + Config.limit, startTime);
        });
    });
}

recursive(0, null);
