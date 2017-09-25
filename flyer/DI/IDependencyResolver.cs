using System;
using System.Collections.Generic;

namespace CoreLibrary
{
    public interface IDependencyResolver
    {
        T GetService<T>() where T : class;
        T GetService<T>(IDictionary<Type, Func<object>> arguments) where T : class;
        object GetService(Type type);
        object GetService(Type type, IDictionary<Type, Func<object>> arguments);
    }
}