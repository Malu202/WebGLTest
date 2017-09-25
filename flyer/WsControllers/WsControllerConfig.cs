using CoreLibrary;
using flyer.WsControllers.Chat;
using flyer.WsControllers.Position;

namespace flyer.WsControllers
{
    public class WsControllerConfig
    {
        public static void Configure(IDependencyConfigurator di, IDependencyResolver resolve)
        {
            ConfigureController<ChatController>(di, resolve.GetService<ControllerTypes>());
            ConfigureController<PlayerPositionController>(di, resolve.GetService<ControllerTypes>());
            ConfigureController<CatchmeController>(di, resolve.GetService<ControllerTypes>());
        }

        private static void ConfigureController<TController>(IDependencyConfigurator di, ControllerTypes types) where TController : class
        {
            di.Register<TController, TController>();
            types.Add(typeof(TController).Name, typeof(TController));
        }
    }

    public class ClientControllers {
        public string Chat { get; set; }
    }
}