import * as React from 'react';
import * as ReactDom from 'react-dom';
require('./index.less');

class Index extends React.Component {
    render() {
        return (<>
            <span className={style.test}>hello world</span>
            <span className={style.test}>{this.state.date}</span>
            <img src="./img/logo/brand.png" />
        </>);
    }
}

ReactDom.render(<Test />, document.getElementById('root'));