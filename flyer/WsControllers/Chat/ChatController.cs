using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace flyer.WsControllers.Chat
{
    public class ChatRequest
    {
        public string Text { get; set; }
    }

    public class ChatResponse
    {
        public Guid ClientId { get; set; }
        public string Text { get; set; }
    }

    public class ChatController
    {
        private readonly IConnectionService _connectionService;
        private readonly IBroadcastService _broadcastService;
        public ChatController(IConnectionService connectionService, IBroadcastService broadcastService)
        {
            _broadcastService = broadcastService;
            _connectionService = connectionService;
        }

        public async Task Chat(ChatRequest request)
        {
            await _broadcastService.Broadcast<ChatController>(p => p.Chat(null), new ChatResponse() { ClientId = _connectionService.ConnectionId, Text = request.Text });
        }

    }
}