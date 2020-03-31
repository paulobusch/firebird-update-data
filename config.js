module.exports = {
    Config: {
        total: 187845603,
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
        peoples: ['id', 'full_name', 'last_name', 'cpf', 'cnpj', 'address', 'complement', 'neighborhood', 'cep', 'city_name', 'state_uf', 'birth_date', 'phone']
    }
}