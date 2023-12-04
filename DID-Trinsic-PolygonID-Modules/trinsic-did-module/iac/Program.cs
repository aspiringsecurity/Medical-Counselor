using Pulumi.AzureNative.Resources;
using System.Collections.Generic;
using Pulumi;
using Pulumi.AzureAD;
using Pulumi.AzureNative.Authorization;
using Pulumi.AzureNative.ContainerRegistry;
using Pulumi.AzureNative.Web;
using Pulumi.AzureNative.Web.Inputs;
using Config = Pulumi.Config;
using ManagedServiceIdentityType = Pulumi.AzureNative.Web.ManagedServiceIdentityType;
using RegistryArgs = Pulumi.AzureNative.ContainerRegistry.RegistryArgs;

return await Pulumi.Deployment.RunAsync(async () =>
{
    var config = new Pulumi.Config();
    var resourceGroupName = config.Require("resourceGroupName");
    var location = config.Require("location");
    var appName1 = config.Require("appName1");
    var appName2 = config.Require("appName2");
    // TODO - Okeydoke demo goes here
    var appName3 = config.Require("appName3");

    var webAppImageName1 = config.Require("appImageName1");
    var webAppImageName2 = config.Require("appImageName2");

    var appServicePlanName = config.Require("appServicePlanName");
    var containerRegistryName = config.Require("containerRegistryName");
    var repository = config.Require("githubRepository");

    var subscriptionId = config.Require("subscriptionId");
    var tenantId = config.Require("tenantId");

    var pearBnBAuthToken = config.RequireSecret("pearbnbAuthToken");
    var pocketRidesAuthToken = config.RequireSecret("pocketridesAuthToken");
    var trinsicEndpoint = config.RequireSecret("trinsicEndpoint");

    var resourceGroup = new ResourceGroup(resourceGroupName, new ResourceGroupArgs
    {
        Location = location
    });

    var application = new Application("azure-provider", new ApplicationArgs
    {
        DisplayName = "azure-application",
    });

    var servicePrincipal = new ServicePrincipal("service-principal", new ServicePrincipalArgs
    {
        ApplicationId = application.ApplicationId,
        AppRoleAssignmentRequired = false,
        Description = "azure-service-principal for connect-demo",
    });

    var servicePrincipalPassword = new ServicePrincipalPassword(
        "service-principal-password",
        new ServicePrincipalPasswordArgs() { ServicePrincipalId = servicePrincipal.Id }
    );

    var roleAssignment = new RoleAssignment("role-assignment", new RoleAssignmentArgs
    {
        PrincipalId = servicePrincipal.Id,
        PrincipalType = PrincipalType.ServicePrincipal,
        RoleDefinitionId =
            $"/subscriptions/{subscriptionId}/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c", // Contributor
        Scope = resourceGroup.Id
    });

    CreateGithubSecret("AZURE_CLIENT_ID", repository, servicePrincipal.ApplicationId);
    CreateGithubSecret("AZURE_CLIENT_SECRET", repository, servicePrincipalPassword.Value);
    CreateGithubSecret("AZURE_SUBSCRIPTION_ID", repository, subscriptionId);
    CreateGithubSecret("AZURE_TENANT_ID", repository, tenantId);

    var containerRegistry = new Registry(containerRegistryName, new RegistryArgs
    {
        RegistryName = containerRegistryName,
        ResourceGroupName = resourceGroup.Name,
        Location = resourceGroup.Location,
        Sku = new Pulumi.AzureNative.ContainerRegistry.Inputs.SkuArgs
        {
            Name = SkuName.Basic,
        },
        AdminUserEnabled = true
    });

    var credentials = ListRegistryCredentials.Invoke(new()
    {
        RegistryName = containerRegistry.Name,
        ResourceGroupName = resourceGroup.Name
    });

    var acrUserName = credentials.Apply(x => x.Username!);
    var acrPassword = credentials.Apply(x => x.Passwords[0].Value!);

    var appServicePlan = new AppServicePlan(appServicePlanName, new AppServicePlanArgs
    {
        ResourceGroupName = resourceGroup.Name,
        Location = resourceGroup.Location,
        Sku = new SkuDescriptionArgs
        {
            Name = "B1",
            Tier = "Basic",
            Size = "B1"
        },
        Kind = "Linux",
        Reserved = true // Required for Linux
    });

    var pearbnb = CreateWebApp(appName1, webAppImageName1, appServicePlan, resourceGroup, containerRegistry,
        acrUserName,
        acrPassword, new InputList<NameValuePairArgs>()
        {
            new[]
            {
                new NameValuePairArgs { Name = "TRINSIC_AUTH_TOKEN", Value = pearBnBAuthToken },
                new NameValuePairArgs { Name = "TRINSIC_ENDPOINT", Value = trinsicEndpoint },
            }
        });
    var pocketRides = CreateWebApp(appName2, webAppImageName2, appServicePlan, resourceGroup, containerRegistry,
        acrUserName,
        acrPassword, new InputList<NameValuePairArgs>()
        {
            new[]
            {
                new NameValuePairArgs { Name = "TRINSIC_AUTH_TOKEN", Value = pocketRidesAuthToken },
                new NameValuePairArgs { Name = "TRINSIC_ENDPOINT", Value = trinsicEndpoint },
            }
        });

    SetGithubActionSecrets(config, acrUserName, acrPassword, containerRegistry);

    return new Dictionary<string, object?>
    {
        { "webAppUrl1", pearbnb.DefaultHostName },
        { "webAppUrl2", pocketRides.DefaultHostName },
        { "registryLoginServer", containerRegistry.LoginServer }
    };
});

