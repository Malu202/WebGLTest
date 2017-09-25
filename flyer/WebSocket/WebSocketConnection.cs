using CoreLibrary;
using flyer.WsControllers.Chat;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Net.WebSockets;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace flyer
{
    public class WebSocketConnection
    {
        private WebSocket _socket;
        private ControllerFactory _controllerFactory;
        private ClientRepository _clientRepository;
        private IBroadcastService _broadcastService;
        private bool _socketDisposed = false;

        public Guid ConnectionId { get; }

        public WebSocketConnection(WebSocket socket, ControllerFactory controllerFactory, ClientRepository clientRepository, IBroadcastService broadcastService)
        {
            clientRepository.Add(this);
            _clientRepository = clientRepository;
            _socket = socket;
            _controllerFactory = controllerFactory;
            ConnectionId = Guid.NewGuid();
            _broadcastService = broadcastService;
        }

        public async Task Close(string description)
        {
            await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, description, CancellationToken.None);
        }

        public bool IsAlive => _socket.State == WebSocketState.Open && ! _socketDisposed;

        public async Task Send<TController>(Expression<Action<TController>> action, object message)
        {
            if (_socketDisposed)
            {
                return;
            }
            var methodCall = action.Body as MethodCallExpression;
            var package = new JsonGameSyncSendPackage()
            {
                Controller = typeof(TController).Name,
                Action = methodCall.Method.Name,
                Payload = message
            };
            var json = JsonConvert.SerializeObject(package);
            var buffer = new ArraySegment<byte>(Encoding.UTF8.GetBytes(json));
            Task t;
            lock (_socket)
            {
                try
                {
                    t = _socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);

                }
                catch (ObjectDisposedException)
                {
                    _socketDisposed = true;
                    return;
                }
            }
            await t;
        }

        public async Task Start()
        {
            await Send<ChatController>(p => p.Chat(null), new { ClientId = "Server", Text = "Willkommen.", YourId = ConnectionId });
            await _broadcastService.Broadcast<ChatController>(p => p.Chat(null), new ChatResponse() { ClientId = ConnectionId, Text = "I joined" });
            
            await Run();
        }

        private async Task Run()
        {
            while (!_socketDisposed)
            {
                if (_socket.State == WebSocketState.Open)
                {
                    ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[1024]);
                    var result = await _socket.ReceiveAsync(buffer, CancellationToken.None);
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        string recievedPackage = Encoding.UTF8.GetString(
                        buffer.Array, 0, result.Count);


                        var package = JsonConvert.DeserializeObject<JsonGameSyncPackage>(recievedPackage);

                        await _controllerFactory.Execute(package, this);
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        _socketDisposed = true;
                        break;
                    } else
                    {
                        throw new Exception("Did not expect binary message type");
                    }
                }
                else
                {
                    if (_socket.State == WebSocketState.CloseReceived)
                    {

                    }
                    _socketDisposed = true;
                    break;
                }

            }
            _clientRepository.Remove(this);
            await _broadcastService.Broadcast<ChatController>(p => p.Chat(null), new ChatResponse() { ClientId = ConnectionId, Text = "I left." });
        }
    }
}