import * as React from 'react';
import * as ReactDom from 'react-dom';

const style = require('./index.less');

class Test extends React.Component {

    state = { date: '' };

    componentDidMount() {
        setInterval(() => {
            this.setState({ date: (new Date).toLocaleTimeString() });
        }, 1000);
    }

    render() {
        return (<>
            <span className={style.test}>hello world</span>
            <span className={style.test}>{this.state.date}</span>
        </>);
    }
}

ReactDom.render(<Test />, document.getElementById('root'));