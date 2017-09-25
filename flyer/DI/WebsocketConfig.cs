using CoreLibrary;
using flyer.Game;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace flyer.DI
{
    public class WebsocketConfig
    {
        public static void Configure(IDependencyConfigurator di)
        {
            di.Register<ControllerFactory, ControllerFactory>(true);
            di.Factory(self => self);
            di.Register<IConnectionService, ConnectionService>();
            di.Register<WebSocketConnection, WebSocketConnection>();
            di.Register<ClientRepository, ClientRepository>(true);
            di.Register<IBroadcastService, BroadcastService>();
            var types = new ControllerTypes();
            di.Factory(d => types);
            di.Factory<IControllerTypeResolver>(d => types);
            di.Register<Catchme, Catchme>(true);
        }
    }
}