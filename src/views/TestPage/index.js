import React, { Component } from 'react';
import styles from './index.module.less'
import Editor from '@/components/editor';

class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorValue: 'hello world'
    }
  }

  handleEditorChange(editorValue) {
    this.setState({ editorValue });
  }

  render() {
    const {editorValue} = this.state;
    return (
      <div className={styles['home-wrapper']}>
      <div  className={styles['home-left']}>
        <div  className={styles['home-title']}>React--富文本编辑器</div>
        <Editor value={editorValue} onChange={(value) => this.handleEditorChange(value)} height={550}/>
      </div>
      <div  className={styles['home-right']}>
        <div  className={styles['home-title']}>内容展示区</div>
        <div dangerouslySetInnerHTML={{__html: editorValue}}></div>
      </div>
    </div>
    );
  }

}

export default Test;
