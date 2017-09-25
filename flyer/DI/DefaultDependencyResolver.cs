using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace CoreLibrary
{
    public class DefaultDependencyResolver : IDependencyResolver, IDependencyConfigurator
    {
        private readonly IDictionary<Type, Func<IDependencyResolver, object>> _factories
            = new Dictionary<Type, Func<IDependencyResolver, object>>();

        private readonly IDictionary<Type, Type> _registrations = new Dictionary<Type, Type>();
        private readonly IDictionary<Type, object> _singles = new Dictionary<Type, object>();

        public T GetService<T>()
            where T : class
        {
            return GetService(typeof(T)) as T;
        }

        public T GetService<T>(IDictionary<Type, Func<object>> arguments)
            where T : class
        {
            return GetService(typeof(T), arguments) as T;
        }

        public void Register<TService, TImpl>(bool single = false)
            where TImpl : TService
            where TService : class
        {
            _registrations.Add(typeof(TService), typeof(TImpl));
            if (single)
            {
                _singles.Add(typeof(TService), null);
            }
        }

        public void Factory<TService>(Func<IDependencyResolver, TService> factory)
            where TService : class
        {
            if (null == factory)
            {
                throw new ArgumentNullException("factory");
            }
            _factories.Add(typeof(TService), factory);
        }

        private bool ContainsService(Type type)
        {
            return _factories.ContainsKey(type) || _registrations.ContainsKey(type);
        }

        public object GetService(Type type)
        {
            return GetService(type, null);
        }

        public object GetService(Type type, IDictionary<Type, Func<object>> arguments)
        {
            object single;
            if (_singles.TryGetValue(type, out single))
            {
                if (single != null)
                {
                    return single;
                }
            }

            Func<IDependencyResolver, object> factory;
            if (_factories.TryGetValue(type, out factory))
            {
                return factory(this);
            }
            Type impl;
            if (_registrations.TryGetValue(type, out impl))
            {
                var bestMatchingConstructor = impl.GetTypeInfo().DeclaredConstructors
                    .Select(constr => new { constr, parameters = constr.GetParameters() })
                    .Where(p => p.parameters
                        .All(parameter => ContainsService(parameter.ParameterType) || arguments != null && arguments.ContainsKey(parameter.ParameterType)))
                    .OrderByDescending(p => p.parameters.Count()).First();
                var implParam = bestMatchingConstructor.parameters.Select(p =>
                {
                    Func<object> param;
                    if (arguments != null && arguments.TryGetValue(p.ParameterType, out param))
                    {
                        return param();
                    }
                    return GetService(p.ParameterType);
                });
                var instance = Activator.CreateInstance(impl, implParam.ToArray());
                if (_singles.ContainsKey(type))
                {
                    _singles[type] = instance;
                }
                return instance;
            }
            return null;
        }
    }
}