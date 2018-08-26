import * as React from 'react';
import * as ReactDom from 'react-dom';

import { LoginPage } from '../LoginPage/LoginPage';
import { MessageBox } from '../MessageBox/MessageBox';

require('./index.less');

const Index: React.StatelessComponent = () => {
    return (
        <>
            <LoginPage />  
            <MessageBox />  
        </>
    );
}

ReactDom.render(<Index />, document.getElementById('root'));