@description('The name of the SQL server.')
param serverName string

@description('The name of the SQL database.')
param databaseName string

resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-02-01-preview' = {
  name: '${serverName}/${databaseName}'
  location: 'EastUS'
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
  }
  sku: {
    name: 'Basic'
    tier: 'Basic'
    capacity: 5
  }
}

output databaseName string = sqlDatabase.name
