import AceEditor from "react-ace";
import { useEffect, useRef, useState } from "react";
import "./MaterialOneDark.js"; // pg模式包

// 代码提示
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/ext-spellcheck";
import "ace-builds/src-noconflict/ext-language_tools";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";

import "ace-builds/src-noconflict/ext-searchbox";

import "ace-builds/src-noconflict/theme-nord_dark";
import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/theme-tomorrow";
import { Tooltip } from "antd";
// /以下import的是风格，还有好多种，可以根据自己需求导入
// github、tomorrow、kuioir、twilight、xcode、textmeta、terminal、solarized-light、solarized-dark

type propsType = {
  value: string;
  tableColumns: any;
  onChange?: (value: string) => void;
  height?: number | string;
  readOnly?: boolean;
  theme?: string;
  mode?: string;
};

const CustomAceEditor = (props: propsType) => {
  const {
    value,
    onChange,
    height = 300,
    readOnly = false,
    theme,
    mode,
    tableColumns,
  } = props;
  const { dropdownWidth, dropdownHeight } = {
    dropdownWidth: 150,
    dropdownHeight: 200,
  };
  const aceEditorRef = useRef<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [editorReady, setEditorReady] = useState(false); // 标记编辑器是否初始化完成

  // 初始化编辑器完成后标记状态
  useEffect(() => {
    const editor = aceEditorRef.current?.editor;
    if (editor) {
      setEditorReady(true);
    }
  }, []);

  useEffect(() => {
    if (!editorReady) return; // 编辑器未就绪则不绑定事件

    const editor = aceEditorRef.current?.editor;
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // if (e.key === "/" && !e.shiftKey && !readOnly) {
      if ((e.keyCode === 191 || e.key === "/") && !e.shiftKey && !readOnly) {
        // 1. 获取光标行列号（行：row，列：column）
        const cursorPos = editor.getCursorPosition(); // { row: number, column: number }
        // 2. 将行列号转换为屏幕像素坐标（关键步骤）
        const renderer = editor.renderer;

        const { pageX, pageY } = renderer.textToScreenCoordinates(
          cursorPos.row,
          cursorPos.column
        );
        const { innerHeight, innerWidth } = window;
        // 内容容器的位置
        const containerRect = editor.container.getBoundingClientRect();
        const relativeTop = pageY - containerRect.top;
        const relativeLeft = pageX - containerRect.left;
        // 设置下拉框位置（基于点击坐标）
        const data = {
          top: relativeTop + 10, // 点击位置下方5px
          left: relativeLeft + 10, // 点击位置右侧5px
        };
        // 边界判断
        if (pageX + dropdownWidth > innerWidth) {
          data.left = pageX - containerRect.left - dropdownWidth;
        }
        if (pageY + dropdownHeight > innerHeight) {
          data.top = pageY - containerRect.top - dropdownHeight;
        }
        setDropdownPosition(data);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const editorElement = aceEditorRef.current?.container;
      if (editorElement && !editorElement.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    // 绑定事件（确保容器存在）
    if (editor.container) {
      editor.container.addEventListener("keydown", handleKeyDown);
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (editor.container) {
        editor.container.removeEventListener("keydown", handleKeyDown);
      }
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [readOnly, editorReady]); // 依赖editorReady，确保编辑器初始化后再执行

  // 选择选项处理（增加编辑器存在性校验）
  const handleSelectOption = (optionValue: string) => {
    if (!editorReady) return;
    const editor = aceEditorRef.current?.editor;
    if (!editor) return;

    editor.navigateLeft(1);
    editor.remove(1);
    editor.insert(`{${optionValue}}`);
    const newPos = editor.getCursorPosition();
    editor.moveCursorTo(newPos.row, newPos.column - 1);
    setShowDropdown(false);
    onChange && onChange(editor.getValue());
  };

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: "18px" }}>
      <AceEditor
        ref={aceEditorRef}
        mode={mode || "json"}
        theme={theme || "tomorrow"}
        fontSize={14}
        showGutter
        showPrintMargin={false}
        value={value}
        wrapEnabled
        highlightActiveLine
        enableSnippets
        name="custom-ace-editor"
        style={{ width: "100%", height: height || 300 }}
        setOptions={{
          readOnly: readOnly || false,
          // 基础的自动完成
          enableBasicAutocompletion: true,
          // 实时自动完成
          enableLiveAutocompletion: true,
          // 代码块
          enableSnippets: true,
          // 显示行号
          showLineNumbers: true,
          // tab键两个空格
          tabSize: 2,
          // useWorker: useWorker === undefined ? useWorker: true,
          useWorker: false,
        }}
        onChange={(newValue) => onChange && onChange(newValue)}
        width="100%"
        readOnly={readOnly}
      />

      {tableColumns?.length && showDropdown && editorReady ? ( // 编辑器就绪后才渲染下拉框
        <div
          style={{
            position: "absolute",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            zIndex: 99,
            width: dropdownWidth + "px",
            height: dropdownHeight + "px",
            padding: "4px 0",
            margin: 0,
            listStyle: "none",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {tableColumns.map((option: any) => (
            <Tooltip
              key={option.value}
              placement="topLeft"
              title={option.label}
            >
              <div
                style={{
                  boxSizing: "border-box",
                  height: "40px",
                  width: "138px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "25px",
                  flexShrink: 0, // 关键：禁止压缩
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => handleSelectOption(option.value)}
              >
                {option.label}
              </div>
            </Tooltip>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export { CustomAceEditor };
