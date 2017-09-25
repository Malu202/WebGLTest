using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using System.Web;

namespace flyer
{
    public interface IConnectionService
    {
        Task Answer<TController>(Expression<Action<TController>> action, object message);
        Guid ConnectionId { get; }
    }
}