using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace flyer
{
    public class JsonGameSyncPackage
    {
        public string Controller { get; set; }
        public string Action { get; set; }

        public JObject  Payload { get; set; }
    }

    public class JsonGameSyncSendPackage
    {
        public string Controller { get; set; }
        public string Action { get; set; }

        public object Payload { get; set; }
    }
}