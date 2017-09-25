using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.WebSockets;

namespace flyer.Controllers
{
    public class TestController : ApiController
    {
        public HttpResponseMessage Get()
        {
            if (HttpContext.Current.IsWebSocketRequest)
            {
                HttpContext.Current.AcceptWebSocketRequest(ProcessWSChat);
            }
            return new HttpResponseMessage(HttpStatusCode.SwitchingProtocols);
        }
        private async Task ProcessWSChat(AspNetWebSocketContext context)
        {
            var conn = Startup.dependencyResolver.GetService<WebSocketConnection>(new Dictionary<Type, Func<object>>() { { typeof(WebSocket), () => context.WebSocket } });
            await conn.Start();
        }

    }
}