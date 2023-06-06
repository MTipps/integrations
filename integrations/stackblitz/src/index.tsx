import {
    createIntegration,
    createComponent,
    FetchEventCallback,
    RuntimeContext,
} from '@gitbook/runtime';

import { createProject } from './stackblitz';

type IntegrationContext = {} & RuntimeContext;

const handleFetchEvent: FetchEventCallback<IntegrationContext> = async (request, context) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { api } = context;
    const user = api.user.getAuthenticatedUser();

    return new Response(JSON.stringify(user));
};

const exampleBlock = createComponent({
    componentId: 'stackblitz',
    initialState: (props) => {
        return {
            message: 'Click Me',
        };
    },
    action: async (element, action, context) => {
        switch (action.action) {
            case 'click':
                console.log('Button Clicked');
                return {};
        }
    },
    render: async (element, action, context) => {
        console.log('RENDER');
        await createProject();
        return (
            <block>
                <button label={element.state.message} onPress={{ action: 'click' }} />
            </block>
        );
    },
});

export default createIntegration({
    fetch: handleFetchEvent,
    components: [exampleBlock],
    events: {},
});