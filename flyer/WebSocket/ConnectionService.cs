using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Web;

namespace flyer
{
    public class ConnectionService : IConnectionService
    {
        private readonly WebSocketConnection _connection;

        public Guid ConnectionId => _connection.ConnectionId;

        public ConnectionService(WebSocketConnection connection)
        {
            _connection = connection;
        }

        public async Task Answer<TController>(Expression<Action<TController>> action, object message)
        {
            await _connection.Send<TController>(action, message);
        }
    }
}