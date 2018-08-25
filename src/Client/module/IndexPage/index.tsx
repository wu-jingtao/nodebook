import * as React from 'react';
import * as ReactDom from 'react-dom';

import { LoginPage } from '../LoginPage/LoginPage';

require('./index.less');

const Index: React.StatelessComponent = () => {
    return (
        <>
            <LoginPage />  
        </>
    );
}

ReactDom.render(<Index />, document.getElementById('root'));