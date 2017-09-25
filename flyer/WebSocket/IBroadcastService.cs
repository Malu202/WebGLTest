using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Web;

namespace flyer
{
    public interface IBroadcastService
    {
        Task Broadcast<TController>(Expression<Action<TController>> action, object message);
        Task BroadcastToOthers<TController>(Expression<Action<TController>> action, object message, IConnectionService activeConnection);
    }
}