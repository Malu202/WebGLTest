using flyer.Game;
using System;
using System.Threading.Tasks;

namespace flyer.WsControllers.Position
{
    public class PlayerPosition
    {
        public float x { get; set; }
        public float y { get; set; }
        public float z { get; set; }
        public float yaw { get; set; }
        public Guid ClientId { get; set; }
    }

    public class PlayerPositionController
    {
        private readonly IConnectionService _connectionService;
        private readonly IBroadcastService _broadcastService;
        private readonly Catchme _catchme;

        public PlayerPositionController(IConnectionService connectionService, IBroadcastService broadcastService,
            Catchme catchme)
        {
            _broadcastService = broadcastService;
            _catchme = catchme;
            _connectionService = connectionService;
        }

        public async Task SendPosition(PlayerPosition position)
        {
            position.ClientId = _connectionService.ConnectionId;
            if (_catchme.SetPlayerPosition(position.ClientId, position))
            {
                var catcher = _catchme.GetCatcher();
                await _broadcastService.Broadcast<CatchmeController>(p => p.SendCatcher(), new
                {
                    clientId = catcher
                });
            }
            await _broadcastService.BroadcastToOthers<PlayerPositionController>(p => p.SendPosition(null), position, _connectionService);
        }

    }
}