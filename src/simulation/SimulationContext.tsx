import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { SimulationState, RoutingStrategy, SimulationAction } from './types';
import { createInitialState } from './initialState';
import { simulationReducer } from './reducer';

interface SimulationContextValue {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  connectClient: (clientId: string) => void;
  disconnectClient: (clientId: string) => void;
  reconnectClient: (clientId: string) => void;
  connectAll: () => void;
  disconnectAll: () => void;
  setRoutingStrategy: (strategy: RoutingStrategy) => void;
  stopServer: (serverId: string) => void;
  startServer: (serverId: string) => void;
  restartServer: (serverId: string) => void;
  addServer: (id: string, name: string, port: number) => void;
  removeServer: (serverId: string) => void;
  publishMessage: (senderId: string, channel: string, content: string) => void;
  addClient: (name: string, deviceType?: 'web' | 'mobile' | 'desktop') => void;
  removeClient: (clientId: string) => void;
  editClientName: (clientId: string, name: string) => void;
  clearLogs: () => void;
  resetSimulation: () => void;
  triggerHealthCheck: () => void;
  subscribeClient: (clientId: string, channel: string) => void;
  unsubscribeClient: (clientId: string, channel: string) => void;
  setPaused: (isPaused: boolean) => void;
  setAnimationSpeed: (speed: number) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(simulationReducer, undefined, createInitialState);

  // Periodic heartbeat animation/check (every 5 seconds, deterministic)
  useEffect(() => {
    if (state.isPaused) return;
    const interval = setInterval(() => {
      dispatch({ type: 'TRIGGER_HEALTH_CHECK' });
    }, 12000); // 12 seconds heartbeat to keep event log clean but active
    return () => clearInterval(interval);
  }, [state.isPaused]);

  // Message flow step animation timer
  useEffect(() => {
    if (!state.activeAnimation) return;

    const baseDelay = (600 / (state.animationSpeed || 1));
    const timer = setTimeout(() => {
      const currentStep = state.activeAnimation?.step;
      if (currentStep === 'client_to_server') {
        dispatch({
          type: 'SET_ANIMATION_STEP',
          payload: {
            activeAnimation: {
              ...state.activeAnimation!,
              step: 'server_to_broker',
            },
          },
        });
      } else if (currentStep === 'server_to_broker') {
        dispatch({
          type: 'SET_ANIMATION_STEP',
          payload: {
            activeAnimation: {
              ...state.activeAnimation!,
              step: 'broker_to_servers',
            },
          },
        });
      } else if (currentStep === 'broker_to_servers') {
        dispatch({
          type: 'SET_ANIMATION_STEP',
          payload: {
            activeAnimation: {
              ...state.activeAnimation!,
              step: 'servers_to_clients',
            },
          },
        });
      } else if (currentStep === 'servers_to_clients') {
        dispatch({
          type: 'SET_ANIMATION_STEP',
          payload: {
            activeAnimation: {
              ...state.activeAnimation!,
              step: 'complete',
            },
          },
        });
      } else {
        // Clear active animation
        dispatch({
          type: 'SET_ANIMATION_STEP',
          payload: { activeAnimation: null },
        });
      }
    }, baseDelay);

    return () => clearTimeout(timer);
  }, [state.activeAnimation, state.animationSpeed]);

  const connectClient = useCallback((clientId: string) => {
    dispatch({ type: 'CONNECT_CLIENT', payload: { clientId } });
  }, []);

  const disconnectClient = useCallback((clientId: string) => {
    dispatch({ type: 'DISCONNECT_CLIENT', payload: { clientId } });
  }, []);

  const reconnectClient = useCallback((clientId: string) => {
    dispatch({ type: 'RECONNECT_CLIENT', payload: { clientId } });
  }, []);

  const connectAll = useCallback(() => {
    dispatch({ type: 'CONNECT_ALL_CLIENTS' });
  }, []);

  const disconnectAll = useCallback(() => {
    dispatch({ type: 'DISCONNECT_ALL_CLIENTS' });
  }, []);

  const setRoutingStrategy = useCallback((strategy: RoutingStrategy) => {
    dispatch({ type: 'SET_ROUTING_STRATEGY', payload: { strategy } });
  }, []);

  const stopServer = useCallback((serverId: string) => {
    dispatch({ type: 'STOP_SERVER', payload: { serverId } });
  }, []);

  const startServer = useCallback((serverId: string) => {
    dispatch({ type: 'START_SERVER', payload: { serverId } });
  }, []);

  const restartServer = useCallback((serverId: string) => {
    dispatch({ type: 'RESTART_SERVER', payload: { serverId } });
  }, []);

  const addServer = useCallback((id: string, name: string, port: number) => {
    dispatch({ type: 'ADD_SERVER', payload: { id, name, port } });
  }, []);

  const removeServer = useCallback((serverId: string) => {
    dispatch({ type: 'REMOVE_SERVER', payload: { serverId } });
  }, []);

  const publishMessage = useCallback((senderId: string, channel: string, content: string) => {
    dispatch({ type: 'PUBLISH_MESSAGE', payload: { senderId, channel, content } });
  }, []);

  const addClient = useCallback((name: string, deviceType?: 'web' | 'mobile' | 'desktop') => {
    dispatch({ type: 'ADD_CLIENT', payload: { name, deviceType } });
  }, []);

  const removeClient = useCallback((clientId: string) => {
    dispatch({ type: 'REMOVE_CLIENT', payload: { clientId } });
  }, []);

  const editClientName = useCallback((clientId: string, name: string) => {
    dispatch({ type: 'EDIT_CLIENT_NAME', payload: { clientId, name } });
  }, []);

  const clearLogs = useCallback(() => {
    dispatch({ type: 'CLEAR_LOGS' });
  }, []);

  const resetSimulation = useCallback(() => {
    dispatch({ type: 'RESET_SIMULATION' });
  }, []);

  const triggerHealthCheck = useCallback(() => {
    dispatch({ type: 'TRIGGER_HEALTH_CHECK' });
  }, []);

  const subscribeClient = useCallback((clientId: string, channel: string) => {
    dispatch({ type: 'CLIENT_SUBSCRIBE_CHANNEL', payload: { clientId, channel } });
  }, []);

  const unsubscribeClient = useCallback((clientId: string, channel: string) => {
    dispatch({ type: 'CLIENT_UNSUBSCRIBE_CHANNEL', payload: { clientId, channel } });
  }, []);

  const setPaused = useCallback((isPaused: boolean) => {
    dispatch({ type: 'SET_PAUSED', payload: { isPaused } });
  }, []);

  const setAnimationSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_ANIMATION_SPEED', payload: { speed } });
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        state,
        dispatch,
        connectClient,
        disconnectClient,
        reconnectClient,
        connectAll,
        disconnectAll,
        setRoutingStrategy,
        stopServer,
        startServer,
        restartServer,
        addServer,
        removeServer,
        publishMessage,
        addClient,
        removeClient,
        editClientName,
        clearLogs,
        resetSimulation,
        triggerHealthCheck,
        subscribeClient,
        unsubscribeClient,
        setPaused,
        setAnimationSpeed,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
