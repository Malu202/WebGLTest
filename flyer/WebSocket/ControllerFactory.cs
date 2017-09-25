using CoreLibrary;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Web;

namespace flyer
{
    public class ControllerFactory
    {
        private readonly Func<string, Type> _controllerTypeResolver;
        private readonly IDependencyResolver _dependencyResolver;

        public ControllerFactory(IDependencyResolver dependencyResolver, IControllerTypeResolver resolver)
        {
            _controllerTypeResolver = (t) => resolver[t];
            _dependencyResolver = dependencyResolver;
        }

        public object Get(JsonGameSyncPackage package, WebSocketConnection connection)
        {
            var type = _controllerTypeResolver(package.Controller);
            if (type == null)
            {
                return null;
            }
            else
                return _dependencyResolver.GetService(type, new Dictionary<Type, Func<object>>()
                {
                    {
                        typeof(IConnectionService),
                        () =>_dependencyResolver.GetService<IConnectionService>(new Dictionary<Type, Func<object>>() {
                            {
                                typeof(WebSocketConnection),
                               () => connection
                            }
                        })

                    }
                });
        }

        public async Task Execute(JsonGameSyncPackage package, WebSocketConnection connection)
        {
            var controller = Get(package, connection);
            if (null == controller)
            {
                throw new NullReferenceException(string.Format("Controller with type {0} not found"));
            }

            var methodInfo = controller.GetType().GetTypeInfo().DeclaredMethods
                .Where(method => method.IsPublic && method.ReturnType == typeof(Task) && method.Name == package.Action)
                .Select(method => new { method, parameters = method.GetParameters() })
                .SingleOrDefault(p => p.parameters.Count() == 1);

            if (null == methodInfo)
            {
                throw new InvalidOperationException(string.Format("No suitable action {0} found in controller {1}. The method must be public and return Task.", package.Action, controller.GetType().Name));
            }
            var param = package.Payload.ToObject(methodInfo.parameters[0].ParameterType);
            await (Task)methodInfo.method.Invoke(controller, new object[] { param });
        }
    }
}