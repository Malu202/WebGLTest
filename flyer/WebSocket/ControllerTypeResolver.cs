using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace flyer
{
    public interface IControllerTypeResolver : IReadOnlyDictionary<string, Type>
    {

    }

    public class ControllerTypes : Dictionary<string, Type>, IControllerTypeResolver
    {
    }
}