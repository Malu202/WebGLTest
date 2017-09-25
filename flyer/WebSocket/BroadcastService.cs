using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace flyer
{
    public class BroadcastService : IBroadcastService
    {
        private ClientRepository _clientRepository;

        public BroadcastService(ClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
        }

        public async Task Broadcast<TController>(Expression<Action<TController>> action, object message)
        {
            var tasks = _clientRepository.Select(p => p.Send(action, message));
            try
            {
                await Task.WhenAll(tasks);
            }
            catch
            {

            }
        }

        public async Task BroadcastToOthers<TController>(Expression<Action<TController>> action, object message, IConnectionService activeConnection)
        {
            var tasks = _clientRepository.Where(p => p.ConnectionId != activeConnection.ConnectionId).Select(p => p.Send(action, message));
            try
            {
                await Task.WhenAll(tasks);
            }
            catch
            {

            }
        }
    }
}