void SetGithubActionSecrets(Config config1, Output<string> acrUserName, Output<string> acrPassword, Registry registry)
{
    // Set github secrets for docker username/password
    var repository = config1.Require("githubRepository");

    // Create the secret
    CreateGithubSecret("ACR_USERNAME", repository, acrUserName);
    CreateGithubSecret("ACR_PASSWORD", repository, acrPassword);
    CreateGithubSecret("ACR_LOGIN_URL", repository, registry.LoginServer);
}

WebApp CreateWebApp(string appName, string appImageName, AppServicePlan appServicePlan, ResourceGroup resourceGroup,
    Registry registry,
    Output<string> acrUsername, Output<string> acrPassword, InputList<NameValuePairArgs> appSettings)
{
    var imageName = appImageName.ToLowerInvariant();
    var fullImageName = registry.LoginServer.Apply(x => $"{x}/{imageName}:latest");

    var webApp = new WebApp(appName, new WebAppArgs
    {
        Name = appName,
        ResourceGroupName = resourceGroup.Name,
        Location = resourceGroup.Location,
        ServerFarmId = appServicePlan.Id,
        SiteConfig = new SiteConfigArgs
        {
            AlwaysOn = true,
            NetFrameworkVersion = "v7.0",
            AppSettings = new InputList<NameValuePairArgs>
            {
                new[]
                {
                    // Config taken from: https://github.com/pulumi/examples/blob/master/azure-py-appservice-docker/__main__.py#L84
                    new NameValuePairArgs { Name = "WEBSITES_ENABLE_APP_SERVICE_STORAGE", Value = "false" },
                    new NameValuePairArgs
                    {
                        Name = "DOCKER_REGISTRY_SERVER_URL", Value = registry.LoginServer.Apply(x => $"https://{x}")
                    },
                    new NameValuePairArgs { Name = "DOCKER_REGISTRY_SERVER_USERNAME", Value = acrUsername },
                    new NameValuePairArgs { Name = "DOCKER_REGISTRY_SERVER_PASSWORD", Value = acrPassword },
                    new NameValuePairArgs { Name = "DOCKER_CUSTOM_IMAGE_NAME", Value = fullImageName },
                    new NameValuePairArgs { Name = "DOCKER_ENABLE_CI", Value = "true" },
                    new NameValuePairArgs { Name = "WEBSITES_PORT", Value = "5229" }, // Must match dockerfile
                }
            }.Concat(appSettings)
        },
        HostNameSslStates = new InputList<HostNameSslStateArgs>()
        {
            new[]
            {
                new HostNameSslStateArgs
                    { Name = $"{imageName}.app", SslState = SslState.SniEnabled, HostType = HostType.Standard },
                new HostNameSslStateArgs
                {
                    Name = $"{imageName}.azurewebsites.net", SslState = SslState.Disabled, HostType = HostType.Standard
                },
                new HostNameSslStateArgs
                {
                    Name = $"{imageName}.scm.azurewebsites.net", SslState = SslState.Disabled,
                    HostType = HostType.Standard
                }
            }
        },
        Kind = "linux,container",
        Identity = new ManagedServiceIdentityArgs
        {
            Type = ManagedServiceIdentityType.SystemAssigned
        },
        HttpsOnly = true,
        Reserved = true // Required for Linux
    });
    return webApp;
}

void CreateGithubSecret(string secretName, string repository, Input<string> secretValue)
{
    var azureClientIdSecret = new Pulumi.Github.ActionsSecret($"github-secret-{secretName}", new()
    {
        Repository = repository,
        SecretName = secretName,
        PlaintextValue = secretValue
    });
}