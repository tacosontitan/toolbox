targetScope = 'subscription'

resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: 'toolbox'
  location: 'EastUS'
}

output resourceGroupName string = resourceGroup.name
