using System;
using System.Threading.Tasks;

namespace flyer.WsControllers.Position
{

    public class CatchmeController
    {
        private readonly IConnectionService _connectionService;
        private readonly IBroadcastService _broadcastService;
        public CatchmeController(IConnectionService connectionService, IBroadcastService broadcastService)
        {
            _broadcastService = broadcastService;
            _connectionService = connectionService;
        }

        public async Task SendCatcher()
        {
           
        }

    }
}