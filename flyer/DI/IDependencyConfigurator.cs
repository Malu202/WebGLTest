using System;

namespace CoreLibrary
{
    public interface IDependencyConfigurator
    {
        void Factory<TService>(Func<IDependencyResolver, TService> factory)
            where TService : class;
        void Register<TService, TImpl>(bool single = false)
            where TImpl : TService
            where TService : class;
    }
}