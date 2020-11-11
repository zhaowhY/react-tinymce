import React, { Component } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { message } from 'antd';
import request from '@/api/request'

const toolbar = [
  `code codesample undo redo restoredraft
  | cut copy paste pastetext
  | forecolor backcolor searchreplace bold italic underline strikethrough link anchor 
  | blockquote subscript superscript removeformat`,
  `alignleft aligncenter alignright alignjustify outdent indent bullist numlist
  | table image charmap emoticons hr pagebreak insertdatetime print preview
  | formatselect fontselect fontsizeselect `
];
const plugins = [
  'print preview searchreplace autolink directionality '
  + 'visualblocks visualchars fullscreen image link media '
  + 'template code codesample table charmap hr pagebreak '
  + 'nonbreaking anchor insertdatetime advlist lists wordcount'
  + ' imagetools textpattern help paste emoticons autosave'
  + ' placeholder'
];
const fontFormats = '微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;'
  + '苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;'
  + '宋体=simsun,serif;仿宋体=FangSong,serif;'
  + '黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;'
  // + 'Arial Black=arial black,avant garde;'
  // + 'Book Antiqua=book antiqua,palatino;'
  // + 'Comic Sans MS=comic sans ms,sans-serif;'
  + 'Courier New=courier new,courier;'
  // + 'Georgia=georgia,palatino;Helvetica=helvetica;'
  // + 'Impact=impact,chicago;Symbol=symbol;'
  // + 'Tahoma=tahoma,arial,helvetica,sans-serif;'
  // + 'Terminal=terminal,monaco;'
  + 'Times New Roman=times new roman,times;';
// + 'Verdana=verdana,geneva;Webdings=webdings;Wingdings=wingdings,zapf dingbats;'
// + '知乎配置=BlinkMacSystemFont, Helvetica Neue, PingFang SC, Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC, WenQuanYi Micro Hei, sans-serif;'
// + '小米配置=Helvetica Neue,Helvetica,Arial,Microsoft Yahei,Hiragino Sans GB,Heiti SC,WenQuanYi Micro Hei,sans-serif'
const fontsizeFormats = '12px 14px 16px 18px 24px 36px 48px 56px 72px';
// const menubar = 'file edit insert view format table';

class MyEditor extends Component {
  static defaultProps = {
    fileType: 'url',
  };

  constructor(props) {
    super(props);
    this.state = { content: '' };
  }

  triggerChange = (content) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(content);
    }
  }

  showLoading = (modal) => {
    let modalContent = document.querySelector('.ant-loading-mask');
    if (modalContent) {
      Object.assign(modalContent.style, { display: 'flex', 'z-index': 1 });
    } else {
      modalContent = document.createElement('div');
      Object.assign(modalContent.style, {
        position: 'absolute',
        top: '38px',
        background: 'rgba(255,255,255,.9)',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        width: '323px',
        height: '194px',
        color: '#4E941C'
      });
      modalContent.className = 'tiny-upload-loading-wrapper';
      modalContent.innerHTML = `
        <div class="tiny-upload-loading">
          <i aria-label="图标: loading" class="anticon anticon-loading"><svg viewBox="0 0 1024 1024" focusable="false" class="anticon-spin" data-icon="loading" width="5em" height="5em" fill="#4E941C" aria-hidden="true"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z"></path></svg></i>
          <p>文件上传中</p>
        </div>
        `;
      modal.appendChild(modalContent);
    }
  }

  hideLoading = () => {
    const loading = document.querySelector('.tiny-upload-loading-wrapper');
    Object.assign(loading.style, { display: 'none', 'z-index': -1 });
  }

  render() {
    const { showLoading, hideLoading } = this;
    const { fileType, value, height = 400 } = this.props;

    return (
      <Editor
        ref={(c) => { this.editor = c; }}
        init={{
          language: 'zh_CN',
          height: height,
          menubar: false,
          branding: false,
          plugins,
          toolbar,
          font_formats: fontFormats,
          fontsize_formats: fontsizeFormats,
          statusbar: false,
          placeholder: '输入正文',
          // eslint-disable-next-line no-shadow
          file_picker_callback: (cb, value, meta) => {
            const types = { image: 'image/jpg, image/jpeg, image/png' };
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', types[meta.filetype]);
            input.onchange = function () {
              const file = this.files[0];
              if (fileType === 'base64') {
                const reader = new FileReader();
                reader.onload = function () {
                  const id = `blobid${(new Date()).getTime()}`;
                  const { blobCache } = window.tinymce.activeEditor.editorUpload;
                  const base64 = reader.result.split(',')[1];
                  const blobInfo = blobCache.create(id, file, base64);
                  blobCache.add(blobInfo);
                  cb(blobInfo.blobUri(), { title: file.name });
                };
                reader.readAsDataURL(file);
              } else {
                const modal = document.querySelector('.mce-panel.mce-floatpanel');
                const formData = new FormData();
                showLoading(modal);
                // 文件对象
                formData.set('file', file);
                try {
                  request({
                    url: 'http://39.105.108.226:7002/files',
                    method: 'post',
                    data: formData
                  }).then(({ data: { file: { path } } }) => {
                      cb(path, {
                        title: file.name, style: 'object-fit: cover;', width: '150px', height: 'auto'
                      });
                      hideLoading(modal);
                    });
                } catch (error) {
                  message.error(error.message);
                  hideLoading(modal);
                }
              }
            };
            input.click();
          },
        }}
        value={value}
        onEditorChange={this.triggerChange}
      />
    );
  }
}

export default MyEditor;
