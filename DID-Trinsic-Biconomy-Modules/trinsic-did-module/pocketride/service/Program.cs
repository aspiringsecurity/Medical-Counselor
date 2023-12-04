using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
IConfiguration configuration = builder.Configuration;
IHostEnvironment hostEnvironment = builder.Environment;
// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddReverseProxy().LoadFromConfig(configuration.GetSection("SpaProxy"));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}


app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();


app.MapControllers();
if (!hostEnvironment.IsDevelopment())
{
    app.MapRazorPages();
}


if (hostEnvironment.IsDevelopment())
{
    app.MapReverseProxy();
}

app.Run();

