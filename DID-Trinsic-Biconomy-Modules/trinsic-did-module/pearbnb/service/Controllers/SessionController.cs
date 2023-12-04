using System;
using System.Threading.Tasks;
using DemoShared.Config;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Trinsic;
using Trinsic.Sdk.Options.V1;
using Trinsic.Services.Connect.V1;
using System.Text.Json;
using System.Text.Json.Serialization;
namespace PearBnB.Controllers;

public class SessionController : Controller
{
    private TrinsicOptions _trinsicClientOptions;

    public SessionController(IConfiguration configuration)
    {
        TrinsicConfig config = new();
        configuration.Bind(config);

        _trinsicClientOptions = new()
        {
            AuthToken = config.TRINSIC_AUTH_TOKEN,
            ServerEndpoint = config.TRINSIC_ENDPOINT,
            ServerPort = 443,
            ServerUseTls = true
        };
    }

    [HttpPost("/api/create-session")]
    public async Task<IActionResult> CreateSession()
    {
        var trinsic = new TrinsicService(_trinsicClientOptions);
        var session = await trinsic.Connect.CreateSessionAsync(new()
        {
            Verifications =
            {
                new RequestedVerification()
                {
                    Type = VerificationType.GovernmentId
                }
            }
        });
        var sessionResp = new SessionResponse
        {
            clientToken = session.Session.ClientToken,
            sessionId = session.Session.Id
        };

        string jsonString = JsonSerializer.Serialize(sessionResp);
        return Ok(jsonString);
    }


    [HttpPost("/api/get-result")]
    public async Task<IActionResult> GetResult([FromQuery(Name = "clientToken")] string clientToken)
    {
        
        Console.Error.WriteLine("clientToken");        

        Console.Error.WriteLine(clientToken);
        
        var trinsic = new TrinsicService(_trinsicClientOptions);
        var session = await trinsic.Connect.GetSessionAsync(new GetSessionRequest() {IdvSessionId = clientToken});
        Console.Error.WriteLine(session.Session.ToString());
        Console.Error.WriteLine(session.Session.HasResultVp);
        Console.Error.WriteLine(session.Session.ResultVp);
        if (!session.Session.HasResultVp)
            return Ok("no-result-yet");
        return Ok(session.Session);
    }
    public class SessionResponse
    {
        public string clientToken { get; set; }
        public string sessionId { get; set; }
    }

}