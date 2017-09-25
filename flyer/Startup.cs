using System.Web.Http;
using Microsoft.Owin;
using Owin;
using flyer;
using CoreLibrary;
using flyer.DI;
using flyer.WsControllers;

[assembly: OwinStartup(typeof(Startup))]
namespace flyer
{
    public class Startup
    {
        public static IDependencyResolver dependencyResolver;

        public void Configuration(IAppBuilder app)
        {
            HttpConfiguration config = new HttpConfiguration();


            WebApiConfig.Register(config);
            //app.UseCors(CorsOptions.AllowAll);
            app.UseWebApi(config);

            var di = new DefaultDependencyResolver();
            WebsocketConfig.Configure(di);
            WsControllerConfig.Configure(di, di);
            dependencyResolver = di;
        }

    }
}

