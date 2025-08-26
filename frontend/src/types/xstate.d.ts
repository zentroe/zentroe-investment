declare module '@xstate/react' {
  import { StateMachine, StateFrom, EventFrom } from 'xstate';

  export function useMachine<TMachine extends StateMachine<any, any, any>>(
    machine: TMachine,
    options?: any
  ): [StateFrom<TMachine>, (event: EventFrom<TMachine>) => void];

  export function useInterpret<TMachine extends StateMachine<any, any, any>>(
    machine: TMachine,
    options?: any
  ): any;

  export function useSelector<TMachine extends StateMachine<any, any, any>, T>(
    service: any,
    selector: (state: StateFrom<TMachine>) => T
  ): T;
}
