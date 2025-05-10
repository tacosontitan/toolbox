@description('The name of the SQL server.')
param serverName string

@description('The username for the SQL server administrator.')
param administratorUsername string

@secure()
@description('The password for the SQL server administrator.')
param administratorPassword string

resource sqlServer 'Microsoft.Sql/servers@2022-02-01-preview' = {
  name: serverName
  location: 'EastUS'
  properties: {
    administratorLogin: administratorUsername
    administratorLoginPassword: administratorPassword
  }
}

output serverName string = sqlServer.name
