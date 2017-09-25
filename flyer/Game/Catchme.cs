using flyer.WsControllers.Position;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace flyer.Game
{
    public class CatchmeState
    {
        public PlayerPosition Position;
        public bool isCatcher;
        public DateTime debounceTo;
    }

    public class Catchme
    {
        private ClientRepository _clientRepository;

        private IDictionary<Guid, CatchmeState> _states;
        private Guid? _lastcatcher;

        public Catchme(ClientRepository clientRepository)
        {
            _clientRepository = clientRepository;
            _states = new Dictionary<Guid, CatchmeState>();
        }

        public bool SetPlayerPosition(Guid clientId, PlayerPosition pos)
        {
            CatchmeState state;
            if (!_states.ContainsKey(clientId))
            {
                state = new CatchmeState()
                {
                    debounceTo = DateTime.Now.Add(new TimeSpan(0, 0, 3)),
                    isCatcher = false,
                    Position = pos
                };
                _states[clientId] = state;
            }
            else
            {
                state = _states[clientId];
                state.Position = pos;
            }
            var catcher = GetCatcher();
            if (catcher.HasValue)
            {
                var catcherState = _states[catcher.Value];
                foreach(var pair in _states)
                {
                    if (pair.Key == catcher)
                    {
                        continue;
                    }
                    if (_clientRepository.Where(c => c.ConnectionId == pair.Key && c.IsAlive).Any())
                    {
                        if (pair.Value.debounceTo < DateTime.Now && Catched(catcherState.Position, pair.Value.Position))
                        {
                            catcherState.isCatcher = false;
                            catcherState.debounceTo = DateTime.Now.Add(new TimeSpan(0, 0, 3));
                            pair.Value.isCatcher = true;
                            catcher = pair.Key;
                            break;
                        }
                    }
                }
            }
            if (_lastcatcher.HasValue)
            {
                if (_lastcatcher.Value != catcher)
                {
                    _lastcatcher = catcher;
                    return true;
                }
            }
            _lastcatcher = catcher;
            return false;
        }

        public bool Catched(PlayerPosition catcher, PlayerPosition catchee)
        {
            var x = catcher.x - catchee.x;
            var y = catcher.y - catchee.y;
            var z = catcher.z - catchee.z;
            return Math.Sqrt(x * x + y * y + z * z) < 1;
        }

        public Guid? GetCatcher()
        {
            if (_states.Where(p => p.Value.isCatcher && _clientRepository.Where(c => c.ConnectionId == p.Key && c.IsAlive).Any()).Any())
            {
                return _states.Where(p => p.Value.isCatcher && _clientRepository.Where(c => c.ConnectionId == p.Key && c.IsAlive).Any()).First().Key;
            }
            else
            {
                if (_states.Any())
                {
                    var candidate = _states.Where(p => _clientRepository.Where(c => c.ConnectionId == p.Key && c.IsAlive).Any()).FirstOrDefault();
                    if (candidate.Value != null)
                    {
                        candidate.Value.isCatcher = true;
                        return candidate.Key;
                    }
                }
            }
            return null;
        }
    }
}