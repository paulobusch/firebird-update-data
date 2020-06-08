module.exports = {
    Config: {
        total: 86604865,
        limit: 10000,
    },
    FdbConfig: {
        database: '/firebird/databases/customers_database.fdb',
        user: 'sysdba',
        password: 'masterkey'
    },
    MySqlConfig: {
        host: 'localhost',
        port: '3306',
        user: 'root',
        password: '123456',
        database: 'vetorial'
    },
    Columns: {
        peoples: ['full_name', 'last_name', 'cpf', 'cnpj', 'address', 'complement', 'neighborhood', 'cep', 'city_name', 'state_uf', 'birth_date', 'phone']
    }
}