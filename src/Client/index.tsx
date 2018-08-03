import * as React from 'react';
import * as ReactDom from 'react-dom';

const style = require('./index.less');

class Test extends React.Component {
    render() {
        return (
            <span className={style.test}>hello world</span>
        );
    }
}

ReactDom.render(<Test />, document.getElementById('root'));